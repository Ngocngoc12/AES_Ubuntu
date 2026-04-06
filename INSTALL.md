# 📖 HƯỚNG DẪN CÀI ĐẶT VÀ SỬ DỤNG

## Mục lục
1. [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
2. [Cài đặt đơn giản](#cài-đặt-đơn-giản)
3. [Cài đặt chi tiết](#cài-đặt-chi-tiết)
4. [Kiểm tra cài đặt](#kiểm-tra-cài-đặt)
5. [Hướng dẫn sử dụng](#hướng-dẫn-sử-dụng)
6. [Khắc phục sự cố](#khắc-phục-sự-cố)

---

## Yêu cầu hệ thống

### Hệ điều hành
- Ubuntu 20.04 LTS hoặc mới hơn (khuyên dùng)
- Fedora, CentOS hoặc các distro Linux khác cũng tương thích
- **64-bit** (bắt buộc)

### Phần mềm cần thiết
```bash
# Kiểm tra kernel
uname -r
# Phải là Linux 5.4 trở lên

# Kiểm tra GCC
gcc --version
# Phải có GCC 4.8 trở lên
```

### Cài đặt yêu cầu (Ubuntu)

```bash
# Cập nhật package list
sudo apt-get update

# Cài đặt build tools
sudo apt-get install -y build-essential

# Cài đặt kernel headers
sudo apt-get install -y linux-headers-$(uname -r)

# Cài đặt git (nếu clone từ GitHub)
sudo apt-get install -y git
```

### Cài đặt cho Fedora/RHEL

```bash
sudo dnf groupinstall "Development Tools"
sudo dnf install kernel-devel
```

---

## Cài đặt đơn giản (Khuyên dùng)

### Bước 1: Chuẩn bị

```bash
# Clone hoặc tải dự án
cd ~/
mkdir projects
cd projects
git clone https://github.com/your-repo/AES_Ubuntu.git
# Hoặc: unzip AES_Ubuntu.zip

cd AES_Ubuntu
```

### Bước 2: Chạy script setup tự động

```bash
# Phải dùng sudo
sudo bash setup.sh
```

**Script sẽ:**
- ✅ Kiểm tra các yêu cầu
- ✅ Build kernel driver + user apps
- ✅ Load driver vào kernel
- ✅ Tạo device node `/dev/aes_engine`
- ✅ Cài đặt symbolic links

### Bước 3: Kiểm tra cài đặt

```bash
# Kiểm tra device
ls -la /dev/aes_engine

# Kiểm tra driver loaded
lsmod | grep aes_driver
```

### Bước 4: Chạy ứng dụng

```bash
# File Manager
/opt/aes_secure/file_manager

# USB Manager (với mount point)
/opt/aes_secure/usb_manager /mnt/usb
```

---

## Cài đặt chi tiết

### Bước 1: Kiểm tra yêu cầu

```bash
# Check kernel headers
ls /lib/modules/$(uname -r)/build

# Check GCC
gcc -v
make -v
```

### Bước 2: Build dự án

```bash
cd AES_Ubuntu

# Build toàn bộ
make all

# Hoặc build riêng từng phần
make clean           # Xóa build files cũ
make driver          # Build kernel driver
make userspace       # Build user apps
```

Kết quả:
```
build/
├── bin/
│   ├── aes_driver.ko           # Kernel module
│   ├── file_manager            # File manager app
│   └── usb_manager             # USB manager app
└── driver/
    └── (intermediate files)
```

### Bước 3: Cài đặt driver

```bash
# Option 1: Cài đặt vĩnh viễn (for autoload)
sudo make install-driver

# Option 2: Load tạm thời (chỉ phiên này)
sudo insmod build/bin/aes_driver.ko

# Kiểm tra
dmesg | tail -5
ls -la /dev/aes_engine
```

### Bước 4: Cài đặt ứng dụng

```bash
# Option 1: Cài đặt đầy đủ
sudo make install

# Option 2: Sử dụng trực tiếp từ build dir
./build/bin/file_manager
./build/bin/usb_manager /mnt/usb

# Option 3: Tạo symlink để gọi từ bất kỳ đâu
sudo ln -s $(pwd)/build/bin/file_manager /usr/local/bin/aes-fm
sudo ln -s $(pwd)/build/bin/usb_manager /usr/local/bin/aes-um
```

---

## Kiểm tra cài đặt

### Kiểm tra Driver

```bash
# 1. Kiểm tra device tồn tại
ls -la /dev/aes_engine

# Output mong đợi:
# crw-rw-rw- 1 root root 248, 0 Mar 25 10:30 /dev/aes_engine

# 2. Kiểm tra driver loaded
lsmod | grep aes_driver

# Output mong đợi:
# aes_driver             12345  0

# 3. Xem kernel logs
dmesg | grep -i aes

# Output mong đợi:
# [...] ==> AES Encryption Driver Initializing <==
# [...] Version: 1.0
# [...] Device /dev/aes_engine created successfully
```

### Kiểm tra Ứng dụng

```bash
# Kiểm tra file_manager
file build/bin/file_manager
# Output: ELF 64-bit LSB executable

# Kiểm tra usb_manager
file build/bin/usb_manager
# Output: ELF 64-bit LSB executable

# Kiểm tra dependencies
ldd build/bin/file_manager
# Phải có libc và libm
```

### Test đơn giản

```bash
# Tạo file test
echo "Hello World" > test.txt

# Mã hóa file
./build/bin/file_manager

# Menu: Chọn 1 → Encrypt
# Nhập: test.txt
# Nhập password: test12345

# Kiểm tra file được mã hóa
file test.txt
hexdump -C test.txt | head

# Giải mã file
# Menu: Chọn 2 → Decrypt
# Kiểm tra kết quả
cat test.txt
```

---

## Hướng dẫn sử dụng

### File Manager

```bash
./build/bin/file_manager [directory]
```

**Menu chính:**

```
╔════════════════════════════════════════════════════╗
║   QUẢN LÝ FILE AN TOÀN VỚI MÃ HÓA AES             ║
╚════════════════════════════════════════════════════╝

1. Mã hóa File (Encrypt File)
2. Giải mã File (Decrypt File)  
3. Danh sách File (List Files)
4. Thông tin File (File Info)
5. Xóa File (Delete File)
6. Trợ giúp (Help)
0. Thoát (Exit)

Chọn tùy chọn:
```

#### Hiển thị danh sách file

```
Danh sách file:
├── document.txt          1.2KB    normal
├── photo.jpg            256KB    encrypted
└── archive.zip          5.6MB    normal
```

#### Mã hóa file

```
Chọn: 1
Nhập đường dẫn file: /path/to/document.txt
Nhập mật khẩu (Password): MySecurePassword1

Đang đọc file (1234 bytes)...
Gọi AES Driver để mã hóa dữ liệu...
✓ Thành công! File đã được mã hóa.
  - Kích thước gốc: 1234 bytes
  - Kích thước sau xử lý: 1248 bytes
```

#### Giải mã file

```
Chọn: 2
Nhập đường dẫn file: /path/to/document.txt
Nhập mật khẩu (Password): MySecurePassword1

Đang đọc file...
Gọi AES Driver để giải mã dữ liệu...
✓ Thành công! File đã được giải mã.
```

#### Xem thông tin chi tiết file

```
Chọn: 4
Nhập đường dẫn file: /path/to/document.txt

═══ THÔNG TIN FILE (FILE INFORMATION) ═══
Tên file:                  /path/to/document.txt
Kích thước:                1248 bytes
Quyền truy cập:             644
Trạng thái:                 Đã mã hóa (Encrypted)
Thời gian sửa đổi:         Wed Mar 25 10:30:45 2026
```

### USB Manager

```bash
# Gắn USB trước
sudo mount /dev/sdb1 /mnt/usb

# Chạy USB Manager
./build/bin/usb_manager /mnt/usb
```

**Menu chính:**

```
╔════════════════════════════════════════════════════╗
║   QUẢN LÝ USB AN TOÀN VỚI MÃ HÓA AES              ║
╚════════════════════════════════════════════════════╝

1. Hiển thị thông tin USB (USB Info)
2. Liệt kê file trên USB (List Files)
3. Mã hóa file trên USB (Encrypt File)
4. Giải mã file trên USB (Decrypt File)
5. Tương tác với File Manager (Open Manager)
0. Thoát (Exit)
```

---

## Khắc phục sự cố

### Vấn đề 1: "Cannot find /dev/aes_engine"

**Nguyên nhân:**
- Driver chưa load
- Device node không được tạo

**Giải pháp:**

```bash
# Kiểm tra driver đã load chưa
lsmod | grep aes_driver

# Nếu không thấy, load driver
sudo insmod /opt/aes_secure/aes_driver.ko
# hoặc
sudo insmod build/bin/aes_driver.ko

# Kiểm tra kernel logs
dmesg | tail -20

# Tạo device node nếu không tồn tại
sudo mknod /dev/aes_engine c 248 0
sudo chmod 666 /dev/aes_engine
```

### Vấn đề 2: "Permission denied when opening /dev/aes_engine"

**Giải pháp 1: Chạy với sudo**

```bash
sudo ./build/bin/file_manager
sudo ./build/bin/usb_manager /mnt/usb
```

**Giải pháp 2: Thay đổi quyền device**

```bash
sudo chmod 666 /dev/aes_engine
sudo chmod 777 /dev/aes_engine  # Nếu 666 không đủ
```

**Giải pháp 3: Thêm user vào group**

```bash
# Tạo group
sudo groupadd aes_users

# Thêm user hiện tại vào group
sudo usermod -aG aes_users $USER

# Set device permissions
sudo chown root:aes_users /dev/aes_engine
sudo chmod 660 /dev/aes_engine

# Reload group (đăng xuất/đăng nhập hoặc)
newgrp aes_users
```

### Vấn đề 3: Build lỗi - "Kernel headers not found"

**Giải pháp:**

```bash
# Ubuntu/Debian
sudo apt-get install linux-headers-$(uname -r)

# Fedora
sudo dnf install kernel-devel

# Kiểm tra kernel headers
ls /lib/modules/$(uname -r)/build
ls /usr/src/linux-headers-$(uname -r)
```

### Vấn đề 4: Build lỗi - "gcc: command not found"

**Giải pháp:**

```bash
# Ubuntu/Debian
sudo apt-get install build-essential

# Fedora
sudo dnf groupinstall "Development Tools"

# Kiểm tra
gcc --version
make --version
```

### Vấn đề 5: File không giải mã được (mật khẩu sai)

**Triệu chứng:**
- Lỗi khi giải mã
- File đầu ra rác

**Giải pháp:**
1. Chắc chắn mật khẩu chính xác
2. Thử mã hóa file mới với cùng mật khẩu
3. Kiểm tra file gốc có còn không

### Vấn đề 6: USB không được gắn

**Giải pháp:**

```bash
# Liệt kê thiết bị
lsblk
# hoặc
sudo fdisk -l

# Gắn USB (thay sdb1 bằng device của bạn)
sudo mkdir -p /mnt/usb
sudo mount /dev/sdb1 /mnt/usb

# Kiểm tra
mount | grep /mnt/usb

# Chạy USB Manager
./build/bin/usb_manager /mnt/usb
```

### Vấn đề 7: File bị hỏng sau mã hóa

**Giải pháp:**

```bash
# 1. Kiểm tra file size
ls -la filename

# 2. File size phải chia hết cho 16
# Nếu không: error

# 3. Kiểm tra quyền truy cập
ls -la filename
# phải có rw

# 4. Kiểm tra dung lượng đĩa
df -h

# 5. Nếu vẫn lỗi, khôi phục từ backup
cp filename.backup filename
```

### Vấn đề 8: Ứng dụng bị freeze khi xử lý file lớn

**Giải pháp:**

```bash
# Đó là bình thường với file rất lớn (>100MB)
# Hãy chờ, đừng hủy bỏ

# Nếu thực sự bị stuck (>5 phút cho file 100MB):
# 1. Mở terminal khác
# 2. Kill process
ps aux | grep file_manager
kill -9 <PID>

# 3. Kiểm tra file
ls -la
# File có thể bị hỏng, khôi phục từ backup
```

---

## Gỡ cài đặt

### Xóa hoàn toàn

```bash
# Nếu cài bằng setup.sh
cd AES_Ubuntu
sudo bash setup.sh uninstall

# Hoặc thủ công
sudo make uninstall
sudo rmmod aes_driver
```

### Xóa driver nhưng giữ ứng dụng

```bash
sudo make remove-driver
```

---

## Mẹo & Thủ thuật

### Mã hóa nhiều file cùng lúc

```bash
#!/bin/bash
# Tạo file: encrypt_all.sh

PASSWORD="MySecurePassword1"
for file in /path/to/files/*; do
    echo "Encrypting: $file"
    ./build/bin/file_manager << EOF
1
$file
$PASSWORD
0
EOF
done
```

### Tạo alias để gọi nhanh

```bash
# Thêm vào ~/.bashrc hoặc ~/.zshrc
alias aes-fm='/opt/aes_secure/file_manager'
alias aes-um='/opt/aes_secure/usb_manager /mnt/usb'

# Reload shell
source ~/.bashrc
```

### Kiểm tra file được mã hóa hay chưa

```bash
# Bằng hexdump (file được mã hóa sẽ không hiển thị text)
hexdump -C filename | head

# Bằng file command (cố gắng đoán kiểu)
file filename

# Bằng ứng dụng (xem thông tin file)
./build/bin/file_manager
# Menu: 4 - File Info
```

---

## Liên hệ hỗ trợ

- 📧 Email: support@aesmanager.com
- 🐛 Bug reports: https://github.com/issues
- 📚 Documentation: https://docs.aesmanager.com

---

**Cảm ơn đã sử dụng AES Secure File Management System!**
