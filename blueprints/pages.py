from datetime import datetime
from flask import Blueprint, render_template, request, jsonify
from src.LLM_client import LLMClient
from config import LLMConfig,ChatHistoryMax

bp = Blueprint("pages", __name__)
client = LLMClient(**LLMConfig["dmx"])

@bp.route("/")
def index():
    projects = [
        {"title": "ChatGPT", "slug": "chat", "desc": "带打字中提示/时间戳/本地保存。支持 /help、/sum、/upper、时间。"},
    ]
    return render_template("index.html", projects=projects)

@bp.route("/chat")
def chat():
    return render_template("chat.html")

@bp.route("/analyzer")
def analyzer():
    return render_template("analyzer.html")

# 文件分析接口
@bp.route("/api/analyze", methods=["POST"])
def api_analyze():
    """
    文件分析接口
    接收上传的文件，调用 analyze_file 函数进行分析
    """
    if 'file' not in request.files:
        return jsonify({"error": "没有上传文件"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "文件名为空"}), 400
    
    # 检查文件类型
    allowed_extensions = {'.pdf', '.ppt', '.pptx'}
    file_ext = '.' + file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else ''
    if file_ext not in allowed_extensions:
        return jsonify({"error": "不支持的文件类型"}), 400
    
    try:
        # 调用分析函数
        result = analyze_file(file)
        return jsonify({
            "success": True,
            "filename": file.filename,
            "content": result
        })
    except Exception as e:
        return jsonify({"error": f"分析失败: {str(e)}"}), 500

def analyze_file(file):
    """
    分析文件的函数 - 这里是你需要实现的核心逻辑
    
    参数:
        file: Flask 的 FileStorage 对象，包含以下属性：
            - file.filename: 文件名
            - file.content_type: MIME类型
            - file.read(): 读取文件内容（字节）
            - file.stream: 文件流对象
    
    返回:
        str: Markdown格式的分析结果
    """
    # 获取文件信息
    filename = file.filename
    content_type = file.content_type
    
    # 读取文件内容（注意：这会消耗文件流，如果需要多次读取需要先保存）
    # file_content = file.read()
    
    # 这里是示例实现，你需要根据实际需求替换
    # 可能的实现方向：
    # 1. 保存文件到临时目录
    # 2. 使用相应的库解析文件（如 PyPDF2, python-pptx 等）
    # 3. 调用 LLM 进行分析和翻译
    # 4. 返回 Markdown 格式的结果
    
    # 示例返回内容
    return f"""
# 文档分析结果

## 文件信息
- **文件名**: {filename}
- **类型**: {content_type}
- **状态**: 分析完成

## 内容摘要
这是一个示例分析结果。在实际实现中，这里应该包含：

1. **文档结构分析**
   - 页数/幻灯片数量
   - 章节结构
   - 主要内容类型

2. **内容提取**
   - 文本内容
   - 图表描述
   - 关键信息点

3. **AI翻译**
   - 中文翻译
   - 术语解释
   - 上下文说明

## 建议的实现步骤

```python
def analyze_file(file):
    # 1. 保存上传的文件
    import tempfile
    import os
    
    with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as tmp_file:
        file.save(tmp_file.name)
        file_path = tmp_file.name
    
    try:
        # 2. 根据文件类型选择解析方法
        if file.filename.lower().endswith('.pdf'):
            content = parse_pdf(file_path)
        elif file.filename.lower().endswith(('.ppt', '.pptx')):
            content = parse_ppt(file_path)
        
        # 3. 调用 LLM 进行分析和翻译
        analysis_result = client.chat_completion([
            {{"role": "system", "content": "你是一个文档分析专家..."}},
            {{"role": "user", "content": f"请分析以下文档内容：\\n{{content}}"}}
        ])
        
        return analysis_result["choices"][0]["message"]["content"]
    
    finally:
        # 4. 清理临时文件
        os.unlink(file_path)
```

**注意**: 当前这只是一个示例响应，请根据你的具体需求实现 `analyze_file` 函数。
"""

# 命令处理函数
def _command_chat(text: str) -> str:
    low = text.lower()
    
    if text in ("/help", "help", "？", "帮助"):
        return "支持：/help、/sum a b、/upper 文本、时间。你也可以直接聊天，我会复述你的话。"

    elif low.startswith("/sum"):
        parts = text.split()
        if len(parts) == 3:
            try:
                a = float(parts[1]); b = float(parts[2])
                return f"{a} + {b} = {a+b}"
            except ValueError:
                return "用法：/sum 3 5"
        return "用法：/sum 3 5"

    elif low.startswith("/upper"):
        payload = text[len("/upper"):].strip()
        return payload.upper() if payload else "用法：/upper 你的句子"

    elif "时间" in text or "time" in low:
        return "现在时间：" + datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # 如果不是已知命令，返回默认消息
    return f"未知命令：{text}"

# 可替换后端 ---
def _simple_bot(msg: str, history: list = None) -> str:
    text = (msg or "").strip()
    low = text.lower()
    
    if low.startswith('/'):
        return _command_chat(text)
    else:
        # 构建完整的对话历史
        messages = []
        
        # 添加对话历史（最多保留最近10轮对话）
        if history:
            # print("history:", history)
            
            # 过滤掉命令消息，只保留真正的对话
            conversation_history = []
            for item in history[-ChatHistoryMax:]:  # 保留最近20条消息
                if not item['text'].startswith('/') and item['text'] not in ['help', '？', '帮助']:
                    conversation_history.append(item)
            # 构建messages数组
            for item in conversation_history:  # 最多ChatHistoryMax/2 轮对话
                role = "user" if item['role'] == "user" else "assistant"
                messages.append({
                    "role": role,
                    "content": item['text']
                })
        
        # 添加当前用户消息
        messages.append({"role": "user", "content": text})
        
        # 如果没有对话历史，添加系统提示
        if len(messages) == 1:
            messages.insert(0, {
                "role": "system", 
                "content": "你是一个友好的AI助手，请用中文回答用户的问题。"
            })
        
        response = client.chat_completion(messages=messages)
        return response["choices"][0]["message"]["content"]

@bp.route("/api/chat", methods=["POST"])
def api_chat():
    data = request.get_json(force=True) or {}
    msg = data.get("message", "")
    history = data.get("history", [])  # 获取对话历史
    reply = _simple_bot(msg, history)  # 传递历史记录
    return jsonify({"reply": reply})