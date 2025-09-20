#!/bin/bash

echo "🚀 Starting SSR deployment..."

# Build project with SSR
echo "📦 Building project with SSR..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Deploy browser files to server
echo "📤 Deploying browser files to server..."
scp -r dist/krasota-ui/browser/* root@45.12.229.112:/opt/krasota-ui/

if [ $? -ne 0 ]; then
    echo "❌ Browser files deploy failed!"
    exit 1
fi

# Deploy server files to server
echo "📤 Deploying server files to server..."
ssh root@45.12.229.112 "mkdir -p /opt/krasota-ui/server"
scp -r dist/krasota-ui/server/* root@45.12.229.112:/opt/krasota-ui/server/

if [ $? -ne 0 ]; then
    echo "❌ Server files deploy failed!"
    exit 1
fi

# Copy package.json for dependencies
echo "📦 Copying package.json..."
scp package.json root@45.12.229.112:/opt/krasota-ui/

# Install dependencies and start SSR server
echo "🔄 Installing dependencies and starting SSR server..."
ssh root@45.12.229.112 "cd /opt/krasota-ui && npm install --production && pm2 delete krasota-ssr 2>/dev/null || true && pm2 start server/server.mjs --name krasota-ssr && pm2 save"

if [ $? -ne 0 ]; then
    echo "❌ SSR server start failed!"
    exit 1
fi

# Reload Nginx
echo "🔄 Reloading Nginx..."
ssh root@45.12.229.112 "systemctl reload nginx"

if [ $? -ne 0 ]; then
    echo "❌ Nginx reload failed!"
    exit 1
fi

echo "✅ SSR deployment completed successfully!"
echo "🌐 Your SSR app is available at: http://45.12.229.112"
echo "📊 SSR server status: ssh root@45.12.229.112 'pm2 status'"
