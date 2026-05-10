# Load config + secrets as env vars
export CLABS_INFINITEPIECES_PROJECT_NAME := `source scripts/env.sh && echo $CLABS_INFINITEPIECES_PROJECT_NAME`
export COMPOSE_PROJECT_NAME := `source scripts/env.sh && echo $CLABS_INFINITEPIECES_PROJECT_NAME`
export CLABS_INFINITEPIECES_POSTGRES_SUPERUSER_PASSWORD := `source scripts/env.sh && echo $CLABS_INFINITEPIECES_POSTGRES_SUPERUSER_PASSWORD`
export CLABS_AWS_ACCOUNT_ID := `source scripts/env.sh && echo $CLABS_AWS_ACCOUNT_ID`
export CLABS_INFINITEPIECES_BUCKET := `source scripts/env.sh && echo $CLABS_INFINITEPIECES_BUCKET`
export CLABS_INFINITEPIECES_CLOUDFRONT_DISTRIBUTION_ID := `source scripts/env.sh && echo $CLABS_INFINITEPIECES_CLOUDFRONT_DISTRIBUTION_ID`
export CLABS_INFINITEPIECES_DB_PASSWORD := `source scripts/env.sh && echo $CLABS_INFINITEPIECES_DB_PASSWORD`

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

# Start local backend + database (detached containers)
local-up: database::up backend::docker

# Wipe database and nuke all project containers, then restart fresh
local-reset:
    docker rm -f $(docker ps -a --filter "name={{project}}-" -q) 2>/dev/null || true
    just database::reset database::up backend::docker

# Deploy everything (frontend + backend) to AWS
deploy-all: frontend::deploy backend::deploy
    @echo "==> Full deploy complete!"
