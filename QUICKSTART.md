# 🚀 QUICKSTART - Bắt đầu nhanh

## ⏱️ 5 Phút để Khởi chạy

### Bước 1: Chuẩn bị (1 phút)

```bash
# Cài đặt dependencies
sudo apt-get update
sudo apt-get install -y build-essential linux-headers-$(uname -r)

# Clone/Extract dự án
cd ~/
git clone https://github.com/your-repo/AES_Ubuntu.git
cd AES_Ubuntu
```

### Bước 2: Build & Cài đặt (3 phút)

```bash
# One-command setup
sudo bash setup.sh
```

**Đợi cho đến khi thấy:** `[✓] Installation complete!`

### Bước 3: Chạy ứng dụng (1 phút)

```bash
# File Manager
/opt/aes_secure/file_manager

# Hoặc USB Manager
/opt/aes_secure/usb_manager /mnt/usb
```

---

## ✨ Các Tính Năng

### ǥĭĭĭ1: Mã hóa File

```
Menu: 1 (Mã hóa File)
Nhập: /path/to/file.txt
Nhập password: MySecurePassword1
Chọn: Enter

Result: File được mã hóa ✓
```

### 2️⃣ Giải mã File

```
Menu: 2 (Giải mã File)
Nhập: /path/to/file.txt (file đã mã hóa)
Nhập password: MySecurePassword1 (chính xác)
Chọn: Enter

Result: File được khôi phục ✓
```

### 3️⃣ Xem File

```
Menu: 3 (Danh sách File)
→ Hiển thị tất cả file trong thư mục
→ Xem trạng thái (encrypted/normal)
→ Xem kích thước file
```

### 4️⃣ Bảo vệ USB

```
Mount USB: sudo mount /dev/sdX1 /mnt/usb

Chạy: /opt/aes_secure/usb_manager /mnt/usb

Menu: 3 hoặc 4 → Mã hóa/Giải mã file trên USB
```

---

## 🎯 Ví dụ Thực Tế

### Ví dụ 1: Bảo vệ tài liệu nhạy cảm

```bash
# 1. Tệp cần bảo vệ
/home/user/documents/secret.pdf

# 2. Mã hóa
./build/bin/file_manager

# Chọn 1, nhập /home/user/documents/secret.pdf
# nhập password: CompanySecret123

# 3. File bây giờ an toàn! 
# Nếu ai đó thấy file, họ không thể mở được
```

### Ví dụ 2: Chia sẻ file an toàn

```bash
# 1. Mã hóa file
# your_file.txt → encrypted

# 2. Gửi file cho người khác
# email, usb, cloud, etc.

# 3. Người nhận:
./build/bin/file_manager
# Chọn 2 (decrypt)
# Nhập password bạn cung cấp
# Lấy file gốc
```

### Ví dụ 3: Backup an toàn trên USB

```bash
# 1. Cắm USB
# Gắn: sudo mount /dev/sdb1 /mnt/usb
# Sao chép file quan trọng vào /mnt/usb

# 2. Mã hóa trên USB
/opt/aes_secure/usb_manager /mnt/usb
# Menu: 3 hoặc 4 → crypt files

# 3. USB backup bây giờ được bảo vệ
# Nếu mất USB, dữ liệu vẫn an toàn
```

---

## ⚠️ Điều Quan Trọng

### 🔒 Mật khẩu
- ✅ Nhớ mật khẩu!
- ✅ Sử dụng mật khẩu mạnh (16+ ký tự)
- ❌ Đừng quên, sẽ không khôi phục được

### 📦 Backup
- ✅ Luôn backup file quan trọng
- ✅ Lưu password ở nơi an toàn
- ✅ Test giải mã trước khi xóa gốc

### 🔐 Bảo mật
- ✅ Chạy với sudo nếu cần
- ✅ Kiểm tra quyền device: `ls -la /dev/aes_engine`
- ✅ Không chia sẻ password

---

## 🆘 Vấn đề Phổ Biến

### ❌ "Device not found"

```bash
# Giải pháp:
sudo insmod /opt/aes_secure/aes_driver.ko
ls -la /dev/aes_engine
```

### ❌ "Permission denied"

```bash
# Giải pháp:
sudo /opt/aes_secure/file_manager
# Hoặc:
sudo chmod 666 /dev/aes_engine
```

### ❌ "File không giải mã được"

```bash
# Nguyên nhân: Mật khẩu sai
# Giải pháp: Nhập mật khẩu đúng
```

---

## 📚 Tài Liệu Đầy Đủ

- **README.md** - Full documentation (Vietnamese)
- **INSTALL.md** - Detailed installation & troubleshooting
- **PROJECT_STRUCTURE.md** - Architecture & file listing
- **Help** - Trong ứng dụng (Menu: 6)

---

## 🎓 Học Tập Thêm

### Hiểu cách hoạt động

1. **Crypto basics:**
   - AES là thuật toán mã hóa chuẩn
   - AES-128 = 128-bit key (rất mạnh)
   - CBC mode = chaining mode (an toàn)

2. **Linux Driver:**
   - Kernel module (aes_driver.ko)
   - Device node (/dev/aes_engine)
   - IOCTL commands (giao tiếp user-kernel)

3. **Padding:**
   - File size phải chia hết cho 16
   - PKCS7 padding tự động thêm bytes

### Xem Source Code

```bash
# Xem kernel driver
cat aes_driver.c

# Xem file manager
cat file_manager.c

# Xem utilities
cat aes_utils.c

# Xem header (API definitions)
cat aes_crypto.h
cat aes_utils.h
```

---

## 🔧 Advanced Usage

### Command Line Usage (Không dùng menu)

```bash
# Sử dụng trực tiếp với hardcode
# (Tùy chỉnh code hoặc tạo script)
```

### Batch Encryption

```bash
# Mã hóa tất cả file .pdf
for file in *.pdf; do
    # Gọi file_manager với parameters
done
```

### Integration

```bash
# Tích hợp vào script khác
/opt/aes_secure/file_manager --encrypt file.txt --password "pass"
```

---

## 📞 Cần Giúp Đỡ?

### Kiểm tra Status

```bash
# Xem driver loaded
lsmod | grep aes

# Xem device
ls -la /dev/aes_engine

# Xem kernel logs
dmesg | tail -20
```

### Test System

```bash
# Chạy test tự động
sudo bash test.sh

# Kết quả: All tests passed! ✓
```

### Tìm Giúp Đỡ

- 📖 Xem INSTALL.md (troubleshooting section)
- 🐛 Báo cáo lỗi trên GitHub Issues
- 📧 Email support: dev@aesmanager.com

---

## 🎉 Bạn Đã Sẵn Sàng!

Chúc mừng! Giờ bạn có thể:
- ✅ Mã hóa file quan trọng
- ✅ Giải mã file an toàn
- ✅ Quản lý USB được bảo vệ
- ✅ Chia sẻ file an toàn

**Hãy bắt đầu bảo vệ file của bạn ngay!** 🔒

```bash
/opt/aes_secure/file_manager
```

---

**Happy Encrypting! 🚀**
