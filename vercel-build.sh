#!/bin/bash

# Navigate to project directory
cd /vercel/path0

# Install dependencies if needed
# npm install

# Build the application
npm run build

# Ensure API directory is built correctly
mkdir -p .vercel/output/functions/api
cp -r api/* .vercel/output/functions/api/

# Copy dist folder to output
mkdir -p .vercel/output/static
cp -r dist/* .vercel/output/static/

echo "Build completed successfully"