# 🔒 AES Secure File Management System

## 📋 Mô tả dự án

Hệ thống quản lý file an toàn với mã hóa AES được cài đặt trong kernel driver Linux. Dự án cung cấp giao diện thân thiện cho phép người dùng mã hóa/giải mã file trên USB và các thiết bị lưu trữ khác.

### Các tính năng chính:

- ✅ **Mã hóa AES-128-CBC** được triển khai trong kernel space (driver)
- ✅ **Giao diện dòng lệnh** thân thiện với menu interative
- ✅ **Quản lý file** - liệt kê, xem chi tiết, xóa file
- ✅ **Hỗ trợ USB** - quản lý riêng cho thiết bị USB
- ✅ **Xác thực mật khẩu** - bảo vệ file bằng mật khẩu 16 ký tự
- ✅ **Hỗ trợ Ubuntu 64-bit** - tương thích với kernel 5.x+
- ✅ **Xây dựng dễ dàng** - Makefile tự động hóa quá trình biên dịch

---

## 🏗️ Cấu trúc dự án

```
AES_Ubuntu/
├── aes_driver.c           # Kernel driver (mã hóa AES)
├── file_manager.c         # Ứng dụng quản lý file GUI
├── usb_manager.c          # Ứng dụng quản lý USB riêng
├── aes_crypto.h           # Header file chia sẻ
├── Makefile               # Build system
├── Kbuild                 # Kernel build config
├── setup.sh               # Script cài đặt tự động
├── README.md              # Tài liệu này
└── build/                 # Thư mục output (được tạo sau khi build)
    └── bin/
        ├── aes_driver.ko
        ├── file_manager
        └── usb_manager
```

---

## 📦 Yêu cầu hệ thống

### Phần cứng:
- Ubuntu 64-bit (20.04 LTS trở lên khuyến nghị)
- CPU: 2GHz hoặc tương đương
- RAM: 512MB tối thiểu, 2GB khuyến nghị
- USB drive: Tùy chọn (để test)

### Phần mềm:
- Linux kernel 5.4+
- GCC compiler
- Make
- Linux kernel headers
- Build essentials

### Cài đặt yêu cầu:

```bash
# Ubuntu / Debian
sudo apt-get update
sudo apt-get install -y build-essential linux-headers-$(uname -r) git

# Fedora / RHEL
sudo dnf groupinstall "Development Tools"
sudo dnf install kernel-devel
```

---

## 🚀 Cài đặt & Sử dụng

### Cách 1: Cài đặt tự động (Khuyên dùng)

```bash
# Clone hoặc tải dự án
cd AES_Ubuntu

# Chạy script setup
sudo bash setup.sh

# Khởi động ứng dụng
/opt/aes_secure/file_manager
# hoặc
/opt/aes_secure/usb_manager /mnt/usb
```

### Cách 2: Cài đặt thủ công

```bash
cd AES_Ubuntu

# 1. Build tất cả
make all

# 2. Load kernel driver
sudo insmod build/bin/aes_driver.ko

# 3. Verify device
ls -la /dev/aes_engine

# 4. Chạy ứng dụng
./build/bin/file_manager
# hoặc
./build/bin/usb_manager /mnt/usb
```

### Cách 3: Build từng thành phần

```bash
# Build kernel driver
make driver

# Build user-space apps
make userspace

# Clean build files
make clean
```

---

## 💻 Sử dụng ứng dụng

### File Manager

```bash
./build/bin/file_manager [directory]
```

**Menu chính:**
```
1. Mã hóa File (Encrypt File)
2. Giải mã File (Decrypt File)
3. Danh sách File (List Files)
4. Thông tin File (File Info)
5. Xóa File (Delete File)
6. Trợ giúp (Help)
0. Thoát (Exit)
```

**Ví dụ:**
```
- Mã hóa file: file.txt → nhập mật khẩu → file.txt được mã hóa
- Giải mã file: nhập mật khẩu chính xác → file.txt được khôi phục
```

### USB Manager

```bash
./build/bin/usb_manager /mnt/usb
```

**Menu chính:**
```
1. Hiển thị thông tin USB (USB Info)
2. Liệt kê file trên USB (List Files)
3. Mã hóa file trên USB (Encrypt File)
4. Giải mã file trên USB (Decrypt File)
5. Tương tác với File Manager (Open Manager)
0. Thoát (Exit)
```

---

## 🔧 Kiến trúc kỹ thuật

### Kernel Driver (aes_driver.c)

**Thành phần chính:**

```c
// IOCTL command
#define AES_DO_CRYPT _IOWR(AES_IOCTL_MAGIC, 1, struct aes_args)

// Cấu trúc giao tiếp User-Kernel
struct aes_args {
    unsigned char key[16];      // AES key (128-bit)
    unsigned char *in_buf;      // Input buffer
    unsigned char *out_buf;     // Output buffer
    size_t len;                 // Data length (multiple of 16)
    int is_encrypt;             // 1: encrypt, 0: decrypt
};
```

**Quá trình xử lý:**

1. User app gửi yêu cầu qua IOCTL
2. Driver kiểm tra tham số
3. Copy data từ user-space vào kernel-space
4. Sử dụng Linux crypto API (skcipher) xử lý AES
5. Copy kết quả trở lại user-space

**Algorithm:** AES-128-CBC (Cipher Block Chaining)
- Key size: 128-bit (16 bytes)
- Block size: 128-bit (16 bytes)
- IV (Initialization Vector): All zeros (0x00...)

### User-Space Applications

#### File Manager (file_manager.c)

Chức năng chính:
- Quản lý file trên bất kỳ đường dẫn nào
- Mã hóa/giải mã file
- Xem danh sách file với trạng thái
- Xem thông tin chi tiết file

