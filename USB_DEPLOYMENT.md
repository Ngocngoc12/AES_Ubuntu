# 🔧 USB DEPLOYMENT GUIDE - AES Encryption System

## 🎯 Mục đích

Chạy AES Encryption Manager từ USB, không cần cài góc, cho bất kỳ máy tính nào.

---

## 📋 YÊU CẦU

- USB ≥ 4 GB
- Node.js 14+ cài trên máy đích (hoặc embedded)
- Windows 10+ / Linux / macOS

---

## 🚀 BƯỚC 1: CHUẨN BỊ USB

### 1.1 Copy Files

```bash
# Trên máy chính (Windows PowerShell)
$source = "c:\Users\hoang\Downloads\AES_Ubuntu\web"
$usb = "E:\"  # Thay E bằng ký tự USB của bạn

# Copy (không cần node_modules & uploads)
robocopy "$source" "$usb\AES_Encryption" `
  /E `
  /EXCLUDE:node_modules uploads .git

# Hoặc copy manual:
# 1. Mở E:\
# 2. Tạo folder "AES_Encryption"
# 3. Copy những file sau:
#    ├── index.html
#    ├── app.js
#    ├── style.css
#    ├── server.js
#    ├── package.json
#    ├── start.bat
#    ├── start.sh
#    └── .env.example (copy + rename thành .env)
```

### 1.2 Kiểm tra USB

```bash
# USB E: phải có structure như này:
E:\AES_Encryption\
├── index.html
├── style.css
├── app.js
├── server.js
├── package.json
├── .env
├── start.bat
├── start.sh
└── README.md
```

---

## 🚀 BƯỚC 2: CHẠY TRÊN USB

### Option A: Windows (Recommended)

#### Cách 1: Start Script

```bash
# 1. Plugged USB vào
# 2. Mở E:\AES_Encryption\
# 3. Double-click start.bat

# Hoặc command line:
cd E:\AES_Encryption
.\start.bat
```

**Nội dung start.bat**:
```batch
@echo off
REM AES Encryption Manager - USB Startup

echo [*] Checking Node.js...
node --version >nul 2>&1 || (
    echo ERROR: Node.js not installed!
    echo Download: https://nodejs.org/
    pause
    exit /b 1
)

echo [+] Node.js found!
echo [*] Installing dependencies...
call npm install

echo [+] Starting server...
call npm start

echo [*] Open: http://localhost:3000
pause
```

#### Cách 2: Manual

```bash
# Terminal
cd E:\AES_Encryption
npm install
npm start

# Browser: http://localhost:3000
```

### Option B: Linux/Mac

```bash
# 1. Mount USB
# 2. Terminal

cd /media/usb/AES_Encryption    # Linux
# hoặc
cd /Volumes/USB/AES_Encryption  # Mac

bash start.sh

# Browser: http://localhost:3000
```

---

## 🎯 BƯỚC 3: DEMO SỬ DỤNG

### Demo 1: Tạo File Test

```bash
# PowerShell trên máy khác
$testFile = "c:\Users\student\Documents\secret.txt"
"This is a secret message from John!" | Out-File $testFile

# Size: ~35 bytes
# Mục đích: Test encryption
```

### Demo 2: Mã hóa từ USB

**Trên máy laptop (USB chạy)**:

1. Browser → http://localhost:3000
2. **Tab "Mã hóa File"**
3. Drag file `secret.txt` vào
4. Password: `usb2026` (8 ký tự)
5. Click "Mã hóa File"
6. ⬇️ Download `secret.txt.aes` (encrypted)

### Demo 3: Giải mã trên Máy Khác

**Trên máy khác (USB vẫn kết nối)**:

1. Copies file `secret.txt.aes` vào desktop
2. USB vẫn chạy server http://localhost:3000
3. **Tab "Giải mã File"**
4. Upload `secret.txt.aes`
5. Password: `usb2026`
6. Click "Giải mã File"
7. ⬇️ Download `secret.txt` (decrypted) → Mở được bình thường!

---

## 📊 PHẦN 4: TÍNH TOÁN

### Dung lượng USB cần

```
File          Size
─────────────────────────────
index.html    ~15 KB
style.css     ~20 KB
app.js        ~15 KB
server.js     ~25 KB
package.json  ~1 KB
Docs          ~50 KB
─────────────────────────────
Total         ~126 KB

+ node_modules (nếu copy): ~500 MB
  (Nhưng không khuyến nghị - cài lại nó)

USB size khuyến nghị: ≥ 2 GB
=> Đủ dư địa cho files tạm
```

### Tốc độ

```
Chuyển dữ liệu    Tốc độ       Thời gian (100MB)
──────────────────────────────────────────────
USB 2.0          ~30 MB/s     ~3 giây
USB 3.0          ~100 MB/s    ~1 giây
USB 3.1          ~300 MB/s    ~0.3 giây
```

---

## 🔐 PHẦN 5: SECURITY TIPS

### ✅ Best Practice

1. **Password mạnh**
   - Min 8 ký tự
   - Mix: ABCD + abcd + 1234 + !@#$
   - Ví dụ: `Usb@2026Secure`

2. **Backup**
   - Copy USB → Ổ cứng
   - "What if USB hỏng?"

3. **HTTPS (Production)**
   - Nếu dùng internet public, bật SSL
   - OpenSSL cài trên USB

