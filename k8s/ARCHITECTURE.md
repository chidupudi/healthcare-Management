# Healthcare Management System - Kubernetes Architecture

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      Kubernetes Cluster                          │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    Service Layer                            │ │
│  │                                                              │ │
│  │  ┌──────────────────────────────────────────────────┐      │ │
│  │  │  healthcare-backend-service (NodePort: 30080)    │      │ │
│  │  │                                                   │      │ │
│  │  │  Load Balances Traffic to Ready Pods             │      │ │
│  │  └──────────────────────────────┬───────────────────┘      │ │
│  └───────────────────────────────────┼──────────────────────────┘ │
│                                      │                            │
│  ┌───────────────────────────────────┼──────────────────────────┐ │
│  │                    Pod Layer      ▼                          │ │
│  │                                                               │ │
│  │  ┌──────────────────────────────────────────────────┐       │ │
│  │  │  Healthcare Backend Pod 1                         │       │ │
│  │  │  ┌────────────────────────────────────────────┐  │       │ │
│  │  │  │  Container: healthcare-backend             │  │       │ │
│  │  │  │                                             │  │       │ │
│  │  │  │  ┌──────────────────────────────────────┐ │  │       │ │
│  │  │  │  │  Express App (Port 5000)             │ │  │       │ │
│  │  │  │  │                                       │ │  │       │ │
│  │  │  │  │  Endpoints:                          │ │  │       │ │
│  │  │  │  │  • GET /                             │ │  │       │ │
│  │  │  │  │  • GET /health  ◄── Liveness        │ │  │       │ │
│  │  │  │  │  • GET /ready   ◄── Readiness       │ │  │       │ │
│  │  │  │  │  • POST /api/signup                  │ │  │       │ │
│  │  │  │  │  • POST /api/login                   │ │  │       │ │
│  │  │  │  │  • GET/POST /api/appointments        │ │  │       │ │
│  │  │  │  │  • POST /api/medicalrecords          │ │  │       │ │
│  │  │  │  │  • POST /api/billings                │ │  │       │ │
│  │  │  │  └──────────────────────────────────────┘ │  │       │ │
│  │  │  │                                             │  │       │ │
│  │  │  │  Probes:                                    │  │       │ │
│  │  │  │  ✓ Startup:   GET /health (0s, 10s, 30x)  │  │       │ │
│  │  │  │  ✓ Liveness:  GET /health (15s, 20s, 3x)  │  │       │ │
│  │  │  │  ✓ Readiness: GET /ready (5s, 10s, 3x)    │  │       │ │
│  │  │  └────────────────────────────────────────────┘  │       │ │
│  │  └──────────────────────────────────────────────────┘       │ │
│  │                            │                                  │ │
│  │  ┌──────────────────────────────────────────────────┐       │ │
│  │  │  Healthcare Backend Pod 2                         │       │ │
│  │  │  (Same structure as Pod 1)                        │       │ │
│  │  └──────────────────────────────────────────────────┘       │ │
│  │                            │                                  │ │
│  └────────────────────────────┼──────────────────────────────── │ │
│                               │                                  │
│                               │ Connects to MongoDB              │
│                               ▼                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  MongoDB Pod                                              │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  Container: mongodb                                 │  │  │
│  │  │                                                      │  │  │
│  │  │  • Image: mongo:6.0                                 │  │  │
│  │  │  • Port: 27017                                      │  │  │
│  │  │  • Database: health                                 │  │  │
│  │  │  • Storage: emptyDir volume                         │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │                                                            │  │
│  │  Service: mongodb-service (ClusterIP: None - Headless)   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Probe Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    Pod Lifecycle with Probes                     │
└─────────────────────────────────────────────────────────────────┘

Pod Created
    │
    ▼
┌─────────────────────────────────────────────────────┐
│  STARTUP PROBE (runs first)                         │
│                                                      │
│  GET /health every 10s                              │
│  Allows up to 5 minutes for app to start           │
│  (30 failures × 10s = 300s)                         │
│                                                      │
│  ❌ Failure: Keep trying (up to 30 times)           │
│  ✓ Success: Move to next phase                     │
└─────────────────────┬───────────────────────────────┘
                      │
                      ▼
        ┌─────────────────────────┐
        │   Startup Successful    │
        └─────────────────────────┘
                      │
    ┌─────────────────┴─────────────────┐
    │                                   │
    ▼                                   ▼
┌──────────────────────┐    ┌──────────────────────┐
│   LIVENESS PROBE     │    │   READINESS PROBE    │
│   (runs in parallel) │    │   (runs in parallel) │
│                      │    │                      │
│  GET /health         │    │  GET /ready          │
│  Every 20s           │    │  Every 10s           │
│                      │    │                      │
│  Checks: Is app      │    │  Checks: Can app     │
│  alive?              │    │  serve traffic?      │
│                      │    │                      │
│  ✓ Success:          │    │  ✓ Success:          │
│    Keep running      │    │    Add to service    │
│                      │    │    endpoints         │
│  ❌ 3 failures:      │    │                      │
│    RESTART POD       │    │  ❌ 3 failures:      │
│    (Container killed)│    │    Remove from       │
│                      │    │    service (no       │
│                      │    │    traffic)          │
└──────────────────────┘    └──────────────────────┘
```

## Health Check Decision Tree

```
                        ┌──────────────┐
                        │ Probe Request│
                        └──────┬───────┘
                               │
                ┌──────────────┴──────────────┐
                │  Which probe is running?    │
                └──────────┬──────────────────┘
                           │
        ┏━━━━━━━━━━━━━━━━━━┻━━━━━━━━━━━━━━━━━━┓
        ▼                                      ▼
