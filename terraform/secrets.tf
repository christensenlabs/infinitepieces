################################################################################
# Application secrets — YAML blob stored in Secrets Manager
#
# The nested YAML structure matches config/secrets.yaml.
# ECS injects the entire string as APP_SECRETS; Spring Boot parses it.
#
# To sync local secrets to Secrets Manager:
#   aws secretsmanager put-secret-value \
#     --secret-id infinitepieces/secrets \
#     --secret-string "$(cat config/secrets.yaml)"
################################################################################

resource "aws_secretsmanager_secret" "app" {
  name = "infinitepieces/secrets"

  tags = {
    Name = "infinitepieces-secrets"
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
