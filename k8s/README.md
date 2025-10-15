# Kubernetes Deployment Guide: Healthcare Management System

This guide covers deploying the Healthcare Management System to Kubernetes with health checks, readiness, and liveness probes.

## Overview

The deployment includes:
- Backend Node.js/Express application with health endpoints
- MongoDB database
- Kubernetes probes for monitoring application health

## Health Endpoints

### `/health` - Liveness Probe
- Returns 200 OK if the application is running
- Used by Kubernetes to determine if the container should be restarted
- Response:
  ```json
  {
    "status": "healthy",
    "timestamp": "2025-10-15T10:30:00.000Z",
    "service": "healthcare-backend"
  }
  ```

### `/ready` - Readiness Probe
- Returns 200 OK if the application is ready to serve traffic
- Checks MongoDB connection status
- Returns 503 Service Unavailable if not ready
- Used by Kubernetes to determine if the pod should receive traffic
- Response (ready):
  ```json
  {
    "status": "ready",
    "database": "connected",
    "timestamp": "2025-10-15T10:30:00.000Z",
    "service": "healthcare-backend"
  }
  ```

## Probe Configuration

### Startup Probe
- **Path**: `/health`
- **Initial Delay**: 0 seconds
- **Period**: 10 seconds
- **Failure Threshold**: 30 (allows 5 minutes for startup)
- **Purpose**: Protects slow-starting containers from premature restarts

### Liveness Probe
- **Path**: `/health`
- **Initial Delay**: 15 seconds
- **Period**: 20 seconds
- **Failure Threshold**: 3 (restarts after 60 seconds of failures)
- **Purpose**: Restarts unhealthy containers

### Readiness Probe
- **Path**: `/ready`
- **Initial Delay**: 5 seconds
- **Period**: 10 seconds
- **Failure Threshold**: 3 (removes from service after 30 seconds of failures)
- **Purpose**: Controls traffic routing to healthy pods

## Prerequisites

1. Kubernetes cluster (Minikube, Kind, or cloud provider)
2. kubectl CLI installed and configured
3. Docker installed (for building images)

## Step 1: Build Docker Image

### Build the backend image:
```bash
cd server
docker build -t healthcare-backend:latest .
```

### (Optional) Tag and push to Docker Hub:
```bash
docker tag healthcare-backend:latest yourusername/healthcare-backend:latest
docker push yourusername/healthcare-backend:latest
```

**Note**: If using Minikube, load the image directly:
```bash
minikube image load healthcare-backend:latest
```

## Step 2: Deploy to Kubernetes

### Deploy MongoDB:
```bash
kubectl apply -f k8s/mongodb-deployment.yaml
```

### Deploy Backend Application:
```bash
kubectl apply -f k8s/backend-deployment.yaml
```

### Deploy Backend Service:
```bash
kubectl apply -f k8s/backend-service.yaml
```

### Deploy all at once:
```bash
kubectl apply -f k8s/
```

## Step 3: Verify Deployment

### Check pod status:
```bash
kubectl get pods
```

Expected output:
```
NAME                                  READY   STATUS    RESTARTS   AGE
healthcare-backend-xxxxxxxxxx-xxxxx   1/1     Running   0          2m
healthcare-backend-xxxxxxxxxx-xxxxx   1/1     Running   0          2m
mongodb-xxxxxxxxxx-xxxxx              1/1     Running   0          2m
```

### Check services:
```bash
kubectl get services
```

### View detailed pod information:
```bash
kubectl describe pod <pod-name>
```

Look for probe status in the Events section:
```
Events:
  Type    Reason     Age   From               Message
  ----    ------     ----  ----               -------
  Normal  Scheduled  2m    default-scheduler  Successfully assigned default/healthcare-backend-xxx to node
  Normal  Pulled     2m    kubelet            Container image "healthcare-backend:latest" already present
  Normal  Created    2m    kubelet            Created container backend
  Normal  Started    2m    kubelet            Started container backend
```

### Check probe results:
```bash
kubectl get pods -o wide
kubectl logs <pod-name>
```

## Step 4: Test Health Endpoints Locally

### Get the service URL (Minikube):
```bash
minikube service healthcare-backend-service --url
```

### Test liveness endpoint:
```bash
curl http://<service-url>/health
```

### Test readiness endpoint:
```bash
curl http://<service-url>/ready
```

## Step 5: Test Probe Behavior

### Simulate Application Failure

#### Option 1: Modify the health endpoint temporarily
```bash
kubectl exec -it <pod-name> -- sh
# Inside the container, you can test behavior
```

