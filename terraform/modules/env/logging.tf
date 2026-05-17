################################################################################
# CloudWatch log group for backend containers
################################################################################

resource "aws_cloudwatch_log_group" "backend" {
  name              = "/ecs/${local.prefix}-backend"
  retention_in_days = 90

  tags = {
    Name        = "${local.prefix}-backend"
    Environment = var.environment
  }
}
