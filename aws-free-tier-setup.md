# AWS free-tier setup guide

## 1. Create an EC2 instance
- Use Ubuntu 22.04 LTS
- Instance type: t2.micro or t3.micro
- Storage: 20 GB or more
- Security group: allow SSH (22), HTTP (80), HTTPS (443)

## 2. Connect to the instance
```bash
ssh -i ~/.ssh/aws-ec2-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

## 3. Install Docker and Ansible locally
```bash
sudo apt update
sudo apt install -y docker.io docker-compose-plugin ansible
sudo systemctl enable docker --now
```

## 4. Add your SSH key to GitHub secrets
Required secrets:
- EC2_HOST
- EC2_SSH_KEY

## 5. Deploy
Push to main or trigger the GitHub Actions workflow manually.
