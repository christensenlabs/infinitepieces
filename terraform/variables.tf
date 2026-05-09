variable "domain_name" {
  description = "Full domain name for the site"
  type        = string
  default     = "infinitepieces.christensenlabs.com"
}

variable "api_domain_name" {
  description = "Full domain name for the backend API"
  type        = string
  default     = "api.infinitepieces.christensenlabs.com"
}

variable "hosted_zone_name" {
  description = "Route53 hosted zone domain"
  type        = string
  default     = "christensenlabs.com"
}

variable "bucket_name" {
  description = "S3 bucket name for static assets"
  type        = string
  default     = "infinitepieces.christensenlabs.com"
}

variable "storage_bucket_name" {
  description = "S3 bucket name for application storage"
  type        = string
  default     = "infinitepieces-storage"
}

################################################################################
# Backend infrastructure
################################################################################

variable "app_port" {
  description = "Port the Spring Boot app listens on"
  type        = number
  default     = 8080
}

variable "db_instance_class" {
  description = "RDS instance size"
  type        = string
  default     = "db.t4g.micro"
}

variable "ecs_cpu" {
  description = "Fargate task CPU units (1 vCPU = 1024)"
  type        = number
  default     = 512
}

variable "ecs_memory" {
  description = "Fargate task memory in MiB"
  type        = number
  default     = 1024
}

variable "ecs_desired_count" {
  description = "Number of backend tasks to run"
  type        = number
  default     = 1
}
