#!/bin/bash


cleanup() {
  echo "Cleaning up..."
  kill $API_PID
  kill $STANDALONE_PID
  kill -9 $MAIN_API_PID
  kill $QUEUE_MANAGER_PID
  kill $PRINTER_PID1
  kill $PRINTER_PID2
  exit 1
}

# Trap SIGINT signal (Ctrl+C)
trap cleanup SIGINT

# Start the API server and save its PID
(
  cd ../api/parse-network/ &&
  set -a &&
  source .env &&
  set +a &&
  SINGLE_RUN=true GTFS_URL=$1 npm run start
) &&
API_PID=$!

# Build the renderer
(
  cd ./renderer/ && npm run build && cp .next/static .next/standalone/.next/static -r
) &&
wait

# Start the standalone server and save its PID
(
  cd ./renderer/ && API_URL=http://localhost:5050 node .next/standalone/server.js
) &
STANDALONE_PID=$!

# Start the main API server and save its PID
(
  cd ../api/server/ && npm run start > /dev/null
) &
MAIN_API_PID=$!

# Start the queue manager and save its PID
(
  cd ./queue-manager/ && sleep 5 && SINGLE_RUN=true npm run start
) &
QUEUE_MANAGER_PID=$!

rm -rf ./printer/pdfs/*
# Start the printer and save its PID
(
  cd ./printer/ && sleep 10 && SINGLE_RUN=true npm run start
) &
PRINTER_PID1=$!
(
  cd ./printer/ && sleep 10 && SINGLE_RUN=true npm run start
) &
PRINTER_PID2=$!

# Wait for the queue manager and both printer processes to finish
wait $QUEUE_MANAGER_PID
wait $PRINTER_PID1
wait $PRINTER_PID2

# Kill the API server, standalone server, and main API server
kill $API_PID
kill $STANDALONE_PID
kill $MAIN_API_PID

(cd ./printer/pdfs && zip ../../$(date +"%Y-%m-%d")$(basename $1) *.pdf)


