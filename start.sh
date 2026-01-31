#!/bin/bash
# Start the Nihongo learning app

PORT=${1:-8080}

echo "Starting Nihongo Japanese Learning App..."
echo "Open http://localhost:$PORT in your browser"
echo "Press Ctrl+C to stop"
echo ""

python3 -m http.server $PORT
