
pipeline {
    agent any

    tools {
        nodejs 'node20'
    }

    environment {
        DOCKERHUB_REPO   = 'mahboobdev/react-app'   // TODO: replace
        IMAGE_TAG        = "${env.BUILD_NUMBER}"
        K8S_NAMESPACE    = 'default'                        // TODO: replace
        K8S_DEPLOYMENT   = 'react-app-deployment'            // TODO: replace
        K8S_CONTAINER    = 'react-app'                       // TODO: replace
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install & Build') {
            steps {
                sh 'npm ci'
                sh 'npm run build'
            }
        }

        stage('SonarQube Analysis') {
    environment {
        SCANNER_HOME = tool 'sonar-scanner'
    }
    steps {
        withSonarQubeEnv('sonarqube') {
            sh '''
                $SCANNER_HOME/bin/sonar-scanner \
                  -Dsonar.projectKey=react-app \
                  -Dsonar.sources=src \
                  -Dsonar.host.url=$SONAR_HOST_URL \
                  -Dsonar.token=$SONAR_AUTH_TOKEN
            '''
        }
    }
}

        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Docker Build') {
            steps {
                sh "docker build -t ${DOCKERHUB_REPO}:${IMAGE_TAG} -t ${DOCKERHUB_REPO}:latest ."
            }
        }

        stage('Trivy Scan') {
            steps {
                sh "trivy image --exit-code 0 --severity HIGH,CRITICAL --format table ${DOCKERHUB_REPO}:${IMAGE_TAG}"
                // Change --exit-code to 1 once you want the build to fail on findings
            }
        }

        stage('Push to DockerHub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
                    sh "docker push ${DOCKERHUB_REPO}:${IMAGE_TAG}"
                    sh "docker push ${DOCKERHUB_REPO}:latest"
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                withCredentials([file(credentialsId: 'kubeconfig-cred', variable: 'KUBECONFIG')]) {
                    sh """
                        kubectl set image deployment/${K8S_DEPLOYMENT} ${K8S_CONTAINER}=${DOCKERHUB_REPO}:${IMAGE_TAG} -n ${K8S_NAMESPACE}
                        kubectl rollout status deployment/${K8S_DEPLOYMENT} -n ${K8S_NAMESPACE}
                    """
                }
            }
        }
    }

    post {
        always {
            sh 'docker logout || true'
        }
        failure {
            echo 'Pipeline failed — check stage logs above.'
        }
    }
}
