# Pod

This is the container that will be assigned to user when they request for a workspace.

## Build the image

```bash
docker build -t pod .
```

### Tag the image to push to dockerhub

```bash
docker tag pod:latest baijan/pod-ide:latest
```

### Push the image to dockerhub

```bash
docker push baijan/pod-ide:latest
```

## To send request to the pod

Start the service before sending request to the pod

```bash
minikube service workspace-service-123 --url

```
