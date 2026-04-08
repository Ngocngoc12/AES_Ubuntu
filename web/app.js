// AES File Encryption Manager - Frontend JavaScript

class FileEncryptionApp {
    constructor() {
        this.encryptFile = null;
        this.decryptFile = null;
        this.stats = {
            encrypted: 0,
            decrypted: 0,
            totalSize: 0,
            startTime: Date.now()
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateStats();
        this.loadSavedPassword();
    }

    setupEventListeners() {
        // Tab Navigation
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.closest('.tab-button')));
        });

        // Encrypt Tab
        document.getElementById('browseBtn').addEventListener('click', () => {
            document.getElementById('fileInput').click();
        });

        document.getElementById('fileInput').addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files[0], 'encrypt');
        });

        document.getElementById('uploadArea').addEventListener('dragover', (e) => this.handleDragOver(e));
        document.getElementById('uploadArea').addEventListener('dragleave', (e) => this.handleDragLeave(e));
        document.getElementById('uploadArea').addEventListener('drop', (e) => this.handleDrop(e, 'encrypt'));

        document.getElementById('clearFileBtn').addEventListener('click', () => this.clearFile('encrypt'));

        document.getElementById('passwordEnc').addEventListener('input', (e) => {
            this.checkPasswordStrength(e.target.value);
            this.updateEncryptButton();
        });

        document.getElementById('togglePasswordEnc').addEventListener('click', () => {
            this.togglePassword('passwordEnc', 'togglePasswordEnc');
        });

        document.getElementById('encryptBtn').addEventListener('click', () => this.encryptFileAction());

        // Decrypt Tab
        document.getElementById('browseBtnDec').addEventListener('click', () => {
            document.getElementById('fileInputDec').click();
        });

        document.getElementById('fileInputDec').addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files[0], 'decrypt');
        });

        document.getElementById('uploadAreaDec').addEventListener('dragover', (e) => this.handleDragOver(e));
        document.getElementById('uploadAreaDec').addEventListener('dragleave', (e) => this.handleDragLeave(e));
        document.getElementById('uploadAreaDec').addEventListener('drop', (e) => this.handleDrop(e, 'decrypt'));

        document.getElementById('clearFileBtnDec').addEventListener('click', () => this.clearFile('decrypt'));

        document.getElementById('passwordDec').addEventListener('input', () => this.updateDecryptButton());

        document.getElementById('togglePasswordDec').addEventListener('click', () => {
            this.togglePassword('passwordDec', 'togglePasswordDec');
        });

        document.getElementById('decryptBtn').addEventListener('click', () => this.decryptFileAction());


        switchTab(button) {
            document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        }

        handleFileSelect(file, mode) {
            if (!file) return;

            if (file.size > 100 * 1024 * 1024) {
                this.showNotification('File quá lớn! Tối đa 100MB', 'error');
                return;
            }

            if (mode === 'encrypt') {
                this.encryptFile = file;
                this.displayFileInfo('encrypt');
                this.updateEncryptButton();
            } else {
                this.decryptFile = file;
                this.displayFileInfo('decrypt');
                this.updateDecryptButton();
            }
        }

        handleDragOver(e) {
            e.preventDefault();
            e.stopPropagation();
            e.target.closest('.upload-area')?.classList.add('dragover');
        }

        handleDragLeave(e) {
            e.preventDefault();
            e.stopPropagation();
            e.target.closest('.upload-area')?.classList.remove('dragover');
        }

        handleDrop(e, mode) {
            e.preventDefault();
            e.stopPropagation();
            e.target.closest('.upload-area')?.classList.remove('dragover');

            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileSelect(files[0], mode);
            }
        }

        displayFileInfo(mode) {
            const file = mode === 'encrypt' ? this.encryptFile : this.decryptFile;
            if (!file) return;

            const suffix = mode === 'decrypt' ? 'Dec' : '';
            document.getElementById(`fileInfo${suffix}`).classList.remove('hidden');
            document.getElementById(`fileName${suffix}`).textContent = file.name;
            document.getElementById(`fileSize${suffix}`).textContent = this.formatFileSize(file.size);
            document.getElementById(`fileType${suffix}`).textContent = file.type || 'Không xác định';
        }

        clearFile(mode) {
            const suffix = mode === 'decrypt' ? 'Dec' : '';
            if (mode === 'encrypt') {
                this.encryptFile = null;
                document.getElementById('fileInput').value = '';
            } else {
                this.decryptFile = null;
                document.getElementById('fileInputDec').value = '';
            }
            document.getElementById(`fileInfo${suffix}`).classList.add('hidden');
            this.updateEncryptButton();
            this.updateDecryptButton();
        }

        formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
        }

        checkPasswordStrength(password) {
            const strengthBar = document.getElementById('strengthEnc');
            const length = password.length;

            strengthBar.style.width = `${Math.min((length / 16) * 100, 100)}%`;

            if (length < 6) {
                strengthBar.className = 'password-strength weak';
            } else if (length < 12) {
                strengthBar.className = 'password-strength medium';
            } else {
                strengthBar.className = 'password-strength strong';
            }
        }

        togglePassword(inputId, buttonId) {
            const input = document.getElementById(inputId);
            const button = document.getElementById(buttonId);

            if (input.type === 'password') {
                input.type = 'text';
                button.textContent = '👁️‍🗨️ Ẩn';
            } else {
                input.type = 'password';
                button.textContent = '👁️ Hiện';
            }
        }

        updateEncryptButton() {
            const btn = document.getElementById('encryptBtn');
            const hasFile = !!this.encryptFile;
            const hasPassword = document.getElementById('passwordEnc').value.length > 0;
            btn.disabled = !(hasFile && hasPassword);
        }

        updateDecryptButton() {
            const btn = document.getElementById('decryptBtn');
            const hasFile = !!this.decryptFile;
            const hasPassword = document.getElementById('passwordDec').value.length > 0;
            btn.disabled = !(hasFile && hasPassword);
        }

    async encryptFileAction() {
            if (!this.encryptFile) return;
            const password = document.getElementById('passwordEnc').value;
            if (document.getElementById('savePassword').checked) {
                localStorage.setItem('aes_password', password);
            }
            await this.processFile(this.encryptFile, password, 'encrypt');
        }

    async decryptFileAction() {
            if (!this.decryptFile) return;
            const password = document.getElementById('passwordDec').value;
            await this.processFile(this.decryptFile, password, 'decrypt');
        }

    async processFile(file, password, mode) {
            this.showProgress(true, `Đang ${mode === 'encrypt' ? 'mã hóa' : 'giải mã'}...`);

            try {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('password', password);
                formData.append('mode', mode);

                const response = await fetch('/api/process', {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();

                if (data.success) {
                    // KIỂM TRA ĐÍCH LƯU FILE ĐỂ QUYẾT ĐỊNH CÓ TẢI VỀ HAY KHÔNG
                    if (data.savedToUSB) {
                        // Nếu đã lưu vào USB -> Không cho tải về máy Windows, chỉ hiện thông báo
                        this.showNotification(
                            `Thành công! File đã được lưu an toàn trực tiếp vào ổ USB.`,
                            'success'
                        );
                    } else {
                        // Nếu không có USB (Fallback lưu tạm trên Server) -> Mới tải về trình duyệt
                        const blob = await fetch(data.downloadUrl).then(r => r.blob());
                        this.downloadFile(blob, data.filename);
                        this.showNotification(
                            `${mode === 'encrypt' ? 'Mã hóa' : 'Giải mã'} thành công! Đang tải về...`,
                            'success'
                        );
                    }

                    // Update stats
                    if (mode === 'encrypt') {
                        this.stats.encrypted++;
                    } else {
                        this.stats.decrypted++;
                    }
                    this.stats.totalSize += file.size;
                    this.updateStats();

                    // Clear form
                    if (mode === 'encrypt') {
                        this.clearFile('encrypt');
                        document.getElementById('passwordEnc').value = '';
                    } else {
                        this.clearFile('decrypt');
                        document.getElementById('passwordDec').value = '';
                    }
                } else {
                    this.showNotification(data.message || 'Lỗi xử lý file!', 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                this.showNotification(`Lỗi: ${error.message}`, 'error');
            } finally {
                this.showProgress(false);
            }
        }

        downloadFile(blob, filename) {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        }

        showProgress(show, text = 'Đang xử lý...') {
            const container = document.getElementById('progressContainer');
            if (show) {
                container.classList.remove('hidden');
                document.getElementById('progressText').textContent = text;
            } else {
                container.classList.add('hidden');
            }
        }

        showNotification(message, type = 'info') {
            const notification = document.getElementById('notification');
            notification.textContent = message;
            notification.className = `notification ${type} show`;
            notification.style.display = 'block';

            setTimeout(() => {
                notification.classList.remove('show');
                notification.style.display = 'none';
            }, 4000);
        }

        loadSavedPassword() {
            const saved = localStorage.getItem('aes_password');
            if (saved) {
                document.getElementById('passwordEnc').value = saved;
                this.checkPasswordStrength(saved);
            }
        }

        updateStats() {
            document.getElementById('statsEncrypted').textContent = this.stats.encrypted;
            document.getElementById('statsDecrypted').textContent = this.stats.decrypted;
            document.getElementById('statsSize').textContent =
                (this.stats.totalSize / (1024 * 1024)).toFixed(2);

            const uptime = Math.floor((Date.now() - this.stats.startTime) / 1000);
            const hours = Math.floor(uptime / 3600);
            const minutes = Math.floor((uptime % 3600) / 60);
            const seconds = uptime % 60;
            document.getElementById('statsUptime').textContent =
                `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

            if (uptime === 0) {
                setInterval(() => this.updateStats(), 1000);
            }
        }

        // Initialize app when DOM is ready
        document.addEventListener('DOMContentLoaded', () => {
            window.app = new FileEncryptionApp();
        });