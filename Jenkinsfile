pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                git branch: 'dev',
                    url: 'https://github.com/adarogessica16/devOps_Lab.git'
            }
        }

        stage('Backend - Install') {
            steps {
                dir('backend') { sh 'npm ci' }
            }
        }

        stage('Backend - Generate Prisma') {
            steps {
                dir('backend') { sh 'npx prisma generate' }
            }
        }

        stage('Backend - Build') {
            steps {
                dir('backend') { sh 'npm run build' }
            }
        }

        stage('Frontend - Install') {
            steps {
                dir('frontend') { sh 'npm ci' }
            }
        }

        stage('Frontend - Build') {
            steps {
                dir('frontend') { sh 'npm run build' }
            }
        }
    }

    post {
        success {
            echo "Build #${BUILD_NUMBER} exitoso — disparando pipeline Docker"
            build job: 'devops-lab-docker', wait: false
        }
        failure {
            echo "Build #${BUILD_NUMBER} fallido"
        }
        always {
            cleanWs()
        }
    }
}