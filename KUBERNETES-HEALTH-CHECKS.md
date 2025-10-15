# Kubernetes Health Checks Implementation Summary

## What Has Been Implemented

Your Healthcare Management System now includes comprehensive Kubernetes health checks with readiness, liveness, and startup probes.

## Files Created/Modified

### Modified Files
1. **[server/server.js](server/server.js)** - Added health check endpoints:
   - `/health` - Liveness probe endpoint (always returns healthy)
   - `/ready` - Readiness probe endpoint (checks MongoDB connection)

2. **[server/Dockerfile](server/Dockerfile)** - Fixed port exposure (5000)

### New Kubernetes Configuration Files
3. **[k8s/backend-deployment.yaml](k8s/backend-deployment.yaml)** - Backend deployment with all three probes
4. **[k8s/backend-service.yaml](k8s/backend-service.yaml)** - NodePort service for backend
5. **[k8s/mongodb-deployment.yaml](k8s/mongodb-deployment.yaml)** - MongoDB deployment and service
6. **[k8s/test-health-failure.yaml](k8s/test-health-failure.yaml)** - Test deployment for failure scenarios

### Documentation Files
7. **[k8s/README.md](k8s/README.md)** - Comprehensive deployment guide (7000+ words)
8. **[k8s/QUICK-START.md](k8s/QUICK-START.md)** - Quick reference guide
9. **[k8s/ARCHITECTURE.md](k8s/ARCHITECTURE.md)** - Architecture diagrams and explanations
10. **[KUBERNETES-HEALTH-CHECKS.md](KUBERNETES-HEALTH-CHECKS.md)** - This summary

### Deployment Scripts
11. **[k8s/deploy.sh](k8s/deploy.sh)** - Automated deployment script (Bash)
12. **[k8s/deploy.ps1](k8s/deploy.ps1)** - Automated deployment script (PowerShell)
13. **[k8s/.dockerignore](k8s/.dockerignore)** - Docker ignore file

## Health Check Endpoints

### GET /health
- **Purpose**: Liveness probe
- **Returns**: 200 OK with JSON status
- **Checks**: Basic application health
- **Response**:
  ```json
  {
    "status": "healthy",
    "timestamp": "2025-10-15T10:30:00.000Z",
    "service": "healthcare-backend"
  }
  ```

### GET /ready
- **Purpose**: Readiness probe
- **Returns**: 200 OK if ready, 503 if not
- **Checks**: MongoDB connection status
- **Response (ready)**:
  ```json
  {
    "status": "ready",
    "database": "connected",
    "timestamp": "2025-10-15T10:30:00.000Z",
    "service": "healthcare-backend"
  }
  ```

## Kubernetes Probes Configured

### Startup Probe
- **Endpoint**: GET /health
- **Timing**: Every 10 seconds, up to 30 attempts (5 minutes)
- **Purpose**: Allows slow-starting applications to initialize
- **Action on failure**: Keeps trying until threshold

### Liveness Probe
- **Endpoint**: GET /health
- **Timing**: Every 20 seconds after 15s initial delay
- **Failure threshold**: 3 consecutive failures
- **Purpose**: Detects and restarts unhealthy containers
- **Action on failure**: Container restart

### Readiness Probe
- **Endpoint**: GET /ready
- **Timing**: Every 10 seconds after 5s initial delay
- **Failure threshold**: 3 consecutive failures
- **Purpose**: Controls traffic routing to healthy pods
- **Action on failure**: Remove from service endpoints (no restart)

## Quick Start Guide

### Prerequisites
- Docker installed
- Kubernetes cluster running (Minikube/Kind/Cloud)
- kubectl configured

### Option 1: Automated Deployment (Windows PowerShell)
```powershell
cd k8s
.\deploy.ps1
```

### Option 2: Automated Deployment (Linux/Mac)
```bash
cd k8s
chmod +x deploy.sh
./deploy.sh
```

### Option 3: Manual Deployment
```bash
# Build Docker image
cd server
docker build -t healthcare-backend:latest .

# Load to Minikube (if using Minikube)
minikube image load healthcare-backend:latest

# Deploy to Kubernetes
cd ../k8s
kubectl apply -f mongodb-deployment.yaml
kubectl apply -f backend-deployment.yaml
kubectl apply -f backend-service.yaml

# Check status
kubectl get pods -w
```

## Testing the Implementation

### 1. Verify Deployment
```bash
kubectl get pods
kubectl get services
```

### 2. Test Health Endpoints
```bash
# Get service URL (Minikube)
minikube service healthcare-backend-service --url

# Test endpoints
curl http://<service-url>/health
curl http://<service-url>/ready
```

### 3. View Probe Status
```bash
kubectl describe pod <pod-name>
```

Look for sections:
- `Liveness: http-get http://:5000/health`
- `Readiness: http-get http://:5000/ready`
- `Startup: http-get http://:5000/health`

### 4. Monitor Probe Behavior
```bash
# Watch pods
kubectl get pods -w

# View events
kubectl get events --sort-by=.metadata.creationTimestamp

# Follow logs
kubectl logs -f <pod-name>
```

