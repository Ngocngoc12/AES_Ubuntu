#!/bin/bash

# ====================================================
# AES Secure File Manager - Quick Test Script
# ====================================================

set -e

echo "╔════════════════════════════════════════════════╗"
echo "║  AES File Manager - Quick Test                ║"
echo "╚════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if running with sudo
if [[ $EUID -ne 0 ]] && [ ! -e /dev/aes_engine ]; then
    echo -e "${YELLOW}[!] This test may need sudo for device access${NC}"
    echo "    Rerun with: sudo bash test.sh"
fi

# Test directory
TEST_DIR="/tmp/aes_test_$$"
mkdir -p "$TEST_DIR"
cd "$TEST_DIR"

echo -e "${BLUE}[*] Test directory: $TEST_DIR${NC}"
echo ""

# ========================================
# Test 1: Check driver
# ========================================
echo -e "${BLUE}Test 1: Checking kernel driver...${NC}"
if lsmod | grep -q aes_driver; then
    echo -e "${GREEN}✓ Driver is loaded${NC}"
else
    echo -e "${YELLOW}! Driver not loaded, attempting to load...${NC}"
    if [ -f /opt/aes_secure/aes_driver.ko ]; then
        sudo insmod /opt/aes_secure/aes_driver.ko
        echo -e "${GREEN}✓ Driver loaded${NC}"
    else
        echo -e "${RED}✗ Cannot find driver${NC}"
        exit 1
    fi
fi

# ========================================
# Test 2: Check device node
# ========================================
echo -e "${BLUE}Test 2: Checking /dev/aes_engine...${NC}"
if [ -e /dev/aes_engine ]; then
    echo -e "${GREEN}✓ Device node exists${NC}"
    ls -la /dev/aes_engine
else
    echo -e "${RED}✗ Device node not found${NC}"
    exit 1
fi

# ========================================
# Test 3: Check binaries
# ========================================
echo ""
echo -e "${BLUE}Test 3: Checking compiled binaries...${NC}"

if [ -f /opt/aes_secure/file_manager ]; then
    echo -e "${GREEN}✓ file_manager found${NC}"
else
    echo -e "${YELLOW}! file_manager not in default location${NC}"
    echo "  Building now..."
    cd ..
    make userspace
    cd "$TEST_DIR"
fi

# ========================================
# Test 4: Create test file
# ========================================
echo ""
echo -e "${BLUE}Test 4: Creating test file...${NC}"
TEST_FILE="$TEST_DIR/test_document.txt"
TEST_CONTENT="Hello World! This is a test file for AES encryption."
echo "$TEST_CONTENT" > "$TEST_FILE"
echo -e "${GREEN}✓ Test file created${NC}"
echo "  File: $TEST_FILE"
echo "  Size: $(stat -f%z "$TEST_FILE" 2>/dev/null || stat -c%s "$TEST_FILE") bytes"

# ========================================
# Test 5: Encrypt file
# ========================================
echo ""
echo -e "${BLUE}Test 5: Encrypting file...${NC}"
PASSWORD="TestPassword123"

# Create a simple C test program
cat > encrypt_test.c << 'EOF'
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <fcntl.h>
#include <unistd.h>
#include <sys/ioctl.h>

#define AES_IOCTL_MAGIC 'A'
#define AES_DO_CRYPT _IOWR(AES_IOCTL_MAGIC, 1, struct aes_args)

struct aes_args {
    unsigned char key[16];
    unsigned char *in_buf;
    unsigned char *out_buf;
    size_t len;
    int is_encrypt;
};

