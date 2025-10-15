# Healthcare Management System - Kubernetes Deployment Script (PowerShell)
# Simplified version without complex error handling

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Healthcare Management System - K8s Deploy" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Build Docker image
Write-Host "Step 1: Building Docker image..." -ForegroundColor Yellow
Push-Location ..\server
docker build -t healthcare-backend:latest .
Pop-Location
Write-Host ""

# Step 2: Load image to Minikube (if using Minikube)
Write-Host "Step 2: Loading image to cluster..." -ForegroundColor Yellow
$context = kubectl config current-context
if ($context -like "*minikube*") {
    minikube image load healthcare-backend:latest
    Write-Host "Image loaded to Minikube" -ForegroundColor Green
} else {
    Write-Host "Not using Minikube - skipping image load" -ForegroundColor Yellow
}
Write-Host ""

# Step 3: Deploy MongoDB
Write-Host "Step 3: Deploying MongoDB..." -ForegroundColor Yellow
kubectl apply -f mongodb-deployment.yaml
Write-Host ""

# Step 4: Wait for MongoDB
Write-Host "Step 4: Waiting for MongoDB to be ready..." -ForegroundColor Yellow
kubectl wait --for=condition=ready pod -l app=mongodb --timeout=120s
Write-Host ""

# Step 5: Deploy Backend
Write-Host "Step 5: Deploying Healthcare Backend..." -ForegroundColor Yellow
kubectl apply -f backend-deployment.yaml
kubectl apply -f backend-service.yaml
Write-Host ""

# Step 6: Wait for Backend
Write-Host "Step 6: Waiting for backend pods to be ready..." -ForegroundColor Yellow
Write-Host "This may take a minute while startup probes complete..." -ForegroundColor Cyan
kubectl wait --for=condition=ready pod -l app=healthcare-backend --timeout=180s
Write-Host ""

# Step 7: Display status
Write-Host "Step 7: Deployment Status" -ForegroundColor Yellow
Write-Host ""
Write-Host "Pods:" -ForegroundColor Cyan
kubectl get pods
Write-Host ""
Write-Host "Services:" -ForegroundColor Cyan
kubectl get services
Write-Host ""

# Step 8: Get pod name and test
Write-Host "Step 8: Testing health endpoints..." -ForegroundColor Yellow
$podName = kubectl get pods -l app=healthcare-backend -o jsonpath='{.items[0].metadata.name}'
Write-Host "Using pod: $podName" -ForegroundColor Cyan
Write-Host ""

# Step 9: Display completion
Write-Host "==========================================" -ForegroundColor Green
Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

if ($context -like "*minikube*") {
    Write-Host "Get service URL:" -ForegroundColor Cyan
    Write-Host "  minikube service healthcare-backend-service --url"
    Write-Host ""
}

Write-Host "Useful commands:" -ForegroundColor Cyan
Write-Host "  kubectl get pods                        # View pod status"
Write-Host "  kubectl get pods -w                     # Watch pod status"
Write-Host "  kubectl logs $podName                   # View logs"
Write-Host "  kubectl describe pod $podName           # View probe status"
Write-Host "  kubectl get events --sort-by=.metadata.creationTimestamp"
Write-Host ""
Write-Host "Test health endpoints:" -ForegroundColor Cyan
Write-Host "  kubectl exec $podName -- wget -O- http://localhost:5000/health"
Write-Host "  kubectl exec $podName -- wget -O- http://localhost:5000/ready"
Write-Host ""
Write-Host "To cleanup:" -ForegroundColor Cyan
Write-Host "  kubectl delete -f ."
Write-Host ""