### 5. Test Failure Scenarios
```bash
# Deploy test pod with aggressive probes
kubectl apply -f k8s/test-health-failure.yaml

# Watch behavior
kubectl get pods -w -l app=healthcare-backend-test

# Simulate failure
kubectl exec -it <test-pod-name> -- sh
kill 1  # Kill main process
```

## Expected Behavior

### Healthy Pod
```
NAME                                  READY   STATUS    RESTARTS   AGE
healthcare-backend-5d7f8c9b4d-abc12   1/1     Running   0          2m
```

### Pod with Readiness Failure (Not Ready)
```
NAME                                  READY   STATUS    RESTARTS   AGE
healthcare-backend-5d7f8c9b4d-abc12   0/1     Running   0          2m
```
- Pod is running but not receiving traffic
- Will not be restarted
- Automatically recovers when readiness passes

### Pod with Liveness Failure (Restarting)
```
NAME                                  READY   STATUS    RESTARTS   AGE
healthcare-backend-5d7f8c9b4d-abc12   1/1     Running   2          5m
```
- RESTARTS count increases
- Container is killed and restarted
- Goes through startup probe again

## Architecture Overview

```
External Traffic
       ↓
NodePort Service (30080)
       ↓
Load Balancer (only to ready pods)
       ↓
Backend Pods (2 replicas)
  - Startup Probe: /health
  - Liveness Probe: /health
  - Readiness Probe: /ready
       ↓
MongoDB Pod
```

## Key Features

1. **Automatic Health Monitoring**: Kubernetes continuously checks pod health
2. **Automatic Recovery**: Unhealthy pods are automatically restarted
3. **Traffic Management**: Only ready pods receive traffic
4. **Slow Startup Protection**: Startup probe allows 5 minutes for initialization
5. **Database Connection Checks**: Readiness probe validates MongoDB connectivity
6. **Zero-Downtime**: Multiple replicas ensure availability during restarts
7. **Observable**: Easy to monitor through kubectl commands

## Common Commands

```bash
# View pod status
kubectl get pods

# Describe pod (shows probe status)
kubectl describe pod <pod-name>

# View logs
kubectl logs <pod-name>
kubectl logs <pod-name> --previous  # Previous container

# View events
kubectl get events --sort-by=.metadata.creationTimestamp

# Check service endpoints
kubectl get endpoints

# Test endpoint directly
kubectl exec <pod-name> -- wget -O- http://localhost:5000/health

# Watch pods
kubectl get pods -w

# Scale deployment
kubectl scale deployment healthcare-backend --replicas=3

# Delete resources
kubectl delete -f k8s/
```

## Troubleshooting

### Pods Not Starting
```bash
kubectl describe pod <pod-name>
kubectl logs <pod-name>
```
**Common issues**: Image pull errors, resource constraints, probe failures

### Readiness Probe Failing
```bash
kubectl logs <pod-name>
kubectl exec <pod-name> -- wget -O- http://localhost:5000/ready
```
**Common cause**: MongoDB not connected

### Liveness Probe Failing
```bash
kubectl describe pod <pod-name>
kubectl logs <pod-name> --previous
```
**Common cause**: Application crash, out of memory

### Service Not Accessible
```bash
kubectl get endpoints
kubectl get services
```
**Common cause**: No ready pods

## Documentation

- **[k8s/README.md](k8s/README.md)** - Complete deployment guide with all scenarios
- **[k8s/QUICK-START.md](k8s/QUICK-START.md)** - Quick reference for common tasks
- **[k8s/ARCHITECTURE.md](k8s/ARCHITECTURE.md)** - Detailed architecture diagrams

## What's Next?

1. **Deploy to Your Cluster**: Use the deployment scripts provided
2. **Test Health Checks**: Follow the testing guide to verify behavior
3. **Simulate Failures**: Use the test deployment to observe Kubernetes behavior
4. **Monitor in Production**: Set up alerts for probe failures
5. **Optimize Probes**: Tune timings based on your application behavior
6. **Add More Checks**: Enhance /ready endpoint with additional dependency checks

## Cleanup

```bash
# Delete all resources
kubectl delete -f k8s/

# Or individually
kubectl delete deployment healthcare-backend
kubectl delete deployment mongodb
kubectl delete service healthcare-backend-service
kubectl delete service mongodb-service
```

## Additional Resources

- Kubernetes Documentation: https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/
- Best Practices: See [k8s/README.md](k8s/README.md) for detailed recommendations
- Architecture: See [k8s/ARCHITECTURE.md](k8s/ARCHITECTURE.md) for diagrams and flow

## Support

For issues or questions:
1. Check [k8s/README.md](k8s/README.md) troubleshooting section
2. Review [k8s/ARCHITECTURE.md](k8s/ARCHITECTURE.md) for understanding
3. Use `kubectl describe` and `kubectl logs` for debugging

---

**Implementation Date**: 2025-10-15
**System**: Healthcare Management System
**Features**: Startup, Liveness, and Readiness Probes
**Status**: Ready for Deployment ✓