4. **File Cleanup**
   - Files tạm xóa sau 1 giờ
   - Không lưu password
   - Không log dữ liệu

### ⚠ Cảnh báo

- ❌ Đừng dùng password "123456" hoặc "abc123"
- ❌ Đừng để USB kết nối internet công cộng
- ❌ Đừng reset mật khẩu nếu quên (không thể recover)
- ❌ Đừng share password qua email/chat

---

## 🐛 PHẦN 6: TROUBLESHOOTING

### Problem 1: "npm command not found"

**Giải pháp**: Cài Node.js
```bash
# https://nodejs.org/ → LTS version
# Download + Install
# Restart terminal
```

### Problem 2: "Port 3000 already in use"

**Giải pháp**: Dùng port khác

```bash
# .env file
PORT=3001
```

Sau đó: http://localhost:3001

### Problem 3: "Cannot read file X"

**Giải pháp**:
- Kiểm tra USB có bị readonly
- Kiểm tra quyền file
- Copy lại từ source

### Problem 4: "Connection refused"

**Giải pháp**:
- Server chưa start
- Chạy lại `npm start`
- Chờ 3 giây
- Refresh browser

### Problem 5: "Encryption failed - ENOENT"

**Giải pháp**:
- Tạo folder `uploads` trên USB
```bash
mkdir uploads
npm start
```

---

## 📋 PHẦN 7: PRODUCTION CHECKLIST

### Before Deployment

- [ ] Test encryption/decryption works
- [ ] USB đủ dung lượng
- [ ] Node.js cài trên target machines
- [ ] Firewall cho phép port 3000
- [ ] Copy toàn bộ files (không quên .env)

### After Deployment

- [ ] Server chạy không lỗi
- [ ] Web load không lỗi
- [ ] Drag-drop hoạt động
- [ ] Encrypt file test thành công
- [ ] Decrypt file .aes thành công
- [ ] Stats endpoint trả về dữ liệu
- [ ] File tự xóa sau 1 giờ

### Monitoring

```bash
# Health check
curl http://localhost:3000/api/health

# Statistics
curl http://localhost:3000/api/stats

# Check port
netstat -ano | findstr ":3000"
```

---

## 🎓 PHẦN 8: HƯỚNG DẪN VÀO LỚP

### Kịch bản: Demo cho 30 sinh viên

#### Chuẩn bị:
- USB đã cài sẵn AES Manager
- Laptop + Projector
- 5-10 file test (text, image, video)
- Mật khẩu ghi trước: `demo2026`

#### Timeline (20 phút):

```
Phút 0-2:   Khởi động USB, chạy npm start
Phút 2-3:   Mở browser, show giao diện
Phút 3-8:   Demo mã hóa 1 file image (password: demo2026)
Phút 8-12:  SV tự làm: upload file riêng, mã hóa
Phút 12-16: Demo giải mã file .aes
Phút 16-18: Q&A về security, API
Phút 18-20: Recap, give USB, SV test tiếp
```

#### Điểm chủ yếu:

✅ "Cryptography không phức tạp"  
✅ "AES là tiêu chuẩn quốc tế"  
✅ "Mã hóa trong server an toàn hơn client"  
✅ "Mật khẩu mạnh = bảo mật tốt"  

---

## 📞 PHẦN 9: QUICK REFERENCE

### Commands

```bash
# Cài dependencies
npm install

# Start server
npm start

# Dev mode (hot reload)
npm run dev

# Health check
curl http://localhost:3000/api/health

# Stats
curl http://localhost:3000/api/stats

# Kill process on port 3000 (Linux)
lsof -ti:3000 | xargs kill -9

# Kill process on port 3000 (Windows)
Get-NetTCPConnection -LocalPort 3000 | Stop-Process
```

### URLs

| Purpose | URL |
|---------|-----|
| Web Interface | http://localhost:3000 |
| Encrypt API | POST /api/process |
| Download | GET /api/download/:id |
| Statistics | GET /api/stats |
| Health Check | GET /api/health |

---

## 📚 PHẦN 10: RESOURCES

```
USB Root/
├── AES_Encryption/
│   ├── index.html         ← Open this in browser
│   ├── README.md          ← Full documentation
│   ├── CONFIG.md          ← Advanced config
│   ├── DEMO_GUIDE.md      ← Test scenarios
│   └── USB_GUIDE.md       ← This file
│
└── SAMPLES/ (Optional)
    ├── test.txt
    ├── image.jpg
    ├── document.pdf
    └── video.mp4
```

---

## ✨ FINAL TIPS

1. **Performance**: Mã hóa file > 50MB có thể mất vài giây → NOT đơ UI


2. **Password**: Mỗi file cần password riêng không?
   - Không, 1 password cho tất cả file
   - Hoặc đặt password khác nhau

3. **Privacy**: Server có lưu password?
   - Không, password chỉ dùng để derive key
   - File tạm xóa sau 1 giờ

4. **Offline**: Cần internet?
   - Không, hoàn toàn offline
   - Server chạy local 100%

5. **Export**: Xuất code?
   - All code is yours
   - Modify, redistribute freely

---

**Status**: ✅ Ready for deployment  
**Version**: 1.0  
**Last Updated**: 2026-03-25  

---

🔒 **Keep your files secure, everywhere!** 🚀

