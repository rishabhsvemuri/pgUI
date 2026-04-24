#!/usr/bin/env bash
set -euo pipefail


# Grabs the following from env file:
# export APPLE_ID="username@gmail.com"
# export APPLE_APP_SPECIFIC_PASSWORD="MY_APP_SPECIFIC_PASSWORD"
# export APPLE_TEAM_ID="MY_TEAM_ID"
# export CSC_LINK="./certificate.p12"
# export CSC_KEY_PASSWORD="MY_CERTIFICATE_PASSWORD"
ENV_FILE="${ENV_FILE:-.env.mac-release}"
if [[ -f "$ENV_FILE" ]]; then
  set -a
  source "$ENV_FILE"
  set +a
fi

required_vars=(
  APPLE_ID
  APPLE_APP_SPECIFIC_PASSWORD
  APPLE_TEAM_ID
  CSC_LINK
  CSC_KEY_PASSWORD
)

for var_name in "${required_vars[@]}"; do
  value="${!var_name:-}"
  if [[ -z "$value" ]]; then
    echo "Missing required env var: ${var_name}" >&2
    exit 1
  else
    echo "${var_name}=${value}"
  fi
done

npm run build:mac -- --publish never