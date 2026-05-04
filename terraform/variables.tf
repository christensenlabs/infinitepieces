variable "domain_name" {
  description = "Full domain name for the site"
  type        = string
  default     = "infinitepieces.christensenlabs.com"
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
