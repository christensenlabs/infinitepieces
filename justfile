# Load config + secrets as env vars
export CLABS_INFINITEPIECES_PROJECT_NAME := `source scripts/env.sh && echo $CLABS_INFINITEPIECES_PROJECT_NAME`
export COMPOSE_PROJECT_NAME := `source scripts/env.sh && echo $CLABS_INFINITEPIECES_PROJECT_NAME`
export CLABS_INFINITEPIECES_POSTGRES_SUPERUSER_PASSWORD := `source scripts/env.sh && echo $CLABS_INFINITEPIECES_POSTGRES_SUPERUSER_PASSWORD`
export CLABS_AWS_ACCOUNT_ID := `source scripts/env.sh && echo $CLABS_AWS_ACCOUNT_ID`
export CLABS_INFINITEPIECES_BUCKET := `source scripts/env.sh && echo $CLABS_INFINITEPIECES_BUCKET`
export CLABS_INFINITEPIECES_CLOUDFRONT_DISTRIBUTION_ID := `source scripts/env.sh && echo $CLABS_INFINITEPIECES_CLOUDFRONT_DISTRIBUTION_ID`
export CLABS_INFINITEPIECES_DB_PASSWORD := `source scripts/env.sh && echo $CLABS_INFINITEPIECES_DB_PASSWORD`
export GOOGLE_APPLICATION_CREDENTIALS := `source scripts/env.sh && echo ${CLABS_INFINITEPIECES_FIREBASE_CREDENTIALS:-}`

ecr_repo := "infinitepieces-backend"
aws_region := "us-east-1"
project := `source scripts/env.sh && echo $CLABS_INFINITEPIECES_PROJECT_NAME`

# List all available commands
help:
    @just --list --list-submodules

mod frontend
mod backend
mod database
mod terraform

# Ensure the shared Docker network exists
network-up:
    docker network create ${CLABS_INFINITEPIECES_PROJECT_NAME}_default 2>/dev/null || true

# Start local backend + database (detached containers)
docker-up: network-up database::docker-up backend::docker-up

# Wipe database and nuke all project containers, then restart fresh
docker-reset: network-up
    docker rm -f $(docker ps -a --filter "name={{project}}-" -q) 2>/dev/null || true
    just database::reset database::docker-up backend::docker-up

# Deploy everything (frontend + backend) to AWS
# Usage: just deploy-all <env>
deploy-all env:
    just frontend::deploy {{env}}
    just backend::deploy {{env}}
    @echo "==> Full deploy complete ({{env}})!"
