#!/bin/bash

# AES File Encryption Web Server - Startup Script

echo "╔════════════════════════════════════════════════════╗"
echo "║  🔒 AES File Encryption Manager - Web Server      ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found!"
    echo "Please install Node.js: https://nodejs.org/"
    exit 1
fi

echo "✓ Node.js version: $(node --version)"
echo "✓ npm version: $(npm --version)"
echo ""

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found!"
    echo "Please run this script from the web directory"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ npm install failed!"
        exit 1
    fi
    echo "✓ Dependencies installed"
    echo ""
fi

# Create uploads directory
if [ ! -d "uploads" ]; then
    echo "📁 Creating uploads directory..."
    mkdir -p uploads
    echo "✓ uploads directory created"
    echo ""
fi

# Determine port
PORT=${PORT:-3000}

# Check if port is available
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  Port $PORT is already in use!"
    echo "Choose another port: PORT=3001 ./start.sh"
    exit 1
fi

echo "════════════════════════════════════════════════════"
echo "🚀 Starting AES Encryption Web Server..."
echo "📍 Access at: http://localhost:$PORT"
echo "════════════════════════════════════════════════════"
echo ""

# Start server
node server.js
