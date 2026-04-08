# 🔒 AES File Encryption 

**Tải lên & mã hóa file với giao diện web**

Hệ thống mã hóa file AES-128-CBC với giao diện web hiện đại + kernel driver Linux cho xử lý mã hóa nhanh chóng và bảo mật.

---

## ⚡ Quick Start (2 phút)

```bash
cd AES_Ubuntu/web
npm install
npm start
```

Mở browser: **http://localhost:3000** ✨

---

## 🌐 Web Interface - 3 Tính năng chính

### 1️⃣ **Mã hóa File (Encrypt)**

```
┌─────────────────────────────────┐
│  AES File Encryption Manager    │
│                                 │
│  [Mã hóa]  [Giải mã]  [Thông tin]│
│                                 │
│  📁 Kéo thả file hoặc click     │
│                                 │
│  🔐 Mật khẩu: [________]        │
│                                 │
│         [Mã hóa File]           │
│                                 │
│  ✓ Tải: document.txt.aes       │
└─────────────────────────────────┘
```

**Bước sử dụng:**
1. Click tab "Mã hóa"
2. Kéo thả file hoặc click "Chọn File"
3. Nhập mật khẩu (8-20 ký tự)
4. Click "Mã hóa File"
5. Tải file `.aes` được mã hóa

---

### 2️⃣ **Giải mã File (Decrypt)**

```
┌─────────────────────────────────┐
│  AES File Encryption Manager    │
│                                 │
│  [Mã hóa]  [Giải mã]  [Thông tin]│
│                                 │
│  📁 Kéo thả file .aes hoặc click│
│                                 │
│  🔓 Mật khẩu: [________]        │
│                                 │
│        [Giải mã File]           │
│                                 │
│  ✓ Tải: document.txt            │
└─────────────────────────────────┘
```

**Bước sử dụng:**
1. Click tab "Giải mã"
2. Chọn file `.aes` cần giải mã
3. Nhập mật khẩu (cùng mật khẩu lúc mã hóa)
4. Click "Giải mã File"
5. Tải file gốc được khôi phục

---

### 3️⃣ **Thông tin & Thống kê (Info)**

```
┌─────────────────────────────────┐
│  AES File Encryption Manager    │
│                                 │
│  [Mã hóa]  [Giải mã] [Thông tin]│
│                                 │
│  📊 Thống kê sử dụng:           │
│                                 │
│  • Tổng file xử lý: 45          │
│  • File mã hóa: 28             │
│  • File giải mã: 17            │
│  • Dữ liệu xử lý: 1.2 GB       │
│  • Thời gian trung bình: 250ms │
│                                │
│  🔐 Algorithm: AES-128-CBC     │
│  ✓ Status: Running             │
└─────────────────────────────────┘
```

**Hiển thị:**
- Thống kê file đã xử lý
- Algorithm sử dụng
- Tổng dữ liệu đã mã hóa
- Performance metrics

---

## 🚀 Các bước cài đặt

### 📋 Yêu cầu

- **Node.js** 14+ (cần cài npm)
- **Hoặc:** Ubuntu 20.04+ (cho driver)

### ⚙️ Cài đặt

```bash
# 1. Vào thư mục web
cd AES_Ubuntu/web

# 2. Cài dependencies
npm install

# 3. Chạy server
npm start
```

**Kết quả:**
```
Server is running on http://localhost:3000
Open your browser to http://localhost:3000
```

---

## 🔧 Cấu trúc dự án

```
AES_Ubuntu/
│
├─ 🌐 WEB INTERFACE (CHÍNH)
│  ├── index.html              ← Giao diện web
│  ├── app.js                  ← Frontend logic
│  ├── server.js               ← Backend Node.js
│  ├── package.json            ← Dependencies
│  ├── style.css               ← CSS styling
│  ├── uploads/                ← Thư mục file xử lý
│  └── README.md               ← Web docs
│
├─ 🔧 KERNEL DRIVER (Xử lý)
│  ├── aes_driver.c            ← Core encryption (kernel)
│  ├── aes_crypto.h            ← Shared structures
│  └── Kbuild                  ← Kernel build config
│
├─ 📱 CLI APPLICATIONS (Tùy chọn)
│  ├── file_manager.c          ← CLI app
│  ├── aes_utils.c             ← Helper functions
│  └── aes_utils.h
│
├─ 🛠️ BUILD SYSTEM
│  ├── Makefile                ← Build configuration
│  ├── setup.sh                ← Setup script
│  └── test.sh                 ← Test script
│
└─ 📚 DOCUMENTATION
   ├── README.md               ← This file
   ├── INSTALL.md              ← Detailed setup
   ├── QUICKSTART.md           ← Quick reference
   └── ...
```

