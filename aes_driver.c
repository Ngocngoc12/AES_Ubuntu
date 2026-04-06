#include <linux/module.h>
#include <linux/kernel.h>
#include <linux/crypto.h>
#include <linux/scatterlist.h>
#include <linux/gfp.h>
#include <linux/err.h>
#include <crypto/skcipher.h>
#include <linux/miscdevice.h>
#include <linux/fs.h>
#include <linux/uaccess.h>

#define AES_IOCTL_MAGIC 'A'
#define AES_DO_CRYPT _IOWR(AES_IOCTL_MAGIC, 1, struct aes_args)
#define AES_KEY_SIZE 16
#define AES_BLOCK_SIZE 16

// Cấu trúc giao tiếp User - Kernel
struct aes_args
{
    unsigned char key[AES_KEY_SIZE]; // Khóa 128-bit
    unsigned char *in_buf;           // Buffer chứa data gốc
    unsigned char *out_buf;          // Buffer nhận data mã hóa
    size_t len;                      // Kích thước (phải chia hết cho 16)
    int is_encrypt;                  // 1: Mã hóa, 0: Giải mã
};

struct tcrypt_result
{
    struct completion completion;
    int err;
};

// ĐÃ SỬA: Thay struct crypto_async_request thành void *data cho tương thích Kernel 6.17+
static void test_skcipher_cb(void *data, int error)
{
    struct tcrypt_result *result = data;
    if (error == -EINPROGRESS)
        return;
    result->err = error;
    complete(&result->completion);
}

// Hàm validation input
static int validate_aes_args(struct aes_args *args)
{
    if (!args)
        return -EINVAL;
    if (args->len == 0 || args->len % AES_BLOCK_SIZE != 0)
    {
        pr_err("AES: Invalid length %zu. Must be multiple of %d\n", args->len, AES_BLOCK_SIZE);
        return -EINVAL;
    }
    if (!args->in_buf || !args->out_buf)
        return -EFAULT;
    if (args->is_encrypt != 0 && args->is_encrypt != 1)
        return -EINVAL;
    return 0;
}

// Hàm mã hóa/giải mã AES
static int perform_aes_crypt(struct aes_args *args)
{
    struct crypto_skcipher *skcipher = NULL;
    struct skcipher_request *req = NULL;
    struct tcrypt_result result;
    struct scatterlist sg;
    unsigned char *kernel_buf = NULL;
    unsigned char ivdata[AES_BLOCK_SIZE];
    int ret = -EFAULT;

    // Validation
    ret = validate_aes_args(args);
    if (ret)
        return ret;

    // 1. Khởi tạo thuật toán AES-CBC
    skcipher = crypto_alloc_skcipher("cbc(aes)", 0, 0);
    if (IS_ERR(skcipher))
    {
        pr_err("AES: Failed to alloc skcipher\n");
        return PTR_ERR(skcipher);
    }

    req = skcipher_request_alloc(skcipher, GFP_KERNEL);
    if (!req)
    {
        pr_err("AES: Failed to alloc request\n");
        ret = -ENOMEM;
        goto out;
    }

    skcipher_request_set_callback(req, CRYPTO_TFM_REQ_MAY_BACKLOG, test_skcipher_cb, &result);

    // 2. Cài đặt Khóa và IV
    ret = crypto_skcipher_setkey(skcipher, args->key, AES_KEY_SIZE);
    if (ret)
    {
        pr_err("AES: Failed to set key\n");
        goto out;
    }

    memset(ivdata, 0, AES_BLOCK_SIZE); // IV mặc định là 0 để demo

    // 3. Cấp phát bộ nhớ an toàn trong Kernel
    kernel_buf = kmalloc(args->len, GFP_KERNEL);
    if (!kernel_buf)
    {
        pr_err("AES: Memory allocation failed\n");
        ret = -ENOMEM;
        goto out;
    }

    // 4. Copy dữ liệu từ User-space
    if (copy_from_user(kernel_buf, args->in_buf, args->len))
    {
        pr_err("AES: copy_from_user failed\n");
        ret = -EFAULT;
        goto out;
    }

    sg_init_one(&sg, kernel_buf, args->len);
    skcipher_request_set_crypt(req, &sg, &sg, args->len, ivdata);
    init_completion(&result.completion);

    // 5. Thực thi mã hóa/giải mã
    if (args->is_encrypt)
    {
        pr_info("AES: Encrypting %zu bytes\n", args->len);
        ret = crypto_skcipher_encrypt(req);
    }
    else
    {
        pr_info("AES: Decrypting %zu bytes\n", args->len);
        ret = crypto_skcipher_decrypt(req);
    }

    if (ret == -EINPROGRESS)
    {
        wait_for_completion_interruptible(&result.completion);
        ret = result.err;
    }

    if (ret < 0)
        pr_err("AES: Crypto operation failed with %d\n", ret);

    // 6. Trả dữ liệu về User-space
    if (ret == 0)
    {
        if (copy_to_user(args->out_buf, kernel_buf, args->len))
        {
            pr_err("AES: copy_to_user failed\n");
            ret = -EFAULT;
        }
        else
        {
            pr_info("AES: Operation completed successfully\n");
        }
    }

out:
    if (skcipher)
        crypto_free_skcipher(skcipher);
    if (req)
        skcipher_request_free(req);
    if (kernel_buf)
        kfree(kernel_buf);
    return ret;
    if (copy_to_user(args->out_buf, kernel_buf, args->len))
    {
        ret = -EFAULT;
    }
}

