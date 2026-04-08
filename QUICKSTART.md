# ⚡ QUICKSTART - 5 Phút Bắt Đầu

## 🚀 Bước 1: Chuẩn bị

```bash
# Điều kiện: Node.js 14+
node --version    # Phải >= v14.0.0
npm --version

# Vào thư mục web
cd AES_Ubuntu/web
```

---

## 📦 Bước 2: Cài đặt

```bash
# Cài dependencies (30 giây)
npm install

# Hoặc nếu dùng yarn
yarn install
```

---

## 🎬 Bước 3: Khởi chạy

### Linux/Mac:

```bash
npm start
# hoặc
bash start.sh
```

### Windows:

```bash
npm start
# hoặc double-click start.bat
```

**Kết quả:**
```
Server running at http://localhost:3000
Open your browser: http://localhost:3000
```

---

## 💡 Bước 4: Sử dụng

### Mã hóa File

```
1. Mở http://localhost:3000
2. Click "Upload file"
3. Chọn file muốn mã hóa
4. Nhập mật khẩu (8-20 ký tự)
5. Click "Mã hóa"
6. Tải file được mã hóa (.aes)
```

### Giải mã File

```
1. Click "Upload file"
2. Chọn file .aes
3. Nhập mật khẩu (mật khẩu ban đầu)
4. Click "Giải mã"
5. Tải file gốc
```

---

## 🎯 Xong! 🎉

**Bạn đã sẵn sàng!**

Khám phá thêm:
- 📖 [README.md](README.md) - Tài liệu đầy đủ
- 📘 [DEMO_GUIDE.md](DEMO_GUIDE.md) - Hướng dẫn chi tiết
- 📊 [web/README.md](web/README.md) - Cấu hình web

---

## 🆘 Nếu gặp vấn đề

### **Server không khởi chạy**

```bash
# Cài lại
rm -rf node_modules package-lock.json
npm install
npm start
```

### **Port 3000 đã dùng**

```bash
# Dùng port khác
PORT=8080 npm start
```

### **Không thấy file được mã hóa**

1. Kiểm tra `web/uploads/` tồn tại
2. Kiểm tra quyền: `chmod 777 web/uploads`
3. Thử F5 làm mới trang

---

## 📞 Hỗ trợ

Xem thêm: [Troubleshooting](README.md#-khắc-phục-sự-cố)
