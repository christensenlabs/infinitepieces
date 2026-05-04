#!/usr/bin/env bash
# Source this file to load secrets as environment variables.
# Usage: source scripts/env.sh
#
# Flattens secrets/secrets.yaml into env vars:
#   clabs.aws.account-id             →  CLABS_AWS_ACCOUNT_ID
#   clabs.infinitepieces.bucket      →  CLABS_INFINITEPIECES_BUCKET

set -euo pipefail

SECRETS_FILE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/secrets/secrets.yaml"

if [[ ! -f "$SECRETS_FILE" ]]; then
  echo "ERROR: $SECRETS_FILE not found. Copy secrets/example-secrets.yaml to secrets/secrets.yaml" >&2
  return 1 2>/dev/null || exit 1
fi

eval "$(yq -o=props '.' "$SECRETS_FILE" | while IFS=' = ' read -r key value; do
  var=$(echo "$key" | tr '[:lower:].' '[:upper:]_' | tr '-' '_')
  echo "export $var=\"$value\""
done)"
