#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/ioctl.h>
#include <fcntl.h>
#include <unistd.h>
#include <errno.h>
#include "aes_crypto.h"

#define AES_ERROR_MSG_SIZE 256

static char last_error[AES_ERROR_MSG_SIZE];

// ========================================
// Error Handling Functions
// ========================================

const char *aes_get_last_error()
{
    return last_error;
}

void aes_set_error(const char *fmt, ...)
{
    va_list args;
    va_start(args, fmt);
    vsnprintf(last_error, sizeof(last_error), fmt, args);
    va_end(args);
}

// ========================================
// Device Operations
// ========================================

int aes_device_open()
{
    int fd = open(AES_DEVICE, O_RDWR);
    if (fd < 0)
    {
        aes_set_error("Cannot open AES device: %s (error %d)", AES_DEVICE, errno);
    }
    return fd;
}

int aes_device_close(int fd)
{
    if (fd >= 0)
        return close(fd);
    return -1;
}

// ========================================
// Crypto Operations
// ========================================

int aes_encrypt_buffer(int fd, const unsigned char *key,
                       unsigned char *data, size_t data_len)
{
    if (!key || !data || data_len == 0)
    {
        aes_set_error("Invalid parameters for encryption");
        return -EINVAL;
    }

    if (data_len % AES_BLOCK_SIZE != 0)
    {
        aes_set_error("Data length must be multiple of %d bytes", AES_BLOCK_SIZE);
        return -EINVAL;
    }

    AES_ARGS args;
    memcpy(args.key, key, AES_KEY_SIZE);
    args.in_buf = data;
    args.out_buf = data;
    args.len = data_len;
    args.is_encrypt = 1;

    int ret = ioctl(fd, AES_DO_CRYPT, &args);
    if (ret < 0)
    {
        aes_set_error("Encryption ioctl failed: %s (error %d)", strerror(errno), errno);
    }
    return ret;
}

int aes_decrypt_buffer(int fd, const unsigned char *key,
                       unsigned char *data, size_t data_len)
{
    if (!key || !data || data_len == 0)
    {
        aes_set_error("Invalid parameters for decryption");
        return -EINVAL;
    }

    if (data_len % AES_BLOCK_SIZE != 0)
    {
        aes_set_error("Data length must be multiple of %d bytes", AES_BLOCK_SIZE);
        return -EINVAL;
    }

    AES_ARGS args;
    memcpy(args.key, key, AES_KEY_SIZE);
    args.in_buf = data;
    args.out_buf = data;
    args.len = data_len;
    args.is_encrypt = 0;

    int ret = ioctl(fd, AES_DO_CRYPT, &args);
    if (ret < 0)
    {
        aes_set_error("Decryption ioctl failed: %s (error %d)", strerror(errno), errno);
    }
    return ret;
}

// ========================================
// Key Derivation
// ========================================

void aes_derive_key_simple(const char *password, unsigned char *key)
{
    memset(key, 0, AES_KEY_SIZE);
    if (password)
    {
        strncpy((char *)key, password, AES_KEY_SIZE - 1);
    }
}

// ========================================
// Padding
// ========================================

size_t aes_calculate_padded_size(size_t original_size)
{
    if (original_size == 0)
        return 0;
    if (original_size % AES_BLOCK_SIZE == 0)
        return original_size;
    return ((original_size / AES_BLOCK_SIZE) + 1) * AES_BLOCK_SIZE;
}

int aes_add_pkcs7_padding(unsigned char *data, size_t original_size,
                          size_t padded_size)
{
    if (padded_size < original_size)
        return -EINVAL;

    unsigned char pad_value = padded_size - original_size;

    for (size_t i = original_size; i < padded_size; i++)
    {
        data[i] = pad_value;
    }

    return 0;
}

int aes_remove_pkcs7_padding(unsigned char *data, size_t *actual_size,
                             size_t padded_size)
{
    if (padded_size == 0 || padded_size % AES_BLOCK_SIZE != 0)
        return -EINVAL;

    unsigned char pad_value = data[padded_size - 1];

    if (pad_value > AES_BLOCK_SIZE || pad_value == 0)
    {
        aes_set_error("Invalid padding detected");
        return -EINVAL;
    }

    *actual_size = padded_size - pad_value;
    return 0;
}

// ========================================
// File Operations
// ========================================

