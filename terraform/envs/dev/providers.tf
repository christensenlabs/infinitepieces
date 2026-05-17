terraform {
  required_version = ">= 1.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
    postgresql = {
      source  = "cyrilgdn/postgresql"
      version = "~> 1.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

provider "postgresql" {
  host     = module.env.rds_host
  port     = 5432
  database = "infinitepieces"
  username = "infinitepieces"
  password = module.env.db_password
  sslmode  = "require"
  superuser = false
}