out : if (skcipher)
          crypto_free_skcipher(skcipher);
if (req)
    skcipher_request_free(req);
if (kernel_buf)
    kfree(kernel_buf);
return ret;
}

// Hàm xử lý IOCTL từ User
static long aes_ioctl(struct file *file, unsigned int cmd, unsigned long arg)
{
    struct aes_args kargs;
    int ret = -ENOTTY;

    if (cmd == AES_DO_CRYPT)
    {
        if (copy_from_user(&kargs, (struct aes_args *)arg, sizeof(kargs)))
        {
            pr_err("AES: Failed to copy ioctl args from user\n");
            return -EFAULT;
        }
        ret = perform_aes_crypt(&kargs);
        if (ret < 0)
            pr_warn("AES: Operation returned error code %d\n", ret);
    }
    else
    {
        pr_err("AES: Unknown ioctl command 0x%x\n", cmd);
    }

    return ret;
}

static const struct file_operations aes_fops = {
    .owner = THIS_MODULE,
    .unlocked_ioctl = aes_ioctl,
#ifdef CONFIG_COMPAT
    .compat_ioctl = aes_ioctl,
#endif
};

static struct miscdevice aes_misc_dev = {
    .minor = MISC_DYNAMIC_MINOR,
    .name = "aes_engine", // Tạo device node /dev/aes_engine
    .fops = &aes_fops,
};

static int __init aes_init(void)
{
    int ret;
    pr_info("=== AES Encryption Driver Initializing ===\n");
    pr_info("Version: 1.0\n");
    pr_info("Algorithm: AES-128-CBC\n");

    ret = misc_register(&aes_misc_dev);
    if (ret < 0)
    {
        pr_err("Failed to register misc device: %d\n", ret);
        return ret;
    }

    pr_info("Device /dev/aes_engine created successfully\n");
    return 0;
}

static void __exit aes_exit(void)
{
    misc_deregister(&aes_misc_dev);
    pr_info("=== AES Encryption Driver Unloaded ===\n");
}

module_init(aes_init);
module_exit(aes_exit);
MODULE_LICENSE("GPL");
MODULE_AUTHOR("Security Team");
MODULE_DESCRIPTION("AES Encryption Driver for Secure File Management");
MODULE_VERSION("1.0");
