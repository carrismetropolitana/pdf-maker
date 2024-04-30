#!/bin/bash

# Get the array of arrays from the first endpoint
response=$(curl -s "localhost:5050/timetables")

# Use jq to parse the JSON and get the array of arrays
pairs=$(echo "$response" | jq -c '.pairs[]')

# Initialize a counter
counter=0

# Loop over each pair
for pair in $pairs
do
  # If the counter is 500, break the loop
  if [ $counter -eq 5000 ]
  then
    break
  fi

  (# Use jq to get the first and second numbers from the pair
  firstNumber=$(echo "$pair" | jq -r '.[0]')
  secondNumber=$(echo "$pair" | jq -r '.[1]')

  # Make the second curl command with the first and second numbers
  curl "localhost:3000/schedule/$firstNumber/$secondNumber">/dev/null 2>/dev/null 
  # curl "localhost:5050/timetables/$firstNumber/$secondNumber">/dev/null 2>/dev/null
  # curl "localhost:5050/patterns/$(echo $firstNumber)_0">/dev/null 2>/dev/null
  echo "$counter") &

  # Increment the counter
  ((counter++))
done
