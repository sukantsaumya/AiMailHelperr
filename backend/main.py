from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import json
import os

from . import models, schemas, database
from .ai_service import GeminiService

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize AI Service
try:
    ai_service = GeminiService()
    print("✅ AI Service initialized successfully")
except Exception as e:
    print(f"❌ Warning: Failed to initialize GeminiService: {e}")
    ai_service = None

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

def categorize_email_with_ai(email_content: str) -> str:
    """Use AI to categorize an email"""
    if not ai_service:
        return "Uncategorized"
    
    try:
        prompt = f"""Categorize this email into ONE of these categories: Urgent Work, Meeting, Newsletter, Spam, Personal, or General.
        
Email:
{email_content}

Return ONLY the category name, nothing else."""

        response = ai_service.model.generate_content(prompt)
        category = response.text.strip()
        print(f"   📂 Category: {category}")
        return category
    except Exception as e:
        print(f"   ❌ Error categorizing: {e}")
        return "Uncategorized"

def extract_action_items(email_content: str) -> list:
    """Use AI to extract action items from email"""
    if not ai_service:
        return []

    try:
        prompt = f"""Extract action items from this email. Return ONLY valid JSON array format like this:
[{{"task": "Complete the report", "deadline": "Friday"}}, {{"task": "Review document", "deadline": "None"}}]

If there are no action items, return: []

Email:
{email_content}

Return ONLY the JSON array, no other text."""

        response = ai_service.model.generate_content(prompt)
        result = response.text.strip()

        # Clean up markdown code blocks if present
        if result.startswith("```"):
            result = result.split("```")[1]
            if result.startswith("json"):
                result = result[4:]
            result = result.strip()

        # Try to parse JSON
        try:
            action_items = json.loads(result)
            if isinstance(action_items, list):
                print(f"   ✅ Action items: {len(action_items)} found")
                return action_items
        except:
            pass

        print(f"   ✅ Action items: 0 found")
        return []
    except Exception as e:
        print(f"   ❌ Error extracting action items: {e}")
        return []

def generate_summary(email_content: str) -> str:
    """Use AI to generate email summary"""
    if not ai_service:
        return "Summary not available"

    try:
        prompt = f"""Summarize this email in 2-3 sentences. Be concise and focus on the main point.

Email:
{email_content}

Summary:"""

        response = ai_service.model.generate_content(prompt)
        print(f"   📄 Summary generated")
        return response.text.strip()
    except Exception as e:
        print(f"   ❌ Error generating summary: {e}")
        return "Summary not available"

@app.post("/ingest")
def ingest_inbox(db: Session = Depends(get_db)):
    print("\n" + "="*60)
    print("📧 STARTING EMAIL INGESTION WITH AI PROCESSING")
    print("="*60)

    if not ai_service:
        print("❌ ERROR: AI Service not available!")
        raise HTTPException(status_code=500, detail="AI Service not initialized. Check backend/.env")

    # Load mock data
    try:
        with open("mock_inbox.json", "r") as f:
            data = json.load(f)
            print(f"✅ Loaded {len(data)} emails from mock_inbox.json")
    except FileNotFoundError:
        try:
            with open("../mock_inbox.json", "r") as f:
                data = json.load(f)
                print(f"✅ Loaded {len(data)} emails from parent directory")
        except FileNotFoundError:
            print("❌ mock_inbox.json not found")
            raise HTTPException(status_code=500, detail="Mock data file not found")

    # Clear existing emails
    try:
        db.query(models.Email).delete()
        print("🗑️  Cleared existing emails")
    except Exception as e:
        print(f"⚠️  Error clearing emails: {e}")

    # Seed prompts if empty
    if db.query(models.Prompt).count() == 0:
        default_prompts = [
            {"prompt_type": "categorize", "template_text": "Categorize this email into: Urgent Work, Meeting, Newsletter, Spam, Personal, or General based on content and urgency."},
            {"prompt_type": "summarize", "template_text": "Summarize this email in 2-3 concise sentences highlighting the main point."},
            {"prompt_type": "action_items", "template_text": "Extract all action items, tasks, and deadlines from this email. Return as JSON array."},
            {"prompt_type": "reply_positive", "template_text": "Draft a positive and professional reply to this email."},
            {"prompt_type": "reply_negative", "template_text": "Draft a polite decline to this email."}
        ]
        for p in default_prompts:
            db.add(models.Prompt(**p))
        db.commit()
        print("📝 Seeded default prompts")

    # Process each email with AI
    print("\n🤖 PROCESSING EMAILS WITH AI...\n")

    for idx, item in enumerate(data, 1):
        print(f"🤖 Processing email {idx}/{len(data)}: {item['subject'][:50]}...")

        email_content = f"From: {item['sender']}\nSubject: {item['subject']}\n\n{item['body']}"

        # AI Processing
        category = categorize_email_with_ai(email_content)
        summary = generate_summary(email_content)
        action_items = extract_action_items(email_content)

        # Create email with AI-generated data
        email = models.Email(
            id=item["id"],
            sender=item["sender"],
            subject=item["subject"],
            body=item["body"],
            timestamp=item["timestamp"],
            is_read=item["is_read"],
            category=category,
            summary=summary,
            action_items=json.dumps(action_items) if action_items else None
        )
        db.add(email)
        print("")  # Blank line between emails

    db.commit()

    print("="*60)
    print("✅ INGESTION COMPLETED SUCCESSFULLY!")
    print(f"   Processed: {len(data)} emails")
    print(f"   AI Enabled: Yes")
    print("="*60 + "\n")

    return {"status": "ingested", "count": len(data), "ai_enabled": True}

