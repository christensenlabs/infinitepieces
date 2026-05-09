################################################################################
# ALB security group — public HTTPS ingress
################################################################################

resource "aws_security_group" "alb" {
  name_prefix = "infinitepieces-alb-"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "HTTPS from anywhere"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "infinitepieces-alb"
  }

  lifecycle {
    create_before_destroy = true
  }
}

################################################################################
# ECS tasks — only reachable from ALB
################################################################################

resource "aws_security_group" "ecs" {
  name_prefix = "infinitepieces-ecs-"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "From ALB"
    from_port       = var.app_port
    to_port         = var.app_port
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "infinitepieces-ecs"
  }

  lifecycle {
    create_before_destroy = true
  }
}

################################################################################
# RDS — only reachable from ECS tasks
################################################################################

resource "aws_security_group" "rds" {
  name_prefix = "infinitepieces-rds-"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "Postgres from ECS"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs.id]
  }

  tags = {
    Name = "infinitepieces-rds"
  }

  lifecycle {
    create_before_destroy = true
  }
}
