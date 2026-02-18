#!/bin/bash

# Script to install node modules for all microservices
echo "Installing dependencies for all microservices..."

# Define services array
services=("auth" "customer" "gateway" "invoice" "product" "sales")

# Loop through each service and install dependencies
for service in "${services[@]}"; do
    echo "=========================================="
    echo "Installing dependencies for $service service..."
    echo "=========================================="
    
    if [ -d "services/$service" ]; then
        cd "services/$service"
        
        if [ -f "package.json" ]; then
            echo "Found package.json in $service, running npm install..."
            npm install
            if [ $? -eq 0 ]; then
                echo "✅ Dependencies installed successfully for $service"
            else
                echo "❌ Failed to install dependencies for $service"
            fi
        else
            echo "⚠️  No package.json found in $service, skipping..."
        fi
        
        cd ../../
    else
        echo "❌ Service directory $service not found"
    fi
    
    echo ""
done

echo "🎉 Dependency installation process completed!"
