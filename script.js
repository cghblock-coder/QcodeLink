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
        this.urlDisplay = document.getElementById('url-display');
        this.urlText = document.getElementById('url-text');
        this.copyUrlBtn = document.getElementById('copy-url-btn');
        this.downloadSection = document.getElementById('download-section');
        this.downloadBtn = document.getElementById('download-btn');
        this.downloadComboBtn = document.getElementById('download-combo-btn');
    }

    bindEvents() {
        this.generateBtn.addEventListener('click', () => this.generateQRCode());
        this.downloadBtn.addEventListener('click', () => this.downloadQRCode());
        this.downloadComboBtn.addEventListener('click', () => this.downloadComboImage());
        this.copyUrlBtn.addEventListener('click', () => this.copyUrl());
        
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
            
            // 顯示網址內容
            this.displayUrl(text);
            
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

    displayUrl(text) {
        // 顯示網址內容
        this.urlText.textContent = text;
        this.urlDisplay.style.display = 'block';
        
        // 如果是網址，讓它可點擊
        if (this.isValidUrl(text)) {
            this.urlText.innerHTML = `<a href="${text}" target="_blank" rel="noopener noreferrer">${text}</a>`;
        }
    }
    
    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }
    
    async copyUrl() {
        try {
            await navigator.clipboard.writeText(this.textInput.value.trim());
            this.showMessage('網址已複製到剪貼簿！', 'success');
        } catch (error) {
            console.error('複製失敗:', error);
            this.showMessage('複製失敗，請手動複製', 'error');
        }
    }
    
    async downloadComboImage() {
        if (!this.canvas) {
            this.showMessage('請先生成 QR Code', 'error');
            return;
        }

        try {
            // 建立組合 canvas
            const comboCanvas = document.createElement('canvas');
            const ctx = comboCanvas.getContext('2d');
            
            const qrSize = this.canvas.width;
            const padding = 40;
            const textHeight = 80;
            
            comboCanvas.width = qrSize + (padding * 2);
            comboCanvas.height = qrSize + textHeight + (padding * 3);
            
            // 白色背景
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, comboCanvas.width, comboCanvas.height);
            
            // 繪製 QR Code
            ctx.drawImage(this.canvas, padding, padding);
            
            // 繪製網址文字
            ctx.fillStyle = '#333';
            ctx.font = '16px Arial, sans-serif';
            ctx.textAlign = 'center';
            
            const text = this.textInput.value.trim();
            const maxWidth = comboCanvas.width - (padding * 2);
            
            // 文字換行處理
            const words = text.split('');
            let line = '';
            let y = qrSize + padding + 30;
            
            for (let i = 0; i < words.length; i++) {
                const testLine = line + words[i];
                const metrics = ctx.measureText(testLine);
                
                if (metrics.width > maxWidth && i > 0) {
                    ctx.fillText(line, comboCanvas.width / 2, y);
                    line = words[i];
                    y += 20;
                } else {
                    line = testLine;
                }
            }
            ctx.fillText(line, comboCanvas.width / 2, y);
            
            // 下載組合圖片
            const link = document.createElement('a');
            link.download = `qrcode_combo_${Date.now()}.png`;
            link.href = comboCanvas.toDataURL('image/png');
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            this.showMessage('組合圖片已下載！', 'success');
        } catch (error) {
            console.error('下載組合圖片時發生錯誤:', error);
            this.showMessage('下載失敗，請重試', 'error');
        }
    }

    clearQRContainer() {
        // 移除所有 canvas 元素
        const canvases = this.qrContainer.querySelectorAll('canvas');
        canvases.forEach(canvas => canvas.remove());
        
        // 隱藏下載和網址區域
        this.downloadSection.style.display = 'none';
        this.urlDisplay.style.display = 'none';
        
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
    // 等待一秒確保所有腳本都載入完成
    setTimeout(() => {
        const qrGenerator = new QRCodeGenerator();
        
        // 隨機顯示範例文字作為預設值
        const randomExample = examples[Math.floor(Math.random() * examples.length)];
        const textInput = document.getElementById('text-input');
        textInput.placeholder += `\n\n範例：${randomExample}`;
        
        // 檢查是否支援 QRCode 庫
        if (typeof QRCode === 'undefined') {
            console.error('QRCode 庫載入失敗');
            qrGenerator.showMessage('QRCode 庫載入失敗，請檢查網路連線並重新整理頁面', 'error');
            
            // 禁用生成按鈕
            const generateBtn = document.getElementById('generate-btn');
            generateBtn.disabled = true;
            generateBtn.textContent = '庫載入失敗';
        } else {
            console.log('QRCode 庫載入成功');
        }
    }, 1000);
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