#!/bin/sh

if [ $# -eq 0 ]; then
    echo "Usage: $0 <script> [args...]"
    echo "Example: $0 src/index.ts arg1 arg2"
    exit 1
fi

script="$1"
shift
bun run --env-file=.env --env-file=../../apps/mongodb-0/.env "$script" "$@"
