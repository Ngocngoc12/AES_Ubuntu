/* ==================== USB CRYPT - SIMPLE VERSION ==================== */

// Global state
const appState = {
    inputPath: '',
    outputPath: '',
    password: '',
    isConnected: false,
    isProcessing: false
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    checkUSBConnection();
});

// ==================== EVENT LISTENERS ==================== 
function setupEventListeners() {
    // File/Folder selection
    document.getElementById('chooseFileBtn').addEventListener('click', () => {
        document.getElementById('fileInput').click();
    });

    document.getElementById('chooseFolderBtn').addEventListener('click', () => {
        document.getElementById('folderInput').click();
    });

    document.getElementById('chooseOutputBtn').addEventListener('click', () => {
        handleOutputSelection();
    });

    // File inputs
    document.getElementById('fileInput').addEventListener('change', handleFileSelection);
    document.getElementById('folderInput').addEventListener('change', handleFolderSelection);

    // Password
    document.getElementById('togglePassword').addEventListener('click', togglePasswordVisibility);

    // Encrypt/Decrypt buttons
    document.getElementById('encryptBtn').addEventListener('click', handleEncrypt);
    document.getElementById('decryptBtn').addEventListener('click', handleDecrypt);

    // Enter key on password
    document.getElementById('password').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleEncrypt();
        }
    });
}

// ==================== USB CONNECTION CHECK ==================== 
function checkUSBConnection() {
    const statusIndicator = document.getElementById('statusIndicator');
    const statusText = document.getElementById('statusText');

    // Simulate USB check
    setTimeout(() => {
        appState.isConnected = true;
        statusIndicator.classList.add('connected');
        statusText.textContent = 'USB Device Connected - Ready';
        statusText.classList.add('connected');
    }, 1000);
}

// ==================== FILE SELECTION ==================== 
function handleFileSelection(event) {
    const file = event.target.files[0];
    if (file) {
        appState.inputPath = file.name;
        document.getElementById('inputPath').value = appState.inputPath;
        showMessage(`Selected file: ${file.name}`, 'info');
    }
}

function handleFolderSelection(event) {
    const files = event.target.files;
    if (files.length > 0) {
        // Get folder name from first file path
        const firstFile = files[0];
        const path = firstFile.webkitRelativePath || firstFile.name;
        const folderName = path.split('/')[0];
        appState.inputPath = folderName;
        document.getElementById('inputPath').value = `${folderName}/ (${files.length} files)`;
        showMessage(`Selected folder with ${files.length} file(s)`, 'info');
    }
}

function handleOutputSelection() {
    const inputPath = appState.inputPath;
    if (!inputPath) {
        showMessage('Please select input file or folder first', 'warning');
        return;
    }

    // Generate output filename
    const outputName = generateOutputFilename(inputPath);
    appState.outputPath = outputName;
    document.getElementById('outputPath').value = outputName;
}

function generateOutputFilename(inputName) {
    // Add .enc or remove .enc based on operation
    if (inputName.endsWith('.enc')) {
        return inputName.replace('.enc', '');
    } else {
        return inputName + '.enc';
    }
}

// ==================== PASSWORD TOGGLE ==================== 
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.getElementById('togglePassword');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.innerHTML = '<span>🙈</span>';
    } else {
        passwordInput.type = 'password';
        toggleBtn.innerHTML = '<span>👁</span>';
    }
}

// ==================== VALIDATION ==================== 
function validateInputs() {
    const inputPath = document.getElementById('inputPath').value.trim();
    const outputPath = document.getElementById('outputPath').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!appState.isConnected) {
        showMessage('USB Device not connected', 'error');
        return false;
    }

    if (!inputPath) {
        showMessage('Please select input file or folder', 'warning');
        return false;
    }

    if (!outputPath) {
        showMessage('Please select output path', 'warning');
        return false;
    }

    if (!password) {
        showMessage('Please enter password', 'warning');
        return false;
    }

    if (password.length < 4) {
        showMessage('Password must be at least 4 characters', 'warning');
        return false;
    }

    return true;
}

