# 🎨 AES Encryption Manager PRO - Giao Diện Mới

## ✨ Tính năng mới

Đã tạo **giao diện web hiện đại, chuyên nghiệp** với những cải tiến:

### 📊 Dashboard
- **Thống kê tổng quan**: USB devices, storage info, encryption stats
- **Hoạt động gần đây**: Theo dõi tất cả thao tác
- **Real-time updates**: Cập nhật tự động mỗi 5 giây

### 💾 USB Device Manager
- **Danh sách USB**: Hiển thị tất cả thiết bị USB được kết nối
- **Thông tin chi tiết**: Mount point, dung lượng, trạng thái
- **Chọn device nhanh**: Click để quản lý

### 📁 File Manager
- **Duyệt file**: Liệt kê toàn bộ file trên USB
- **Upload file**: Drag-drop hoặc click để upload
- **Thao tác file**: Download, delete, view details
- **Filter file**: Hiển thị file mã hóa vs bình thường

### 🔐 Encrypt/Decrypt
- **Mã hóa file**: Với validation mật khẩu mạnh
- **Giải mã file**: Nhập mật khẩu để restore
- **Progress bar**: Theo dõi tiến trình
- **Lịch sử hoạt động**: Bảng ghi lại tất cả thao tác

### 💾 Backup & Restore  
- **Tạo backup**: Full backup hoặc chỉ encrypted files
- **Restore**: Phục hồi từ backup file
- **Lịch sử**: Quản lý tất cả backup
- **Overwrite option**: Ghi đè file cũ hoặc giữ lại

### ⚙️ Settings
- **Security**: Chọn thuật toán AES-128 hay AES-256
- **Theme**: Light mode / Dark mode
- **Language**: Tiếng Việt / English
- **Password strength**: Bắt buộc mật khẩu mạnh

---

## 🚀 Cách chạy giao diện mới

### Windows
```bash
cd web
npm install
npm start
# Truy cập: http://localhost:3000
```

### Linux/Ubuntu
```bash
cd web
npm install
npm start
# Truy cập: http://localhost:3000
```

### Hoặc chạy trực tiếp từ USB
```bash
cd web && node server.js
# Mở trình duyệt: http://localhost:3000
```

---

## 📁 Cấu trúc file

```
web/
├── index.html          ← Giao diện Pro (MỚI)
├── index-old.html      ← Giao diện cũ (backup)
├── style-pro.css       ← CSS hiện đại (MỚI)
├── app-pro.js          ← Logic giao diện (MỚI)
├── app.js              ← API handler (cũ)
├── style.css           ← CSS cũ
├── server.js           ← Node.js server
├── package.json        ← Dependencies
└── uploads/            ← Thư mục upload
```

---

## 🎯 Chức năng chính (Chi tiết)

### 1️⃣ Dashboard
- **USB Devices**: Số lượng USB được phát hiện
- **Storage Info**: Tổng dung lượng, đã sử dụng, còn trống
- **Encryption Stats**: Số file mã hóa vs bình thường
- **Activity Log**: 10 hoạt động gần nhất

### 2️⃣ USB Devices
- Hiển thị tất cả USB devices theo card grid
- Mỗi device hiển thị:
  - Icon + Tên device
  - Mount point
  - Dung lượng
  - Trạng thái (Ready)
- Click device để chuyển sang File Manager

### 3️⃣ File Manager
- Chọn USB device từ dropdown
- Duyệt file của device
- Cột hiển thị:
  - Tên file (với icon loại file)
  - Kích thước
  - Loại (PDF, JPG, Excel, v.v.)
  - Ngày sửa
  - Thao tác (Download, Delete)
- Upload file bằng button hoặc drag-drop

### 4️⃣ Encrypt/Decrypt
- **Mã hóa**: 
  - Chọn file
  - Nhập mật khẩu (validation: 8+ ký tự, chữ hoa, số)
  - Xác nhận mật khẩu
  - Option xóa file gốc
  - Progress bar 0-100%
  
- **Giải mã**:
  - Chọn file được mã hóa (.enc)
  - Nhập mật khẩu
  - Progress bar
  
- **Lịch sử hoạt động**:
  - Bảng ghi lại file, loại, kích thước, thời gian, trạng thái

### 5️⃣ Backup & Restore
- **Backup**:
  - Chọn device
  - Nhập tên backup
  - Chọn chế độ (Full hoặc Encrypted only)
  - Progress bar
  
- **Restore**:
  - Chọn file backup
  - Chọn device đích
  - Option overwrite
  - Progress bar
  
