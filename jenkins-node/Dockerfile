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
