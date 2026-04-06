# Makefile cho AES Secure File Management System
# Hỗ trợ Ubuntu 64-bit

# Biến cấu hình
KERNEL_VERSION := $(shell uname -r)
KERNEL_DIR := /lib/modules/$(KERNEL_VERSION)/build

# Các tham số biên dịch
CC := gcc
CFLAGS := -Wall -Wextra -O2 -std=c99
LDFLAGS := -lc

# Thư mục đầu ra
BUILD_DIR := build
OBJ_DIR := $(BUILD_DIR)/obj
BIN_DIR := $(BUILD_DIR)/bin

# Các file nguồn
USER_APPS := file_manager usb_manager
DRIVER := aes_driver

# Các file đầu ra
DRIVER_MODULE := $(BIN_DIR)/aes_driver.ko
FILE_MANAGER := $(BIN_DIR)/file_manager
USB_MANAGER := $(BIN_DIR)/usb_manager

.PHONY: all clean install uninstall help driver userspace

all: driver userspace

# ========================================
# Build Kernel Driver
# ========================================
driver: $(DRIVER_MODULE)

$(DRIVER_MODULE): aes_driver.c
	@echo "[+] Building kernel driver..."
	@mkdir -p $(BUILD_DIR)/driver
	@cp aes_driver.c $(BUILD_DIR)/driver/
	@cp Kbuild $(BUILD_DIR)/driver/ 2>/dev/null || echo "Creating Kbuild..."
	@echo "obj-m := aes_driver.o" > $(BUILD_DIR)/driver/Kbuild
	@make -C $(KERNEL_DIR) M=$(PWD)/$(BUILD_DIR)/driver modules
	@mkdir -p $(BIN_DIR)
	@cp $(BUILD_DIR)/driver/aes_driver.ko $(DRIVER_MODULE)
	@echo "[✓] Driver built: $(DRIVER_MODULE)"

# ========================================
# Build User-space Applications
# ========================================
userspace: $(FILE_MANAGER) $(USB_MANAGER)

$(FILE_MANAGER): file_manager.c aes_crypto.h
	@echo "[+] Building file_manager..."
	@mkdir -p $(OBJ_DIR) $(BIN_DIR)
	$(CC) $(CFLAGS) -o $@ file_manager.c $(LDFLAGS)
	@echo "[✓] Compiled: $@"

$(USB_MANAGER): usb_manager.c aes_crypto.h
	@echo "[+] Building usb_manager..."
	@mkdir -p $(OBJ_DIR) $(BIN_DIR)
	$(CC) $(CFLAGS) -o $@ usb_manager.c $(LDFLAGS)
	@echo "[✓] Compiled: $@"

# ========================================
# Installation
# ========================================
install: all
	@echo "[+] Installing AES Secure File Management System..."
	@sudo mkdir -p /opt/aes_secure
	@sudo cp $(DRIVER_MODULE) /opt/aes_secure/
	@sudo cp $(FILE_MANAGER) /opt/aes_secure/file_manager
	@sudo cp $(USB_MANAGER) /opt/aes_secure/usb_manager
	@sudo chmod +x /opt/aes_secure/file_manager
	@sudo chmod +x /opt/aes_secure/usb_manager
	@sudo sh -c 'echo "insmod /opt/aes_secure/aes_driver.ko" >> /etc/modules'
	@echo "[✓] Installation complete!"
	@echo "    Usage:"
	@echo "    - Load driver: sudo insmod /opt/aes_secure/aes_driver.ko"
	@echo "    - File Manager: /opt/aes_secure/file_manager"
	@echo "    - USB Manager: /opt/aes_secure/usb_manager /mnt/usb"

install-driver: driver
	@echo "[+] Installing kernel driver..."
	@sudo mkdir -p /opt/aes_secure
	@sudo cp $(DRIVER_MODULE) /opt/aes_secure/
	@sudo insmod $(DRIVER_MODULE)
	@echo "[✓] Driver installed and loaded"

remove-driver:
	@echo "[+] Removing kernel driver..."
	@sudo rmmod aes_driver 2>/dev/null || echo "Driver not loaded"
	@echo "[✓] Driver removed"

uninstall: remove-driver
	@echo "[+] Uninstalling AES Secure File Management System..."
	@sudo rm -rf /opt/aes_secure
	@sudo sed -i '/aes_driver/d' /etc/modules
	@echo "[✓] Uninstallation complete"

# ========================================
# Cleaning
# ========================================
clean:
	@echo "[+] Cleaning build files..."
	@rm -rf $(BUILD_DIR)
	@rm -f *.o *.ko *.mod.c Module.symvers modules.order
	@echo "[✓] Clean complete"

distclean: clean uninstall
	@echo "[✓] Distclean complete"

# ========================================
# Testing
# ========================================
test-driver: install-driver
	@echo "[+] Testing driver..."
	@ls -la /dev/aes_engine
	@echo "[✓] Driver test passed (device created)"

test: all test-driver
	@echo "[+] All tests passed!"

# ========================================
# Helper Targets
# ========================================
help:
	@echo "============================================"
	@echo "AES Secure File Management System - Makefile"
	@echo "============================================"
	@echo ""
	@echo "Available targets:"
	@echo "  make all           - Build everything (driver + userspace)"
	@echo "  make driver        - Build kernel driver only"
	@echo "  make userspace     - Build user-space apps only"
	@echo "  make install       - Install complete system"
	@echo "  make install-driver - Install kernel driver only"
	@echo "  make remove-driver - Remove kernel driver"
	@echo "  make uninstall     - Remove complete system"
	@echo "  make clean         - Remove build files"
	@echo "  make distclean     - Clean + uninstall"
	@echo "  make test          - Run tests"
	@echo "  make help          - Show this help message"
	@echo ""
	@echo "Quick start:"
	@echo "  1. make all"
	@echo "  2. sudo make install-driver"
	@echo "  3. ./build/bin/file_manager"
	@echo ""

info:
	@echo "Kernel Version: $(KERNEL_VERSION)"
	@echo "Kernel Dir: $(KERNEL_DIR)"
	@echo "Build Dir: $(BUILD_DIR)"
	@echo "Compiler: $(CC)"
	@echo "CFLAGS: $(CFLAGS)"
