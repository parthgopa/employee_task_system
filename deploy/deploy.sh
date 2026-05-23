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
pm2 restart taskflow-api || pm2 start "cd /var/www/taskflow/backend && source venv/bin/activate && gunicorn -w 4 -b 127.0.0.1:501 'app:create_app()'" --name taskflow-api

echo "=== Frontend ==="
cd $APP_DIR/frontend
npm install --production
npm run build
pm2 restart taskflow-web || pm2 start "cd /var/www/taskflow/frontend && npm start -- -p 500" --name taskflow-web

echo "=== Deploy complete! ==="
