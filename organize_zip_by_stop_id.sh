#!/bin/sh

rm -r ./tmp 
unzip -d ./tmp $1 &&
cd ./tmp &&
# Iterate over each PDF file in the current directory
for file in *.pdf; do
  # Check if the file exists to avoid errors when there are no PDFs
  if [ -e "$file" ]; then
    # Extract the stop ID (6 digits before the .pdf)
    stop_id=$(echo "$file" | grep -o '[0-9]\{6\}\.pdf' | cut -d '.' -f 1)

    # Create a directory for the stop ID if it doesn't exist
    mkdir -p "$stop_id"

    # Move the file into the corresponding directory
    mv "$file" "$stop_id/"
  fi
done

filename="$(basename "$1")"
zip -r "../${filename%.*}_org.zip" ./*