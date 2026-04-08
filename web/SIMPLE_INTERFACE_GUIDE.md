# 🔐 USB Crypt - Simple Interface

Giao diện **đơn giản, tập trung, chuyên nghiệp** giống như hình desktop app!

---

## ✨ Tính năng

✅ **Input File/Folder** - Chọn file hoặc folder cần mã hóa  
✅ **Output Path** - Chọn đường dẫn lưu kết quả  
✅ **Password** - Nhập mật khẩu với nút toggle hiển thị  
✅ **Encrypt Button** - Mã hóa file  
✅ **Decrypt Button** - Giải mã file  
✅ **Progress Bar** - Theo dõi tiến trình  
✅ **Status Indicator** - Hiển thị trạng thái USB  
✅ **Message Box** - Thông báo success/error/warning  
✅ **Drag & Drop** - Kéo thả file  
✅ **Keyboard Shortcuts** - Ctrl+E (Encrypt), Ctrl+D (Decrypt)  

---

## 🚀 Chạy ngay

### 1️⃣ Cách 1: Dùng file `index-simple.html`

```bash
cd web
npm install
npm start

# Mở browser: http://localhost:3000
# File sẽ tự load index.html
```

### 2️⃣ Cách 2: Dùng file riêng

Nếu muốn dùng `index-simple.html` riêng:

```bash
# Trong server.js, thêm route:
app.get('/simple', (req, res) => {
    res.sendFile(__dirname + '/index-simple.html');
});

# Mở: http://localhost:3000/simple
```

---

## 📁 File tạo mới

```
web/
├── index-simple.html     ← Giao diện (đơn giản)
├── style-simple.css      ← CSS (sạch, responsive)
├── app-simple.js         ← JavaScript logic
└── server.js             ← Cập nhật để hỗ trợ
```

---

## 🎨 Thiết kế

### Layout
```
┌─────────────────────────────────┐
│         USB Crypt               │
│   File Encryption/Decryption    │
├─────────────────────────────────┤
│ ● USB Device Connected - Ready │
├─────────────────────────────────┤
│                                 │
│ Input File or Folder            │
│ [  Path input  ] [File] [Folder]│
│                                 │
│ Output File (to USB)            │
│ [  Path input  ]      [Output]  │
│                                 │
│ Password                        │
│ [  Password  ] [👁]             │
│                                 │
│  [🔒 Encrypt]  [🔓 Decrypt]     │
│                                 │
│ Progress                        │
│ ████████░░░░░░░░░░░░  60%      │
│                                 │
│ ✓ Encryption successful!        │
└─────────────────────────────────┘
```

### Màu sắc
- **Header**: Gradient purple (667eea → 764ba2)
- **Status**: Green (#28a745) khi connected
- **Buttons**: Gradient như header
- **Background**: Gradient light-blue

---

## 🎯 Sử dụng

### 1. Mã hóa file
```
1. Chọn file → [Chọn File]
2. Nhập mật khẩu → [Password input]
3. Chọn output → [Chọn Output]
4. Click [🔒 Encrypt]
5. Chờ progress bar → 100%
6. ✓ Done!
```

### 2. Giải mã file
```
1. Chọn file .enc → [Chọn File]
2. Nhập mật khẩu → [Password input]
3. Chọn output → [Chọn Output
]
4. Click [🔓 Decrypt]
5. Chờ progress bar → 100%
6. ✓ Done!
```

---

## 🔧 API Endpoints (cần implement)

```javascript
// POST /api/encrypt
{
    "inputPath": "/media/chien/file.txt",
    "outputPath": "/media/chien/file.txt.enc",
    "password": "mySecretPassword"
}
Response: { "success": true, "message": "Encrypted" }

// POST /api/decrypt
{
    "inputPath": "/media/chien/file.txt.enc",
    "outputPath": "/media/chien/file.txt",
    "password": "mySecretPassword"
}
Response: { "success": true, "message": "Decrypted" }
```

---

## ⌨️ Keyboard Shortcuts

| Phím | Hành động |
|------|-----------|
| `Ctrl + E` | Encrypt |
| `Ctrl + D` | Decrypt |
| `Enter` | Encrypt (nếu focus password) |

---

## 📱 Responsive

- ✅ Desktop (650px max)
- ✅ Tablet (450px)
- ✅ Mobile (< 480px)
- ✅ Landscape

---

## 🎨 Dark Mode

Tự động dùng dark mode nếu OS setting là dark (prefers-color-scheme)

---

## 🔌 Kết nối Driver AES

Cập nhật `app-simple.js`:

```javascript
async function handleEncrypt() {
    // ...
    const response = await fetch('/api/encrypt', {
        method: 'POST',
        body: JSON.stringify({
            inputPath,
            outputPath,
            password
        })
    });
    
    // Backend sẽ gọi:
    // ioctl(/dev/aes_engine, AES_DO_CRYPT, args)
}
```

---

## 📊 Progress Simulation

- Hiện progress bar khi bắt đầu
- Random progress 0-90% mỗi 300ms
- Hiển thị 0-100% complete
- Auto-hide sau 1 giây

---

## ✉️ Messages

### Success
```
✓ Encryption successful! Output: /path/to/file.enc
```

### Error
```
✗ Error: Password too short
```

### Warning
```
⚠ Please select input file first
```

### Info
```
ℹ Encrypting file.txt...
```

---

## 🎁 Bonus Features

1. **Drag & Drop** - Kéo file vào input
2. **Auto-filename** - Tự thêm/xoá .enc
3. **Toggle password** - 👁 để xem mật khẩu
4. **Enter key** - Encrypt bằng Enter
5. **Keyboard shortcuts** - Ctrl+E, Ctrl+D
6. **Real-time validation** - Kiểm tra ngay
7. **Status indicator** - USB status động
8. **Smooth animations** - Fade in/out

---

## 🐛 Troubleshooting

### Input field không được click?
- Vì `readonly`, chỉ có thể chọn qua button

### Password field không show?
- Tab vào hoặc click vào để focus

### Progress bar không chuyển động?
- Check console (F12) cho error

### Message không disappear?
- Success message auto-hide sau 4s
- Warning/Error giữ nguyên

---

## 📝 Cổng API Server

Thêm vào `server.js`:

```javascript
const express = require('express');
const app = express();

app.use(express.static('web'));
app.use(express.json());

// Serve simple interface
app.get('/simple', (req, res) => {
    res.sendFile(__dirname + '/web/index-simple.html');
});

// Encrypt endpoint
app.post('/api/encrypt', async (req, res) => {
    try {
        const { inputPath, outputPath, password } = req.body;
        // TODO: Call AES driver via ioctl
        res.json({ success: true, message: 'Encrypted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Decrypt endpoint
app.post('/api/decrypt', async (req, res) => {
    try {
        const { inputPath, outputPath, password } = req.body;
        // TODO: Call AES driver via ioctl
        res.json({ success: true, message: 'Decrypted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
```

---

**Version**: 1.0.0  
**License**: GPL 3.0  
**Created**: 2024-04-08
