# Registro de Gastos — Kubernetes Local

Aplicación multicapa (Frontend + Backend + PostgreSQL) desplegada en Kubernetes local con Minikube.

---

## Requisitos previos

| Herramienta | Versión mínima | Instalación |
|-------------|---------------|-------------|
| Docker      | 24+           | https://docs.docker.com/get-docker/ |
| kubectl     | 1.28+         | https://kubernetes.io/docs/tasks/tools/ |
| Minikube    | 1.32+         | https://minikube.sigs.k8s.io/docs/start/ |

---

## Estructura del proyecto

```
.
├── backend/
│   ├── Dockerfile
│   └── src/
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── src/
└── k8s/
    ├── namespace/
    │   └── namespace.yaml
    ├── database/
    │   ├── db-secret.yaml
    │   ├── db-pvc.yaml
    │   ├── db-deployment.yaml
    │   └── db-service.yaml
    ├── backend/
    │   ├── backend-configmap.yaml
    │   ├── backend-deployment.yaml
    │   └── backend-service.yaml
    └── frontend/
        ├── frontend-deployment.yaml
        └── frontend-service.yaml
```

---

## Parte 1: Preparación del entorno

### 1.1 Iniciar el clúster local

```bash
minikube start --driver=docker
```

### 1.2 Verificar nodos

```bash
kubectl get nodes
# Resultado esperado: minikube   Ready   control-plane   ...
```

### 1.3 Crear el namespace

```bash
kubectl apply -f k8s/namespace/namespace.yaml

# Verificar 
kubectl get namespaces | grep devops-lab

#Verificar en caso de Windows  PowerShell
kubectl get namespaces | Select-String devops-lab
```

---

## Parte 2: Base de datos

### 2.1 Crear el Secret con credenciales

```bash
kubectl apply -f k8s/database/db-secret.yaml

# Verificar (los valores aparecen ofuscados)
kubectl get secret db-secret -n devops-lab
kubectl describe secret db-secret -n devops-lab
```

### 2.2 Crear el PersistentVolumeClaim

```bash
kubectl apply -f k8s/database/db-pvc.yaml

# Verificar
kubectl get pvc -n devops-lab
```

### 2.3 Crear el Deployment de PostgreSQL

```bash
kubectl apply -f k8s/database/db-deployment.yaml

# Verificar que el pod esté Running
kubectl get pods -n devops-lab -l app=postgres
kubectl describe pod -l app=postgres -n devops-lab
```

### 2.4 Crear el Service interno

```bash
kubectl apply -f k8s/database/db-service.yaml

# Verificar
kubectl get service db-service -n devops-lab
```

---

## Parte 3: Backend

### 3.1 Construir la imagen Docker

```bash
# Apuntar Docker al daemon de Minikube (las imágenes quedan disponibles en el clúster)
eval $(minikube docker-env)

#En caso de Window con PowerShell usar
minikube docker-env --shell powershell | Invoke-Expression

# Construir la imagen
docker build -t registro-gastos-backend:1.0 ./backend
```

### 3.2 Aplicar ConfigMap

```bash
kubectl apply -f k8s/backend/backend-configmap.yaml

# Verificar
kubectl get configmap backend-config -n devops-lab
kubectl describe configmap backend-config -n devops-lab
```

### 3.3 Crear el Deployment del backend

```bash
kubectl apply -f k8s/backend/backend-deployment.yaml

# Verificar
kubectl get pods -n devops-lab -l app=backend
kubectl logs -l app=backend -n devops-lab
```

### 3.4 Crear el Service del backend

```bash
kubectl apply -f k8s/backend/backend-service.yaml

# Verificar
kubectl get service backend-service -n devops-lab
```

---

## Parte 4: Frontend

### 4.1 Construir la imagen Docker

```bash
# (Si cerraste la terminal, volver a ejecutar esto)
eval $(minikube docker-env)

docker build -t registro-gastos-frontend:1.0 ./frontend
```

### 4.2 Crear el Deployment del frontend

```bash
kubectl apply -f k8s/frontend/frontend-deployment.yaml

# Verificar
kubectl get pods -n devops-lab -l app=frontend
```

### 4.3 Exponer con Service NodePort

```bash
kubectl apply -f k8s/frontend/frontend-service.yaml

# Verificar
kubectl get service frontend-service -n devops-lab
```

### 4.4 Acceder al frontend desde el navegador

```bash
minikube service frontend-service -n devops-lab --url
# Abre la URL que devuelve en el navegador
```

```bash
kubectl port-forward deployment/backend-deployment 3000:3000 -n devops-lab
# Abre la URL del backend con http://localhost:3000/api-docs/

---

### Parte 5: Validación

```bash
# Ver todos los pods del namespace
kubectl get pods -n devops-lab

# Ver todos los servicios
kubectl get services -n devops-lab

# Ver todos los recursos juntos
kubectl get all -n devops-lab

# Ver logs de un pod específico
kubectl logs <nombre-del-pod> -n devops-lab

# Probar conexión al backend desde dentro del clúster
kubectl run test-curl --image=curlimages/curl -it --rm --restart=Never \
  -n devops-lab -- curl http://backend-service:3000/health
```

---

## Parte 6: Escalado y resiliencia

### 6.1 Escalar el backend a 3 réplicas

```bash
kubectl scale deployment backend-deployment --replicas=3 -n devops-lab

# Verificar las 3 réplicas
kubectl get pods -n devops-lab -l app=backend
```

### 6.2 Eliminar un pod manualmente

```bash
# Obtener el nombre de un pod
kubectl get pods -n devops-lab -l app=backend

# Eliminar uno (reemplazar <nombre-pod> con el nombre real)
kubectl delete pod <nombre-pod> -n devops-lab

# Observar cómo Kubernetes lo recrea automáticamente
kubectl get pods -n devops-lab -l app=backend -w
```

### 6.3 Verificar recreación automática

```bash
# Kubernetes debe mantener siempre 3 réplicas activas
kubectl describe deployment backend-deployment -n devops-lab
```

---

## Comandos útiles de diagnóstico

```bash
# Describir un pod con errores
kubectl describe pod <nombre-pod> -n devops-lab

# Ver logs en tiempo real
kubectl logs -f <nombre-pod> -n devops-lab

# Entrar a un pod (debug interactivo)
kubectl exec -it <nombre-pod> -n devops-lab -- sh

# Ver eventos del namespace
kubectl get events -n devops-lab --sort-by='.lastTimestamp'

# Ver uso de recursos
kubectl top pods -n devops-lab
```

---

## Limpieza del entorno

```bash
# Eliminar todos los recursos del namespace
kubectl delete namespace devops-lab

# Detener Minikube
minikube stop
```
