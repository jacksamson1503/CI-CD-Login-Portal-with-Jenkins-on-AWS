# Login Portal - Full CI/CD on AWS

This repository deploys a static HTML/CSS/JavaScript website in an Nginx Docker container. The CI/CD workflow is `.github/workflows/full-cicd.yml`.

## Pipeline stages

1. Pull request / push to `main`.
2. Lint and syntax checks.
3. Docker build and local HTTP smoke tests.
4. Trivy scan for HIGH and CRITICAL OS/library vulnerabilities (unfixed issues are ignored).
5. Push a commit-SHA-tagged image to Amazon ECR.
6. Deploy the image to staging EC2 and run staging HTTP smoke tests.
7. Wait for the GitHub `production` environment approval gate.
8. Deploy to production EC2, run a health check, and attempt rollback if the new container is unhealthy.
9. Send the result to Amazon SNS if an SNS topic is configured.

Pull requests run the lint, build/test, and security-scan stages only. They do not deploy to AWS.

## Required GitHub configuration

### Repository variables

- `AWS_REGION`: region containing ECR and SNS (for example `ap-south-1`).
- `ECR_REPOSITORY`: existing ECR repository name, default `login-portal`.

### Repository secrets

- `AWS_ROLE_ARN`: IAM role assumed through GitHub OIDC. It needs least-privilege ECR push permissions and SNS publish permission if notifications are enabled.
- `SNS_TOPIC_ARN`: optional SNS topic ARN.

### Environment: `staging`

Create a GitHub environment named `staging` and add:
- Secrets: `STAGING_EC2_HOST`, `STAGING_EC2_USER`, `STAGING_EC2_SSH_KEY`.
- Variable: `STAGING_URL`, such as `http://your-staging-host`.

### Environment: `production`

Create a GitHub environment named `production`. Add:
- Required reviewers / protection rules to enforce the manual approval gate.
- Secrets: `PRODUCTION_EC2_HOST`, `PRODUCTION_EC2_USER`, `PRODUCTION_EC2_SSH_KEY`.

Do not put real credentials in the repository. Configure an AWS IAM OIDC identity provider for `https://token.actions.githubusercontent.com`, audience `sts.amazonaws.com`, and restrict the role trust policy to this repository and intended workflow/environment. GitHub Actions must be granted `id-token: write` permission to request OIDC tokens; the role itself must be scoped to only the required AWS actions.

## EC2 prerequisites

Both EC2 instances must have Docker, AWS CLI, and curl installed. Attach an EC2 instance profile that permits pulling from the specific ECR repository. The SSH user must be able to run Docker with `sudo`. Allow inbound HTTP on port 80 from the intended test/users and restrict SSH to trusted source IPs. Staging and production should be separate hosts for this workflow because both bind container port 80.

The production deployment has a short interruption while the old container is stopped and the new container starts. This is a guarded replacement with rollback, **not true zero-downtime Blue-Green deployment**. True zero downtime requires a traffic switch (for example an ALB target group, reverse proxy, or equivalent) and should be added before describing this as zero downtime.

## Run locally

```bash
bash tests/smoke-test.sh
docker build -t login-portal:local .
docker run --rm -p 8080:80 login-portal:local
```

Open `http://localhost:8080`.

## Notes

- The contact form is currently a frontend demo; it does not send or store messages.
- The legacy `production-pipeline.yml` is retained during migration. Disable it after validating this workflow so two workflows do not deploy concurrently.
- Test rollback and AWS permissions in a non-production environment before using real production workloads.
