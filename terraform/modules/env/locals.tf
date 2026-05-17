locals {
  # Prod keeps original names to avoid resource recreation.
  # Other environments get a prefixed name.
  prefix = var.environment == "prod" ? "infinitepieces" : "infinitepieces-${var.environment}"
}