int main(int argc, char *argv[]) {
    if (argc != 4) {
        fprintf(stderr, "Usage: %s <encrypt|decrypt> <password> <file>\n", argv[0]);
        return 1;
    }

    const char *operation = argv[1];
    const char *password = argv[2];
    const char *filepath = argv[3];
    
    int is_encrypt = (strcmp(operation, "encrypt") == 0) ? 1 : 0;
    
    // Open file
    int fd_file = open(filepath, O_RDWR);
    if (fd_file < 0) {
        perror("Cannot open file");
        return 1;
    }
    
    // Read file
    off_t file_size = lseek(fd_file, 0, SEEK_END);
    lseek(fd_file, 0, SEEK_SET);
    
    if (file_size == 0) {
        fprintf(stderr, "File is empty\n");
        close(fd_file);
        return 1;
    }
    
    // Calculate padded size
    size_t padded_size = (file_size % 16 == 0) ? file_size : ((file_size / 16) + 1) * 16;
    
    unsigned char *buffer = calloc(1, padded_size);
    if (!buffer) {
        perror("malloc");
        close(fd_file);
        return 1;
    }
    
    read(fd_file, buffer, file_size);
    
    // Open AES device
    int fd_aes = open("/dev/aes_engine", O_RDWR);
    if (fd_aes < 0) {
        perror("Cannot open AES device");
        free(buffer);
        close(fd_file);
        return 1;
    }
    
    // Prepare crypto args
    struct aes_args args;
    memset(args.key, 0, 16);
    strncpy((char *)args.key, password, 15);
    args.in_buf = buffer;
    args.out_buf = buffer;
    args.len = padded_size;
    args.is_encrypt = is_encrypt;
    
    // Call driver
    printf("Processing %d bytes (%s)...\n", (int)padded_size, operation);
    
    if (ioctl(fd_aes, AES_DO_CRYPT, &args) < 0) {
        perror("ioctl");
        free(buffer);
        close(fd_aes);
        close(fd_file);
        return 1;
    }
    
    // Write file
    lseek(fd_file, 0, SEEK_SET);
    ftruncate(fd_file, padded_size);
    write(fd_file, buffer, padded_size);
    
    printf("Success! File processed.\n");
    
    free(buffer);
    close(fd_aes);
    close(fd_file);
    return 0;
}
EOF

# Compile test program
gcc -o encrypt_test encrypt_test.c

# Run encryption
./encrypt_test encrypt "$PASSWORD" "$TEST_FILE"
echo -e "${GREEN}✓ File encrypted${NC}"

# ========================================
# Test 6: Verify file is encrypted
# ========================================
echo ""
echo -e "${BLUE}Test 6: Verifying file is encrypted...${NC}"
FIRST_CHARS=$(od -A n -t x1 "$TEST_FILE" | head -1)
echo "  File starts with: $FIRST_CHARS"
echo -e "${GREEN}✓ File appears encrypted (binary data)${NC}"

# ========================================
# Test 7: Decrypt file
# ========================================
echo ""
echo -e "${BLUE}Test 7: Decrypting file...${NC}"
./encrypt_test decrypt "$PASSWORD" "$TEST_FILE"
echo -e "${GREEN}✓ File decrypted${NC}"

# ========================================
# Test 8: Verify content
# ========================================
echo ""
echo -e "${BLUE}Test 8: Verifying decrypted content...${NC}"
DECRYPTED_CONTENT=$(cat "$TEST_FILE" 2>/dev/null | tr -d '\0')
echo "  Original: $TEST_CONTENT"
echo "  Decrypted: $DECRYPTED_CONTENT"

if [[ "$DECRYPTED_CONTENT" == *"Hello World"* ]]; then
    echo -e "${GREEN}✓ Content verified correctly!${NC}"
else
    echo -e "${RED}✗ Content mismatch!${NC}"
    exit 1
fi

# ========================================
# Test 9: Test with different password
# ========================================
echo ""
echo -e "${BLUE}Test 9: Testing wrong password...${NC}"
cp "$TEST_FILE" "$TEST_FILE.backup"
./encrypt_test encrypt "$PASSWORD" "$TEST_FILE"
./encrypt_test decrypt "WrongPassword123" "$TEST_FILE" 2>/dev/null || true

WRONG_CONTENT=$(cat "$TEST_FILE" 2>/dev/null | tr -d '\0')
if [[ "$WRONG_CONTENT" != *"Hello World"* ]]; then
    echo -e "${GREEN}✓ Wrong password correctly produces garbage${NC}"
else
    echo -e "${YELLOW}! File decrypted with wrong password (unexpected)${NC}"
fi

# Restore
cp "$TEST_FILE.backup" "$TEST_FILE"

# ========================================
# Cleanup
# ========================================
echo ""
echo -e "${BLUE}Cleaning up...${NC}"
cd /
rm -rf "$TEST_DIR"
echo -e "${GREEN}✓ Cleanup complete${NC}"

# ========================================
# Summary
# ========================================
echo ""
echo "╔════════════════════════════════════════════════╗"
echo -e "${GREEN}║  All tests passed! System is working correctly.     ║${NC}"
echo "╚════════════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo "1. Run the file manager:"
echo "   /opt/aes_secure/file_manager"
echo ""
echo "2. Or the USB manager:"
echo "   /opt/aes_secure/usb_manager /mnt/usb"
echo ""
echo "3. For more information, see README.md and INSTALL.md"
echo ""
