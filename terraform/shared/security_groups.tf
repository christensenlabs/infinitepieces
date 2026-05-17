################################################################################
# ALB security group — shared across environments (public HTTPS ingress)
################################################################################

resource "aws_security_group" "alb" {
  name_prefix = "infinitepieces-alb-"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "HTTP from anywhere (redirects to HTTPS)"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

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
