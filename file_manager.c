#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <fcntl.h>
#include <unistd.h>
#include <sys/ioctl.h>
#include <sys/stat.h>
#include <dirent.h>
#include <time.h>
#include "aes_crypto.h"

#define BUFFER_SIZE 1024
#define COLOR_RESET "\x1b[0m"
#define COLOR_GREEN "\x1b[32m"
#define COLOR_YELLOW "\x1b[33m"
#define COLOR_RED "\x1b[31m"
#define COLOR_BLUE "\x1b[34m"
#define COLOR_CYAN "\x1b[36m"

typedef struct
{
    char *name;
    int is_encrypted;
    unsigned long size;
    time_t modification_time;
} FileEntry;

// Hàm in menu
void print_menu()
{
    system("clear");
    printf("\n");
    printf(" %s╔════════════════════════════════════════════════════╗%s\n", COLOR_BLUE, COLOR_RESET);
    printf(" %s║%s    QUẢN LÝ FILE AN TOÀN VỚI MÃ HÓA AES         %s║%s\n",
           COLOR_BLUE, COLOR_GREEN, COLOR_BLUE, COLOR_RESET);
    printf(" %s║%s         Secure File Management System            %s║%s\n",
           COLOR_BLUE, COLOR_CYAN, COLOR_BLUE, COLOR_RESET);
    printf(" %s╠════════════════════════════════════════════════════╣%s\n", COLOR_BLUE, COLOR_RESET);
    printf(" %s║%s 1. Mã hóa File (Encrypt File)                    %s║%s\n",
           COLOR_BLUE, COLOR_YELLOW, COLOR_BLUE, COLOR_RESET);
    printf(" %s║%s 2. Giải mã File (Decrypt File)                  %s║%s\n",
           COLOR_BLUE, COLOR_YELLOW, COLOR_BLUE, COLOR_RESET);
    printf(" %s║%s 3. Danh sách File (List Files)                  %s║%s\n",
           COLOR_BLUE, COLOR_YELLOW, COLOR_BLUE, COLOR_RESET);
    printf(" %s║%s 4. Thông tin File (File Info)                   %s║%s\n",
           COLOR_BLUE, COLOR_YELLOW, COLOR_BLUE, COLOR_RESET);
    printf(" %s║%s 5. Xóa File (Delete File)                       %s║%s\n",
           COLOR_BLUE, COLOR_YELLOW, COLOR_BLUE, COLOR_RESET);
    printf(" %s║%s 6. Trợ giúp (Help)                              %s║%s\n",
           COLOR_BLUE, COLOR_YELLOW, COLOR_BLUE, COLOR_RESET);
    printf(" %s║%s 0. Thoát (Exit)                                 %s║%s\n",
           COLOR_BLUE, COLOR_RED, COLOR_BLUE, COLOR_RESET);
    printf(" %s╚════════════════════════════════════════════════════╝%s\n\n", COLOR_BLUE, COLOR_RESET);
}

// Hàm hiển thị tiêu đề
void print_header(const char *title)
{
    printf("\n%s", COLOR_CYAN);
    printf("╔════════════════════════════════════════════════════╗\n");
    printf("║  %-48s║\n", title);
    printf("╚════════════════════════════════════════════════════╝\n");
    printf("%s", COLOR_RESET);
}

// Kiểm tra file được mã hóa hay không (kiểm tra phần mở rộng)
int is_file_encrypted(const char *filepath)
{
    return (strstr(filepath, ".aes") != NULL);
}

// Đọc mật khẩu từ người dùng
void read_password(char *password, int max_len)
{
    printf("%sNhập mật khẩu (Password): %s", COLOR_YELLOW, COLOR_RESET);
    fgets(password, max_len, stdin);
    // Loại bỏ newline
    size_t len = strlen(password);
    if (len > 0 && password[len - 1] == '\n')
        password[len - 1] = '\0';
}

// Hàm padding khóa cho đủ 16 byte
void prepare_key(const char *password, unsigned char *key)
{
    memset(key, 0, AES_KEY_SIZE);
    strncpy((char *)key, password, AES_KEY_SIZE - 1);
}

