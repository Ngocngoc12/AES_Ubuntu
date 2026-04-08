/* ==================== AES ENCRYPTION MANAGER PRO - APP ==================== */

// Global state
const appState = {
    currentPage: 'dashboard',
    currentDevice: null,
    devices: [],
    files: [],
    operations: [],
    backupHistory: []
};

// Initialize app on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    loadDashboard();
});

// ==================== INITIALIZATION ==================== 
function initializeApp() {
    // Load theme preference
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);

    // Load language preference
    const savedLanguage = localStorage.getItem('language') || 'vi';

    // Fetch system info
    fetchSystemInfo();

    // Auto-refresh devices every 5 seconds
    setInterval(refreshDevices, 5000);
}

function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            switchPage(page);
        });
    });

    // Theme toggle
    document.querySelectorAll('input[name="theme"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            applyTheme(e.target.value);
            localStorage.setItem('theme', e.target.value);
        });
    });

    // Encryption buttons
    document.getElementById('encryptBtn').addEventListener('click', handleEncrypt);
    document.getElementById('decryptBtn').addEventListener('click', handleDecrypt);

    // Backup buttons
    document.getElementById('backupBtn').addEventListener('click', handleBackup);
    document.getElementById('restoreBtn').addEventListener('click', handleRestore);

    // File manager
    document.getElementById('uploadFileBtn').addEventListener('click', () => {
        document.getElementById('fileInput').click();
    });

    document.getElementById('fileInput').addEventListener('change', handleFileUpload);
    document.getElementById('refreshDevices').addEventListener('click', refreshDevices);
}

// ==================== PAGE NAVIGATION ==================== 
function switchPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
        page.classList.add('hidden');
    });

    // Remove active from nav
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    // Show selected page
    const pageElement = document.getElementById(`${pageName}-page`);
    if (pageElement) {
        pageElement.classList.add('active');
        pageElement.classList.remove('hidden');
    }

    // Mark nav item as active
    const navItem = document.querySelector(`[data-page="${pageName}"]`);
    if (navItem) {
        navItem.classList.add('active');
    }

    appState.currentPage = pageName;

    // Load page-specific data
    if (pageName === 'devices') {
        refreshDevices();
    } else if (pageName === 'files') {
        refreshFileManager();
    } else if (pageName === 'backup') {
        refreshBackupPage();
    }
}

// ==================== DASHBOARD ==================== 
function loadDashboard() {
    // Initialize with default values
    updateDashboardStats();
    addActivity('Hệ thống khởi động thành công', 'success');
}

function updateDashboardStats() {
    // Update device count
    document.getElementById('deviceCount').textContent = appState.devices.length;

    // Update storage info (mock data)
    document.getElementById('totalStorage').textContent = '256 GB';
    document.getElementById('usedStorage').textContent = '128 GB';
    document.getElementById('freeStorage').textContent = '128 GB';
    document.getElementById('storageProgress').style.width = '50%';

    // Update file stats
    const encryptedCount = Math.floor(Math.random() * 50);
    const normalCount = Math.floor(Math.random() * 100);
    document.getElementById('encryptedCount').textContent = encryptedCount;
    document.getElementById('normalCount').textContent = normalCount;
    document.getElementById('totalFiles').textContent = encryptedCount + normalCount;
}

function addActivity(text, type = 'info') {
    const now = new Date();
    const time = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    const activityLog = document.getElementById('activityLog');
    const newEntry = document.createElement('li');
    newEntry.className = 'activity-item';
    newEntry.innerHTML = `
        <span class="activity-time">${time}</span>
        <span class="activity-text">${text}</span>
    `;

    activityLog.insertBefore(newEntry, activityLog.firstChild);

    // Keep only last 10 activities
    const items = activityLog.querySelectorAll('.activity-item');
    if (items.length > 10) {
        items[items.length - 1].remove();
    }
}

// ==================== SYSTEM INFO ==================== 
function fetchSystemInfo() {
    // Mock API call to get system info
    setTimeout(() => {
        appState.devices = [
            { id: 1, name: 'USB Device 1', mount: '/mnt/usb1', size: '64 GB', used: '32 GB' },
            { id: 2, name: 'USB Device 2', mount: '/mnt/usb2', size: '32 GB', used: '16 GB' }
        ];
        updateDevicesList();
    }, 500);
}

function refreshDevices() {
    // Simulate device refresh
    fetchSystemInfo();
    addActivity('Làm mới danh sách thiết bị', 'info');
    showNotification('Danh sách USB đã được cập nhật', 'success', 'Refresh Devices');
}

function updateDevicesList() {
    const devicesList = document.getElementById('devicesList');
    devicesList.innerHTML = '';

    appState.devices.forEach(device => {
        const item = document.createElement('div');
        item.className = 'device-item';
        item.innerHTML = `
            <i class="fas fa-usb"></i>
            <span>${device.name} (${device.size})</span>
        `;
        devicesList.appendChild(item);
    });
}

