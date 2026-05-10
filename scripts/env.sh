#!/usr/bin/env bash
# Source this file to load config and secrets as environment variables.
# Usage: source scripts/env.sh
#
# Flattens YAML keys into env vars:
#   project-name                     →  PROJECT_NAME
#   clabs.aws.account-id             →  CLABS_AWS_ACCOUNT_ID
#   clabs.infinitepieces.bucket      →  CLABS_INFINITEPIECES_BUCKET

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONFIG_FILE="$ROOT_DIR/config/config.yaml"
SECRETS_FILE="$ROOT_DIR/config/secrets.yaml"

_load_yaml() {
  local file="$1"
  if [[ ! -f "$file" ]]; then
    echo "ERROR: $file not found." >&2
    return 1 2>/dev/null || exit 1
  fi
  eval "$(yq -o=props '.' "$file" | while IFS=' = ' read -r key value; do
    var=$(echo "$key" | tr '[:lower:].' '[:upper:]_' | tr '-' '_')
    echo "export $var=\"$value\""
  done)"
}

_load_yaml "$CONFIG_FILE"
_load_yaml "$SECRETS_FILE"
