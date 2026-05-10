#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 \
     --username "$POSTGRES_USER" \
     --dbname "$POSTGRES_DB" \
     -v admin_password="$ADMIN_PASSWORD" \
     -v app_password="$APP_PASSWORD" \
     -f /docker-entrypoint-initdb.d/01_create_roles.sql
