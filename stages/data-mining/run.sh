#! /bin/sh

if [ $# -eq 0 ]; then
    echo "Usage: $0 <script> [args...]"
    echo "Example: $0 src/index.ts arg1 arg2"
    exit 1
fi

# go to venv
. venv/bin/activate

#  get args
script="$1"
shift
$script "$@"