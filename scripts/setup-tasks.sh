#!/bin/bash

# Run the database migration
echo "Running database migration..."
npx supabase db push

# Install dependencies if needed
echo "Installing dependencies..."
npm install papaparse @types/papaparse

# Build and run the import script
echo "Building and running import script..."
npx tsx scripts/import-tasks.ts

echo "Setup complete!" 