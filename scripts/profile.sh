#!/usr/bin/env bash
PROJECT_DIR=$1
TARGET_PORT=${2:-3000}
cd "$PROJECT_DIR"
node ../../src/cli.js --path "$PROJECT_DIR" --output ./rsaudit-output.json
