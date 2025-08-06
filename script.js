// QR Code 生成器 JavaScript

class QRCodeGenerator {
    constructor() {
        this.canvas = null;
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        this.textInput = document.getElementById('text-input');
        this.sizeSelect = document.getElementById('size-select');
        this.colorInput = document.getElementById('color-input');
        this.bgColorInput = document.getElementById('bg-color-input');
        this.generateBtn = document.getElementById('generate-btn');
        this.qrContainer = document.getElementById('qr-container');
        this.downloadSection = document.getElementById('download-section');
        this.downloadBtn = document.getElementById('download-btn');
    }

    bindEvents() {
        this.generateBtn.addEventListener('click', () => this.generateQRCode());
        this.downloadBtn.addEventListener('click', () => this.downloadQRCode());
        
        // 支援 Enter 鍵生成
        this.textInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.generateQRCode();
            }
        });

        // 即時預覽（輸入停止後1秒自動生成）
        let timeoutId;
        this.textInput.addEventListener('input', () => {
            clearTimeout(timeoutId);
            if (this.textInput.value.trim()) {
                timeoutId = setTimeout(() => this.generateQRCode(), 1000);
            }
        });
    }

    async generateQRCode() {
        const text = this.textInput.value.trim();
        
        if (!text) {
            this.showMessage('請輸入要轉換的內容', 'error');
            return;
        }

        try {
            // 顯示載入狀態
            this.showLoading();

            // 清除之前的 QR Code
            this.clearQRContainer();

            // 建立 canvas 元素
            this.canvas = document.createElement('canvas');
            
            // 取得設定值
            const size = parseInt(this.sizeSelect.value);
            const color = this.colorInput.value;
            const backgroundColor = this.bgColorInput.value;

            // 生成 QR Code
            await QRCode.toCanvas(this.canvas, text, {
                width: size,
                height: size,
                color: {
                    dark: color,
                    light: backgroundColor
                },
                errorCorrectionLevel: 'M',
                margin: 1
            });

            // 顯示 QR Code
            this.qrContainer.appendChild(this.canvas);
            this.downloadSection.style.display = 'block';
            
            this.hideLoading();
            this.showMessage('QR Code 生成成功！', 'success');

        } catch (error) {
            console.error('生成 QR Code 時發生錯誤:', error);
            this.hideLoading();
            this.showMessage('生成 QR Code 時發生錯誤，請檢查輸入內容', 'error');
        }
    }

    downloadQRCode() {
        if (!this.canvas) {
            this.showMessage('請先生成 QR Code', 'error');
            return;
        }

        try {
            // 建立下載連結
            const link = document.createElement('a');
            link.download = `qrcode_${Date.now()}.png`;
            link.href = this.canvas.toDataURL('image/png');
            
            // 觸發下載
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            this.showMessage('QR Code 已下載！', 'success');
        } catch (error) {
            console.error('下載 QR Code 時發生錯誤:', error);
            this.showMessage('下載失敗，請重試', 'error');
        }
    }

    clearQRContainer() {
        // 移除所有 canvas 元素
        const canvases = this.qrContainer.querySelectorAll('canvas');
        canvases.forEach(canvas => canvas.remove());
        
        // 隱藏下載區域
        this.downloadSection.style.display = 'none';
        
        // 顯示預設提示
        if (!this.qrContainer.querySelector('.placeholder')) {
            const placeholder = document.createElement('div');
            placeholder.className = 'placeholder';
            placeholder.innerHTML = '<p>📱 QR Code 將顯示在這裡</p>';
            this.qrContainer.appendChild(placeholder);
        }
    }

    showLoading() {
        this.generateBtn.disabled = true;
        this.generateBtn.innerHTML = '<span class="loading"></span>生成中...';
    }

    hideLoading() {
        this.generateBtn.disabled = false;
        this.generateBtn.innerHTML = '生成 QR Code';
    }

    showMessage(message, type = 'info') {
        // 移除舊的訊息
        const existingMessage = document.querySelector('.message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // 建立新訊息
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        messageDiv.textContent = message;

        // 插入到輸入區域的頂部
        const inputSection = document.querySelector('.input-section');
        inputSection.insertBefore(messageDiv, inputSection.firstChild);

        // 3秒後自動移除
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 3000);
    }
}

// QR Code 範例預設值
const examples = [
    'https://www.google.com',
    'Hello World!',
    'https://github.com',
    '這是一個中文 QR Code 測試',
    'mailto:example@email.com',
    'tel:+886-912-345-678'
];

// 頁面載入完成後初始化
document.addEventListener('DOMContentLoaded', () => {
    const qrGenerator = new QRCodeGenerator();
    
    // 隨機顯示範例文字作為預設值
    const randomExample = examples[Math.floor(Math.random() * examples.length)];
    document.getElementById('text-input').placeholder += `\n\n範例：${randomExample}`;
    
    // 檢查是否支援 QRCode 庫
    if (typeof QRCode === 'undefined') {
        console.error('QRCode 庫載入失敗');
        qrGenerator.showMessage('QRCode 庫載入失敗，請檢查網路連線', 'error');
    }
});

// 支援拖放文字檔案
document.addEventListener('DOMContentLoaded', () => {
    const textInput = document.getElementById('text-input');
    
    // 防止預設的拖放行為
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        textInput.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    // 拖放效果
    ['dragenter', 'dragover'].forEach(eventName => {
        textInput.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        textInput.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight(e) {
        textInput.style.borderColor = '#667eea';
        textInput.style.backgroundColor = '#f8f9ff';
    }
    
    function unhighlight(e) {
        textInput.style.borderColor = '#e0e0e0';
        textInput.style.backgroundColor = 'white';
    }
    
    // 處理檔案拖放
    textInput.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('text/')) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    textInput.value = e.target.result;
                };
                reader.readAsText(file);
            }
        }
    }
});