- **Lịch sử**:
  - Bảng với tên, kích thước, ngày, loại, thao tác

### 6️⃣ Settings
- **Security**:
  - Thuật toán: AES-128 (mặc định) hoặc AES-256
  - Yêu cầu mật khẩu mạnh (toggle)
  
- **Application**:
  - Ngôn ngữ: Tiếng Việt hoặc English
  - Theme: Light hoặc Dark mode
  
- **About**:
  - Tên ứng dụng, version, license

---

## 🎨 Giao diện & UX

### Design
- **Modern & Professional**: Material Design influenced
- **Responsive**: Tương thích desktop/tablet/mobile
- **Dark Mode**: Support chế độ tối
- **Icons**: Font Awesome 6.0
- **Animations**: Smooth transitions & loading effects

### Sidebar Navigation
- Fixed sidebar với 6 mục chính
- Active indicator
- Hover effects
- Mobile responsive (trở thành horizontal nav)

### Notifications
- Toast messages (top-right)
- Màu sắc khác nhau (success/error/warning/info)
- Auto-dismiss sau 5 giây
- Có title + message

### Modals
- Confirm dialog cho các thao tác quan trọng
- Overlay tối
- Smooth animation

---

## 📝 File CSS (style-pro.css)

**Kích thước**: ~8KB (hoàn toàn)
**Đặc điểm**:
- CSS Variables cho theme
- Flexbox & Grid layout
- Custom properties
- Dark mode support
- Responsive breakpoints (600px, 768px)
- Smooth transitions

---

## 📝 File JavaScript (app-pro.js)

**Kích thước**: ~10KB
**Chức năng**:
- Page navigation
- Event listeners
- Form validation
- Progress simulation
- Notifications
- Local storage (theme, language)
- Activity tracking

---

## 🔧 API Endpoints (cần connect với backend)

Các endpoint cần được implement trong `server.js`:

```javascript
// USB Devices
GET /api/devices              // Lấy danh sách USB devices
POST /api/devices/refresh     // Refresh device list

// File Management
GET /api/files/:deviceId      // Lấy danh sách file
POST /api/files/upload        // Upload file
DELETE /api/files/:fileId     // Xóa file
GET /api/files/download/:id   // Download file

// Encryption
POST /api/encrypt             // Mã hóa file (call driver)
POST /api/decrypt             // Giải mã file (call driver)

// Backup
POST /api/backup/create       // Tạo backup
POST /api/backup/restore      // Restore từ backup
GET /api/backup/history       // Lịch sử backup

// System
GET /api/system/info          // Thông tin hệ thống
GET /api/system/stats         // Thống kê
```

---

## 🔗 Kết nối với AES Driver

Trong `app-pro.js`, hàm `simulateEncryptionProcess()` cần được thay thế bằng:

```javascript
async function handleEncrypt() {
    const file = document.getElementById('encryptFileInput').files[0];
    const password = document.getElementById('encryptPassword').value;
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('password', password);
    
    const response = await fetch('/api/encrypt', {
        method: 'POST',
        body: formData
    });
    
    if (response.ok) {
        showNotification('Mã hóa thành công', 'success');
    } else {
        showNotification('Lỗi mã hóa', 'error');
    }
}
```

---

## 📱 Responsive Breakpoints

- **Desktop**: 1400px (max-width)
- **Tablet**: 768px (sidebar to horizontal nav)
- **Mobile**: 600px (full responsive)

---

## 🎯 Tổng kết

| Thành phần | Trước | Sau |
|-----------|-------|------|
| **Giao diện** | Đơn giản, tab-based | Modern, sidebar + pages |
| **Chức năng** | Chỉ encrypt/decrypt | Encrypt/decrypt/file manager/backup |
| **USB Management** | ❌ Không có | ✅ Quản lý multiple USB |
| **Dashboard** | ❌ Không có | ✅ Thống kê tổng quan |
| **Theme Support** | ❌ Không có | ✅ Light/Dark mode |
| **Responsive** | Cơ bản | ✅ Hoàn toàn responsive |
| **Icons** | Text | ✅ Font Awesome |
| **Animations** | Cơ bản | ✅ Smooth transitions |

---

## 🚀 Tiếp theo

1. ✅ Giao diện hoàn tất
2. 📌 Cần connect APIs:
   - Device discovery
   - File operations
   - AES encryption (call kernel driver)
   - Backup management
3. 📌 Test trên Windows & Linux
4. 📌 Optimize performance

---

**Tác giả**: Security Team  
**Version**: 1.0.0  
**License**: GPL 3.0  
**Created**: 2024-04-08
