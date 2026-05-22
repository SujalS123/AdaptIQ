import os
import requests
from typing import Optional

def load_env_manually():
    """
    Manually parses the root .env file if it exists to load the GROQ_API_KEY
    without relying on external python-dotenv dependencies.
    """
    # Look for .env file in parent directories
    possible_paths = [
        os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../../.env')),
        os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../.env')),
        os.path.abspath(os.path.join(os.path.dirname(__file__), '../../.env')),
        os.path.abspath(os.path.join(os.path.dirname(__file__), '../.env')),
        os.path.abspath(".env")
    ]
    
    for path in possible_paths:
        if os.path.exists(path):
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith('#') and '=' in line:
                            key, val = line.split('=', 1)
                            key = key.strip()
                            val = val.strip().strip('"').strip("'")
                            os.environ[key] = val
                break
            except Exception:
                pass

# Load environmental variables on module import
load_env_manually()

class GroqClient:
    def __init__(self):
        self.api_key = os.environ.get("GROQ_API_KEY")
        self.url = "https://api.groq.com/openai/v1/chat/completions"
        self.model = "llama-3.3-70b-versatile"

    def is_configured(self) -> bool:
        return bool(self.api_key)

    def generate_socratic_response(self, system_prompt: str, user_query: str) -> Optional[str]:
        """
        Sends chat queries to the Groq API matching OpenAI standards.
        """
        if not self.is_configured():
            return None

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_query}
            ],
            "temperature": 0.4,
            "max_tokens": 512
        }

        try:
            response = requests.post(self.url, headers=headers, json=data, timeout=8)
            if response.status_code == 200:
                result_json = response.json()
                return result_json["choices"][0]["message"]["content"].strip()
            else:
                print(f"[WARN] Groq API returned status code {response.status_code}: {response.text}")
                return None
        except Exception as e:
            print(f"[WARN] Failed to query Groq API: {e}")
            return None
