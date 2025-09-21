#!/bin/bash

echo "🚀 Starting SPA deployment..."

# Build project
echo "📦 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Stop SSR server if running
echo "🛑 Stopping SSR server..."
ssh root@45.12.229.112 "pm2 delete krasota-ssr 2>/dev/null || true"

# Deploy files to server
echo "📤 Deploying files to server..."
ssh root@45.12.229.112 "rm -rf /opt/krasota-ui/* && mkdir -p /opt/krasota-ui"
scp -r dist/krasota-ui/* root@45.12.229.112:/opt/krasota-ui/

if [ $? -ne 0 ]; then
    echo "❌ Deploy failed!"
    exit 1
fi

# Nginx config already configured, skipping update
echo "✅ Nginx config already correct"

# Reload Nginx
echo "🔄 Reloading Nginx..."
ssh root@45.12.229.112 "systemctl reload nginx"

if [ $? -ne 0 ]; then
    echo "❌ Nginx reload failed!"
    exit 1
fi

echo "✅ SPA deployment completed successfully!"
echo "🌐 Your app is available at: http://45.12.229.112"
