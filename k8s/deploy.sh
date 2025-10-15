#!/bin/bash

# Healthcare Management System - Kubernetes Deployment Script
# This script automates the deployment process with health checks

set -e

echo "=========================================="
echo "Healthcare Management System - K8s Deploy"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}Error: kubectl is not installed${NC}"
    exit 1
fi

# Check if cluster is accessible
if ! kubectl cluster-info &> /dev/null; then
    echo -e "${RED}Error: Cannot connect to Kubernetes cluster${NC}"
    echo "Please ensure your cluster is running (e.g., 'minikube start')"
    exit 1
fi

echo -e "${GREEN}✓ Kubernetes cluster is accessible${NC}"
echo ""

# Step 1: Build Docker image
echo -e "${YELLOW}Step 1: Building Docker image...${NC}"
cd ../server
docker build -t healthcare-backend:latest .
echo -e "${GREEN}✓ Docker image built successfully${NC}"
echo ""

# Step 2: Load image to Minikube (if using Minikube)
if command -v minikube &> /dev/null; then
    CONTEXT=$(kubectl config current-context)
    if [[ $CONTEXT == *"minikube"* ]]; then
        echo -e "${YELLOW}Step 2: Loading image to Minikube...${NC}"
        minikube image load healthcare-backend:latest
        echo -e "${GREEN}✓ Image loaded to Minikube${NC}"
        echo ""
    else
        echo -e "${YELLOW}Step 2: Skipping Minikube load (not using Minikube)${NC}"
        echo ""
    fi
else
    echo -e "${YELLOW}Step 2: Skipping Minikube load (Minikube not installed)${NC}"
    echo ""
fi

# Step 3: Deploy MongoDB
echo -e "${YELLOW}Step 3: Deploying MongoDB...${NC}"
cd ../k8s
kubectl apply -f mongodb-deployment.yaml
echo -e "${GREEN}✓ MongoDB deployed${NC}"
echo ""

# Step 4: Wait for MongoDB to be ready
echo -e "${YELLOW}Step 4: Waiting for MongoDB to be ready...${NC}"
kubectl wait --for=condition=ready pod -l app=mongodb --timeout=120s
echo -e "${GREEN}✓ MongoDB is ready${NC}"
echo ""

# Step 5: Deploy Backend
echo -e "${YELLOW}Step 5: Deploying Healthcare Backend...${NC}"
kubectl apply -f backend-deployment.yaml
kubectl apply -f backend-service.yaml
echo -e "${GREEN}✓ Backend deployed${NC}"
echo ""

# Step 6: Wait for Backend to be ready
echo -e "${YELLOW}Step 6: Waiting for backend pods to be ready...${NC}"
echo "This may take a minute while startup probes complete..."
kubectl wait --for=condition=ready pod -l app=healthcare-backend --timeout=180s
echo -e "${GREEN}✓ Backend pods are ready${NC}"
echo ""

# Step 7: Display deployment status
echo -e "${YELLOW}Step 7: Deployment Status${NC}"
echo ""
echo "Pods:"
kubectl get pods -l app=healthcare-backend -o wide
kubectl get pods -l app=mongodb -o wide
echo ""
echo "Services:"
kubectl get services
echo ""

# Step 8: Test health endpoints
echo -e "${YELLOW}Step 8: Testing health endpoints...${NC}"

# Get a pod name
POD_NAME=$(kubectl get pods -l app=healthcare-backend -o jsonpath='{.items[0].metadata.name}')

echo "Testing /health endpoint..."
HEALTH_CHECK=$(kubectl exec $POD_NAME -- wget -q -O- http://localhost:5000/health 2>/dev/null || echo "failed")
if [[ $HEALTH_CHECK != "failed" ]]; then
    echo -e "${GREEN}✓ Health endpoint response: $HEALTH_CHECK${NC}"
else
    echo -e "${RED}✗ Health endpoint failed${NC}"
fi

echo "Testing /ready endpoint..."
READY_CHECK=$(kubectl exec $POD_NAME -- wget -q -O- http://localhost:5000/ready 2>/dev/null || echo "failed")
if [[ $READY_CHECK != "failed" ]]; then
    echo -e "${GREEN}✓ Ready endpoint response: $READY_CHECK${NC}"
else
    echo -e "${RED}✗ Ready endpoint failed${NC}"
fi
echo ""

# Step 9: Display access information
echo -e "${GREEN}=========================================="
echo "Deployment Complete!"
echo "==========================================${NC}"
echo ""
echo "Access your application:"
echo ""

# Check if using Minikube
if command -v minikube &> /dev/null; then
    CONTEXT=$(kubectl config current-context)
    if [[ $CONTEXT == *"minikube"* ]]; then
        echo "Get service URL:"
        echo "  minikube service healthcare-backend-service --url"
        echo ""
        SERVICE_URL=$(minikube service healthcare-backend-service --url 2>/dev/null || echo "")
        if [ ! -z "$SERVICE_URL" ]; then
            echo "Service is available at: $SERVICE_URL"
            echo ""
            echo "Test endpoints:"
            echo "  curl $SERVICE_URL/health"
            echo "  curl $SERVICE_URL/ready"
        fi
    fi
fi

echo ""
echo "Useful commands:"
echo "  kubectl get pods -w                     # Watch pod status"
echo "  kubectl logs -f $POD_NAME               # Follow logs"
echo "  kubectl describe pod $POD_NAME          # View probe status"
echo "  kubectl get events --sort-by=.metadata.creationTimestamp  # View events"
echo ""
echo "To cleanup:"
echo "  kubectl delete -f k8s/"
echo ""
