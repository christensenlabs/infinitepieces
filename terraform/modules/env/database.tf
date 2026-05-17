################################################################################
# RDS Postgres — private subnet, encrypted
################################################################################

resource "aws_db_subnet_group" "main" {
  name       = local.prefix
  subnet_ids = var.private_subnet_ids

  tags = {
    Name = local.prefix
  }
}

resource "aws_db_instance" "main" {
  identifier = local.prefix

  engine         = "postgres"
  engine_version = "16.14"
  instance_class = var.db_instance_class

  db_name  = "infinitepieces"
  username = "infinitepieces"
  password = random_password.db.result

  allocated_storage     = 20
  max_allocated_storage = 100
  storage_type          = "gp3"
  storage_encrypted     = true

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = false
  multi_az               = false

  backup_retention_period   = 7
  skip_final_snapshot       = false
  final_snapshot_identifier = "${local.prefix}-final"

  tags = {
    Name        = local.prefix
    Environment = var.environment
  }
}
