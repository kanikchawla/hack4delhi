import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

try:
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        print("Error: GROQ_API_KEY is missing in .env")
        exit(1)
        
    print(f"Testing key: {api_key[:5]}...{api_key[-5:]}")
    
    client = Groq(api_key=api_key)
    chat_completion = client.chat.completions.create(
        messages=[
            {"role": "user", "content": "Hello"}
        ],
        model="llama3-8b-8192",
    )
    print("Success! Response:", chat_completion.choices[0].message.content)
except Exception as e:
    print(f"Groq API Error: {e}")
