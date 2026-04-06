#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <fcntl.h>
#include <unistd.h>
#include <sys/ioctl.h>
#include <sys/mount.h>
#include <sys/stat.h>
#include <errno.h>

#define AES_IOCTL_MAGIC 'A'
#define AES_DO_CRYPT _IOWR(AES_IOCTL_MAGIC, 1, struct aes_args)

struct aes_args
{
    unsigned char key[16];
    unsigned char *in_buf;
    unsigned char *out_buf;
    size_t len;
    int is_encrypt;
};

#define COLOR_RED "\x1b[31m"
#define COLOR_GREEN "\x1b[32m"
#define COLOR_YELLOW "\x1b[33m"
#define COLOR_BLUE "\x1b[34m"

// Hàm kiểm tra USB được gắn
int check_usb_mounted(const char *usb_mount_point)
{
    FILE *fp = fopen("/proc/mounts", "r");
    char line[512];
    int found = 0;

    if (!fp)
    {
        perror("Cannot read /proc/mounts");
        return 0;
    }

    while (fgets(line, sizeof(line), fp))
    {
        if (strstr(line, usb_mount_point))
        {
            found = 1;
            break;
        }
    }

    fclose(fp);
    return found;
}

// Hàm in menu
void print_usb_menu()
{
    printf("\n%s╔════════════════════════════════════════════════════╗%s\n", COLOR_BLUE, "");
    printf("%s║%s   QUẢN LÝ USB AN TOÀN VỚI MÃ HÓA AES        %s║%s\n",
           COLOR_BLUE, COLOR_GREEN, COLOR_BLUE, "");
    printf("%s╠════════════════════════════════════════════════════╣%s\n", COLOR_BLUE, "");
    printf("%s║%s 1. Hiển thị thông tin USB (USB Info)            %s║%s\n",
           COLOR_BLUE, COLOR_YELLOW, COLOR_BLUE, "");
    printf("%s║%s 2. Liệt kê file trên USB (List Files)           %s║%s\n",
           COLOR_BLUE, COLOR_YELLOW, COLOR_BLUE, "");
    printf("%s║%s 3. Mã hóa file trên USB (Encrypt File)          %s║%s\n",
           COLOR_BLUE, COLOR_YELLOW, COLOR_BLUE, "");
    printf("%s║%s 4. Giải mã file trên USB (Decrypt File)         %s║%s\n",
           COLOR_BLUE, COLOR_YELLOW, COLOR_BLUE, "");
    printf("%s║%s 5. Tương tác với File Manager (Open Manager)    %s║%s\n",
           COLOR_BLUE, COLOR_YELLOW, COLOR_BLUE, "");
    printf("%s║%s 0. Thoát (Exit)                                 %s║%s\n",
           COLOR_BLUE, COLOR_RED, COLOR_BLUE, "");
    printf("%s╚════════════════════════════════════════════════════╝%s\n\n", COLOR_BLUE, "");
}

// Hàm mã hóa/giải mã file trên USB
int process_usb_file(int is_encrypt, const char *password, const char *filepath)
{
    int fd_file, fd_driver;
    off_t file_size;
    size_t padded_size;
    unsigned char *buffer = NULL;
    struct aes_args args;
    struct stat file_stat;

    if (stat(filepath, &file_stat) < 0)
    {
        printf("%s✗ Lỗi: File không tồn tại%s\n", COLOR_RED, "");
        return -1;
    }

    file_size = file_stat.st_size;
    if (file_size == 0)
    {
        printf("%s✗ Lỗi: File trống%s\n", COLOR_RED, "");
        return -1;
    }

    fd_file = open(filepath, O_RDWR);
    if (fd_file < 0)
    {
        perror("Cannot open file");
        return -1;
    }

    fd_driver = open("/dev/aes_engine", O_RDWR);
    if (fd_driver < 0)
    {
        printf("%s✗ Lỗi: Không thể kết nối driver AES%s\n", COLOR_RED, "");
        close(fd_file);
        return -1;
    }

    // Tính kích thước padding
    padded_size = (file_size % 16 == 0) ? file_size : ((file_size / 16) + 1) * 16;

    buffer = calloc(1, padded_size);
    if (!buffer)
    {
        printf("%s✗ Lỗi: Không đủ bộ nhớ%s\n", COLOR_RED, "");
        close(fd_driver);
        close(fd_file);
        return -1;
    }

    read(fd_file, buffer, file_size);

    // Chuẩn bị key
    memset(args.key, 0, 16);
    strncpy((char *)args.key, password, 15);
    args.in_buf = buffer;
    args.out_buf = buffer;
    args.len = padded_size;
    args.is_encrypt = is_encrypt;

    printf("%sXử lý file %s...%s\n",
           COLOR_YELLOW,
           is_encrypt ? "mã hóa" : "giải mã",
           "");

    if (ioctl(fd_driver, AES_DO_CRYPT, &args) < 0)
    {
        printf("%s✗ Lỗi ioctl%s\n", COLOR_RED, "");
        perror("ioctl");
        goto cleanup;
    }

    lseek(fd_file, 0, SEEK_SET);
    ftruncate(fd_file, padded_size);
    write(fd_file, buffer, padded_size);
    printf("%s✓ Thành công!%s\n", COLOR_GREEN, "");

cleanup:
    free(buffer);
    close(fd_driver);
    close(fd_file);
    return 0;
}

