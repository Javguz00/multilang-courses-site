#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
OUT_FILE="${1:-../multilang-courses-site.zip}"
cd "$ROOT_DIR"

# Build exclude list: node_modules, .next, .git, .DS_Store, zip files, env files
# zip -r <out> . -x patterns
# Use relative paths to avoid capturing absolute paths inside the archive
if [ -f "$OUT_FILE" ]; then rm -f "$OUT_FILE"; fi

zip -r "$OUT_FILE" . \
  -x "*/node_modules/*" \
  -x "*/.next/*" \
  -x "*/.git/*" \
  -x "*.zip" \
  -x "*/*.DS_Store" \
  -x "*/.DS_Store" \
  -x "*/.env" \
  -x "*/.env.*"

echo "Archive created at $OUT_FILE"