int aes_encrypt_file(const char *input_file, const char *output_file,
                     const unsigned char *key)
{
    int fd_in, fd_out, fd_aes;
    FILE *fp_in;
    unsigned char *buffer = NULL;
    size_t file_size, padded_size;
    struct stat stat_buf;
    int ret = -1;

    // Open input file
    fp_in = fopen(input_file, "rb");
    if (!fp_in)
    {
        aes_set_error("Cannot open input file: %s", input_file);
        return -1;
    }

    // Get file size
    fseek(fp_in, 0, SEEK_END);
    file_size = ftell(fp_in);
    fseek(fp_in, 0, SEEK_SET);

    if (file_size == 0)
    {
        aes_set_error("Input file is empty");
        goto cleanup_in;
    }

    // Calculate padded size
    padded_size = aes_calculate_padded_size(file_size);

    // Allocate buffer
    buffer = malloc(padded_size);
    if (!buffer)
    {
        aes_set_error("Memory allocation failed");
        goto cleanup_in;
    }

    // Read file
    if (fread(buffer, 1, file_size, fp_in) != file_size)
    {
        aes_set_error("Failed to read input file");
        goto cleanup_buffer;
    }

    // Add PKCS7 padding
    aes_add_pkcs7_padding(buffer, file_size, padded_size);

    // Open AES device
    fd_aes = aes_device_open();
    if (fd_aes < 0)
        goto cleanup_buffer;

    // Encrypt buffer
    if (aes_encrypt_buffer(fd_aes, key, buffer, padded_size) < 0)
    {
        aes_device_close(fd_aes);
        goto cleanup_buffer;
    }

    aes_device_close(fd_aes);

    // Write output file
    FILE *fp_out = fopen(output_file, "wb");
    if (!fp_out)
    {
        aes_set_error("Cannot open output file: %s", output_file);
        goto cleanup_buffer;
    }

    if (fwrite(buffer, 1, padded_size, fp_out) != padded_size)
    {
        aes_set_error("Failed to write output file");
        fclose(fp_out);
        goto cleanup_buffer;
    }

    fclose(fp_out);
    ret = 0;

cleanup_buffer:
    free(buffer);
cleanup_in:
    fclose(fp_in);
    return ret;
}

int aes_decrypt_file(const char *input_file, const char *output_file,
                     const unsigned char *key)
{
    int fd_aes;
    FILE *fp_in, *fp_out;
    unsigned char *buffer = NULL;
    size_t file_size, actual_size;
    int ret = -1;

    // Open encrypted file
    fp_in = fopen(input_file, "rb");
    if (!fp_in)
    {
        aes_set_error("Cannot open encrypted file: %s", input_file);
        return -1;
    }

    // Get file size
    fseek(fp_in, 0, SEEK_END);
    file_size = ftell(fp_in);
    fseek(fp_in, 0, SEEK_SET);

    if (file_size == 0 || file_size % AES_BLOCK_SIZE != 0)
    {
        aes_set_error("Invalid encrypted file size");
        goto cleanup_in;
    }

    // Allocate buffer
    buffer = malloc(file_size);
    if (!buffer)
    {
        aes_set_error("Memory allocation failed");
        goto cleanup_in;
    }

    // Read encrypted file
    if (fread(buffer, 1, file_size, fp_in) != file_size)
    {
        aes_set_error("Failed to read encrypted file");
        goto cleanup_buffer;
    }

    // Open AES device
    fd_aes = aes_device_open();
    if (fd_aes < 0)
        goto cleanup_buffer;

    // Decrypt buffer
    if (aes_decrypt_buffer(fd_aes, key, buffer, file_size) < 0)
    {
        aes_device_close(fd_aes);
        goto cleanup_buffer;
    }

    aes_device_close(fd_aes);

    // Remove PKCS7 padding
    if (aes_remove_pkcs7_padding(buffer, &actual_size, file_size) < 0)
        goto cleanup_buffer;

    // Write output file
    fp_out = fopen(output_file, "wb");
    if (!fp_out)
    {
        aes_set_error("Cannot open output file: %s", output_file);
        goto cleanup_buffer;
    }

    if (fwrite(buffer, 1, actual_size, fp_out) != actual_size)
    {
        aes_set_error("Failed to write output file");
        fclose(fp_out);
        goto cleanup_buffer;
    }

    fclose(fp_out);
    ret = 0;

cleanup_buffer:
    free(buffer);
cleanup_in:
    fclose(fp_in);
    return ret;
}