// Hàm tính kích thước padding
size_t calculate_padded_size(size_t original_size)
{
    if (original_size % AES_BLOCK_SIZE == 0)
        return original_size;
    return ((original_size / AES_BLOCK_SIZE) + 1) * AES_BLOCK_SIZE;
}

// Xử lý file mã hóa/giải mã
int process_file(int is_encrypt, const char *password, const char *filepath)
{
    int fd_file, fd_driver;
    off_t file_size;
    size_t padded_size;
    unsigned char *buffer = NULL;
    struct aes_args args;
    struct stat file_stat;
    int ret = -1;

    // Kiểm tra file tồn tại
    if (stat(filepath, &file_stat) < 0)
    {
        printf("%s✗ Lỗi: Không thể mở file '%s'%s\n", COLOR_RED, filepath, COLOR_RESET);
        perror("  ");
        return -1;
    }

    file_size = file_stat.st_size;
    if (file_size == 0)
    {
        printf("%s✗ Lỗi: File trống.%s\n", COLOR_RED, COLOR_RESET);
        return -1;
    }

    // Mở file
    fd_file = open(filepath, O_RDWR);
    if (fd_file < 0)
    {
        printf("%s✗ Lỗi: Không thể mở file '%s'%s\n", COLOR_RED, filepath, COLOR_RESET);
        perror("  ");
        return -1;
    }

    // Mở driver device
    fd_driver = open(AES_DEVICE, O_RDWR);
    if (fd_driver < 0)
    {
        printf("%s✗ Lỗi: Không thể kết nối với AES Driver%s\n", COLOR_RED, COLOR_RESET);
        printf("   Vui lòng chắc chắn driver đã được load: insmod aes_driver.ko\n");
        perror("  ");
        close(fd_file);
        return -1;
    }

    // Cấp phát bộ nhớ
    padded_size = calculate_padded_size(file_size);
    buffer = calloc(1, padded_size);
    if (!buffer)
    {
        printf("%s✗ Lỗi: Không đủ bộ nhớ%s\n", COLOR_RED, COLOR_RESET);
        close(fd_driver);
        close(fd_file);
        return -1;
    }

    // Đọc file
    printf("%sĐang đọc file (%ld bytes)...%s\n", COLOR_YELLOW, file_size, COLOR_RESET);
    ssize_t bytes_read = read(fd_file, buffer, file_size);
    if (bytes_read < 0)
    {
        printf("%s✗ Lỗi: Không thể đọc file%s\n", COLOR_RED, COLOR_RESET);
        goto cleanup;
    }

    // Chuẩn bị tham số cho driver
    prepare_key(password, args.key);
    args.in_buf = buffer;
    args.out_buf = buffer;
    args.len = padded_size;
    args.is_encrypt = is_encrypt;

    // Gọi driver
    printf("%sGọi AES Driver để %s dữ liệu...%s\n",
           COLOR_YELLOW,
           is_encrypt ? "mã hóa" : "giải mã",
           COLOR_RESET);

    if (ioctl(fd_driver, AES_DO_CRYPT, &args) < 0)
    {
        printf("%s✗ Lỗi ioctl - Không thể %s file%s\n",
               COLOR_RED,
               is_encrypt ? "mã hóa" : "giải mã",
               COLOR_RESET);
        perror("  ");
        goto cleanup;
    }

    // Ghi file
    printf("%sGhi dữ liệu vào file...%s\n", COLOR_YELLOW, COLOR_RESET);
    lseek(fd_file, 0, SEEK_SET);
    ftruncate(fd_file, padded_size);
    ssize_t bytes_written = write(fd_file, buffer, padded_size);
    if (bytes_written < 0)
    {
        printf("%s✗ Lỗi: Không thể ghi file%s\n", COLOR_RED, COLOR_RESET);
        goto cleanup;
    }

    printf("%s✓ Thành công! File đã được %s.%s\n",
           COLOR_GREEN,
           is_encrypt ? "mã hóa" : "giải mã",
           COLOR_RESET);
    printf("  - Kích thước gốc: %ld bytes\n", file_size);
    printf("  - Kích thước sau xử lý: %zu bytes\n", padded_size);
    ret = 0;

cleanup:
    free(buffer);
    close(fd_driver);
    close(fd_file);
    return ret;
}

