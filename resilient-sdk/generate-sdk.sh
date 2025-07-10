#!/bin/bash

echo "🚀 Generating ResilientDB SDK from OpenAPI specification..."

# Install dependencies if not already installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Clean previous generated files
echo "🧹 Cleaning previous generated files..."
rm -rf sdk dist

# Generate SDK from OpenAPI spec
echo "🔧 Generating TypeScript SDK..."
npx @openapitools/openapi-generator-cli generate \
    -i openapi.yaml \
    -g typescript-fetch \
    -o ./sdk \
    --additional-properties=supportsES6=true,npmName=resilientdb-sdk,npmVersion=1.0.0,typescriptThreePlus=true

# Build the project
echo "🔨 Building project..."
npm run build

echo "✅ SDK generation complete!"
echo ""
echo "📁 Generated files:"
echo "  - sdk/ (OpenAPI generated client)"
echo "  - dist/ (Built JavaScript files)"
echo ""
echo "🚀 Try running the example:"
echo "  npm run build && node dist/example.js" 