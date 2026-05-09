################################################################################
# RDS Postgres — private subnet, encrypted
################################################################################

resource "aws_db_subnet_group" "main" {
  name       = "infinitepieces"
  subnet_ids = aws_subnet.private[*].id

  tags = {
    Name = "infinitepieces"
  }
}

resource "aws_db_instance" "main" {
  identifier = "infinitepieces"

  engine         = "postgres"
  engine_version = "16.4"
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
  final_snapshot_identifier = "infinitepieces-final"

  tags = {
    Name = "infinitepieces"
  }
}
