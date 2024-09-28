# Backend

This is the container that will handle all the backend logic.

## Build the image

```bash
docker build -t baijan-ide-backend .
```

### Tag the image to push to dockerhub

```bash
docker tag baijan-ide-backend:latest baijan/baijan-ide-backend:latest
```

### Push the image to dockerhub

```bash
docker push baijan/baijan-ide-backend:latest
```
