# Load secrets as env vars
export CLABS_AWS_ACCOUNT_ID := `source scripts/env.sh && echo $CLABS_AWS_ACCOUNT_ID`
export CLABS_INFINITEPIECES_BUCKET := `source scripts/env.sh && echo $CLABS_INFINITEPIECES_BUCKET`
export CLABS_INFINITEPIECES_CLOUDFRONT_DISTRIBUTION_ID := `source scripts/env.sh && echo $CLABS_INFINITEPIECES_CLOUDFRONT_DISTRIBUTION_ID`

ecr_repo := "infinitepieces-backend"
aws_region := "us-east-1"

# ─── Frontend ────────────────────────────────────────────────────────

# Run frontend dev server
frontend-dev:
    cd frontend && npm run dev

# Build frontend for production
frontend-build:
    cd frontend && npm run build

# Deploy frontend to S3 + CloudFront
frontend-deploy: frontend-build
    @echo "==> Syncing dist/ to S3 bucket $CLABS_INFINITEPIECES_BUCKET..."
    aws s3 sync frontend/dist s3://$CLABS_INFINITEPIECES_BUCKET --delete
    @echo "==> Invalidating CloudFront distribution $CLABS_INFINITEPIECES_CLOUDFRONT_DISTRIBUTION_ID..."
    aws cloudfront create-invalidation --distribution-id $CLABS_INFINITEPIECES_CLOUDFRONT_DISTRIBUTION_ID --paths "/*"
    @echo "==> Frontend deploy complete!"

# ─── Backend ─────────────────────────────────────────────────────────

# Run backend locally (Spring Boot, local profile)
backend-dev:
    cd backend && ./gradlew bootRun --args='--spring.profiles.active=local'

# Build backend jar
backend-build:
    cd backend && ./gradlew build

# Build backend Docker image locally
backend-docker:
    docker build -t {{ecr_repo}} backend/

# Deploy backend to ECS (build, push to ECR, force new deployment)
backend-deploy: backend-docker
    @echo "==> Logging into ECR..."
    aws ecr get-login-password --region {{aws_region}} | docker login --username AWS --password-stdin $CLABS_AWS_ACCOUNT_ID.dkr.ecr.{{aws_region}}.amazonaws.com
    @echo "==> Tagging and pushing image..."
    docker tag {{ecr_repo}}:latest $CLABS_AWS_ACCOUNT_ID.dkr.ecr.{{aws_region}}.amazonaws.com/{{ecr_repo}}:latest
    docker push $CLABS_AWS_ACCOUNT_ID.dkr.ecr.{{aws_region}}.amazonaws.com/{{ecr_repo}}:latest
    @echo "==> Forcing new ECS deployment..."
    aws ecs update-service --cluster infinitepieces --service infinitepieces-backend --force-new-deployment --region {{aws_region}} > /dev/null
    @echo "==> Backend deploy complete!"

# ─── Terraform ───────────────────────────────────────────────────────

# Preview infrastructure changes
terraform-plan:
    cd terraform && tofu plan

# Apply infrastructure changes
terraform-apply:
    cd terraform && tofu apply

# Destroy infrastructure (use with caution)
terraform-destroy:
    cd terraform && tofu destroy

# ─── Full Deploy ─────────────────────────────────────────────────────

# Deploy everything (frontend + backend)
deploy-all: frontend-deploy backend-deploy
    @echo "==> Full deploy complete!"
