################################################################################
# PostgreSQL roles — created after RDS is provisioned
################################################################################

# Admin role: owns the schema, runs migrations (DDL + DML)
resource "random_password" "admin" {
  length  = 32
  special = false
}

resource "postgresql_role" "admin" {
  name     = "infinitepieces_admin"
  login    = true
  password = random_password.admin.result
}

# App role: read-write only (DML), used by the application at runtime
resource "random_password" "app" {
  length  = 32
  special = false
}

resource "postgresql_role" "app" {
  name     = "infinitepieces_app"
  login    = true
  password = random_password.app.result
}

# Admin owns public schema
resource "postgresql_schema" "public" {
  name  = "public"
  owner = postgresql_role.admin.name

  depends_on = [postgresql_role.admin]
}

# App gets DML on all current and future tables
resource "postgresql_default_privileges" "app_tables" {
  role     = postgresql_role.app.name
  owner    = postgresql_role.admin.name
  database = "infinitepieces"
  schema   = "public"

  object_type = "table"
  privileges  = ["SELECT", "INSERT", "UPDATE", "DELETE"]

  depends_on = [postgresql_role.admin, postgresql_role.app]
}

resource "postgresql_default_privileges" "app_sequences" {
  role     = postgresql_role.app.name
  owner    = postgresql_role.admin.name
  database = "infinitepieces"
  schema   = "public"

  object_type = "sequence"
  privileges  = ["USAGE", "SELECT"]

  depends_on = [postgresql_role.admin, postgresql_role.app]
}

resource "postgresql_grant" "app_connect" {
  role        = postgresql_role.app.name
  database    = "infinitepieces"
  object_type = "database"
  privileges  = ["CONNECT"]

  depends_on = [postgresql_role.app]
}

# Readonly role: for local dev / DataGrip access
resource "random_password" "readonly" {
  length  = 32
  special = false
}

resource "postgresql_role" "readonly" {
  name     = "infinitepieces_readonly"
  login    = true
  password = random_password.readonly.result
}

resource "postgresql_grant" "readonly_connect" {
  role        = postgresql_role.readonly.name
  database    = "infinitepieces"
  object_type = "database"
  privileges  = ["CONNECT"]

  depends_on = [postgresql_role.readonly]
}

resource "postgresql_grant" "readonly_tables" {
  role        = postgresql_role.readonly.name
  database    = "infinitepieces"
  schema      = "public"
  object_type = "table"
  privileges  = ["SELECT"]

  depends_on = [postgresql_role.readonly]
}

resource "postgresql_grant" "readonly_sequences" {
  role        = postgresql_role.readonly.name
  database    = "infinitepieces"
  schema      = "public"
  object_type = "sequence"
  privileges  = ["SELECT"]

  depends_on = [postgresql_role.readonly]
}

resource "postgresql_default_privileges" "readonly_tables" {
  role     = postgresql_role.readonly.name
  owner    = postgresql_role.admin.name
  database = "infinitepieces"
  schema   = "public"

  object_type = "table"
  privileges  = ["SELECT"]

  depends_on = [postgresql_role.admin, postgresql_role.readonly]
}

resource "postgresql_default_privileges" "readonly_sequences" {
  role     = postgresql_role.readonly.name
  owner    = postgresql_role.admin.name
  database = "infinitepieces"
  schema   = "public"

  object_type = "sequence"
  privileges  = ["SELECT"]

  depends_on = [postgresql_role.admin, postgresql_role.readonly]
}

# Grant on existing tables (covers tables created before default privileges)
resource "postgresql_grant" "app_tables" {
  role        = postgresql_role.app.name
  database    = "infinitepieces"
  schema      = "public"
  object_type = "table"
  privileges  = ["SELECT", "INSERT", "UPDATE", "DELETE"]

  depends_on = [postgresql_role.app]
}

resource "postgresql_grant" "app_sequences" {
  role        = postgresql_role.app.name
  database    = "infinitepieces"
  schema      = "public"
  object_type = "sequence"
  privileges  = ["USAGE", "SELECT"]

  depends_on = [postgresql_role.app]
}
