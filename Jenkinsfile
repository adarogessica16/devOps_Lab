pipeline {
    agent any

    environment {
        BACKEND_IMAGE  = "adarogessi/registro-gastos-backend"
        FRONTEND_IMAGE = "adarogessi/registro-gastos-frontend"
        IMAGE_TAG      = "${BUILD_NUMBER}"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
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

        stage('Deploy to Kubernetes') {
            steps {
                withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
                    sh """
                        kubectl set image deployment/backend-deployment \
                          backend=${BACKEND_IMAGE}:${IMAGE_TAG} \
                          -n devops-lab --kubeconfig=$KUBECONFIG

                        kubectl rollout status deployment/backend-deployment \
                          -n devops-lab --kubeconfig=$KUBECONFIG
                    """
                }
            }
        }
    }

    post {
        always {
            sh 'docker logout'
        }
        success {
            echo " Deploy ${IMAGE_TAG} exitoso"
        }
        failure {
            echo "Pipeline falló en stage: ${STAGE_NAME}"
        }
    }
}
