#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 \
     --username "$POSTGRES_USER" \
     --dbname "$POSTGRES_DB" \
     -v db_password="$CLABS_INFINITEPIECES_DB_PASSWORD" \
     -f /opt/infinitepieces/create_roles.sql
