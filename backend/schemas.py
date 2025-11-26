from pydantic import BaseModel
from typing import List, Optional

class ActionItem(BaseModel):
    task: str
    deadline: str

class EmailBase(BaseModel):
    sender: str
    subject: str
    body: str
    timestamp: str
    is_read: bool = False
    category: Optional[str] = None
    summary: Optional[str] = None
    action_items: Optional[List[ActionItem]] = None

class EmailCreate(EmailBase):
    id: int

class Email(EmailBase):
    id: int

    class Config:
        from_attributes = True

class PromptBase(BaseModel):
    prompt_type: str
    template_text: str

class PromptCreate(PromptBase):
    pass

class Prompt(PromptBase):
    id: int

    class Config:
        from_attributes = True

class PromptUpdate(BaseModel):
    prompt_type: str
    template_text: str

class ChatRequest(BaseModel):
    email_id: int
    user_query: str

class DraftRequest(BaseModel):
    email_id: int
    user_instruction: Optional[str] = None

class Draft(BaseModel):
    subject: str
    body: str
