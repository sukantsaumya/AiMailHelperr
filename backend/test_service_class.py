import sys
import os

# Add the parent directory to sys.path to allow importing backend modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from backend.ai_service import GeminiService
    print("Successfully imported GeminiService")
except ImportError as e:
    print(f"Failed to import GeminiService: {e}")
    exit(1)

try:
    print("Attempting to initialize GeminiService...")
    service = GeminiService()
    print("GeminiService initialized successfully!")
    
    print("Testing generate_response...")
    response = service.generate_response("Test email content", "Test query")
    print(f"Response: {response}")
except Exception as e:
    print(f"Error initializing or using GeminiService: {e}")
    import traceback
    traceback.print_exc()
