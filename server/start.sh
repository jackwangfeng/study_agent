#!/bin/bash

cd "$(dirname "$0")"

# Stop any existing server on port 3000
lsof -ti:3000 | xargs -r kill -9 2>/dev/null

# Wait for port to be released
sleep 1

# Source proxy if exists
if [ -f /usr/local/proxy1.sh ]; then
  source /usr/local/proxy1.sh
fi

# Start the server in background with log
nohup npm run dev > server.log 2>&1 &
SERVER_PID=$!

echo "Server started (PID: $SERVER_PID) on http://localhost:3000"
echo "Logs: server.log"