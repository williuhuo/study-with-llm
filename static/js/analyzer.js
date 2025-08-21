// PDF/PPT 分析器页面逻辑
(function () {
  // DOM 元素
  const fileInput = document.getElementById('file-input');
  const uploadArea = document.getElementById('file-upload-area');
  const filePreview = document.getElementById('file-preview');
  const fileName = document.getElementById('file-name');
  const fileSize = document.getElementById('file-size');
  const fileContent = document.getElementById('file-content');
  const analyzeBtn = document.getElementById('analyze-btn');
  const analysisWaiting = document.getElementById('analysis-waiting');
  const analysisProgress = document.getElementById('analysis-progress');
  const analysisResult = document.getElementById('analysis-result');
  const progressFill = document.getElementById('progress-fill');
  const progressText = document.getElementById('progress-text');
  const progressPercentage = document.getElementById('progress-percentage');
  const markdownContent = document.getElementById('markdown-content');
  const chatPanel = document.getElementById('chat-panel');
  const toggleChatBtn = document.getElementById('toggle-chat');

  // 聊天相关元素
  const chatLog = document.getElementById('analyzer-chat-log');
  const chatForm = document.getElementById('analyzer-chat-form');
  const chatInput = document.getElementById('analyzer-chat-input');

  let currentFile = null;
  let analysisData = null;

  // 工具函数
  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  function nowTime() {
    const d = new Date();
    const pad = (n) => (n < 10 ? "0" + n : "" + n);
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) +
           " " + pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds());
  }

  // 聊天功能
  function appendChatBubble(role, text, time) {
    const wrap = document.createElement("div");
    const bubble = document.createElement("div");
    bubble.className = "bubble " + (role === "user" ? "bubble-user" : "bubble-bot");
    bubble.textContent = text;

    const meta = document.createElement("div");
    meta.className = "meta";
    meta.textContent = (role === "user" ? "我" : "AI助手") + " · " + (time || nowTime());

    wrap.appendChild(bubble);
    wrap.appendChild(meta);
    chatLog.appendChild(wrap);
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  // 文件上传处理
  function handleFileSelect(file) {
    if (!file) return;
    
    // 检查文件类型
    const allowedTypes = ['application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|ppt|pptx)$/i)) {
      alert('请选择 PDF 或 PPT 文件');
      return;
    }

    currentFile = file;
    
    // 显示文件信息
    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);
    
    // 隐藏上传区域，显示预览
    uploadArea.style.display = 'none';
    filePreview.style.display = 'block';
    
    // 显示分析按钮
    analyzeBtn.style.display = 'inline-block';
    analysisWaiting.innerHTML = '<p>文件已上传，点击"开始分析"按钮</p>';
    
    // 简单的文件预览（这里可以后续扩展为真正的PDF/PPT预览）
    fileContent.innerHTML = `
      <div class="file-placeholder">
        <div class="file-icon">${file.type.includes('pdf') ? '📄' : '📊'}</div>
        <p>${file.name}</p>
        <p>${formatFileSize(file.size)}</p>
      </div>
    `;
  }

  // 进度更新函数
  function updateProgress(percentage, text) {
    progressFill.style.width = percentage + '%';
    progressPercentage.textContent = percentage + '%';
    progressText.textContent = text;
  }

  // 模拟分析进度（实际项目中这应该通过WebSocket或轮询获取真实进度）
  function simulateProgress() {
    const steps = [
      { percent: 10, text: '正在上传文件...' },
      { percent: 25, text: '解析文档结构...' },
      { percent: 45, text: '提取文本内容...' },
      { percent: 65, text: 'AI分析中...' },
      { percent: 85, text: '生成翻译...' },
      { percent: 95, text: '整理结果...' },
      { percent: 100, text: '分析完成！' }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        updateProgress(steps[currentStep].percent, steps[currentStep].text);
        currentStep++;
      } else {
        clearInterval(interval);
        // 分析完成，显示结果
        setTimeout(() => {
          analysisProgress.style.display = 'none';
          analysisResult.style.display = 'block';
          chatPanel.style.display = 'block';
          initializeResizers(); // 重新初始化拖拽调整
        }, 500);
      }
    }, 800);
  }

  // 分析文件
  async function analyzeFile() {
    if (!currentFile) return;

    // 隐藏等待区域，显示进度条
    analysisWaiting.style.display = 'none';
    analysisProgress.style.display = 'block';
    analyzeBtn.style.display = 'none';

    try {
      // 创建FormData
      const formData = new FormData();
      formData.append('file', currentFile);

      // 开始模拟进度
      simulateProgress();

      // 调用后端分析接口
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (response.ok) {
        analysisData = result;
        // 渲染Markdown内容
        markdownContent.innerHTML = `
          <div class="analysis-header">
            <h2>分析结果</h2>
            <p>文件：${currentFile.name}</p>
          </div>
          <div class="analysis-content">
            ${result.content || '分析结果将在这里显示...'}
          </div>
        `;
      } else {
        throw new Error(result.error || '分析失败');
      }
    } catch (error) {
      console.error('分析错误:', error);
      analysisProgress.style.display = 'none';
      analysisWaiting.style.display = 'block';
      analysisWaiting.innerHTML = `<p style="color: #ff6b6b;">分析失败: ${error.message}</p>`;
      analyzeBtn.style.display = 'inline-block';
    }
  }

  // 拖拽上传
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
  });

  uploadArea.addEventListener('dragleave', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
  });

  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  });

  // 文件选择
  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  });

  // 分析按钮
  analyzeBtn.addEventListener('click', analyzeFile);

  // 聊天功能
  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;

    appendChatBubble('user', text);
    chatInput.value = '';

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: text,
          context: analysisData ? `当前分析的文档：${currentFile.name}` : null
        })
      });
      
      const data = await response.json();
      appendChatBubble('bot', data.reply);
    } catch (error) {
      appendChatBubble('bot', '请求失败：' + error.message);
    }
  });

  // 切换聊天窗口
  toggleChatBtn.addEventListener('click', () => {
    const isVisible = chatPanel.style.display !== 'none';
    if (isVisible) {
      chatPanel.style.display = 'none';
      toggleChatBtn.textContent = '展开';
    } else {
      chatPanel.style.display = 'block';
      toggleChatBtn.textContent = '收起';
      initializeResizers();
    }
  });

  // 拖拽调整大小功能
  function initializeResizers() {
    const container = document.querySelector('.analyzer-container');
    const panels = container.querySelectorAll('.panel');
    const resizers = document.querySelectorAll('.resizer');
    
    // 根据显示的面板数量调整布局
    const visiblePanels = Array.from(panels).filter(panel => 
      window.getComputedStyle(panel).display !== 'none'
    );
    
    if (visiblePanels.length === 2) {
      container.style.gridTemplateColumns = '1fr 4px 1fr';
      resizers[0].style.display = 'block';
      resizers[1].style.display = 'none';
    } else if (visiblePanels.length === 3) {
      container.style.gridTemplateColumns = '1fr 4px 1fr 4px 300px';
      resizers[0].style.display = 'block';
      resizers[1].style.display = 'block';
    }

    // 实现拖拽调整逻辑（简化版）
    resizers.forEach((resizer, index) => {
      let isResizing = false;
      
      resizer.addEventListener('mousedown', (e) => {
        isResizing = true;
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
      });

      function handleMouseMove(e) {
        if (!isResizing) return;
        // 这里可以实现具体的拖拽调整逻辑
        // 为了简化，暂时省略具体实现
      }

      function handleMouseUp() {
        isResizing = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      }
    });
  }

  // 初始化
  initializeResizers();
})();