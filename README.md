# Speak in Urdu

Speak in Urdu is a modern React + Vite website for showcasing courses, pricing, blog content, and contact/booking forms.

## Project Overview

This project is a static website that can be built, containerized, and deployed with modern DevSecOps practices including:

- Git and GitHub version control
- GitHub Actions CI/CD
- Docker containerization
- Security scanning with Trivy
- Ansible-based deployment
- Kubernetes deployment starter
- AWS free-tier deployment guidance

## Features

- Fast frontend built with React and Vite
- Server-side rendering support
- Static site generation for better SEO
- Contact, booking, and newsletter forms
- Blog pages and public website content

## Tech Stack

- React
- Vite
- Node.js
- Docker
- Nginx
- GitHub Actions
- Ansible
- Kubernetes

## Local Development

### Requirements

- Node.js 20+
- npm
- Docker (optional, for containerized runs)

### Install dependencies

```bash
npm install
```

### Run locally

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

## Run with Docker

Build the image:

```bash
docker build -t speak-in-urdu .
```

Run the container:

```bash
docker run -p 8080:80 speak-in-urdu
```

Then open:

```text
http://localhost:8080
```

## DevSecOps Setup

This repository includes:

- CI workflow in [.github/workflows/ci.yml](.github/workflows/ci.yml)
- EC2 deployment workflow in [.github/workflows/deploy-ec2.yml](.github/workflows/deploy-ec2.yml)
- Docker configuration in [Dockerfile](Dockerfile)
- Container orchestration config in [docker-compose.yml](docker-compose.yml)
- Ansible deployment files in [ansible/playbook.yml](ansible/playbook.yml)
- Kubernetes manifest in [k8s/deployment.yaml](k8s/deployment.yaml)

## Deployment Guide

For AWS free-tier deployment instructions, see [aws-free-tier-setup.md](aws-free-tier-setup.md).

For a full DevSecOps overview, see [README-DEVSECOPS.md](README-DEVSECOPS.md).

## GitHub Workflow

1. Push your code to GitHub
2. GitHub Actions will run the build and scan workflow
3. Deploy to an EC2 instance using the deployment workflow

## License

This project is for personal and educational use unless otherwise specified.
