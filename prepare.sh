#!/bin/bash

set -e

# Build types library
cd types
npm install
npm run sync-ce
cd ..

# Build backend
cd backend
npm install
npm run build
cd ..

# Build frontend
cd frontend
npm install
npm run lib:build
cd ..