// ==================== DEVICES PAGE ==================== 
function refreshFileManager() {
    const deviceSelect = document.getElementById('deviceSelect');
    const backupDevice = document.getElementById('backupDevice');
    const restoreDevice = document.getElementById('restoreDevice');

    deviceSelect.innerHTML = '<option>Chọn USB Device</option>';
    backupDevice.innerHTML = '<option>Chọn device để backup</option>';
    restoreDevice.innerHTML = '<option>Chọn USB device đích</option>';

    appState.devices.forEach(device => {
        const option = document.createElement('option');
        option.value = device.id;
        option.textContent = `${device.name} (${device.size})`;

        deviceSelect.appendChild(option.cloneNode(true));
        backupDevice.appendChild(option.cloneNode(true));
        restoreDevice.appendChild(option.cloneNode(true));
    });
}

function displayDevices() {
    const container = document.getElementById('usbDevicesList');

    if (appState.devices.length === 0) {
        container.innerHTML = '<div class="device-card empty"><p>Không tìm thấy thiết bị USB. Vui lòng cắm USB vào.</p></div>';
        return;
    }

    container.innerHTML = appState.devices.map(device => `
        <div class="device-card" onclick="selectDevice(${device.id})">
            <div class="device-icon">
                <i class="fas fa-usb"></i>
            </div>
            <div class="device-name">${device.name}</div>
            <div class="device-info">Mount: ${device.mount}</div>
            <div class="device-info">Dung lượng: ${device.size}</div>
            <div class="device-info">Đã sử dụng: ${device.used}</div>
            <div class="device-status"><i class="fas fa-check-circle"></i> Sẵn sàng</div>
        </div>
    `).join('');
}

function selectDevice(deviceId) {
    const device = appState.devices.find(d => d.id === deviceId);
    if (device) {
        appState.currentDevice = device;
        switchPage('files');
        displayFiles();
    }
}

// ==================== FILE MANAGER ==================== 
function refreshFileManager() {
    displayDevices();
}

