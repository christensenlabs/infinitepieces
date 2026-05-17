variable "environment" {
  description = "Environment name (e.g. dev, prod)"
  type        = string
}

variable "vpc_id" {
  type = string
}

variable "public_subnet_ids" {
  type = list(string)
}

variable "private_subnet_ids" {
  type = list(string)
}

variable "ecs_cluster_id" {
  type = string
}

variable "ecr_repository_url" {
  type = string
}

variable "alb_sg_id" {
  type = string
}

variable "route53_zone_id" {
  type = string
}

variable "domain_name" {
  description = "Frontend domain (e.g. infinitepieces.christensenlabs.com)"
  type        = string
}

variable "api_domain_name" {
  description = "API domain (e.g. api.infinitepieces.christensenlabs.com)"
  type        = string
}

variable "image_tag" {
  description = "ECR image tag to deploy (e.g. latest, dev)"
  type        = string
  default     = "latest"
}

variable "spring_profile" {
  description = "Spring Boot profile (e.g. prod, dev)"
  type        = string
}

variable "app_port" {
  type    = number
  default = 8080
}

variable "db_instance_class" {
  type    = string
  default = "db.t4g.micro"
}

variable "ecs_cpu" {
  type    = number
  default = 512
}

variable "ecs_memory" {
  type    = number
  default = 1024
}

variable "ecs_desired_count" {
  type    = number
  default = 1
}
