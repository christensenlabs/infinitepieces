data "terraform_remote_state" "shared" {
  backend = "local"
  config = {
    path = "../../shared/terraform.tfstate"
  }
}

module "env" {
  source = "../../modules/env"

  environment        = "prod"
  vpc_id             = data.terraform_remote_state.shared.outputs.vpc_id
  public_subnet_ids  = data.terraform_remote_state.shared.outputs.public_subnet_ids
  private_subnet_ids = data.terraform_remote_state.shared.outputs.private_subnet_ids
  ecs_cluster_id     = data.terraform_remote_state.shared.outputs.ecs_cluster_id
  ecr_repository_url = data.terraform_remote_state.shared.outputs.ecr_repository_url
  alb_sg_id          = data.terraform_remote_state.shared.outputs.alb_sg_id
  route53_zone_id    = data.terraform_remote_state.shared.outputs.route53_zone_id

  domain_name     = "infinitepieces.christensenlabs.com"
  api_domain_name = "api.infinitepieces.christensenlabs.com"
  image_tag       = "latest"
  spring_profile  = "prod"

  db_app_password   = random_password.app.result
  db_admin_password = random_password.admin.result
}
