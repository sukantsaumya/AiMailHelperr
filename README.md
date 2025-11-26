# Prompt-Driven Email Agent

An AI-powered email productivity tool where the agent's behavior is defined by user-editable prompts. Features automatic categorization, action extraction, and intelligent drafting using Google Gemini.

## Prerequisites

- **Node.js** (v18 or higher)
- **Python** (v3.8 or higher)
- **Google Gemini API Key** (Get it from [Google AI Studio](https://aistudio.google.com/app/apikey))

## Setup Instructions

### 1. Install Dependencies

#### Frontend (React + Vite):
```bash
npm install
```

#### Backend (FastAPI + Python):
```bash
pip install -r requirements.txt
```

### 2. Configure API Key

Create a `.env` file in the `backend/` directory:

```bash
# Create the file
touch backend/.env

# Or on Windows:
# type nul > backend\.env
```

Add your Gemini API key to `backend/.env`:
```env
GEMINI_API_KEY=your_actual_api_key_here
```

**Important:** 
- No quotes around the API key
- No spaces around the `=` sign
- Replace `your_actual_api_key_here` with your actual key

### 3. Test Your API Key (Optional but Recommended)

```bash
python test_api_key.py
```

This will verify your API key is valid before starting the app.

## Running the Application

You need to run **BOTH** the backend and frontend servers:

### Terminal 1 - Start Backend Server:
```bash
cd backend
uvicorn main:app --reload --port 8000
```

**Expected output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
✅ AI Service initialized successfully
```

### Terminal 2 - Start Frontend Server:
```bash
npm run dev
```

**Expected output:**
```
VITE v6.x.x  ready in XXX ms
➜  Local:   http://localhost:3000/
```

## Using the Application

1. **Open the app:** Navigate to `http://localhost:3000`

2. **Ingest emails:** Click the "⬇ Ingest Mock Data" button in the top-right corner

3. **Watch the AI work:** Check Terminal 1 (backend) to see AI processing logs:
   ```
   🤖 Processing email 1/15: URGENT: Q3 Report Due Today...
      📂 Category: Urgent Work
      📄 Summary generated
      ✅ Action items: 2 found
   ```

4. **Browse your inbox:** Click on any email to see:
   - AI-generated summary
   - Extracted action items
   - Category tags

5. **Chat with the agent:** Select an email and use the chat panel to:
   - Ask questions: "What is this about?"
   - Get summaries: "Summarize this email"
   - Generate replies: "Draft a professional response"

6. **Customize prompts:** Click "Prompt Brain 🧠" to edit how the AI behaves

## Troubleshooting

### Backend won't start:
```bash
# Check if Python packages are installed
pip list | grep -E "fastapi|uvicorn|google-generativeai"

# Reinstall if needed
pip install -r requirements.txt
```

### Frontend can't connect to backend:
```bash
# Verify backend is running on port 8000
curl http://127.0.0.1:8000/emails

# Should return: []
```

### AI features not working:
1. Check backend terminal for error messages
2. Verify `.env` file exists in `backend/` folder
3. Run `python test_api_key.py` to validate your API key
4. Make sure there are no quotes around your API key in `.env`

### Port already in use:
```bash
# Backend (change port to 8001)
uvicorn backend.main:app --reload --port 8001

# Then update frontend/services/api.ts:
# const API_URL = 'http://127.0.0.1:8001';
```

## Project Structure

```
.
├── backend/
│   ├── .env              # API key goes here (you create this)
│   ├── main.py           # FastAPI server
│   ├── ai_service.py     # Gemini AI integration
│   ├── models.py         # Database models
│   └── schemas.py        # API schemas
├── frontend/
│   ├── components/       # React components
│   └── services/
│       └── api.ts        # API client
├── mock_inbox.json       # Sample email data
├── requirements.txt      # Python dependencies
├── package.json          # Node dependencies
└── README.md            # This file
```

## Features

- ✅ **Email Ingestion** - Load sample emails with one click
- ✅ **AI Categorization** - Automatically sorts emails (Urgent, Meeting, Newsletter, etc.)
- ✅ **Smart Summaries** - Get concise 2-3 sentence summaries
- ✅ **Action Extraction** - AI identifies tasks and deadlines
- ✅ **Draft Generation** - AI writes professional replies
- ✅ **Chat Interface** - Ask questions about any email
- ✅ **Prompt Customization** - Edit AI behavior in real-time
- ✅ **Search & Filter** - Find emails by content, category, or status

## API Endpoints

- `POST /ingest` - Load and process emails with AI
- `GET /emails` - Retrieve all emails
- `GET /emails/{id}` - Get specific email
- `GET /prompts` - Get prompt templates
- `POST /prompts/update` - Update a prompt
- `POST /chat/agent` - Chat with AI about an email
- `POST /drafts/generate` - Generate email draft

## Tech Stack

**Frontend:**
- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- Axios

**Backend:**
- FastAPI
- SQLAlchemy
- Google Generative AI (Gemini)
- Python 3.8+

## Notes

- All AI processing happens during ingestion - emails are analyzed once and stored
- Drafts are NOT sent automatically - they're generated for review only
- The mock inbox contains 15 sample emails for testing
- Prompts can be edited in real-time without restarting the app