// Hiển thị thông tin USB
void show_usb_info(const char *usb_mount)
{
    struct stat buf;
    char cmd[256];

    printf("%s\n═══ Thông tin USB ════════════════════════════════%s\n", COLOR_CYAN, "");
    printf("Điểm gắn kết (Mount Point): %s\n", usb_mount);

    if (stat(usb_mount, &buf) == 0)
    {
        printf("Hệ thống tệp: ext4/vfat\n");
        printf("Dung lượng tổng: xem bằng 'df -h %s'\n", usb_mount);
    }

    snprintf(cmd, sizeof(cmd), "ls -lh %s | tail -1", usb_mount);
    printf("\nCác tệp chiếm dụng:\n");
    system(cmd);
}

// Liệt kê file trên USB
void list_usb_files(const char *usb_mount)
{
    char cmd[256];
    snprintf(cmd, sizeof(cmd), "ls -lh %s", usb_mount);
    printf("\n%s════ Danh sách file trên USB ════%s\n", COLOR_YELLOW, "");
    system(cmd);
}

int main(int argc, char *argv[])
{
    const char *usb_mount = "/mnt/usb";
    int choice;
    char filepath[512];
    char password[32];

    // Chấp nhận tham số dòng lệnh
    if (argc > 1)
    {
        usb_mount = argv[1];
    }

    while (1)
    {
        print_usb_menu();
        printf("%sChọn tùy chọn: %s", COLOR_YELLOW, "");
        scanf("%d", &choice);
        getchar();

        if (choice == 0)
        {
            printf("%s✓ Tạm biệt!%s\n", COLOR_GREEN, "");
            break;
        }

        switch (choice)
        {
        case 1:
            show_usb_info(usb_mount);
            break;

        case 2:
            list_usb_files(usb_mount);
            break;

        case 3:
            printf("Nhập đường dẫn file: ");
            fgets(filepath, sizeof(filepath), stdin);
            filepath[strcspn(filepath, "\n")] = 0;
            printf("Nhập mật khẩu: ");
            fgets(password, sizeof(password), stdin);
            password[strcspn(password, "\n")] = 0;
            process_usb_file(1, password, filepath);
            break;

        case 4:
            printf("Nhập đường dẫn file: ");
            fgets(filepath, sizeof(filepath), stdin);
            filepath[strcspn(filepath, "\n")] = 0;
            printf("Nhập mật khẩu: ");
            fgets(password, sizeof(password), stdin);
            password[strcspn(password, "\n")] = 0;
            process_usb_file(0, password, filepath);
            break;

        case 5:
            printf("%sKhởi động File Manager...%s\n", COLOR_YELLOW, "");
            snprintf(filepath, sizeof(filepath), "%s %s", "file_manager", usb_mount);
            system(filepath);
            break;

        default:
            printf("%s✗ Tùy chọn không hợp lệ%s\n", COLOR_RED, "");
        }

        printf("\nNhấn Enter để tiếp tục...");
        getchar();
    }

    return 0;
}
