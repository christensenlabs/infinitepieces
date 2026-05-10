# Load secrets as env vars
export CLABS_AWS_ACCOUNT_ID := `source scripts/env.sh && echo $CLABS_AWS_ACCOUNT_ID`
export CLABS_INFINITEPIECES_BUCKET := `source scripts/env.sh && echo $CLABS_INFINITEPIECES_BUCKET`
export CLABS_INFINITEPIECES_CLOUDFRONT_DISTRIBUTION_ID := `source scripts/env.sh && echo $CLABS_INFINITEPIECES_CLOUDFRONT_DISTRIBUTION_ID`
export POSTGRES_ADMIN_PASSWORD := `source scripts/env.sh && echo ${CLABS_INFINITEPIECES_DB_ADMIN_PASSWORD:-admin}`
export POSTGRES_APP_PASSWORD := `source scripts/env.sh && echo ${CLABS_INFINITEPIECES_DB_APP_PASSWORD:-app}`

ecr_repo := "infinitepieces-backend"
aws_region := "us-east-1"

mod frontend
mod backend
mod database
mod terraform

# Start local backend + database (Postgres + Spring Boot)
local-up: database::up backend::dev

# Wipe database and restart everything fresh
local-reset: database::reset database::up backend::dev

# Deploy everything (frontend + backend) to AWS
deploy-all: frontend::deploy backend::deploy
    @echo "==> Full deploy complete!"
