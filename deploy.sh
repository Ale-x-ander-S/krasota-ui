#!/bin/bash

echo "🚀 Starting deployment..."

# Build project
echo "📦 Building project..."
npm run build -- --configuration production

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Deploy to server
echo "📤 Deploying to server..."
scp -r dist/krasota-ui/browser/* root@45.12.229.112:/opt/krasota-ui/

if [ $? -ne 0 ]; then
    echo "❌ Deploy failed!"
    exit 1
fi

# Reload Nginx
echo "🔄 Reloading Nginx..."
ssh root@45.12.229.112 "systemctl reload nginx"

if [ $? -ne 0 ]; then
    echo "❌ Nginx reload failed!"
    exit 1
fi

echo "✅ Deployment completed successfully!"
echo "🌐 Your app is available at: http://45.12.229.112"
