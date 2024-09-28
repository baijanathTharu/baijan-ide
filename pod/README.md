# Pod

This is the container that will be assigned to user when they request for a workspace.

## Build the image

```bash
docker build -t baijan-ide-pod .
```

### Tag the image to push to dockerhub

```bash
docker tag baijan-ide-pod:latest baijan/baijan-ide-pod:latest
```

### Push the image to dockerhub

```bash
docker push baijan/baijan-ide-pod:latest
```

## Accessing the backend

```
curl http://baijan-ide-backend-service.default.svc.cluster.local:4000/ping
```
