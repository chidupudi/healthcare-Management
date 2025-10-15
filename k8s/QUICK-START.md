# Quick Start Guide - Kubernetes Health Checks

## Fast Track to Testing Health Checks

### 1. Build and Load Docker Image (Minikube)
```bash
# Navigate to server directory
cd server

# Build the image
docker build -t healthcare-backend:latest .

# Load into Minikube (if using Minikube)
minikube image load healthcare-backend:latest
```

### 2. Deploy Everything
```bash
# From project root
kubectl apply -f k8s/mongodb-deployment.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml
```

### 3. Watch Deployment
```bash
# Watch pods start up
kubectl get pods -w
```

Wait until you see:
```
NAME                                  READY   STATUS    RESTARTS   AGE
healthcare-backend-xxxxxxxxxx-xxxxx   1/1     Running   0          30s
```

### 4. Test Health Endpoints

#### Get service URL (Minikube):
```bash
minikube service healthcare-backend-service --url
```

#### Test endpoints:
```bash
# Replace <url> with your service URL
curl <url>/health
curl <url>/ready
```

Expected responses:
```json
# /health
{"status":"healthy","timestamp":"2025-10-15T10:30:00.000Z","service":"healthcare-backend"}

# /ready
{"status":"ready","database":"connected","timestamp":"2025-10-15T10:30:00.000Z","service":"healthcare-backend"}
```

### 5. View Probe Status
```bash
# Describe pod to see probe results
kubectl describe pod <pod-name>
```

Look for these sections:
```
Liveness:     http-get http://:5000/health
Readiness:    http-get http://:5000/ready
Startup:      http-get http://:5000/health

Events:
  Normal  Started  1m  kubelet  Started container backend
```

### 6. Test Failure Scenarios

#### Watch pod in real-time:
```bash
kubectl get pods -w
```

#### In another terminal, deploy test pod:
```bash
kubectl apply -f k8s/test-health-failure.yaml
```

#### Simulate failure:
```bash
# Get the test pod name
kubectl get pods -l app=healthcare-backend-test

# Exec into the pod
kubectl exec -it <test-pod-name> -- sh

# Kill the main process (simulates crash)
kill 1
```

#### Observe:
- Liveness probe fails
- Pod restarts automatically
- Restart count increases

### 7. Monitor Everything

#### View logs:
```bash
kubectl logs -f <pod-name>
```

#### View events:
```bash
kubectl get events --sort-by=.metadata.creationTimestamp
```

#### Check endpoints (traffic routing):
```bash
kubectl get endpoints healthcare-backend-service
```

### 8. Cleanup
```bash
kubectl delete -f k8s/
```

## Common Commands Cheat Sheet

```bash
# View all resources
kubectl get all

# Get pod details
kubectl describe pod <pod-name>

# View logs
kubectl logs <pod-name>
kubectl logs <pod-name> --previous  # Previous container

# Exec into pod
kubectl exec -it <pod-name> -- sh

# Port forward for testing
kubectl port-forward pod/<pod-name> 5000:5000

# Scale deployment
kubectl scale deployment healthcare-backend --replicas=3

# Delete specific resources
kubectl delete deployment healthcare-backend
kubectl delete service healthcare-backend-service

# Watch resources
kubectl get pods -w
kubectl get events -w

# Get YAML of running resource
kubectl get deployment healthcare-backend -o yaml
```

## Troubleshooting Quick Fixes

### Pods not starting:
```bash
kubectl describe pod <pod-name>
kubectl logs <pod-name>
```

### Image pull errors (Minikube):
```bash
# Set imagePullPolicy to Never in deployment YAML
# Or load image again
minikube image load healthcare-backend:latest
```

### Readiness probe failing:
```bash
# Check MongoDB is running
kubectl get pods | grep mongodb

# Check logs
kubectl logs <pod-name>

# Test endpoint directly
kubectl exec -it <pod-name> -- wget -O- http://localhost:5000/ready
```

### Liveness probe failing:
```bash
# Check if app is responding
kubectl exec -it <pod-name> -- wget -O- http://localhost:5000/health

# View pod events
kubectl describe pod <pod-name>
```

## Understanding Probe Behavior in 30 Seconds

**Startup Probe**: "Is the app started yet?"
- Blocks other probes until app starts
- Runs once at startup

**Liveness Probe**: "Is the app alive?"
- Checks if app is running
- Failure = Restart pod

**Readiness Probe**: "Is the app ready for traffic?"
- Checks if app can handle requests
- Failure = Remove from service (no restart)

## What You Should See

### Healthy Pod:
```bash
NAME                                  READY   STATUS    RESTARTS   AGE
healthcare-backend-5d7f8c9b4d-abc12   1/1     Running   0          2m
```

### Pod with Readiness Failure:
```bash
NAME                                  READY   STATUS    RESTARTS   AGE
healthcare-backend-5d7f8c9b4d-abc12   0/1     Running   0          2m
```
(Note: Ready shows 0/1)

### Pod with Liveness Failure:
```bash
NAME                                  READY   STATUS    RESTARTS   AGE
healthcare-backend-5d7f8c9b4d-abc12   1/1     Running   2          5m
```
(Note: RESTARTS count increases)

## Next Steps
- Read full documentation: [README.md](./README.md)
- Experiment with probe settings
- Test different failure scenarios
- Set up monitoring and alerts
