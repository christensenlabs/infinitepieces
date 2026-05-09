################################################################################
# ECR repository — container image storage
################################################################################

resource "aws_ecr_repository" "backend" {
  name                 = "infinitepieces-backend"
  image_tag_mutability = "MUTABLE"
  force_delete         = false

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "infinitepieces-backend"
  }
}
