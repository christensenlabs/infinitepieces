################################################################################
# Application secrets — YAML blob stored in Secrets Manager
################################################################################

resource "aws_secretsmanager_secret" "app" {
  name = "${local.prefix}/secrets"

  tags = {
    Name        = "${local.prefix}-secrets"
    Environment = var.environment
  }
}

resource "random_password" "db" {
  length  = 32
  special = false
}

# Seed with initial structure — after first apply, manage via AWS CLI
resource "aws_secretsmanager_secret_version" "app" {
  secret_id = aws_secretsmanager_secret.app.id

  secret_string = yamlencode({
    clabs = {
      aws = {
        account-id = ""
      }
      infinitepieces = {
        cloudfront = {
          distribution-id = ""
        }
        bucket         = ""
        db-password    = random_password.db.result
        gemini-api-key = ""
      }
    }
  })

  lifecycle {
    ignore_changes = [secret_string]
  }
}