┌────────────────┐                   ┌────────────────┐
│ Startup Probe  │                   │ Liveness Probe │
│  /health       │                   │  /health       │
└────────┬───────┘                   └────────┬───────┘
         │                                    │
         │ Check: Is app                      │ Check: Is app
         │ started?                           │ alive?
         │                                    │
         │ YES: Return 200                    │ YES: Return 200
         │ NO:  Return 5xx                    │ NO:  Return 5xx
         │                                    │
         ▼                                    ▼
   ┌────────────┐                        ┌────────────┐
   │ Success?   │                        │ Success?   │
   └─────┬──────┘                        └─────┬──────┘
         │                                     │
    YES ┌┴┐ NO                            YES ┌┴┐ NO
        │ │                                   │ │
        │ └──► Wait & Retry                   │ └──► 3 failures?
        │       (up to 30x)                   │          │
        │                                     │      YES │ NO
        ▼                                     │          │
   Enable other                               │          └──► Wait
   probes                                     ▼               & Retry
                                         RESTART POD

                        ▼
                ┌────────────────┐
                │ Readiness Probe│
                │  /ready        │
                └────────┬───────┘
                         │
                         │ Check: Is app ready?
                         │ - DB connected?
                         │ - Dependencies OK?
                         │
                         │ YES: Return 200
                         │ NO:  Return 503
                         │
                         ▼
                   ┌────────────┐
                   │ Success?   │
                   └─────┬──────┘
                         │
                    YES ┌┴┐ NO
                        │ │
                        │ └──► 3 failures?
                        │          │
                        │      YES │ NO
                        │          │
                        ▼          └──► Wait & Retry
                   Add to service
                   endpoints         Remove from
                   (receive          service
                   traffic)          (no traffic)
```

## Resource Configuration

### Backend Deployment
- **Replicas**: 2 pods
- **Image**: healthcare-backend:latest
- **Port**: 5000
- **Resources**:
  - Requests: 256Mi memory, 250m CPU
  - Limits: 512Mi memory, 500m CPU

### MongoDB Deployment
- **Replicas**: 1 pod
- **Image**: mongo:6.0
- **Port**: 27017
- **Resources**:
  - Requests: 512Mi memory, 250m CPU
  - Limits: 1Gi memory, 500m CPU
- **Storage**: emptyDir (ephemeral)

## Probe Configuration Summary

| Probe Type | Path     | Initial Delay | Period | Timeout | Failures | Purpose                          |
|------------|----------|---------------|--------|---------|----------|----------------------------------|
| Startup    | /health  | 0s            | 10s    | 5s      | 30       | Allow slow startup (5 min max)   |
| Liveness   | /health  | 15s           | 20s    | 5s      | 3        | Restart unhealthy containers     |
| Readiness  | /ready   | 5s            | 10s    | 5s      | 3        | Control traffic routing          |

## Health Check Responses

### /health Endpoint
**Success (200 OK)**:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-15T10:30:00.000Z",
  "service": "healthcare-backend"
}
```

### /ready Endpoint
**Ready (200 OK)**:
```json
{
  "status": "ready",
  "database": "connected",
  "timestamp": "2025-10-15T10:30:00.000Z",
  "service": "healthcare-backend"
}
```

**Not Ready (503 Service Unavailable)**:
```json
{
  "status": "not ready",
  "database": "disconnected",
  "timestamp": "2025-10-15T10:30:00.000Z",
  "service": "healthcare-backend"
}
```

## Traffic Flow

1. External request → NodePort (30080)
2. Service → Load balances to ready pods only
3. Pod receives request if:
   - Startup probe passed
   - Liveness probe passing
   - Readiness probe passing (last 3 checks)
4. Pod processes request
5. Returns response

## Failure Scenarios

### Scenario 1: MongoDB Down
- **Effect**: Readiness probe fails (503 from /ready)
- **K8s Action**: Remove pod from service endpoints
- **Result**: No traffic to affected pods, no restart
- **Recovery**: When MongoDB reconnects, readiness passes, pod added back

### Scenario 2: Application Crash
- **Effect**: Liveness probe fails (no response from /health)
- **K8s Action**: Restart container after 3 failures (60s)
- **Result**: Pod restarted, restart count increases
- **Recovery**: New container starts, goes through startup probe

### Scenario 3: Slow Startup
- **Effect**: Startup probe gives 5 minutes to initialize
- **K8s Action**: Keeps trying, doesn't fail liveness probe
- **Result**: Pod eventually becomes ready
- **Recovery**: Once startup passes, normal probes take over

### Scenario 4: Temporary Network Issue
- **Effect**: Probes may fail transiently
- **K8s Action**: Requires 3 consecutive failures
- **Result**: Tolerates brief outages
- **Recovery**: Automatic when network recovers

## Monitoring Points

1. **Pod Status**: `kubectl get pods`
2. **Probe Events**: `kubectl describe pod <name>`
3. **Application Logs**: `kubectl logs <name>`
4. **Service Endpoints**: `kubectl get endpoints`
5. **Resource Usage**: `kubectl top pods`
6. **Cluster Events**: `kubectl get events`

## Security Considerations

1. Health endpoints are unauthenticated (by design)
2. Readiness checks database connection (validates dependencies)
3. Resource limits prevent resource exhaustion
4. Multiple replicas provide high availability
5. NodePort exposes service externally (consider LoadBalancer/Ingress for production)

## Production Recommendations

1. Use secrets for sensitive configuration
2. Add TLS/SSL for external access
3. Implement proper logging and monitoring
4. Add persistent storage for MongoDB
5. Configure network policies
6. Set up horizontal pod autoscaling (HPA)
7. Use liveness/readiness probes consistently
8. Monitor probe failure rates
9. Set up alerts for continuous failures
10. Regular backup of MongoDB data