// Hiển thị danh sách file
void list_files(const char *directory)
{
    DIR *dir;
    struct dirent *entry;
    struct stat file_stat;
    char filepath[512];
    int count = 0;

    dir = opendir(directory);
    if (!dir)
    {
        printf("%s✗ Không thể mở thư mục '%s'%s\n", COLOR_RED, directory, COLOR_RESET);
        return;
    }

    print_header("DANH SÁCH FILE (FILE LIST)");
    printf("%s%-40s %12s %12s%s\n",
           COLOR_CYAN, "Tên File", "Kích thước", "Trạng thái", COLOR_RESET);
    printf("%-40s %12s %12s\n",
           "================================", "============", "============");

    while ((entry = readdir(dir)) != NULL)
    {
        if (entry->d_name[0] == '.')
            continue;

        snprintf(filepath, sizeof(filepath), "%s/%s", directory, entry->d_name);

        if (stat(filepath, &file_stat) == 0 && S_ISREG(file_stat.st_mode))
        {
            int is_encrypted = is_file_encrypted(entry->d_name);
            const char *status = is_encrypted ? "encrypted" : "normal";
            const char *color = is_encrypted ? COLOR_RED : COLOR_GREEN;

            printf("%-40s %10li B  %s%-12s%s\n",
                   entry->d_name,
                   file_stat.st_size,
                   color,
                   status,
                   COLOR_RESET);
            count++;
        }
    }

    printf("\nTổng cộng: %d file\n", count);
    closedir(dir);
}

// Hiển thị thông tin chi tiết file
void show_file_info(const char *filepath)
{
    struct stat file_stat;

    if (stat(filepath, &file_stat) < 0)
    {
        printf("%s✗ Không thể lấy thông tin file%s\n", COLOR_RED, COLOR_RESET);
        return;
    }

    print_header("THÔNG TIN FILE (FILE INFORMATION)");
    printf("%s%-30s:%s %s\n", COLOR_CYAN, "Tên file", COLOR_RESET, filepath);
    printf("%s%-30s:%s %ld bytes\n", COLOR_CYAN, "Kích thước", COLOR_RESET, file_stat.st_size);
    printf("%s%-30s:%s %o\n", COLOR_CYAN, "Quyền truy cập", COLOR_RESET, file_stat.st_mode & 0777);
    printf("%s%-30s:%s %s\n",
           COLOR_CYAN, "Trạng thái", COLOR_RESET,
           is_file_encrypted(filepath) ? "Đã mã hóa (Encrypted)" : "Chưa mã hóa (Decrypted)");
    printf("%s%-30s:%s %s\n", COLOR_CYAN, "Thời gian sửa đổi", COLOR_RESET,
           ctime(&file_stat.st_mtime));
}

// Xóa file
void delete_file(const char *filepath)
{
    char confirm[10];

    printf("%sChắc chắn xóa '%s'? (yes/no): %s", COLOR_YELLOW, filepath, COLOR_RESET);
    scanf("%9s", confirm);
    getchar();

    if (strcmp(confirm, "yes") == 0)
    {
        if (remove(filepath) == 0)
        {
            printf("%s✓ File đã được xóa.%s\n", COLOR_GREEN, COLOR_RESET);
        }
        else
        {
            printf("%s✗ Lỗi: Không thể xóa file%s\n", COLOR_RED, COLOR_RESET);
        }
    }
    else
    {
        printf("%sHủy bỏ.%s\n", COLOR_YELLOW, COLOR_RESET);
    }
}

