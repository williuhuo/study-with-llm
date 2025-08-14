import os


ContextLength = 10000
ChatHistoryMax = 20
LLMConfig = {
    "dmx": {
        "model": "gpt-4o-mini",
        "base_url": "https://www.dmxapi.com/v1",
        "endpoint": "chat/completions",
        "api_key": os.getenv("DMX_API_KEY", "sk-slwyrksH22teR64YSDDfIaQzluQCX2Qa1utUupGkYzt4BYvt"),
    },
    "openai": {
        "model": "gpt-4o-mini",
        "base_url": "https://api.openai.com/v1",
        "endpoint": "chat/completions",
        "api_key": os.getenv("OPENAI_API_KEY", ""),
    }
}