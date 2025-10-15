# Kubernetes Health Checks - Implementation Checklist

Use this checklist to track your progress through the implementation.

## Phase 1: App Preparation ✅

- [x] Choose healthcare management app
- [x] Add `/health` endpoint (returns success when app works)
- [x] Add `/ready` endpoint (checks MongoDB connection)
- [x] Health endpoints return proper JSON responses
- [ ] Test endpoints locally (see instructions below)

**Local Testing Instructions:**
```bash
# Start MongoDB locally
# mongod --dbpath /path/to/data

# Start the server
cd server
node server.js

# In another terminal, test endpoints
curl http://localhost:5000/health
curl http://localhost:5000/ready
```

## Phase 2: Containerization ✅

- [x] Dockerfile created for backend app
- [x] Dockerfile exposes correct port (5000)
- [ ] Build Docker image locally
- [ ] Run container locally
- [ ] Test health endpoints in container
- [ ] (Optional) Push image to Docker Hub

**Build & Test Instructions:**
```bash
# Build the image
cd server
docker build -t healthcare-backend:latest .

# Run container locally
docker run -p 5000:5000 healthcare-backend:latest

# In another terminal, test
curl http://localhost:5000/health
curl http://localhost:5000/ready
```

## Phase 3: Kubernetes Setup ✅

- [ ] Kubernetes cluster ready (Minikube/Kind/Cloud)
- [x] Backend deployment YAML created
- [x] Backend service YAML created
- [x] MongoDB deployment YAML created
- [x] Container details defined (image, ports, replicas)
- [ ] Verify kubectl is installed and configured

**Setup Verification:**
```bash
# Check kubectl
kubectl version --client

# Check cluster
kubectl cluster-info

# If using Minikube
minikube status
minikube start  # if not running
```

## Phase 4: Add Probes ✅

- [x] Startup probe configured in deployment YAML
  - Path: `/health`
  - Initial delay: 0s
  - Period: 10s
  - Failure threshold: 30

- [x] Liveness probe configured in deployment YAML
  - Path: `/health`
  - Initial delay: 15s
  - Period: 20s
  - Failure threshold: 3

- [x] Readiness probe configured in deployment YAML
  - Path: `/ready`
  - Initial delay: 5s
  - Period: 10s
  - Failure threshold: 3

- [x] Resource requests and limits defined

## Phase 5: Deploy & Verify

- [ ] Load Docker image to cluster (if using Minikube)
- [ ] Deploy MongoDB
- [ ] Deploy backend application
- [ ] Deploy backend service
- [ ] Check pods status
- [ ] Verify all pods are Running
- [ ] Verify all pods are Ready (1/1)
- [ ] Check probe status with `kubectl describe`

**Deployment Instructions:**

### Option A: Automated (Recommended)
```bash
# Windows PowerShell
cd k8s
.\deploy.ps1

# Linux/Mac
cd k8s
chmod +x deploy.sh
./deploy.sh
```

### Option B: Manual
```bash
# Build and load image
cd server
docker build -t healthcare-backend:latest .
minikube image load healthcare-backend:latest  # if using Minikube

# Deploy
cd ../k8s
kubectl apply -f mongodb-deployment.yaml
kubectl apply -f backend-deployment.yaml
kubectl apply -f backend-service.yaml

# Verify
kubectl get pods
kubectl get services
```

**Verification Commands:**
```bash
# Check pod status
kubectl get pods

# Expected output:
# NAME                                  READY   STATUS    RESTARTS   AGE
# healthcare-backend-xxxxxxxxxx-xxxxx   1/1     Running   0          2m
# mongodb-xxxxxxxxxx-xxxxx              1/1     Running   0          2m

# Describe pod to see probe details
kubectl describe pod <pod-name>

# Look for:
# - Liveness: http-get http://:5000/health
# - Readiness: http-get http://:5000/ready
# - Startup: http-get http://:5000/health
```

## Phase 6: Test Behavior

- [ ] Access service URL
- [ ] Test `/health` endpoint through service
- [ ] Test `/ready` endpoint through service
- [ ] Watch pod behavior in real-time
- [ ] Deploy test pod for failure scenarios
- [ ] Simulate application crash
- [ ] Observe liveness probe failure and restart
- [ ] Simulate readiness failure (MongoDB disconnect)
- [ ] Observe pod marked as "Not Ready"
- [ ] Verify traffic routing changes
- [ ] Watch pod recover automatically

**Testing Instructions:**

### Test Endpoints Through Service
```bash
# Get service URL (Minikube)
minikube service healthcare-backend-service --url

# Test endpoints (replace <url> with actual URL)
curl <url>/health
curl <url>/ready
```

