#!/usr/bin/env bash
# Runs TypeORM CLI commands (migration:run, migration:generate, migration:revert, migration:show)
# under Node 20 via nvm-windows, then always restores Node 22 afterwards.
#
# Why: ts-node + TypeORM's CLI datasource loader are incompatible with Node 22's
# native TypeScript/require(esm) handling (see data-source.ts loading errors).
# pnpm itself requires Node >=22.13, so it can't be used while on Node 20 —
# this script calls ts-node/typeorm directly instead.
#
# Usage: ./scripts/migrate.sh run|generate|revert|show

set -euo pipefail

export NVM_HOME="C:\\Users\\orlan\\AppData\\Local\\nvm"
export NVM_SYMLINK="C:\\nvm4w\\nodejs"

MIGRATION_NODE_VERSION="20.20.2"
DEV_NODE_VERSION="22.14.0"

cmd="${1:-run}"
shift || true

restore() {
  "$NVM_HOME/nvm.exe" use "$DEV_NODE_VERSION" >/dev/null
}
trap restore EXIT

"$NVM_HOME/nvm.exe" use "$MIGRATION_NODE_VERSION" >/dev/null

cd "$(dirname "$0")/.."
"/c/nvm4w/nodejs/node.exe" node_modules/ts-node/dist/bin.js \
  -r tsconfig-paths/register \
  ./node_modules/typeorm/cli.js \
  --dataSource src/database/data-source.ts \
  "migration:$cmd" "$@"
