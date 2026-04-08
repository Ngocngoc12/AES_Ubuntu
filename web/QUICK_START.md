# 🚀 QUICK START - Giao Diện AES Manager Pro

## ✅ Yêu cầu
- Node.js 14+ cài trên máy
- npm (đi kèm Node.js)
- Browser hiện đại (Chrome, Firefox, Safari, Edge)

---

## 🎯 Chạy giao diện ngay

### Bước 1: Install dependencies
```bash
cd web
npm install
```

### Bước 2: Start server
```bash
npm start
```

Hoặc dùng nodemon (auto-reload):
```bash
npm run dev
```

### Bước 3: Mở trình duyệt
```
http://localhost:3000
```

---

## 📂 Cấu trúc giao diện

### 🏠 Dashboard
- Xem tổng quan hệ thống
- Thống kê USB, Storage, Encryption
- Hoạt động gần đây

### 💾 USB Devices  
- Liệt kê tất cả USB được kết nối
- Thông tin chi tiết mỗi device
- Refresh tự động

### 📁 File Manager
- Upload file lên USB
- Xem danh sách file
- Download/Delete file
- Filter encrypted vs normal files

### 🔐 Encrypt/Decrypt
- **Encrypt**: Chọn file + mật khẩu → Mã hóa
- **Decrypt**: Chọn file .enc + mật khẩu → Giải mã
- **Progress**: Theo dõi tiến trình
- **History**: Xem lịch sử

### 💾 Backup & Restore
- **Backup**: Tạo backup của USB device
- **Restore**: Phục hồi từ backup file
- **History**: Lịch sử backup

### ⚙️ Settings
- Chọn thuật toán AES (128 hoặc 256)
- Theme: Light/Dark mode
- Ngôn ngữ: Tiếng Việt/English

---

## 🎨 Giao diện mới

### Thanh bên (Sidebar)
```
┌─────────────────┐
│  Dashboard   ← │
│ 📊 Dashboard    │
│ 💾 USB Devices  │
│ 📁 File Manager │
│ 🔐 Encrypt      │
│ 💾 Backup       │
│ ⚙️  Settings     │
└─────────────────┘
```

### Thông báo (Notifications)
- Hiển thị bên phải màn hình
- Tự động biến mất sau 5 giây
- 4 loại: Success, Error, Warning, Info

### Màu sắc
- **Primary**: Blue (Actions)
- **Success**: Green (OK)
- **Error**: Red (Problems)  
- **Warning**: Yellow (Cautions)
- **Info**: Cyan (Info)

---

## 💡 Ví dụ sử dụng

### Mã hóa file
1. Đi tới: **Encrypt/Decrypt** tab
2. Chọn file cần mã hóa
3. Nhập mật khẩu (8+ ký tự, chứa A-Z, 0-9, ký tự đặc biệt)
4. Xác nhận mật khẩu
5. Click "Bắt đầu mã hóa"
6. Chờ progress bar → 100%
7. ✅ Mã hóa thành công!

### Quản lý USB
1. Đi tới: **USB Devices** tab
2. Kích refresh để cập nhật danh sách
3. Click device → Chuyển sang File Manager
4. Upload file đơn giản bằng drag-drop

### Backup
1. Đi tới: **Backup & Restore** tab
2. Chọn USB device
3. Nhập tên backup
4. Chọn chế độ (Full hoặc Encrypted only)
5. Click "Tạo Backup"
6. ✅ Hoàn tất!

---

## ⚡ Tính năng nổi bật

| Tính năng | Mô tả |
|-----------|-------|
| **Multi-USB** | Quản lý nhiều USB cùng lúc |
| **Dark Mode** | Bảo vệ mắt (nhất là ban đêm) |
| **Drag-Drop** | Upload file dễ dàng |
| **Real-time** | Dashboard cập nhật tự động 5s |
| **Notifications** | Thông báo mọi hành động |
| **Progress Bar** | Theo dõi tiến trình encoding |
| **Activity Log** | Lịch sử 10 hoạt động gần nhất |
| **Responsive** | Chạy được trên phone/tablet |

---

## 🔧 Cấu hình

### Thay đổi port
Mở `server.js` tìm:
```javascript
const PORT = 3000;
```

Đổi thành:
```javascript
const PORT = 8080;  // Hoặc port khác
```

### Thay đổi folder upload
Mở `app-pro.js` tìm:
```javascript
const UPLOAD_DIR = './uploads';
```

---

## 📋 Keyboard Shortcuts

| Phím | Hành động |
|------|-----------|
| `D` | Dashboard |
| `U` | USB Devices |
| `F` | File Manager |
| `E` | Encrypt/Decrypt |
| `B` | Backup |
| `S` | Settings |

**Lưu ý**: Shortcuts sẽ được add trong version tiếp theo

---

## 🆘 Troubleshooting

### Port 3000 đã được sử dụng
```bash
# Tìm process chiếm port
netstat -ano | findstr :3000

# Kill process (Windows)
taskkill /PID [PID] /F
```

### npm install lỗi
```bash
# Clear cache
npm cache clean --force

# Install lại
npm install
```

### Giao diện không load
- F5 để reload page
- Xóa browser cache (Ctrl+Shift+Delete)
- Mở Developer Console (F12) kiểm tra lỗi

### Ký tự Tiếng Việt bị lỗi
- Đảm bảo UTF-8 encoding trong file HTML
- Kiểm tra terminal encoding

---

## 📚 File quan trọng

```
web/
├── index.html          ← Giao diện HTML
├── style-pro.css       ← CSS styling
├── app-pro.js          ← JavaScript logic
├── app.js              ← API handlers
├── server.js           ← Node.js server
└── package.json        ← Dependencies
```

---

## 🎓 Học tập

### HTML/CSS/JS
- **index.html**: Cấu trúc giao diện
- **style-pro.css**: Styling, responsive design
- **app-pro.js**: DOM manipulation, events

### Node.js
- **server.js**: Express server, routes
- **app.js**: API endpoints

### Integration
- **AES Driver**: Gọi encrypt/decrypt qua ioctl
- **USB Manager**: Phát hiện device, quản lý file

---

## 📞 Support

Nếu gặp lỗi:
1. Kiểm tra Developer Console (F12)
2. Xem file INTERFACE_PRO_GUIDE.md
3. Kiểm tra server logs
4. Restart server

---

**Chúc bạn sử dụng vui vẻ! 🎉**
