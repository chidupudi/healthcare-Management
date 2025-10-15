# Healthcare Management System - Kubernetes Deployment Script (PowerShell)
# This script automates the deployment process with health checks

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Healthcare Management System - K8s Deploy" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if kubectl is available
try {
    kubectl version --client --short | Out-Null
} catch {
    Write-Host "Error: kubectl is not installed" -ForegroundColor Red
    exit 1
}

# Check if cluster is accessible
try {
    kubectl cluster-info | Out-Null
} catch {
    Write-Host "Error: Cannot connect to Kubernetes cluster" -ForegroundColor Red
    Write-Host "Please ensure your cluster is running (e.g., 'minikube start')" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Kubernetes cluster is accessible" -ForegroundColor Green
Write-Host ""

# Step 1: Build Docker image
Write-Host "Step 1: Building Docker image..." -ForegroundColor Yellow
Push-Location ..\server
docker build -t healthcare-backend:latest .
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error building Docker image" -ForegroundColor Red
    Pop-Location
    exit 1
}
Write-Host "✓ Docker image built successfully" -ForegroundColor Green
Write-Host ""
Pop-Location

# Step 2: Load image to Minikube (if using Minikube)
$context = kubectl config current-context
if ($context -like "*minikube*") {
    Write-Host "Step 2: Loading image to Minikube..." -ForegroundColor Yellow
    minikube image load healthcare-backend:latest
    Write-Host "✓ Image loaded to Minikube" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "Step 2: Skipping Minikube load (not using Minikube)" -ForegroundColor Yellow
    Write-Host ""
}

# Step 3: Deploy MongoDB
Write-Host "Step 3: Deploying MongoDB..." -ForegroundColor Yellow
kubectl apply -f mongodb-deployment.yaml
Write-Host "✓ MongoDB deployed" -ForegroundColor Green
Write-Host ""

# Step 4: Wait for MongoDB to be ready
Write-Host "Step 4: Waiting for MongoDB to be ready..." -ForegroundColor Yellow
kubectl wait --for=condition=ready pod -l app=mongodb --timeout=120s
Write-Host "✓ MongoDB is ready" -ForegroundColor Green
Write-Host ""

# Step 5: Deploy Backend
Write-Host "Step 5: Deploying Healthcare Backend..." -ForegroundColor Yellow
kubectl apply -f backend-deployment.yaml
kubectl apply -f backend-service.yaml
Write-Host "✓ Backend deployed" -ForegroundColor Green
Write-Host ""

# Step 6: Wait for Backend to be ready
Write-Host "Step 6: Waiting for backend pods to be ready..." -ForegroundColor Yellow
Write-Host "This may take a minute while startup probes complete..." -ForegroundColor Cyan
kubectl wait --for=condition=ready pod -l app=healthcare-backend --timeout=180s
Write-Host "✓ Backend pods are ready" -ForegroundColor Green
Write-Host ""

# Step 7: Display deployment status
Write-Host "Step 7: Deployment Status" -ForegroundColor Yellow
Write-Host ""
Write-Host "Pods:" -ForegroundColor Cyan
kubectl get pods -l app=healthcare-backend -o wide
kubectl get pods -l app=mongodb -o wide
Write-Host ""
Write-Host "Services:" -ForegroundColor Cyan
kubectl get services
Write-Host ""

# Step 8: Test health endpoints
Write-Host "Step 8: Testing health endpoints..." -ForegroundColor Yellow

# Get a pod name
$podName = (kubectl get pods -l app=healthcare-backend -o jsonpath='{.items[0].metadata.name}')

Write-Host "Testing /health endpoint..."
try {
    $healthCheck = kubectl exec $podName -- wget -q -O- http://localhost:5000/health 2>$null
    Write-Host "✓ Health endpoint response: $healthCheck" -ForegroundColor Green
} catch {
    Write-Host "✗ Health endpoint failed" -ForegroundColor Red
}

Write-Host "Testing /ready endpoint..."
try {
    $readyCheck = kubectl exec $podName -- wget -q -O- http://localhost:5000/ready 2>$null
    Write-Host "✓ Ready endpoint response: $readyCheck" -ForegroundColor Green
} catch {
    Write-Host "✗ Ready endpoint failed" -ForegroundColor Red
}
Write-Host ""

# Step 9: Display access information
Write-Host "==========================================" -ForegroundColor Green
Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Access your application:" -ForegroundColor Cyan
Write-Host ""

# Check if using Minikube
if ($context -like "*minikube*") {
    Write-Host "Get service URL:"
    Write-Host "  minikube service healthcare-backend-service --url"
    Write-Host ""
    try {
        $serviceUrl = minikube service healthcare-backend-service --url 2>$null
        if ($serviceUrl) {
            Write-Host "Service is available at: $serviceUrl" -ForegroundColor Green
            Write-Host ""
            Write-Host "Test endpoints:"
            Write-Host "  curl $serviceUrl/health"
            Write-Host "  curl $serviceUrl/ready"
        }
    } catch {
        # Service URL not available yet
    }
}

Write-Host ""
Write-Host "Useful commands:" -ForegroundColor Cyan
Write-Host "  kubectl get pods -w                     # Watch pod status"
Write-Host "  kubectl logs -f $podName               # Follow logs"
Write-Host "  kubectl describe pod $podName          # View probe status"
Write-Host "  kubectl get events --sort-by=.metadata.creationTimestamp  # View events"
Write-Host ""
Write-Host "To cleanup:"
Write-Host "  kubectl delete -f ."
Write-Host ""
