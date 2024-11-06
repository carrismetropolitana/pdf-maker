#!/bin/bash

# Base directory where all the PDFs are located
BASE_DIR="all_pdfs"
NEW_DIR="by-line-id"

# Find all the PDF files in the current structure
find "$BASE_DIR" -type f -name "*.pdf" | while read -r file; do
  # Extract the line_id and stop_id from the file path
  filename=$(basename "$file")

  # Using a regex-like pattern to extract the line_id and stop_id from the filename
  line_id=$(echo "$filename" | cut -d'-' -f2)

  # Create the new directory for this line_id if it doesn't exist
  new_dir="$NEW_DIR/$line_id"
  mkdir -p "$new_dir"

  # Move the file to the new directory
  mv "$file" "$new_dir/"

done

echo "Files have been reorganized by line_id."