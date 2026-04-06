#!/bin/bash

# ====================================================
# AES Secure File Management System - Setup Script
# ====================================================

set -e

echo "================================"
echo " AES Secure File Management Setup"
echo "================================"
echo ""

# Kiểm tra permission
if [[ $EUID -ne 0 ]]; then
   echo "[!] Script này phải chạy với quyền root"
   echo "    Sử dụng: sudo bash setup.sh"
   exit 1
fi

# Kiểm tra kernel headers
echo "[*] Checking kernel headers..."
if ! dpkg -l | grep -q linux-headers-$(uname -r); then
    echo "[!] Kernel headers không được cài đặt"
    echo "[*] Cài đặt: sudo apt-get install linux-headers-$(uname -r)"
    exit 1
fi
echo "[✓] Kernel headers found"

# Kiểm tra build tools
echo "[*] Checking build tools..."
for tool in gcc make; do
    if ! command -v $tool &> /dev/null; then
        echo "[!] $tool không được cài đặt"
        echo "[*] Cài đặt: sudo apt-get install build-essential"
        exit 1
    fi
done
echo "[✓] Build tools available"

# Tạo USB mount point
echo "[*] Creating USB mount point..."
mkdir -p /mnt/usb
echo "[✓] /mnt/usb created"

# Build project
echo ""
echo "[*] Building project..."
cd "$(dirname "$0")"
make clean
make all

if [ $? -ne 0 ]; then
    echo "[!] Build failed!"
    exit 1
fi
echo "[✓] Build successful"

# Install
echo ""
echo "[*] Installing..."
make install-driver

# Create device node if needed
if [ ! -e /dev/aes_engine ]; then
    echo "[*] Creating device node..."
    MAJOR=$(grep aes_engine /proc/devices | awk '{print $1}')
    if [ ! -z "$MAJOR" ]; then
        mknod /dev/aes_engine c $MAJOR 0
        chmod 666 /dev/aes_engine
    fi
fi

# Create symbolic links
echo "[*] Creating symbolic links..."
ln -sf $(pwd)/build/bin/file_manager /usr/local/bin/aes-file-manager 2>/dev/null || true
ln -sf $(pwd)/build/bin/usb_manager /usr/local/bin/aes-usb-manager 2>/dev/null || true
chmod +x $(pwd)/build/bin/file_manager
chmod +x $(pwd)/build/bin/usb_manager

# Verify installation
echo ""
echo "[*] Verifying installation..."
if [ -e /dev/aes_engine ]; then
    echo "[✓] Device /dev/aes_engine is ready"
else
    echo "[!] Warning: /dev/aes_engine not found"
fi

echo ""
echo "================================"
echo " Setup Complete!"
echo "================================"
echo ""
echo "Quick start:"
echo "  1. File Manager: /opt/aes_secure/file_manager"
echo "  2. USB Manager: /opt/aes_secure/usb_manager /mnt/usb"
echo "  3. Or use: aes-file-manager, aes-usb-manager"
echo ""
echo "To uninstall:"
echo "  sudo bash setup.sh uninstall"
echo ""
