import requests
import json
from typing import Dict, List, Optional, Union
import os


class LLMClient:
    """
    A client for interacting with OpenAI-compatible LLM APIs
    """
    
    def __init__(self, 
                 api_key: Optional[str] = "sk-slwyrksH22teR64YSDDfIaQzluQCX2Qa1utUupGkYzt4BYvt",
                 base_url: str = "https://www.dmxapi.com/v1",
                 endpoint: str = "chat/completions",
                 model: str = "gpt-4o-mini",
                 timeout: int = 30,
                 max_retries: int = 3):
        """
        Initialize the LLM client
        
        Args:
            api_key: OpenAI API key (will try to get from OPENAI_API_KEY env var if not provided)
            base_url: Base URL for the API (default: OpenAI official API)
            timeout: Request timeout in seconds
            max_retries: Maximum number of retries for failed requests
        """
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("API key is required. Set OPENAI_API_KEY environment variable or pass api_key parameter.")
        self.model = model
        self.base_url = base_url.rstrip('/')
        self.endpoint = endpoint.rstrip('/')
        self.timeout = timeout
        self.max_retries = max_retries
        self.session = requests.Session()
        
        # Set default headers
        self.session.headers.update({
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        })
    
    def chat_completion(self,
                       messages: List[Dict[str, str]],
                       model: str = None,
                       temperature: float = 0.7,
                       max_tokens: Optional[int] = None,
                       stream: bool = False,
                       **kwargs) -> Union[Dict, requests.Response]:
        """
        Send a chat completion request
        
        Args:
            messages: List of message dictionaries with 'role' and 'content' keys
            model: Model name to use
            temperature: Sampling temperature (0-2)
            max_tokens: Maximum tokens to generate
            stream: Whether to stream the response
            **kwargs: Additional parameters to pass to the API
            
        Returns:
            API response as dictionary or streaming response object
        """
        url = f"{self.base_url}/{self.endpoint}"
        
        payload = {
            "model": model or self.model,
            "messages": messages,
            "temperature": temperature,
            "stream": stream
        }
        
        if max_tokens:
            payload["max_tokens"] = max_tokens
            
        # Add any additional parameters
        payload.update(kwargs)
        
        try:
            response = self.session.post(
                url,
                json=payload,
                timeout=self.timeout,
                stream=stream
            )
            response.raise_for_status()
            
            if stream:
                return response
            else:
                return response.json()
                
        except requests.exceptions.RequestException as e:
            raise Exception(f"Request failed: {str(e)}")
    
    def close(self):
        """Close the session"""
        self.session.close()
    
    def __enter__(self):
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()


# Example usage
if __name__ == "__main__":
    # Example 1: Basic usage with OpenAI
    try:
        client = LLMClient()  # Will use OPENAI_API_KEY environment variable
        
        # Chat completion
        messages = [
            {"role": "user", "content": "Hello, how are you?"}
        ]
        
        response = client.chat_completion(messages, model="gpt-3.5-turbo")
        print("Chat response:", response["choices"][0]["message"]["content"])
        
    except Exception as e:
        print(f"Error: {e}")
    
    # Example 2: Custom base URL (for local models or other providers)
    try:
        local_client = LLMClient(
            api_key="your-api-key",
            base_url="http://localhost:8000/v1"  # Local model endpoint
        )
        
        # Test with local model
        response = local_client.chat_completion(
            messages=[{"role": "user", "content": "Test message"}],
            model="local-model"
        )
        print("Local model response:", response)
        
    except Exception as e:
        print(f"Local model error: {e}")
