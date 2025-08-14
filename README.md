# 简化版 ChatGPT · 新手友好起步项目

功能：
- 聊天 UI（对话气泡、时间戳）
- “对方正在输入…”提示
- 本地存储聊天记录（localStorage）
- 一键清空聊天记录
- 后端 API：/api/chat（规则型演示机器人）

运行：
```bash
pip install -r requirements.txt
python app.py
# 打开 http://127.0.0.1:5000/chat
```

改哪几处：
- 前端结构：`templates/chat.html`
- 前端逻辑：`static/js/chat.js`
- 样式：`static/css/style.css`
- 后端逻辑：`blueprints/pages.py` 中 `_simple_bot`