function displayFiles() {
    if (!appState.currentDevice) {
        document.getElementById('fileListContainer').innerHTML = '<div class="empty-message">Chọn USB device để xem file</div>';
        return;
    }

    // Mock files list
    const mockFiles = [
        { name: 'document.pdf', size: '2.5 MB', type: 'PDF', date: '2024-04-07', encrypted: false },
        { name: 'image.jpg.enc', size: '1.2 MB', type: 'JPG (Encrypted)', date: '2024-04-07', encrypted: true },
        { name: 'data.xlsx', size: '512 KB', type: 'Excel', date: '2024-04-06', encrypted: false },
        { name: 'video.mp4.enc', size: '850 MB', type: 'Video (Encrypted)', date: '2024-04-05', encrypted: true }
    ];

    const container = document.getElementById('fileListContainer');
    container.innerHTML = mockFiles.map((file, index) => `
        <div class="file-row">
            <div class="file-name">
                <div class="file-icon" style="background-color: ${file.encrypted ? '#dc3545' : '#007bff'}">
                    ${file.encrypted ? '<i class="fas fa-lock"></i>' : '<i class="fas fa-file"></i>'}
                </div>
                <span>${file.name}</span>
            </div>
            <span>${file.size}</span>
            <span>${file.type}</span>
            <span>${file.date}</span>
            <div class="file-actions">
                <button class="file-action-btn" title="Download" onclick="downloadFile(${index})">
                    <i class="fas fa-download"></i>
                </button>
                <button class="file-action-btn" title="Delete" onclick="deleteFile(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function handleFileUpload(event) {
    const files = event.target.files;
    if (files.length > 0) {
        const fileNames = Array.from(files).map(f => f.name).join(', ');
        showNotification(`Đã upload: ${fileNames}`, 'success', 'Upload Files');
        addActivity(`Upload ${files.length} file(s) lên USB`, 'upload');

        // Simulate upload progress
        displayFileUploadProgress();
    }
}

function displayFileUploadProgress() {
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            displayFiles();
        }
    }, 500);
}

function downloadFile(fileIndex) {
    showNotification('Bắt đầu tải xuống file', 'info', 'Download');
}

function deleteFile(fileIndex) {
    showConfirmModal('Xóa file', 'Bạn chắc chắn muốn xóa file này? Hành động này không thể hoàn tác.', () => {
        showNotification('File đã được xóa', 'success', 'Delete File');
    });
}

// ==================== ENCRYPTION/DECRYPTION ==================== 
function handleEncrypt() {
    const fileInput = document.getElementById('encryptFileInput');
    const password = document.getElementById('encryptPassword').value;
    const password2 = document.getElementById('encryptPassword2').value;

    if (!fileInput.files.length) {
        showNotification('Vui lòng chọn file để mã hóa', 'warning', 'Validation Error');
        return;
    }

    if (!password || !password2) {
        showNotification('Vui lòng nhập mật khẩu', 'warning', 'Validation Error');
        return;
    }

    if (password !== password2) {
        showNotification('Mật khẩu không khớp', 'error', 'Validation Error');
        return;
    }

    if (!validatePassword(password)) {
        showNotification('Mật khẩu phải có ít nhất 8 ký tự và chứa chữ hoa, số', 'warning', 'Password Requirement');
        return;
    }

    simulateEncryptionProcess(fileInput.files[0], password, true);
}

function handleDecrypt() {
    const fileInput = document.getElementById('decryptFileInput');
    const password = document.getElementById('decryptPassword').value;

    if (!fileInput.files.length) {
        showNotification('Vui lòng chọn file mã hóa', 'warning', 'Validation Error');
        return;
    }

    if (!password) {
        showNotification('Vui lòng nhập mật khẩu', 'warning', 'Validation Error');
        return;
    }

    simulateEncryptionProcess(fileInput.files[0], password, false);
}

function validatePassword(password) {
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
}

function simulateEncryptionProcess(file, password, isEncrypt) {
    const progressContainer = isEncrypt ?
        document.getElementById('encryptProgress') :
        document.getElementById('decryptProgress');
    const progressBar = isEncrypt ?
        document.getElementById('encryptProgressBar') :
        document.getElementById('decryptProgressBar');
    const progressText = isEncrypt ?
        document.getElementById('encryptProgressText') :
        document.getElementById('decryptProgressText');

    progressContainer.style.display = 'block';
    let progress = 0;

    const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);

            progressBar.style.width = '100%';
            progressText.textContent = '100%';

            const operation = isEncrypt ? 'Mã hóa' : 'Giải mã';
            const type = isEncrypt ? 'Encrypt' : 'Decrypt';
            showNotification(`${operation} thành công: ${file.name}`, 'success', operation);
            addActivity(`${operation} file: ${file.name}`, 'success');
            addOperationHistory(file.name, type, file.size);

            // Reset after 2 seconds
            setTimeout(() => {
                progressContainer.style.display = 'none';
                progressBar.style.width = '0%';
                progressText.textContent = '0%';
                document.getElementById(isEncrypt ? 'encryptFileInput' : 'decryptFileInput').value = '';
            }, 2000);
        } else {
            progressBar.style.width = progress + '%';
            progressText.textContent = Math.floor(progress) + '%';
        }
    }, 300);
}

function addOperationHistory(filename, type, size) {
    const tbody = document.getElementById('operationsBody');

    // Remove empty message if exists
    const emptyMsg = tbody.querySelector('.text-center');
    if (emptyMsg) emptyMsg.remove();

    const tr = document.createElement('tr');
    const now = new Date();
    const time = now.toLocaleString('vi-VN');
    const fileSize = typeof size === 'number' ? (size / 1024 / 1024).toFixed(2) + ' MB' : size;

    tr.innerHTML = `
        <td>${filename}</td>
        <td>${type}</td>
        <td>${fileSize}</td>
        <td>${time}</td>
        <td><span style="background: #d4edda; color: #155724; padding: 0.25rem 0.75rem; border-radius: 12px;">Thành công</span></td>
    `;

    tbody.insertBefore(tr, tbody.firstChild);

    // Keep only latest 10 operations
    const rows = tbody.querySelectorAll('tr');
    for (let i = 10; i < rows.length; i++) {
        rows[i].remove();
    }
}

// ==================== BACKUP & RESTORE ==================== 
function refreshBackupPage() {
    const backupDevice = document.getElementById('backupDevice');
    const restoreDevice = document.getElementById('restoreDevice');

    backupDevice.innerHTML = '<option>Chọn device để backup</option>';
    restoreDevice.innerHTML = '<option>Chọn USB device đích</option>';

    appState.devices.forEach(device => {
        const option = document.createElement('option');
        option.value = device.id;
        option.textContent = `${device.name} (${device.size})`;

        backupDevice.appendChild(option.cloneNode(true));
        restoreDevice.appendChild(option.cloneNode(true));
    });
}

function handleBackup() {
    const deviceId = document.getElementById('backupDevice').value;
    const backupName = document.getElementById('backupName').value;
    const mode = document.querySelector('input[name="backupMode"]:checked').value;

    if (!deviceId || deviceId === 'Chọn device để backup') {
        showNotification('Vui lòng chọn device', 'warning', 'Validation Error');
        return;
    }

    if (!backupName) {
        showNotification('Vui lòng nhập tên backup', 'warning', 'Validation Error');
        return;
    }

    simulateBackupProcess(backupName, mode);
}

function simulateBackupProcess(backupName, mode) {
    const progressContainer = document.getElementById('backupProgress');
    const progressBar = document.getElementById('backupProgressBar');
    const progressText = document.getElementById('backupProgressText');

    progressContainer.style.display = 'block';
    let progress = 0;

    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);

            progressBar.style.width = '100%';
            progressText.textContent = '100%';

            showNotification('Backup thành công!', 'success', 'Backup Complete');
            addActivity(`Tạo backup: ${backupName}`, 'success');
            addBackupHistory(backupName, '512 MB', mode);

            setTimeout(() => {
                progressContainer.style.display = 'none';
                progressBar.style.width = '0%';
                progressText.textContent = '0%';
                document.getElementById('backupName').value = '';
            }, 2000);
        } else {
            progressBar.style.width = progress + '%';
            progressText.textContent = Math.floor(progress) + '%';
        }
    }, 300);
}

function handleRestore() {
    const backupFile = document.getElementById('backupFile').files[0];
    const deviceId = document.getElementById('restoreDevice').value;

    if (!backupFile) {
        showNotification('Vui lòng chọn file backup', 'warning', 'Validation Error');
        return;
    }

    if (!deviceId || deviceId === 'Chọn USB device đích') {
        showNotification('Vui lòng chọn device đích', 'warning', 'Validation Error');
        return;
    }

    simulateRestoreProcess(backupFile.name);
}

function simulateRestoreProcess(backupName) {
    const progressContainer = document.getElementById('restoreProgress');
    const progressBar = document.getElementById('restoreProgressBar');
    const progressText = document.getElementById('restoreProgressText');

    progressContainer.style.display = 'block';
    let progress = 0;

    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);

            progressBar.style.width = '100%';
            progressText.textContent = '100%';

            showNotification('Restore thành công!', 'success', 'Restore Complete');
            addActivity(`Restore từ backup: ${backupName}`, 'success');

            setTimeout(() => {
                progressContainer.style.display = 'none';
                progressBar.style.width = '0%';
                progressText.textContent = '0%';
                document.getElementById('backupFile').value = '';
            }, 2000);
        } else {
            progressBar.style.width = progress + '%';
            progressText.textContent = Math.floor(progress) + '%';
        }
    }, 300);
}

function addBackupHistory(name, size, type) {
    const tbody = document.getElementById('backupHistoryBody');

    // Remove empty message if exists
    const emptyMsg = tbody.querySelector('.text-center');
    if (emptyMsg) emptyMsg.remove();

    const tr = document.createElement('tr');
    const now = new Date();
    const date = now.toLocaleString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });

    tr.innerHTML = `
        <td>${name}</td>
        <td>${size}</td>
        <td>${date}</td>
        <td><span style="background: #cfe2ff; color: #084298; padding: 0.25rem 0.75rem; border-radius: 12px;">${type === 'full' ? 'Full' : 'Encrypted only'}</span></td>
        <td>
            <button class="file-action-btn" title="Restore" onclick="showNotification('Restore function', 'info')">
                <i class="fas fa-undo"></i>
            </button>
            <button class="file-action-btn" title="Delete" onclick="showNotification('Delete function', 'info')">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;

    tbody.insertBefore(tr, tbody.firstChild);

    // Keep only latest 10 backups
    const rows = tbody.querySelectorAll('tr');
    for (let i = 10; i < rows.length; i++) {
        rows[i].remove();
    }
}

// ==================== NOTIFICATIONS ==================== 
function showNotification(message, type = 'info', title = '') {
    const container = document.getElementById('notificationContainer');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;

    const icons = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        warning: 'fa-exclamation-circle',
        info: 'fa-info-circle'
    };

    notification.innerHTML = `
        <div class="notification-icon">
            <i class="fas ${icons[type]}"></i>
        </div>
        <div class="notification-content">
            ${title ? `<div class="notification-title">${title}</div>` : ''}
            <div class="notification-message">${message}</div>
        </div>
    `;

    container.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.classList.add('removing');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

function showConfirmModal(title, message, onConfirm) {
    const modal = document.getElementById('confirmModal');
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMessage').textContent = message;

    const confirmBtn = document.getElementById('confirmBtn');
    confirmBtn.onclick = () => {
        onConfirm();
        closeModal('confirmModal');
    };

    modal.classList.remove('hidden');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

// ==================== THEME ==================== 
function applyTheme(theme) {
    document.body.setAttribute('data-theme', theme);

    if (theme === 'dark') {
        document.querySelector('input[value="dark"]').checked = true;
    } else {
        document.querySelector('input[value="light"]').checked = true;
    }
}

// ==================== UTILS ==================== 
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Load initial page
window.addEventListener('load', () => {
    switchPage('dashboard');
});
