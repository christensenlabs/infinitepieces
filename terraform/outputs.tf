output "s3_bucket" {
  description = "S3 bucket name for deploying built assets"
  value       = aws_s3_bucket.site.id
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID (use for cache invalidation)"
  value       = aws_cloudfront_distribution.site.id
}

output "site_url" {
  description = "Live site URL"
  value       = "https://${var.domain_name}"
}
