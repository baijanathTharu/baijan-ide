Deployment for the backend app

```sh
kubectl apply -f backend.yml
```

## To send request to the pod

Start the service before sending request to the pod

```bash
minikube service baijan-ide-backend-service-np --url

```