#### USB Manager (usb_manager.c)

Chức năng chính:
- Kiểm tra USB được gắn
- Liệt kê file trên USB
- Mã hóa/giải mã file trên USB riêng biệt
- Tích hợp với File Manager

---

## 🔐 Bảo mật

### Điểm mạnh:

- ✅ **Mã hóa trong Kernel** - Tốc độ cao, bảo vệ tốt
- ✅ **Chuẩn AES-128** - Tiêu chuẩn quốc tế
- ✅ **Memory Protection** - Kernel quản lý bộ nhớ an toàn
- ✅ **Input Validation** - Kiểm tra mọi tham số từ user

### Hạn chế hiện tại (Version 1.0):

- ⚠️ IV cố định (tất cả 0) - Nên sử dụng IV ngẫu nhiên ở phiên bản cao hơn
- ⚠️ Không có chức năng xác thực (Authentication)
- ⚠️ Mật khẩu được padding với 0 - Nên dùng key derivation function (KDF)

### Khuyến nghị:

```
1. Sử dụng mật khẩu mạnh (16 ký tự + chữ hoa, số, ký tự đặc biệt)
2. Lưu trữ mật khẩu an toàn
3. Không chia sẻ file được mã hóa mà không có mật khẩu
4. Backup mật khẩu một cách an toàn
```

---

## 🐛 Khắc phục sự cố

### Lỗi: "Cannot find /dev/aes_engine"

**Giải pháp:**
```bash
# Kiểm tra driver đã load
lsmod | grep aes_driver

# Nếu không, load driver
sudo insmod build/bin/aes_driver.ko

# Kiểm tra device
ls -la /dev/aes_engine
```

### Lỗi: "Permission denied"

**Giải pháp:**
```bash
# Cập nhật quyền device
sudo chmod 666 /dev/aes_engine

# Hoặc chạy ứng dụng với sudo
sudo ./build/bin/file_manager
```

### Lỗi: "Kernel driver build failed"

**Giải pháp:**
```bash
# Cài đặt kernel headers
sudo apt-get install linux-headers-$(uname -r)

# Clean and rebuild
make clean
make driver
```

### Lỗi: "File not decrypted properly"

**Gây ra bởi:**
- Mật khẩu sai
- File bị hỏng
- Không đủ không gian đĩa

**Giải pháp:**
1. Kiểm tra mật khẩu
2. Thử với backup file nếu có
3. Kiểm tra dung lượng đĩa

---

## 📊 Ví dụ sử dụng

### Ví dụ 1: Mã hóa file quan trọng

```bash
# Khởi chạy File Manager
./build/bin/file_manager

# Menu:
# 1. Mã hóa File
# Nhập đường dẫn: /path/to/document.txt
# Nhập mật khẩu: MySecurePassword1
# ✓ Thành công!
```

### Ví dụ 2: Quản lý USB device

```bash
# Cắm USB và gắn vào /mnt/usb
# Khởi chạy USB Manager
./build/bin/usb_manager /mnt/usb

# Menu:
# 2. Liệt kê file trên USB
# 3. Mã hóa file trên USB → chọn file → nhập mật khẩu
```

### Ví dụ 3: Batch encryption (command line)

```bash
# Tạo script bash cho batch mã hóa
for file in /path/to/files/*; do
    echo "SecurePass1" | /opt/aes_secure/file_manager
done
```

---

## 🔄 Developing & Contributing

### Build with Debug Info:

```bash
# Rebuild with verbose output
make clean
VERBOSE=1 make all
```

### View Kernel Logs:

```bash
# Real-time kernel logs
tail -f /var/log/kern.log

# or
dmesg -w
```

### Test Driver Directly:

```bash
# Load driver with debug output
sudo insmod build/bin/aes_driver.ko
dmesg | tail -20

# Test encrypt/decrypt
./build/bin/file_manager
```

---

## 📝 Ghi chú phiên bản

### Version 1.0

- ✅ Kernel driver AES-128-CBC
- ✅ File Manager GUI interative
- ✅ USB Manager
- ✅ Build system Makefile
- ✅ Setup script tự động
- ✅ Documentation đầy đủ

### Dự định phiên bản tương lai:

- [ ] Random IV generation
- [ ] HMAC authentication
- [ ] Key derivation (PBKDF2)
- [ ] File compression trước mã hóa
- [ ] Backup & recovery
- [ ] Qt GUI interface
- [ ] Multi-threaded processing
- [ ] Progress bar for large files

---

## 📄 Giấy phép

GPL v2 License - Tự do sử dụng, sửa đổi và phân phối

---

## 👥 Tác giả

**Security Team**
- Phát triển kernel driver AES
- Tạo user-space applications
- Testing & documentation

---

## 📞 Liên hệ & Hỗ trợ

### Lỗi & Báo cáo:

Vui lòng báo cáo mọi vấn đề tại:
- GitHub Issues
- Email: dev@example.com

### Tài liệu thêm:

- [Linux Kernel Crypto API](https://www.kernel.org/doc/html/latest/crypto/)
- [Ubuntu Kernel Building](https://wiki.ubuntu.com/KernelBuildingHowto)
- [AES Encryption Standard](https://csrc.nist.gov/publications/aes)

---

## ⚠️ Tuyên bố miễn trừ

Phần mềm này được cung cấp "như là" mà không có bất kỳ bảo hành nào. Tác giả không chịu trách nhiệm cho bất kỳ thiệt hại nào phát sinh từ việc sử dụng phần mềm này.

---

**Cảm ơn đã sử dụng AES Secure File Management System!**

🔐 *Keep Your Files Secure* 🔐
