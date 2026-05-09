################################################################################
# CloudWatch log group for backend containers
################################################################################

resource "aws_cloudwatch_log_group" "backend" {
  name              = "/ecs/infinitepieces-backend"
  retention_in_days = 90

  tags = {
    Name = "infinitepieces-backend"
  }
}