### Test Failure Scenarios
```bash
# Terminal 1: Watch pods
kubectl get pods -w

# Terminal 2: Deploy test pod
kubectl apply -f k8s/test-health-failure.yaml

# Get test pod name
kubectl get pods -l app=healthcare-backend-test

# Simulate crash
kubectl exec -it <test-pod-name> -- sh
kill 1

# Observe in Terminal 1:
# - Pod becomes "Not Ready" first
# - Then restarts after liveness failures
# - Restart count increases
```

### Monitor and Debug
```bash
# View logs
kubectl logs <pod-name>
kubectl logs <pod-name> --previous  # Previous container

# View events
kubectl get events --sort-by=.metadata.creationTimestamp

# Check which pods are receiving traffic
kubectl get endpoints healthcare-backend-service
```

## Additional Verification Steps

### Verify Startup Probe
- [ ] Pod starts successfully within 5 minutes
- [ ] Startup probe shows success in events
- [ ] No premature restarts during startup

**Check:**
```bash
kubectl describe pod <pod-name> | grep -A 10 "Events"
```

### Verify Liveness Probe
- [ ] Liveness probe checks run every 20 seconds
- [ ] Pod restarts after 3 consecutive failures
- [ ] Restart count increases in pod status

**Simulate:**
```bash
# Kill the app process to trigger liveness failure
kubectl exec <pod-name> -- kill 1

# Watch restart
kubectl get pods -w
```

### Verify Readiness Probe
- [ ] Readiness probe checks run every 10 seconds
- [ ] Pod removed from endpoints when not ready
- [ ] Pod NOT restarted on readiness failure
- [ ] Pod added back when ready again

**Check:**
```bash
# Watch endpoints
kubectl get endpoints healthcare-backend-service -w

# In another terminal, stop MongoDB temporarily
kubectl delete pod -l app=mongodb

# Observe backend pods become "Not Ready"
# But they don't restart
```

## Cleanup Checklist

When you're done testing:

- [ ] Delete test deployment: `kubectl delete -f k8s/test-health-failure.yaml`
- [ ] (Optional) Delete all resources: `kubectl delete -f k8s/`
- [ ] Verify all resources deleted: `kubectl get all`

```bash
# Cleanup commands
kubectl delete -f k8s/test-health-failure.yaml
kubectl delete -f k8s/

# Verify cleanup
kubectl get all
```

## Documentation Review

Before moving to production, review:

- [ ] Read [README.md](./README.md) - Full deployment guide
- [ ] Read [QUICK-START.md](./QUICK-START.md) - Quick reference
- [ ] Read [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [ ] Review [KUBERNETES-HEALTH-CHECKS.md](../KUBERNETES-HEALTH-CHECKS.md) - Summary

## Production Readiness

Before deploying to production:

- [ ] Test all failure scenarios
- [ ] Verify automatic recovery works
- [ ] Set up monitoring and alerts
- [ ] Configure persistent storage for MongoDB
- [ ] Use secrets for sensitive configuration
- [ ] Add TLS/SSL for external access
- [ ] Configure resource limits based on load testing
- [ ] Set up horizontal pod autoscaling (HPA)
- [ ] Implement proper backup strategy
- [ ] Document runbooks for common issues

## Success Criteria

You've successfully implemented health checks when:

1. ✅ Health endpoints respond correctly
2. ✅ Docker image builds and runs successfully
3. ✅ Kubernetes deployments are created
4. ✅ All three probes are configured
5. ✅ Pods start and become ready
6. ✅ Service routes traffic to healthy pods
7. ✅ Unhealthy pods are automatically restarted
8. ✅ Not-ready pods are removed from service
9. ✅ System recovers automatically from failures
10. ✅ Monitoring and debugging tools work correctly

## Quick Reference

**Most Used Commands:**
```bash
# Status
kubectl get pods
kubectl get services

# Details
kubectl describe pod <pod-name>
kubectl logs <pod-name>

# Testing
curl http://<service-url>/health
curl http://<service-url>/ready

# Monitoring
kubectl get pods -w
kubectl get events -w

# Debugging
kubectl exec -it <pod-name> -- sh
kubectl logs <pod-name> --previous
```

**Service URL (Minikube):**
```bash
minikube service healthcare-backend-service --url
```

## Notes

Add your notes here as you go through the implementation:

```
Date: _______________

Cluster: _______________

Issues encountered:


Resolutions:


Observations:


```

---

**Remember**: The goal is to have Kubernetes automatically manage your application health, restart failed containers, and route traffic only to healthy pods. This checklist ensures you've implemented and tested all these capabilities.
