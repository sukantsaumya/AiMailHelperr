import os
from dotenv import load_dotenv
import google.generativeai as genai

# Try to load .env from backend folder
load_dotenv('backend/.env')

api_key = os.getenv('GEMINI_API_KEY')

print("=" * 60)
print("🔍 GEMINI API KEY TEST")
print("=" * 60)

if not api_key:
    print("❌ PROBLEM: No API key found!")
    print("\nWhat to check:")
    print("1. Make sure backend/.env exists")
    print("2. Make sure it contains: GEMINI_API_KEY=your_key")
    print("3. No quotes, no spaces around =")
else:
    print(f"✅ API Key found: {api_key[:20]}...{api_key[-4:]}")
    print(f"   Length: {len(api_key)} characters")

    print("\n🧪 Testing API connection...")
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-flash-latest')
        response = model.generate_content("Say 'Hello, I am working!'")
        print(f"✅ SUCCESS! API Response: {response.text}")
        print("\n🎉 Your API key is valid and working!")
    except Exception as e:
        print(f"❌ API ERROR: {e}")
        print("\nPossible causes:")
        print("1. Invalid API key")
        print("2. API key needs to be enabled at https://aistudio.google.com")
        print("3. Network/firewall blocking Google AI")

print("=" * 60)