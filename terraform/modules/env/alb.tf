################################################################################
# Application Load Balancer
################################################################################

resource "aws_lb" "backend" {
  name               = "${local.prefix}-backend"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [var.alb_sg_id]
  subnets            = var.public_subnet_ids

  tags = {
    Name        = "${local.prefix}-backend"
    Environment = var.environment
  }
}

################################################################################
# HTTP listener — used by CloudFront origin (http-only protocol policy)
################################################################################

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.backend.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }
}

################################################################################
# Target group — health-checked against the Spring Boot app
################################################################################

resource "aws_lb_target_group" "backend" {
  name        = "${local.prefix}-backend"
  port        = var.app_port
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    path                = "/api/health"
    port                = "traffic-port"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    interval            = 30
    timeout             = 5
  }
}
