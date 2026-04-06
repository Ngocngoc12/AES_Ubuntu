/**
 * AES File Encryption Manager - Node.js Backend Server
 * Express.js + Crypto processing
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

// ========================================
// Configuration
// ========================================

const app = express();
const PORT = process.env.PORT || 3000;

// ĐƯỜNG DẪN ĐẾN USB CỦA BẠN (Dùng cho Demo)
const USB_DIR = '/media/hoangngoc/76E8-CACF';

// Storage configuration for uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}-${Date.now()}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB limit
    }
});

// Middleware
app.use(express.static(path.join(__dirname)));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========================================
// Statistics
// ========================================

const stats = {
    filesEncrypted: 0,
    filesDecrypted: 0,
    totalSizeProcessed: 0,
    processedFiles: {},
    startTime: Date.now()
};

// ========================================
// Utility Functions
// ========================================

function deriveKey(password) {
    const key = Buffer.alloc(16, 0);
    const passwordBuffer = Buffer.from(password, 'utf8');
    passwordBuffer.copy(key, 0, 0, Math.min(16, passwordBuffer.length));
    return key;
}

function createIV() {
    return Buffer.alloc(16, 0);
}

function addPadding(buffer) {
    const blockSize = 16;
    const dataLength = buffer.length;
    const paddingLength = blockSize - (dataLength % blockSize);
    const padding = Buffer.alloc(paddingLength, paddingLength);
    return Buffer.concat([buffer, padding]);
}

function removePadding(buffer) {
    const lastByte = buffer[buffer.length - 1];
    if (lastByte < 1 || lastByte > 16) {
        throw new Error('Invalid padding - wrong password or corrupted file');
    }
    for (let i = 0; i < lastByte; i++) {
        if (buffer[buffer.length - 1 - i] !== lastByte) {
            throw new Error('Invalid padding - wrong password or corrupted file');
        }
    }
    return buffer.slice(0, buffer.length - lastByte);
}

function encryptData(data, password) {
    try {
        const key = deriveKey(password);
        const iv = createIV();
        const paddedData = addPadding(data);
        const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
        let encrypted = cipher.update(paddedData);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return Buffer.concat([iv, encrypted]);
    } catch (error) {
        throw new Error(`Encryption failed: ${error.message}`);
    }
}

function decryptData(data, password) {
    try {
        const key = deriveKey(password);
        const iv = data.slice(0, 16);
        const encrypted = data.slice(16);
        const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
        let decrypted = decipher.update(encrypted);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return removePadding(decrypted);
    } catch (error) {
        throw new Error(`Decryption failed: ${error.message}`);
    }
}

// ========================================
// Routes
// ========================================

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/api/process', upload.single('file'), async (req, res) => {
    try {
        const { password, mode } = req.body;

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        if (!password || password.length === 0 || password.length > 16) {
            return res.status(400).json({ success: false, message: 'Invalid password (1-16 characters)' });
        }
        if (mode !== 'encrypt' && mode !== 'decrypt') {
            return res.status(400).json({ success: false, message: 'Invalid mode' });
        }

        const inputPath = req.file.path;
        const fileData = fs.readFileSync(inputPath);
        let outputData;
        let outputFilename;

        if (mode === 'encrypt') {
            outputData = encryptData(fileData, password);
            outputFilename = `${path.parse(req.file.originalname).name}.aes`;
            stats.filesEncrypted++;
        } else {
            outputData = decryptData(fileData, password);
            const baseName = path.parse(req.file.originalname).name;
            outputFilename = baseName.endsWith('.aes') ? baseName.slice(0, -4) : baseName;
            stats.filesDecrypted++;
        }

        // ========================================================
        // LOGIC LƯU FILE VÀO USB HOẶC LOCAL
        // ========================================================
        let finalOutputDir = path.join(__dirname, 'uploads');
        let isSavedToUSB = false;

        // Kiểm tra xem USB có đang cắm không
        if (fs.existsSync(USB_DIR)) {
            finalOutputDir = USB_DIR;
            isSavedToUSB = true;
        }

        // Lấy tên file trực tiếp (VD: bimat.aes) để hiển thị đẹp trên USB
        const outputPath = path.join(finalOutputDir, outputFilename);

        // Ghi file ra thư mục đích (USB hoặc uploads)
        fs.writeFileSync(outputPath, outputData);

        const fileId = uuidv4();
        stats.processedFiles[fileId] = {
            path: outputPath,
            filename: outputFilename,
            createdAt: Date.now()
        };

        stats.totalSizeProcessed += fileData.length;
        fs.unlinkSync(inputPath); // Xóa file gốc người dùng upload lên

        // Nếu KHÔNG lưu vào USB thì mới hẹn giờ xóa (để dọn rác server)
        // Nếu lưu vào USB thì giữ nguyên để báo cáo
        if (!isSavedToUSB) {
            setTimeout(() => {
                try {
                    if (fs.existsSync(outputPath)) {
                        fs.unlinkSync(outputPath);
                    }
                    delete stats.processedFiles[fileId];
                } catch (error) {
                    console.error('Cleanup error:', error);
                }
            }, 3600 * 1000); // 1 hour
        }

        res.json({
            success: true,
            message: `${mode === 'encrypt' ? 'Encryption' : 'Decryption'} successful. Saved to ${isSavedToUSB ? 'USB' : 'Server'}.`,
            downloadUrl: `/api/download/${fileId}`,
            filename: outputFilename,
            size: outputData.length,
            timestamp: new Date().toISOString(),
            savedToUSB: isSavedToUSB
        });

    } catch (error) {
        console.error('Processing error:', error);
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ success: false, message: error.message || 'Processing failed' });
    }
});

app.get('/api/download/:fileId', (req, res) => {
    try {
        const { fileId } = req.params;
        const fileInfo = stats.processedFiles[fileId];

        if (!fileInfo || !fs.existsSync(fileInfo.path)) {
            delete stats.processedFiles[fileId];
            return res.status(404).json({ success: false, message: 'File not found or has expired' });
        }

        res.download(fileInfo.path, fileInfo.filename, (err) => {
            if (err) console.error('Download error:', err);
        });
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ success: false, message: 'Download failed' });
    }
});

app.get('/api/stats', (req, res) => {
    const uptime = Math.floor((Date.now() - stats.startTime) / 1000);
    res.json({
        filesEncrypted: stats.filesEncrypted,
        filesDecrypted: stats.filesDecrypted,
        totalSizeProcessed: stats.totalSizeProcessed,
        uptime: uptime,
        timestamp: new Date().toISOString()
    });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'AES File Encryption Manager', version: '1.0' });
});

// Error Handling
app.use((err, req, res, next) => {
    console.error('Error:', err);
    if (err instanceof multer.MulterError && err.code === 'FILE_TOO_LARGE') {
        return res.status(400).json({ success: false, message: 'File too large (max 100MB)' });
    }
    res.status(500).json({ success: false, message: err.message || 'Internal server error' });
});

app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// Server Start
app.listen(PORT, () => {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║  🔒 AES File Encryption Manager      ║');
    console.log('║     Server v1.0                      ║');
    console.log('╠════════════════════════════════════════╣');
    console.log(`║  🚀 Server chạy tại:                 ║`);
    console.log(`║     http://localhost:${PORT}`);
    console.log('║                                        ║');
    console.log('║   USB Output configured to:             ║');
    console.log(`║  ${USB_DIR.substring(0, 36).padEnd(36)}  ║`);
    console.log('╚════════════════════════════════════════╝\n');
});

process.on('SIGINT', () => {
    console.log('\n\n🛑 Server đang tắt...');
    process.exit(0);
});

module.exports = app;