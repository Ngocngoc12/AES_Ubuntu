@echo off
REM AES File Encryption Web Server - Windows Startup

echo.
echo ╔════════════════════════════════════════════════════╗
echo ║  🔒 AES File Encryption Manager - Web Server      ║
echo ╚════════════════════════════════════════════════════╝
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js not found!
    echo Please install Node.js: https://nodejs.org/
    pause
    exit /b 1
)

echo ✓ Node.js version:
node --version
echo ✓ npm version:
npm --version
echo.

REM Check if package.json exists
if not exist package.json (
    echo ❌ package.json not found!
    echo Please run this script from the web directory
    pause
    exit /b 1
)

REM Install dependencies if node_modules doesn't exist
if not exist node_modules (
    echo 📦 Installing dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ npm install failed!
        pause
        exit /b 1
    )
    echo ✓ Dependencies installed
    echo.
)

REM Create uploads directory
if not exist uploads (
    echo 📁 Creating uploads directory...
    mkdir uploads
    echo ✓ uploads directory created
    echo.
)

echo ════════════════════════════════════════════════════
echo 🚀 Starting AES Encryption Web Server...
set PORT=3000
echo 📍 Access at: http://localhost:%PORT%
echo ════════════════════════════════════════════════════
echo.

REM Start server
node server.js

pause
