import requests
import json

BASE_URL = "http://127.0.0.1:8001"

def test_api():
    # 1. Ingest data first (just in case)
    print("Ingesting data...")
    try:
        requests.post(f"{BASE_URL}/ingest")
    except Exception as e:
        print(f"Ingest failed (might be expected if file missing): {e}")

    # 2. Get emails
    print("Fetching emails...")
    resp = requests.get(f"{BASE_URL}/emails")
    if resp.status_code != 200:
        print(f"Failed to get emails: {resp.text}")
        return
    
    emails = resp.json()
    if not emails:
        print("No emails found")
        return
    
    email_id = emails[0]['id']
    print(f"Testing with email ID: {email_id}")

    # 3. Test Chat Agent
    print("Testing /chat/agent...")
    payload = {
        "email_id": email_id,
        "user_query": "What is this email about?"
    }
    resp = requests.post(f"{BASE_URL}/chat/agent", json=payload)
    print(f"Chat Response Code: {resp.status_code}")
    print(f"Chat Response Body: {resp.json()}")

    # 4. Test Draft Generation
    print("Testing /drafts/generate...")
    payload = {
        "email_id": email_id,
        "user_instruction": "Draft a polite reply"
    }
    resp = requests.post(f"{BASE_URL}/drafts/generate", json=payload)
    print(f"Draft Response Code: {resp.status_code}")
    print(f"Draft Response Body: {resp.json()}")

if __name__ == "__main__":
    test_api()