---

## 🔐 Tính năng Bảo mật

### Mã hóa mạnh:

✅ **AES-128-CBC** - Chuẩn NIST FIPS 197 (quân đội)  
✅ **Kernel-space processing** - Xử lý nhanh & bảo mật  
✅ **PKCS7 Padding** - Chuẩn tính tiêu chuẩn  
✅ **Input Validation** - Kiểm tra mọi input  

### Khuyến nghị sử dụng:

```
✅ Mật khẩu mạnh: 16+ ký tự (hoa + thường + số)
✅ Backup file gốc trước mã hóa
✅ Lưu mật khẩu ở nơi an toàn
✅ Xóa file gốc sau khi mã hóa thành công (rm -P)
```

---

## 🎯 Ví dụ sử dụng

### Mã hóa một file Word

```
1. Mở http://localhost:3000
2. Tab "Mã hóa" → Kéo documen.docx vào
3. Nhập mật khẩu: "MySecure123Pass!"
4. Click "Mã hóa"
5. Tải file document.docx.aes
```

### Gửi file cho bạn

```
1. Share file document.docx.aes qua email/cloud
2. Bạn tải về
3. Mở website (http://localhost:3000)
4. Tab "Giải mã" → Upload file .aes
5. Nhập mật khẩu: "MySecure123Pass!"
6. Click "Giải mã"
7. Tải file gốc document.docx
```

---

## 📊 Performance

Trên máy 2 GHz:

| Kích cỡ | Encrypt | Decrypt |
|--------|---------|---------|
| 1 MB   | ~20 ms  | ~20 ms  |
| 10 MB  | ~200 ms | ~200 ms |
| 100 MB | ~2 sec  | ~2 sec  |
| 1 GB   | ~20 sec | ~20 sec |

---

## 🆘 Troubleshooting

### "Port 3000 đã dùng"

```bash
# Dùng port khác
PORT=8080 npm start

# Hoặc kill process cũ
lsof -ti :3000 | xargs kill -9
npm start
```

### "Module not found"

```bash
# Cài lại dependencies
rm -rf node_modules package-lock.json
npm install
npm start
```

### "File not uploaded"

```bash
# Kiểm tra thư mục uploads
ls -la web/uploads/

# Cho quyền thư mục
chmod 777 web/uploads

# Refresh trang browser (F5)
```

### "Cannot decrypt file"

- ❌ Mật khẩu sai → File bị hỏng, không quay lại
- ✅ Mật khẩu đúng → File gốc được khôi phục 100%

**Cách tránh:**
```bash
# Luôn backup trước
cp file.txt file.txt.backup
```



## 📚 Tài liệu chi tiết

| Tài liệu | Nội dung |
|---------|---------|
| [INSTALL.md](INSTALL.md) | Hướng dẫn cài đặt chi tiết |
| [QUICKSTART.md](QUICKSTART.md) | Bắt đầu nhanh |
| [DEMO_GUIDE.md](DEMO_GUIDE.md) | Hướng dẫn sử dụng đầy đủ |
| [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) | Chi tiết cấu trúc code |
| [LAB_EXERCISE.sh](LAB_EXERCISE.sh) | Bài tập thực hành |

---

## 🎓 Công nghệ sử dụng

**Frontend:**
- HTML5 / CSS3
- JavaScript (Vanilla)
- Drag & Drop API
- File API

**Backend:**
- Node.js + Express.js
- REST API
- File upload handling

**Encryption:**
- Node.js crypto module
- Algorithm: AES-128-CBC (FIPS 197)

---


## 🚀 Bắt đầu ngay

```bash
cd web && npm install && npm start
```

Rồi mở browser: **http://localhost:3000**

---

## ❓ Cần giúp?

1. **Lần đầu?** → [QUICKSTART.md](QUICKSTART.md)
2. **Cài đặt?** → [INSTALL.md](INSTALL.md)
3. **Chi tiết?** → [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)
4. **Gặp lỗi?** → Xem Troubleshooting ở trên

---

**🔒 AES File Encryption with Modern Web Interface**  
**Status:** ✅ Ready to Use  
**Latest Version:** 1.0

