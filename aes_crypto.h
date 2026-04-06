#ifndef AES_CRYPTO_H
#define AES_CRYPTO_H

#include <sys/ioctl.h>

#define AES_IOCTL_MAGIC 'A'
#define AES_DO_CRYPT _IOWR(AES_IOCTL_MAGIC, 1, struct aes_args)
#define AES_KEY_SIZE 16
#define AES_BLOCK_SIZE 16
#define AES_DEVICE "/dev/aes_engine"

// Cấu trúc giao tiếp User - Kernel
typedef struct
{
    unsigned char key[AES_KEY_SIZE]; // Khóa 128-bit
    unsigned char *in_buf;           // Buffer chứa data gốc
    unsigned char *out_buf;          // Buffer nhận data mã hóa
    size_t len;                      // Kích thước (phải chia hết cho 16)
    int is_encrypt;                  // 1: Mã hóa, 0: Giải mã
} AES_ARGS;

typedef struct
{
    char filepath[256];
    int is_encrypted;
    unsigned long file_size;
    char digest[32]; // MD5 hoặc SHA256
} FILE_INFO;

#endif
