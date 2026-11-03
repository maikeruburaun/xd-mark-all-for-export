#!/usr/bin/env bash
# Builds dist/MarkAllForExport-v<version>.xdx from src/
set -euo pipefail
cd "$(dirname "$0")/.."
VERSION=$(node -p "require('./src/manifest.json').version")
mkdir -p dist
OUT="dist/MarkAllForExport-v${VERSION}.xdx"
rm -f "$OUT"
(cd src && zip -q -r "../$OUT" manifest.json main.js)
echo "Built $OUT"
