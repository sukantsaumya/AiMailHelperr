import google.generativeai as genai
import os
from dotenv import load_dotenv

# Get the directory where this script is located
current_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(current_dir, ".env")

print(f"DEBUG: Looking for .env at: {env_path}")
print(f"DEBUG: .env exists: {os.path.exists(env_path)}")

# Load environment variables
load_dotenv(env_path)

class GeminiService:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")

        # Strip quotes and whitespace if present
        if api_key:
            api_key = api_key.strip().strip('"').strip("'")

        print(f"DEBUG: API Key found: {'Yes' if api_key else 'No'}")
        if api_key:
            print(f"DEBUG: API Key length: {len(api_key)} chars")
            print(f"DEBUG: API Key preview: {api_key[:10]}...{api_key[-4:]}")

        if not api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables. Check backend/.env file.")

        if len(api_key) < 30:
            raise ValueError(f"GEMINI_API_KEY seems too short ({len(api_key)} chars). Check if it's complete.")

        try:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-flash-latest')

            # Test the connection
            test_response = self.model.generate_content("Test")
            print("✅ AI Service initialized and tested successfully!")
        except Exception as e:
            print(f"❌ Failed to initialize Gemini: {e}")
            raise ValueError(f"Failed to configure Gemini API: {str(e)}")

    def generate_response(self, context: str, query: str) -> str:
        prompt = f"""
        You are a helpful email assistant.

        Context (Email Content):
        {context}

        User Query:
        {query}

        Answer the user's query based on the email context provided. Be concise and helpful.
        """
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"Error: {str(e)}"

    def generate_draft(self, email_content: str, instruction: str) -> str:
        prompt = f"""
        You are an expert email drafter.

        Original Email:
        {email_content}

        User Instruction:
        {instruction}

        Draft a professional response to the email based on the user's instruction.
        Return ONLY the body of the email. Do not include subject lines or placeholders like [Your Name] unless necessary.
        """
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"Error generating draft: {str(e)}"