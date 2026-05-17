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

output "api_url" {
  description = "Backend API URL"
  value       = "https://${var.api_domain_name}"
}

output "rds_endpoint" {
  description = "RDS Postgres endpoint"
  value       = aws_db_instance.main.endpoint
}

output "storage_bucket" {
  description = "S3 storage bucket name"
  value       = aws_s3_bucket.storage.id
}

output "ecs_service_name" {
  description = "ECS service name (for force-deploy)"
  value       = aws_ecs_service.backend.name
}

output "db_password" {
  description = "RDS master password"
  value       = random_password.db.result
  sensitive   = true
}
