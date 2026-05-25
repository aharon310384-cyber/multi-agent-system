#!/usr/bin/env bash
set -uo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_DIR="$PROJECT_ROOT/Онлайн разведка/архив"
mkdir -p "$LOG_DIR"

STAMP="$(date +%Y-%m-%d_%H%M%S)"
LOG_FILE="$LOG_DIR/cron-$STAMP.log"

cd "$PROJECT_ROOT"

node Backend/intel-scout/cli.js --sync --deliver \
  > "$LOG_FILE" 2> "$LOG_FILE.err"
RC=$?

if [ "$RC" -ne 0 ]; then
  echo "intel-scout exited with code $RC. See $LOG_FILE.err" >&2
  exit "$RC"
fi

echo "intel-scout done. Log: $LOG_FILE"
exit 0
