#!/bin/bash

# Install dependencies
npm install

# Build the client
cd client
npm run build

# Build the server
cd ../server
npm run build

# Return to root directory
cd ..