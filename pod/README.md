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
