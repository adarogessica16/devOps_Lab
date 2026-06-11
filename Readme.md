# Registro de Gastos — DevOps Lab

Aplicación multicapa (Frontend + Backend + PostgreSQL) desplegada en Kubernetes local con Minikube, integrada con un pipeline CI/CD en Jenkins y monitoreo con Prometheus + Grafana.

---

## Requisitos previos

| Herramienta | Versión mínima | Instalación |
|-------------|----------------|-------------|
| Docker      | 24+            | https://docs.docker.com/get-docker/ |
| kubectl     | 1.28+          | https://kubernetes.io/docs/tasks/tools/ |
| Minikube    | 1.32+          | https://minikube.sigs.k8s.io/docs/start/ |
| Helm        | 3+             | https://helm.sh/docs/intro/install/ |

---

## Estructura del proyecto

```
.
├── backend/
│   ├── Dockerfile
│   └── src/
│       └── app.ts
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── src/
├── jenkins-node/
│   └── Dockerfile
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
│Jenkinsfile-build
│Jenkinsfile-push
```

---

## Parte 1 — Kubernetes Local

### 1. Iniciar el clúster

```bash
minikube start --driver=docker
kubectl get nodes
```

### 2. Crear el namespace

```bash
kubectl apply -f k8s/namespace/namespace.yaml

# Linux/macOS
kubectl get namespaces | grep devops-lab

# Windows PowerShell
kubectl get namespaces | Select-String devops-lab
```

### 3. Base de datos (PostgreSQL)

```bash
kubectl apply -f k8s/database/db-secret.yaml
kubectl apply -f k8s/database/db-pvc.yaml
kubectl apply -f k8s/database/db-deployment.yaml
kubectl apply -f k8s/database/db-service.yaml

# Verificar
kubectl get pods -n devops-lab -l app=postgres
kubectl get pvc -n devops-lab
```

### 4. Backend

```bash
# Apuntar Docker al daemon de Minikube
eval $(minikube docker-env)
# Windows PowerShell: minikube docker-env --shell powershell | Invoke-Expression

docker build -t registro-gastos-backend:1.0 ./backend

kubectl apply -f k8s/backend/backend-configmap.yaml
kubectl apply -f k8s/backend/backend-deployment.yaml
kubectl apply -f k8s/backend/backend-service.yaml

# Verificar
kubectl get pods -n devops-lab -l app=backend
kubectl logs -l app=backend -n devops-lab
```

### 5. Frontend

```bash
docker build -t registro-gastos-frontend:1.0 ./frontend

kubectl apply -f k8s/frontend/frontend-deployment.yaml
kubectl apply -f k8s/frontend/frontend-service.yaml
```

### 6. Acceder a la aplicación

```bash
# URL del frontend
minikube service frontend-service -n devops-lab --url

# Port-forward al backend
kubectl port-forward deployment/backend-deployment 3000:3000 -n devops-lab
# → http://localhost:3000/api-docs/
# → http://localhost:3000/health
# → http://localhost:3000/version
```

### 7. Validación

```bash
# Ver todos los recursos
kubectl get all -n devops-lab

# Conectarse a PostgreSQL
kubectl exec -it <nombre-pod-postgres> -n devops-lab -- psql -U postgres -d registro_gastos
# \dt              → listar tablas
# \d gastos        → estructura de la tabla
# SELECT * FROM gastos;
# \q               → salir

# Probar backend desde dentro del clúster
kubectl run test-curl --image=curlimages/curl -it --rm --restart=Never \
  -n devops-lab -- curl http://backend-service:3000/health
```

### 8. Escalado y resiliencia

```bash
# Escalar a 3 réplicas
kubectl scale deployment backend-deployment --replicas=3 -n devops-lab

# Eliminar un pod y observar recreación automática
kubectl delete pod <nombre-pod> -n devops-lab
kubectl get pods -n devops-lab -l app=backend -w
```

---
## Entrega Final
## Parte 2 — CI/CD con Jenkins

### 1. Dockerfile de Jenkins

