################################################################################
# ECS tasks — only reachable from ALB
################################################################################

resource "aws_security_group" "ecs" {
  name_prefix = "${local.prefix}-ecs-"
  vpc_id      = var.vpc_id

  ingress {
    description     = "From ALB"
    from_port       = var.app_port
    to_port         = var.app_port
    protocol        = "tcp"
    security_groups = [var.alb_sg_id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${local.prefix}-ecs"
  }

  lifecycle {
    create_before_destroy = true
  }
}

################################################################################
# RDS — reachable from this environment's ECS tasks and operator IP
################################################################################

resource "aws_security_group" "rds" {
  name_prefix = "${local.prefix}-rds-"
  vpc_id      = var.vpc_id

  ingress {
    description     = "Postgres from ECS"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs.id]
  }

  # Daniel's home IP — update if it changes
  ingress {
    description = "Postgres from operator IP"
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["173.206.251.57/32"]
  }

  tags = {
    Name = "${local.prefix}-rds"
  }

  lifecycle {
    create_before_destroy = true
  }
}
