#ifndef AES_UTILS_H
#define AES_UTILS_H

#include <stddef.h>
#include <stdarg.h>
#include "aes_crypto.h"

#ifdef __cplusplus
extern "C"
{
#endif

    // ========================================
    // Error Handling
    // ========================================

    /**
     * Get the last error message
     * @return Pointer to error string
     */
    const char *aes_get_last_error(void);

    /**
     * Set error message (internal use)
     */
    void aes_set_error(const char *fmt, ...);

    // ========================================
    // Device Operations
    // ========================================

    /**
     * Open AES device
     * @return File descriptor on success, negative on error
     */
    int aes_device_open(void);

    /**
     * Close AES device
     * @param fd File descriptor
     * @return Close result
     */
    int aes_device_close(int fd);

    // ========================================
    // Crypto Primitives
    // ========================================

    /**
     * Encrypt buffer in-place
     * @param fd AES device file descriptor
     * @param key 16-byte encryption key
     * @param data Data to encrypt (modified in-place)
     * @param data_len Data length (must be multiple of 16)
     * @return 0 on success, negative on error
     */
    int aes_encrypt_buffer(int fd, const unsigned char *key,
                           unsigned char *data, size_t data_len);

    /**
     * Decrypt buffer in-place
     * @param fd AES device file descriptor
     * @param key 16-byte decryption key
     * @param data Data to decrypt (modified in-place)
     * @param data_len Data length (must be multiple of 16)
     * @return 0 on success, negative on error
     */
    int aes_decrypt_buffer(int fd, const unsigned char *key,
                           unsigned char *data, size_t data_len);

    // ========================================
    // Key Derivation
    // ========================================

    /**
     * Derive key from password (simple method - pad with NULLs)
     * @param password Password string
     * @param key Output buffer (16 bytes)
     */
    void aes_derive_key_simple(const char *password, unsigned char *key);

    // ========================================
    // Padding Functions
    // ========================================

    /**
     * Calculate padded size for AES block alignment
     * @param original_size Original data size
     * @return Padded size (multiple of 16)
     */
    size_t aes_calculate_padded_size(size_t original_size);

    /**
     * Add PKCS7 padding
     * @param data Buffer to pad
     * @param original_size Original data size
     * @param padded_size Target padded size
     * @return 0 on success, negative on error
     */
    int aes_add_pkcs7_padding(unsigned char *data, size_t original_size,
                              size_t padded_size);

    /**
     * Remove PKCS7 padding
     * @param data Buffer with padding
     * @param actual_size Output: actual data size
     * @param padded_size Current padded size
     * @return 0 on success, negative on error
     */
    int aes_remove_pkcs7_padding(unsigned char *data, size_t *actual_size,
                                 size_t padded_size);

    // ========================================
    // File Operations
    // ========================================

    /**
     * Encrypt file
     * @param input_file Input file path
     * @param output_file Output file path
     * @param key 16-byte encryption key
     * @return 0 on success, negative on error
     */
    int aes_encrypt_file(const char *input_file, const char *output_file,
                         const unsigned char *key);

    /**
     * Decrypt file
     * @param input_file Encrypted file path
     * @param output_file Output file path
     * @param key 16-byte decryption key
     * @return 0 on success, negative on error
     */
    int aes_decrypt_file(const char *input_file, const char *output_file,
                         const unsigned char *key);

#ifdef __cplusplus
}
#endif

#endif // AES_UTILS_H