```dockerfile
FROM jenkins/jenkins:lts
USER root

# Node.js
RUN apt update && apt install -y curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt install -y nodejs

# kubectl
RUN curl -LO "https://dl.k8s.io/release/$(curl -Ls https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl" \
    && chmod +x kubectl \
    && mv kubectl /usr/local/bin/kubectl

# Docker CLI
RUN curl -fsSL https://get.docker.com | sh

USER jenkins
```

```bash
cd ~/jenkins-node
docker build -t jenkins-node .

docker run -d \
  --name jenkins \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  --network host \
  jenkins-node
```

### 2. Configurar kubectl dentro de Jenkins

```bash
minikube start --driver=docker

kubectl config view --raw --minify --flatten | \
  sed 's|https://127.0.0.1:8080|https://192.168.49.2:8443|g' > /tmp/kube-config-jenkins

docker exec -u root jenkins mkdir -p /var/jenkins_home/.kube
docker cp /tmp/kube-config-jenkins jenkins:/var/jenkins_home/.kube/config
docker exec -u root jenkins chown -R jenkins:jenkins /var/jenkins_home/.kube

# Verificar
docker exec -e KUBECONFIG=/var/jenkins_home/.kube/config jenkins kubectl get nodes

# Hacer permanente
docker exec -u root jenkins bash -c \
  'echo "export KUBECONFIG=/var/jenkins_home/.kube/config" >> /etc/environment'
```

### 3. Cambio requerido en los YAMLs

Al integrar Jenkins con Docker Hub, los pods necesitan descargar imágenes desde el registro remoto. Actualizar en `backend-deployment.yaml` y `frontend-deployment.yaml`:

```yaml
containers:
    imagePullPolicy: Always    # antes: Never
```

### 4. Endpoint `/version` (backend/src/app.ts)

```typescript
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/version', (_req, res) => {
  res.json({
    version: process.env.npm_package_version ?? '1.0.0',
    app: 'registro-gastos-backend',
    environment: process.env.NODE_ENV ?? 'production'
  });
});
```

### 5. Pipeline — `registro-gastos-build`

Hace checkout del repositorio y compila backend y frontend. Si tiene éxito, dispara el pipeline de push.

```groovy
pipeline {
    agent any
    stages {
        stage('Checkout') {
            steps {
                git branch: 'devopsv2',
                    url: 'https://github.com/adarogessica16/devOps_Lab.git'
            }
        }
        stage('Build Backend') {
            steps {
                dir('backend') {
                    sh 'npm ci'
                    sh 'npm run build'
                }
            }
        }
        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    sh 'npm ci'
                    sh 'npm run build'
                }
            }
        }
    }
    post {
        success {
            echo 'BUILD SUCCESS'
            build job: 'registros-gastos-push'
        }
    }
}
```

### 6. Pipeline — `registros-gastos-push`

Construye y sube imágenes a Docker Hub y despliega en Kubernetes.

```groovy
pipeline {
    agent any
    environment {
        BACKEND_IMAGE  = "lourdesvalenzuela/registros-gastos-backend"
        FRONTEND_IMAGE = "lourdesvalenzuela/registros-gastos-frontend"
        IMAGE_TAG      = "${BUILD_NUMBER}"
        KUBECONFIG     = "/var/jenkins_home/.kube/config"
        NAMESPACE      = "devops-lab"
    }
    stages {
        stage('Checkout') {
            steps {
                git branch: 'devopsv2',
                    url: 'https://github.com/adarogessica16/devOps_Lab.git'
            }
        }
        stage('Docker Build & Push') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'docker-hub-credentials',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
                    sh "docker build -t ${BACKEND_IMAGE}:${IMAGE_TAG} ./backend"
                    sh "docker push ${BACKEND_IMAGE}:${IMAGE_TAG}"
                    sh "docker build -t ${FRONTEND_IMAGE}:${IMAGE_TAG} ./frontend"
                    sh "docker push ${FRONTEND_IMAGE}:${IMAGE_TAG}"
                }
            }
        }
        stage('Deploy en Kubernetes') {
            steps {
                sh """
                    kubectl set image deployment/backend-deployment \
                        backend=${BACKEND_IMAGE}:${IMAGE_TAG} \
                        -n ${NAMESPACE}
                    kubectl set image deployment/frontend-deployment \
                        frontend=${FRONTEND_IMAGE}:${IMAGE_TAG} \
                        -n ${NAMESPACE}
                    kubectl rollout status deployment/backend-deployment -n ${NAMESPACE}
                    kubectl rollout status deployment/frontend-deployment -n ${NAMESPACE}
                """
            }
        }
        stage('Validacion') {
            steps {
                sh """
                    echo '=== Pods activos ==='
                    kubectl get pods -n ${NAMESPACE}
                    echo '=== Servicios ==='
                    kubectl get services -n ${NAMESPACE}
                    echo '=== Verificando backend /health ==='
                    kubectl run test-health --image=curlimages/curl \
                        --restart=Never --rm -it \
                        -n ${NAMESPACE} \
                        -- curl -sf http://backend-service:3000/health && echo 'OK' || echo 'FALLO'
                """
            }
        }
    }
    post {
        always { sh 'docker logout' }
        success { echo "Deploy exitoso - imagen tag: ${IMAGE_TAG}" }
        failure { echo "Pipeline fallido - revisá los logs" }
    }
}
```

