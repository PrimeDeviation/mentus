#!/bin/bash

# Check if commit message argument is provided
if [ -z "$1" ]; then
  echo "Error: Commit message is required as the first argument."
  exit 1
fi

# Add all changes
git add .

# Commit with provided message
git commit -m "$1"

# Perform a git pull, always accepting the remote version
git pull --strategy-option=theirs origin $(git rev-parse --abbrev-ref HEAD)

# Push changes
git push origin $(git rev-parse --abbrev-ref HEAD)

# Wait for 30 seconds
sleep 30

# Download the zip file from GitHub
curl -L -o mentus-extension.zip https://github.com/PrimeDeviation/mentus/blob/paywall/mentus-extension.zip?raw=true

# Delete the contents of the specified directory before extraction
rm -rf /mnt/e/localcode/mentus-extension-o1/*

# Extract the zip file to the specified directory
unzip mentus-extension.zip -d /mnt/e/localcode/mentus-extension-o1

rm mentus-extension.zip