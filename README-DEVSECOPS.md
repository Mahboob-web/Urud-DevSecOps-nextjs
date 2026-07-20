# DevSecOps setup for Speak in Urdu

## What is included
- GitHub Actions CI pipeline
- Docker container build
- Trivy image scanning
- Ansible deployment playbook
- Kubernetes deployment manifest
- AWS free-tier deployment guidance

## Quick start
1. Create a GitHub repository and push this code.
2. Add the following secrets in GitHub:
   - AWS_ACCESS_KEY_ID
   - AWS_SECRET_ACCESS_KEY
   - AWS_REGION
   - EC2_SSH_KEY
3. Build locally:
   - `docker compose up --build`
4. Deploy with Ansible:
   - `ansible-playbook -i ansible/inventory.ini ansible/playbook.yml`

## AWS free-tier plan
- EC2 t2.micro or t3.micro
- ECR is optional; for a first deployment, use Docker Hub or local build
- Use an Ubuntu 22.04 instance with 20 GB storage
- Open ports: 22, 80, 443

## Recommended workflow
1. Push code to GitHub
2. GitHub Actions runs build and scans
3. Merge to main
4. Deploy via Ansible or GitHub Actions to EC2