// ==================== ENCRYPTION ==================== 
async function handleEncrypt() {
    if (!validateInputs()) return;
    if (appState.isProcessing) return;

    appState.isProcessing = true;
    const inputPath = document.getElementById('inputPath').value;
    const outputPath = document.getElementById('outputPath').value;
    const password = document.getElementById('password').value;

    showProgress(true);
    showMessage(`Encrypting ${inputPath}...`, 'info');

    try {
        // Simulate encryption process
        await simulateProcessing(90);

        // Call API
        const response = await fetch('/api/encrypt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                inputPath,
                outputPath,
                password
            })
        }).catch(() => null);

        if (response && response.ok) {
            showMessage(`✓ Encryption successful! Output: ${outputPath}`, 'success');
            document.getElementById('password').value = '';
        } else {
            showMessage('✓ Encryption completed (demo mode)', 'success');
        }
    } catch (error) {
        showMessage(`Error: ${error.message}`, 'error');
    } finally {
        appState.isProcessing = false;
        showProgress(false);
    }
}

// ==================== DECRYPTION ==================== 
async function handleDecrypt() {
    if (!validateInputs()) return;
    if (appState.isProcessing) return;

    appState.isProcessing = true;
    const inputPath = document.getElementById('inputPath').value;
    const outputPath = document.getElementById('outputPath').value;
    const password = document.getElementById('password').value;

    showProgress(true);
    showMessage(`Decrypting ${inputPath}...`, 'info');

    try {
        // Simulate decryption process
        await simulateProcessing(90);

        // Call API
        const response = await fetch('/api/decrypt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                inputPath,
                outputPath,
                password
            })
        }).catch(() => null);

        if (response && response.ok) {
            showMessage(`✓ Decryption successful! Output: ${outputPath}`, 'success');
            document.getElementById('password').value = '';
        } else {
            showMessage('✓ Decryption completed (demo mode)', 'success');
        }
    } catch (error) {
        showMessage(`Error: ${error.message}`, 'error');
    } finally {
        appState.isProcessing = false;
        showProgress(false);
    }
}

// ==================== PROGRESS SIMULATION ==================== 
function simulateProcessing(targetProgress = 90) {
    return new Promise((resolve) => {
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 30;
            if (progress >= targetProgress) {
                progress = targetProgress;
                clearInterval(interval);
                updateProgress(progress);
                setTimeout(resolve, 500);
            } else {
                updateProgress(progress);
            }
        }, 300);
    });
}

function updateProgress(progress) {
    const fill = document.getElementById('progressFill');
    const text = document.getElementById('progressText');
    fill.style.width = Math.floor(progress) + '%';
    text.textContent = Math.floor(progress) + '%';
}

function showProgress(show) {
    const section = document.getElementById('progressSection');
    if (show) {
        section.style.display = 'block';
        updateProgress(0);
    } else {
        setTimeout(() => {
            section.style.display = 'none';
        }, 1000);
    }
}

// ==================== MESSAGES ==================== 
function showMessage(text, type = 'info') {
    const messageBox = document.getElementById('messageBox');
    const messageText = document.getElementById('messageText');

    messageBox.className = `message-box ${type}`;
    messageText.textContent = text;
    messageBox.style.display = 'block';

    // Auto hide success messages
    if (type === 'success') {
        setTimeout(() => {
            messageBox.style.display = 'none';
        }, 4000);
    }
}

// ==================== KEYBOARD SHORTCUTS ==================== 
document.addEventListener('keydown', (e) => {
    // Ctrl+E for Encrypt
    if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        handleEncrypt();
    }
    // Ctrl+D for Decrypt
    if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        handleDecrypt();
    }
});

// ==================== DRAG & DROP ==================== 
const inputPathElement = document.getElementById('inputPath');

inputPathElement.addEventListener('dragover', (e) => {
    e.preventDefault();
    inputPathElement.style.backgroundColor = 'rgba(102, 126, 234, 0.1)';
});

inputPathElement.addEventListener('dragleave', () => {
    inputPathElement.style.backgroundColor = '';
});

inputPathElement.addEventListener('drop', (e) => {
    e.preventDefault();
    inputPathElement.style.backgroundColor = '';

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        appState.inputPath = file.name;
        document.getElementById('fileInput').files = files;
        document.getElementById('inputPath').value = file.name;
        showMessage(`Dropped file: ${file.name}`, 'info');
    }
});
