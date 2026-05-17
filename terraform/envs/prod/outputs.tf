output "s3_bucket" {
  value = module.env.s3_bucket
}

output "cloudfront_distribution_id" {
  value = module.env.cloudfront_distribution_id
}

output "site_url" {
  value = module.env.site_url
}

output "api_url" {
  value = module.env.api_url
}

output "rds_endpoint" {
  value = module.env.rds_endpoint
}

output "storage_bucket" {
  value = module.env.storage_bucket
}

output "ecs_service_name" {
  value = module.env.ecs_service_name
}
