from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text
from .database import Base

class Email(Base):
    __tablename__ = "emails"

    id = Column(Integer, primary_key=True, index=True)
    sender = Column(String, index=True)
    subject = Column(String)
    body = Column(Text)
    timestamp = Column(String)
    is_read = Column(Boolean, default=False)
    
    # AI-generated fields
    category = Column(String, nullable=True)  # AI categorization
    summary = Column(Text, nullable=True)  # AI summary
    action_items = Column(Text, nullable=True)  # JSON string of action items

class Prompt(Base):
    __tablename__ = "prompts"

    id = Column(Integer, primary_key=True, index=True)
    prompt_type = Column(String, unique=True, index=True)
    template_text = Column(Text)
