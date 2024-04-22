#!/bin/bash

# Create an empty array to hold child process IDs
pids=()

# Start the processes
processes=${PROCESSES:-1}  # Default to 1 if PROCESSES is not set
tabs=${TABS:-10}  # Default to 10 if TABS is not set
for ((i=0; i<$processes; i++))
do
  TABS=$tabs PROCESS=$i node build/index.js &
  pids+=($!)  # Store the PID of the child process
done

# Define a function to kill all child processes
kill_processes() {
  for pid in ${pids[*]}; do
    kill $pid 2>/dev/null
  done
}

# Call the function to kill all child processes when this script receives a SIGINT
trap kill_processes SIGINT
trap kill_processes INT

# Wait for all child processes to complete
wait