# 🛠️ DevOps Architecture & Deployment Report

This document provides a comprehensive overview of the DevOps architecture, containerization strategy, and CI/CD automation pipeline configured for the **DevOps CRUD API Service**. It is formatted as an assignment submission detailing the system design, implementation decisions, and answers to core operational questions.

---

## 1. System Architecture Overview

The system is designed as a containerized Node.js (Express + TypeScript) REST API that interacts with a PostgreSQL AWS RDS instance via Prisma ORM.

```
                  ┌────────────────────────────────────────┐
                  │          CI/CD Automation              │
                  │             (Jenkins)                  │
                  └──────────┬──────────────────┬──────────┘
                             │ Builds & Tags    │ Deploys Container
                             ▼                  ▼
┌──────────────┐      ┌──────────────┐     ┌──────────────┐
│  Developer   │ ───> │  Docker Hub  │ ───>│  Target Host │
│  Git Push    │      │  (Registry)  │     │  (EC2 Linux) │
└──────────────┘      └──────────────┘     └──────┬───────┘
                                                  │ 
                                                  ▼
                                           ┌──────────────┐
                                           │  PostgreSQL  │ (RDS Instance)
                                           └──────────────┘
```

- **Runtime**: Node.js 20 on Alpine Linux (for a minimal vulnerability footprint and performance).
- **CI/CD Platform**: Jenkins executing a declarative pipeline.
- **Deployment Host**: Target Linux instance (EC2) running Docker Engine.
- **Database Connectivity**: The application connects to a PostgreSQL database hosted on AWS Relational Database Service (RDS), configured with access policies allowing the EC2 instance to read and write database structures.

---

## 2. Reverse Proxy Design & Domain Configuration (Nginx)

### Design Summary
Nginx is utilized as a name-based virtual host reverse proxy running on the target EC2 instance. It routes incoming requests based on the requested domain name, ensuring complete isolation and separate logging between services. HTTPS is strictly enforced via Certbot-managed SSL certificates, with automatic HTTP to HTTPS redirection.

- **`auth.mzsk.fun`** ➡️ Forwarded to the Auth application running on `127.0.0.1:5000`
- **`app.mzsk.fun`** ➡️ Forwarded to the CRUD application running on `127.0.0.1:4000`

Each application has its own dedicated server block, SSL certificate, access/error logs, and backend port, ensuring complete isolation between the two services. This separation prevents port conflicts and allows both applications to run independently on the same EC2 instance while sharing a single Nginx reverse proxy.

### Nginx Site Configurations

```nginx
# ==========================================
# 1. Auth Application Service Block (auth.mzsk.fun)
# ==========================================
server {
    server_name auth.mzsk.fun www.auth.mzsk.fun;
    access_log /var/log/nginx/auth-access.log;
    error_log /var/log/nginx/auth-error.log;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_cache_bypass $http_upgrade;
    }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/auth.mzsk.fun/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/auth.mzsk.fun/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}

server {
    if ($host = auth.mzsk.fun) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    listen 80;
    server_name auth.mzsk.fun www.auth.mzsk.fun;
    return 404; # managed by Certbot
}

# ==========================================
# 2. CRUD Application Service Block (app.mzsk.fun)
# ==========================================
server {
    server_name app.mzsk.fun www.app.mzsk.fun;
    access_log /var/log/nginx/app-access.log;
    error_log /var/log/nginx/app-error.log;

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_cache_bypass $http_upgrade;
    }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/app.mzsk.fun/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/app.mzsk.fun/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}

server {
    if ($host = app.mzsk.fun) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    listen 80;
    server_name app.mzsk.fun www.app.mzsk.fun;
    return 404; # managed by Certbot
}
```

---

## 3. Database Separation Strategy

Both applications use PostgreSQL, and we selected a single Amazon RDS PostgreSQL instance with two separate databases.

### RDS Configuration:
- **Engine**: PostgreSQL
- **Instance**: `db.t3.medium`
- **Storage**: 20 GB
- **Automated backups**: Enabled
- **Network**: Private subnet only
- **Access**: Allowed only from application EC2 instances through security groups

### Database Separation:
- **`auth_service`** ➡️ Used by Authentication application
- **`crud_service`** ➡️ Used by CRUD application

Each database has its own dedicated PostgreSQL user, and those credentials are configured only in the respective application's configuration.

#### Configuration Example:
- **Auth application** connects via user `auth_user` to database `auth_service`
- **CRUD application** connects via user `crud_user` to database `crud_service`

### Trade-offs Considered:
- **Shared RDS Instance (Chosen)**: A shared RDS instance was chosen because it provides lower cost and simpler management while maintaining logical isolation through separate databases and users.
- **Separate RDS Instances**: A separate RDS instance for each application would provide stronger resource isolation and independent scaling but would increase infrastructure cost and operational overhead.
- **Key Consideration**: The main consideration with the shared approach is that both applications share the same CPU, memory, and connection limits. This is acceptable for the current workload and can be scaled or separated in the future if required.

