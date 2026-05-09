# Load secrets as env vars for all recipes in a very unperformant way, but centralizing all of the config
export CLABS_AWS_ACCOUNT_ID := `source scripts/env.sh && echo $CLABS_AWS_ACCOUNT_ID`
export CLABS_INFINITEPIECES_BUCKET := `source scripts/env.sh && echo $CLABS_INFINITEPIECES_BUCKET`
export CLABS_INFINITEPIECES_CLOUDFRONT_DISTRIBUTION_ID := `source scripts/env.sh && echo $CLABS_INFINITEPIECES_CLOUDFRONT_DISTRIBUTION_ID`

# Build the site
build:
    cd frontend && npm run build

# Deploy: build, sync to S3, invalidate CloudFront cache
deploy: build
    @echo "==> Syncing dist/ to S3 bucket $CLABS_INFINITEPIECES_BUCKET..."
    aws s3 sync frontend/dist s3://$CLABS_INFINITEPIECES_BUCKET --delete
    @echo "==> Invalidating CloudFront distribution $CLABS_INFINITEPIECES_CLOUDFRONT_DISTRIBUTION_ID..."
    aws cloudfront create-invalidation --distribution-id $CLABS_INFINITEPIECES_CLOUDFRONT_DISTRIBUTION_ID --paths "/*"
    @echo "==> Deploy complete!"

# Show resolved config (for debugging)
show-config:
    @echo "AWS Account:    $CLABS_AWS_ACCOUNT_ID"
    @echo "S3 Bucket:      $CLABS_INFINITEPIECES_BUCKET"
    @echo "CloudFront Dist: $CLABS_INFINITEPIECES_CLOUDFRONT_DISTRIBUTION_ID"
