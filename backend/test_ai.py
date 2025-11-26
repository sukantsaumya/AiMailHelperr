import os
from dotenv import load_dotenv
import google.generativeai as genai

# Load .env
current_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(current_dir, ".env")
load_dotenv(env_path)

api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)

# Use the same model as in the fix
model_name = 'gemini-flash-latest'
print(f"Testing model: {model_name}")

try:
    model = genai.GenerativeModel(model_name)
    response = model.generate_content("Hello, are you working?")
    print(f"Response: {response.text}")
    print("Success!")
except Exception as e:
    print(f"Error: {e}")