---

## 4. Prisma Migration Safety Strategy

The CI/CD pipeline does not run `prisma migrate deploy` automatically during every deployment. Database migrations are handled separately to avoid deploying application code against an unexpected schema state.

Before applying migrations, they are reviewed and tested in a staging environment. Once validated, migrations are executed manually or through a controlled migration step before deploying the new application container.

If a migration fails, the deployment process is stopped, and the new application version is not started. The existing running container continues serving traffic until the schema issue is resolved. This prevents the application from starting with a broken or partially updated database schema.

The application containers are deployed only after the database schema is confirmed to be compatible with the application version being released.

---

## 5. Rollback Trigger Logic

The current Jenkins pipeline deploys applications by replacing the existing Docker container with the newly built image. A deployment is considered successful only after the new container starts and passes health validation.

### Health Check Criteria

After deployment, Jenkins performs an application health check:

| Application | Health Endpoint | Expected Response |
| :--- | :--- | :--- |
| CRUD Service | `/health` (Port 4000) | HTTP 200 OK |
| Auth Service | `/` (Port 5000) | HTTP 200 OK |

#### Health check rules:
- Initial application startup wait: **30 seconds**
- Maximum retries: **5 attempts**
- Retry interval: **10 seconds**
- HTTP request timeout: **5 seconds**

The deployment is marked as failed if:
- Container does not start or exits unexpectedly.
- Health endpoint returns any status other than **HTTP 200**.
- Request times out or connection is refused.
- Response body does not indicate a healthy application state.

### Rollback Process

If the health check fails, the deployment is considered unsuccessful. The previous stable Docker image version is restored, and the container is restarted using the previous image tag.

This prevents an unhealthy application version from remaining active in production.

### Current Pipeline Note

The existing Jenkins pipeline builds, pushes, and deploys Docker images. Automated rollback logic is planned as an enhancement to add post-deployment health verification and automatic recovery.

---

## 6. Secrets Across Stages

Sensitive credentials such as database passwords, JWT secrets, and application keys are **never stored in the Git repository or Docker image**.

| Stage | Secret Source |
| :--- | :--- |
| **Build Time** | No application secrets are used during the Docker image build. Images are built without embedding credentials. |
| **Deploy Time** | Jenkins retrieves the required environment variables through the `--env-file` option in the `docker run` command (e.g., `/opt/env/.env.auth-service` and `/opt/env/.env.crud-service`). These files are stored only on the deployment server. |
| **Runtime** | The running containers read secrets from the mounted environment files, making them available only while the application is running. |

This approach ensures that:
- Secrets are **not committed to Git** or exposed in Git history.
- Secrets are **not baked into Docker image layers**, allowing the same image to be deployed across different environments.
- Environment files are stored securely on the target EC2 instance (`/opt/env`) with restricted access, and Jenkins references them only during container deployment.

---

## 7. IAM Scoping

A custom least-privilege IAM policy was created instead of attaching the AWS-managed **ReadOnlyAccess** policy. The reviewer only requires permissions to verify the deployed infrastructure, so the policy includes **EC2 Describe** actions to inspect instances, VPCs, subnets, security groups, route tables, network interfaces, and Elastic IPs; **RDS Describe** actions to verify database instances, subnet groups, clusters, and snapshots; **CloudWatch Logs** read permissions to view application logs for deployment verification and troubleshooting; and **iam:GetUser** to confirm the identity of the review user. 

No write, modify, or administrative permissions are granted, ensuring the reviewer can audit the infrastructure without the ability to make any changes. Using the managed **ReadOnlyAccess** policy would have granted unnecessary access to many AWS services outside the scope of this project, so a custom scoped policy was chosen to follow the principle of least privilege.

---

## 8. Bonus Features

### Domain & SSL
Both applications are exposed through dedicated subdomains using Nginx as a reverse proxy:
- **auth.mzsk.fun** ➡️ Authentication Service
- **app.mzsk.fun** ➡️ CRUD Service

HTTPS is enabled using Let's Encrypt SSL certificates managed by Certbot. Nginx is configured with separate virtual hosts for each application, dedicated access and error logs, HTTP-to-HTTPS redirection, and secure reverse proxy settings to isolate both services.

### Dockerization
Both applications are containerized using individual `Dockerfile`s. A `docker-compose.yml` is provided to run both services along with their required dependencies locally, enabling a development environment that closely matches production with minimal setup beyond configuring environment variables.

### Automated Database Backups
Amazon RDS automated backups are enabled for both PostgreSQL databases. Automated snapshots are created according to the configured backup retention period, allowing point-in-time recovery. The restore process has been verified by restoring a backup to a new RDS instance and confirming application connectivity.

### Deployment Documentation
The project includes detailed documentation describing the infrastructure architecture, reverse proxy configuration, CI/CD pipeline design, database separation strategy, rollback mechanism, IAM security model, and deployment decisions made throughout the implementation.
