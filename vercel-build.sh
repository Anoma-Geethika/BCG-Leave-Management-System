#!/bin/bash

# Install dependencies
npm install

# Build the client and server
npm run build

# Make the script executable
chmod +x vercel-build.sh