// Hiển thị trợ giúp
void show_help()
{
    print_header("TRỢ GIÚP (HELP)");
    printf("%s1. Mã hóa File:%s\n", COLOR_YELLOW, COLOR_RESET);
    printf("   - Chọn tùy chọn 1 từ menu\n");
    printf("   - Nhập đường dẫn file cần mã hóa\n");
    printf("   - Nhập mật khẩu (16 ký tự tối đa)\n");
    printf("   - File sẽ được mã hóa bằng AES-128-CBC\n\n");

    printf("%s2. Giải mã File:%s\n", COLOR_YELLOW, COLOR_RESET);
    printf("   - Chọn tùy chọn 2 từ menu\n");
    printf("   - Nhập đường dẫn file đã mã hóa\n");
    printf("   - Nhập mật khẩu đúng để giải mã\n\n");

    printf("%s3. Danh sách File:%s\n", COLOR_YELLOW, COLOR_RESET);
    printf("   - Chọn tùy chọn 3 để xem danh sách file trong USB\n\n");

    printf("%sLưu ý:%s\n", COLOR_RED, COLOR_RESET);
    printf("   - Phải cài đặt driver trước: insmod aes_driver.ko\n");
    printf("   - Mật khẩu tối đa 16 ký tự\n");
    printf("   - Kích thước file phải chia hết cho 16 bytes\n");
    printf("   - Lưu lại mật khẩu an toàn!\n");
}

// Hàm chính
int main(int argc, char *argv[])
{
    int choice;
    char filepath[512];
    char password[32];
    char directory[512] = ".";

    // Xử lý tham số dòng lệnh
    if (argc > 1)
    {
        strncpy(directory, argv[1], sizeof(directory) - 1);
    }

    while (1)
    {
        print_menu();
        printf("%sChọn tùy chọn: %s", COLOR_YELLOW, COLOR_RESET);
        scanf("%d", &choice);
        getchar();

        switch (choice)
        {
        case 1: // Mã hóa
            print_header("MÃ HÓA FILE (ENCRYPT FILE)");
            printf("Nhập đường dẫn file: ");
            fgets(filepath, sizeof(filepath), stdin);
            filepath[strcspn(filepath, "\n")] = 0;
            read_password(password, sizeof(password));
            if (strlen(password) > 0)
            {
                process_file(1, password, filepath);
            }
            printf("\nNhấn Enter để tiếp tục...");
            getchar();
            break;

        case 2: // Giải mã
            print_header("GIẢI MÃ FILE (DECRYPT FILE)");
            printf("Nhập đường dẫn file: ");
            fgets(filepath, sizeof(filepath), stdin);
            filepath[strcspn(filepath, "\n")] = 0;
            read_password(password, sizeof(password));
            if (strlen(password) > 0)
            {
                process_file(0, password, filepath);
            }
            printf("\nNhấn Enter để tiếp tục...");
            getchar();
            break;

        case 3: // Danh sách file
            list_files(directory);
            printf("\nNhấn Enter để tiếp tục...");
            getchar();
            break;

        case 4: // Thông tin file
            print_header("THÔNG TIN FILE (FILE INFORMATION)");
            printf("Nhập đường dẫn file: ");
            fgets(filepath, sizeof(filepath), stdin);
            filepath[strcspn(filepath, "\n")] = 0;
            show_file_info(filepath);
            printf("\nNhấn Enter để tiếp tục...");
            getchar();
            break;

        case 5: // Xóa file
            print_header("XÓA FILE (DELETE FILE)");
            printf("Nhập đường dẫn file: ");
            fgets(filepath, sizeof(filepath), stdin);
            filepath[strcspn(filepath, "\n")] = 0;
            delete_file(filepath);
            printf("\nNhấn Enter để tiếp tục...");
            getchar();
            break;

        case 6: // Trợ giúp
            show_help();
            printf("\nNhấn Enter để tiếp tục...");
            getchar();
            break;

        case 0: // Thoát
            printf("%s\n╔════════════════════════════════════════════════════╗%s\n",
                   COLOR_BLUE, COLOR_RESET);
            printf("%s║%s   Cảm ơn đã sử dụng hệ thống quản lý file an toàn!  %s║%s\n",
                   COLOR_BLUE, COLOR_GREEN, COLOR_BLUE, COLOR_RESET);
            printf("%s╚════════════════════════════════════════════════════╝%s\n",
                   COLOR_BLUE, COLOR_RESET);
            exit(0);

        default:
            printf("%s✗ Tùy chọn không hợp lệ. Vui lòng thử lại.%s\n", COLOR_RED, COLOR_RESET);
            printf("Nhấn Enter để tiếp tục...");
            getchar();
        }
    }

    return 0;
}
