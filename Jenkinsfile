pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                echo "Rama: ${env.BRANCH_NAME}"
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
            // Dispara el Pipeline 2 automáticamente
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