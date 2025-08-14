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