### Flujo completo

```
Commit en GitHub (rama devopsv2)
        ↓
registro-gastos-build
  → Checkout
  → npm ci + npm run build (backend)
  → npm ci + npm run build (frontend)
        ↓ (success)
registros-gastos-push
  → Docker Build & Push → Docker Hub
  → kubectl set image + rollout status
  → Validación /health
        ↓
Docker Hub actualizado + Kubernetes desplegado
```

### Imágenes en Docker Hub

```
lourdesvalenzuela/registros-gastos-backend:<BUILD_NUMBER>
lourdesvalenzuela/registros-gastos-frontend:<BUILD_NUMBER>
```

---

## Parte 3 — Monitoreo con Prometheus + Grafana

### 1. Instalación con Helm

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

kubectl create namespace monitoring

helm install monitoring prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --set grafana.adminPassword=admin123 \
  --set prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues=false
```

### 2. Verificar pods

```bash
kubectl get pods -n monitoring
```

### 3. Acceder a Grafana

```bash
kubectl port-forward -n monitoring svc/monitoring-grafana 3001:80
```

| Campo     | Valor               |
|-----------|---------------------|
| URL       | http://localhost:3001 |
| Usuario   | admin               |
| Contraseña | admin123           |

### 4. Query de métricas (Explore → Code)

```promql
container_memory_working_set_bytes{namespace="devops-lab"}
```

Muestra uso de memoria en tiempo real de los pods `backend-deployment`, `frontend-deployment` y `db-deployment`.

---

## Comandos de diagnóstico

```bash
# Describir un pod con errores
kubectl describe pod <nombre-pod> -n devops-lab

# Logs en tiempo real
kubectl logs -f <nombre-pod> -n devops-lab

# Shell interactivo en un pod
kubectl exec -it <nombre-pod> -n devops-lab -- sh

# Eventos del namespace ordenados por tiempo
kubectl get events -n devops-lab --sort-by='.lastTimestamp'

# Uso de recursos
kubectl top pods -n devops-lab
```

---

## Limpieza del entorno

```bash
kubectl delete namespace devops-lab
minikube stop
```

---

## Problemas encontrados y soluciones

| Problema | Solución |
|----------|----------|
| Jenkins sin `kubectl` | Agregar `kubectl` al Dockerfile y copiar kubeconfig |
| `kubeconfig` apuntaba a `127.0.0.1:8080` | Usar `--flatten` y reemplazar IP por la de Minikube (`192.168.49.2:8443`) |
| `ErrImageNeverPull` en pods | Cambiar `imagePullPolicy: Never` → `Always` |
| `exceeded its progress deadline` | Aumentar `progressDeadlineSeconds` a 300 e `initialDelaySeconds` del readiness probe |
| `/health` retornaba 404 | El endpoint fue eliminado accidentalmente al agregar `/version`; se restauró |
| Grafana sin datos en dashboards | Usar Explore con query PromQL directa |