@app.get("/emails", response_model=List[schemas.Email])
def get_emails(db: Session = Depends(get_db)):
    emails = db.query(models.Email).all()

    # Parse action_items JSON string back to list
    for email in emails:
        if email.action_items:
            try:
                email.action_items = json.loads(email.action_items)
            except:
                email.action_items = []

    return emails

@app.get("/emails/{email_id}", response_model=schemas.Email)
def get_email(email_id: int, db: Session = Depends(get_db)):
    email = db.query(models.Email).filter(models.Email.id == email_id).first()
    if email is None:
        raise HTTPException(status_code=404, detail="Email not found")

    # Parse action_items
    if email.action_items:
        try:
            email.action_items = json.loads(email.action_items)
        except:
            email.action_items = []

    return email

@app.get("/prompts", response_model=List[schemas.Prompt])
def get_prompts(db: Session = Depends(get_db)):
    return db.query(models.Prompt).all()

@app.post("/prompts/update", response_model=schemas.Prompt)
def update_prompt(prompt_update: schemas.PromptUpdate, db: Session = Depends(get_db)):
    prompt = db.query(models.Prompt).filter(models.Prompt.prompt_type == prompt_update.prompt_type).first()
    if not prompt:
        prompt = models.Prompt(prompt_type=prompt_update.prompt_type, template_text=prompt_update.template_text)
        db.add(prompt)
    else:
        prompt.template_text = prompt_update.template_text

    db.commit()
    db.refresh(prompt)
    return prompt

@app.post("/chat/agent")
def chat_agent(request: schemas.ChatRequest, db: Session = Depends(get_db)):
    if not ai_service:
        return {"response": "❌ AI Service not available. Please check your GEMINI_API_KEY in backend/.env"}

    email = db.query(models.Email).filter(models.Email.id == request.email_id).first()
    if not email:
        raise HTTPException(status_code=404, detail="Email not found")

    context = f"From: {email.sender}\nSubject: {email.subject}\nBody: {email.body}"

    try:
        response = ai_service.generate_response(context, request.user_query)
        return {"response": response}
    except Exception as e:
        return {"response": f"❌ Error generating response: {str(e)}"}

@app.post("/drafts/generate", response_model=schemas.Draft)
def generate_draft(request: schemas.DraftRequest, db: Session = Depends(get_db)):
    if not ai_service:
        return {"subject": "Error", "body": "❌ AI Service not available. Check GEMINI_API_KEY."}

    email = db.query(models.Email).filter(models.Email.id == request.email_id).first()
    if not email:
        raise HTTPException(status_code=404, detail="Email not found")

    email_content = f"From: {email.sender}\nSubject: {email.subject}\nBody: {email.body}"

    try:
        body = ai_service.generate_draft(email_content, request.user_instruction or "Draft a professional reply")
        return {
            "subject": f"Re: {email.subject}",
            "body": body
        }
    except Exception as e:
        return {"subject": "Error", "body": f"❌ Error generating draft: {str(e)}"}