#### Option 2: Watch pod behavior
```bash
kubectl get pods -w
```

### Observe Kubernetes behavior:

1. **Readiness Probe Failure**:
   - Pod marked as "Not Ready"
   - Removed from service endpoints
   - No traffic routed to the pod
   - Pod NOT restarted

2. **Liveness Probe Failure**:
   - Pod restarted after 3 consecutive failures (60 seconds)
   - Container restart count increases

### Check restart count:
```bash
kubectl get pods
```

### View events and probe status:
```bash
kubectl describe pod <pod-name>
```

Look for probe-related events:
```
Warning  Unhealthy  1m   kubelet  Readiness probe failed: HTTP probe failed
Warning  Unhealthy  30s  kubelet  Liveness probe failed: HTTP probe failed
Normal   Killing    20s  kubelet  Container backend failed liveness probe, will be restarted
```

## Step 6: Monitor and Debug

### View logs:
```bash
kubectl logs <pod-name>
kubectl logs <pod-name> --previous  # View logs from crashed container
```

### Stream logs:
```bash
kubectl logs -f <pod-name>
```

### Execute commands inside pod:
```bash
kubectl exec -it <pod-name> -- sh
```

### Check events:
```bash
kubectl get events --sort-by=.metadata.creationTimestamp
```

## Cleanup

### Delete all resources:
```bash
kubectl delete -f k8s/
```

### Or delete individually:
```bash
kubectl delete deployment healthcare-backend
kubectl delete deployment mongodb
kubectl delete service healthcare-backend-service
kubectl delete service mongodb-service
```

## Troubleshooting

### Pods stuck in "Not Ready" state:
```bash
kubectl describe pod <pod-name>
kubectl logs <pod-name>
```
- Check if MongoDB is running
- Verify network connectivity between pods
- Check readiness probe configuration

### Pods continuously restarting:
```bash
kubectl describe pod <pod-name>
kubectl logs <pod-name> --previous
```
- Check liveness probe configuration
- Verify application is responding on the health endpoint
- Check resource limits

### Cannot access service:
```bash
kubectl get endpoints
kubectl describe service healthcare-backend-service
```
- Verify pods are "Ready"
- Check service selector matches pod labels
- Test health endpoints directly

## Understanding Probe Behavior

### Startup Probe
- Runs **first** and blocks liveness/readiness probes
- Gives application time to initialize
- Useful for applications with slow startup times
- Once succeeds, never runs again

### Liveness Probe
- Checks if container is **alive**
- Failure → Container restart
- Should check basic application health
- Keep checks lightweight

### Readiness Probe
- Checks if container is **ready to serve traffic**
- Failure → Removed from service endpoints (no restart)
- Should check dependencies (database, external services)
- Can fail temporarily without restarting pod

## Best Practices

1. **Use all three probes** for production applications
2. **Set appropriate timeouts** - allow enough time for checks
3. **Keep probes lightweight** - avoid expensive operations
4. **Tune thresholds** - balance between quick detection and stability
5. **Monitor probe failures** - set up alerts for continuous failures
6. **Test probe behavior** - simulate failures before production
7. **Use readiness for dependencies** - database, cache, external APIs
8. **Use liveness for application health** - memory leaks, deadlocks
9. **Set startup probes for slow apps** - protect during initialization
10. **Log probe requests** - helps with debugging (optional)

## Advanced Configuration

### TCP Socket Probes (alternative to HTTP):
```yaml
livenessProbe:
  tcpSocket:
    port: 5000
  initialDelaySeconds: 15
  periodSeconds: 20
```

### Exec Command Probes (alternative to HTTP):
```yaml
livenessProbe:
  exec:
    command:
    - cat
    - /tmp/healthy
  initialDelaySeconds: 5
  periodSeconds: 5
```

### Custom Headers:
```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 5000
    httpHeaders:
    - name: Custom-Header
      value: Awesome
```

## Next Steps

1. Deploy to production cluster
2. Set up monitoring with Prometheus/Grafana
3. Configure alerts for probe failures
4. Add more sophisticated health checks
5. Implement graceful shutdown handling
6. Add horizontal pod autoscaling (HPA)
7. Configure resource requests/limits based on monitoring

## Additional Resources

- [Kubernetes Liveness, Readiness, and Startup Probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)
- [Kubernetes Best Practices](https://kubernetes.io/docs/concepts/configuration/overview/)
- [Production-Grade Container Orchestration](https://kubernetes.io/docs/concepts/)
