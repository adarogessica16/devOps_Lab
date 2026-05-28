pipeline {
    agent any

    environment {
        DOCKER_HOST    = 'tcp://172.30.5.101:2375'
        BACKEND_IMAGE  = 'devops-lab-backend'
        FRONTEND_IMAGE = 'devops-lab-frontend'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
                echo "Rama: ${env.BRANCH_NAME}"
            }
        }

        stage('Backend - Install') {
            steps {
                dir('backend') {
                    sh 'npm ci'
                }
            }
        }

        stage('Backend - Generate Prisma') {
            steps {
                dir('backend') {
                    sh 'npx prisma generate'
                }
            }
        }

        stage('Backend - Build') {
            steps {
                dir('backend') {
                    sh 'npm run build'
                }
            }
        }

        stage('Frontend - Install') {
            steps {
                dir('frontend') {
                    sh 'npm ci'
                }
            }
        }

        stage('Frontend - Build') {
            steps {
                dir('frontend') {
                    sh 'npm run build'
                }
            }
        }

        stage('Docker - Build Images') {
            steps {
                sh '''
                    DOCKER_HOST=${DOCKER_HOST} docker build \
                        -t ${BACKEND_IMAGE}:${BUILD_NUMBER} \
                        -t ${BACKEND_IMAGE}:latest \
                        ./backend

                    DOCKER_HOST=${DOCKER_HOST} docker build \
                        -t ${FRONTEND_IMAGE}:${BUILD_NUMBER} \
                        -t ${FRONTEND_IMAGE}:latest \
                        ./frontend
                '''
            }
        }
    }

    post {
        success {
            echo "Build #${BUILD_NUMBER} exitoso"
        }
        failure {
            echo "Build #${BUILD_NUMBER} fallido — revisar Console Output"
        }
        always {
            cleanWs()
        }
    }
}