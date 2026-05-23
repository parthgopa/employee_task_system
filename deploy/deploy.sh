#!/bin/bash
# Auto-deploy script for TaskFlow
set -e

APP_DIR="/var/www/taskflow"
cd $APP_DIR

echo "=== Pulling latest code ==="
git pull origin main

echo "=== Backend ==="
cd $APP_DIR/backend
source venv/bin/activate
pip install -r requirements.txt --quiet
pm2 restart taskflow-api

echo "=== Frontend ==="
cd $APP_DIR/frontend
npm install --production
npm run build
pm2 restart taskflow-web

echo "=== Deploy complete! ==="
