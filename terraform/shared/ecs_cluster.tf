################################################################################
# ECS Cluster — shared across environments
################################################################################

resource "aws_ecs_cluster" "main" {
  name = "infinitepieces"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Name = "infinitepieces"
  }
}
