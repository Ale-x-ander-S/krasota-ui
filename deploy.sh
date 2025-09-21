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

# Update Nginx config for SPA
echo "🔧 Updating Nginx config for SPA..."
ssh root@45.12.229.112 'cat > /etc/nginx/sites-available/krasota-ui << EOF
server {
    listen 80;
    server_name 45.12.229.112;
    
    root /opt/krasota-ui;
    index index.html;
    
    # Gzip compression
    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml;
    gzip_comp_level 9;
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # SPA routing - все запросы перенаправляем на index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF'

# Reload Nginx
echo "🔄 Reloading Nginx..."
ssh root@45.12.229.112 "systemctl reload nginx"

if [ $? -ne 0 ]; then
    echo "❌ Nginx reload failed!"
    exit 1
fi

echo "✅ SPA deployment completed successfully!"
echo "🌐 Your app is available at: http://45.12.229.112"
