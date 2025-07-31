#!/bin/bash

echo "Installing dependencies..."
npm install

echo "Installing client dependencies..."
cd client
npm install
npm run build

echo "Installing server dependencies..."
cd ../server
npm install

echo "Build completed successfully!"