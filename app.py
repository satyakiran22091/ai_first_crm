from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from google import genai
from sqlalchemy.orm import Session
import models
from database import engine, SessionLocal

load_dotenv(".env")

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    print("❌ GEMINI_API_KEY not found.")
    client = None
else:
    print("✅ GEMINI_API_KEY loaded successfully.")
    client = genai.Client(api_key=API_KEY)


class LeadCreate(BaseModel):
    name: str
    company: str
    email: str
    status: str

class LeadUpdate(BaseModel):
    status: str


@app.post("/add-lead")
def add_lead(lead: LeadCreate, db: Session = Depends(get_db)):
    db_lead = models.Lead(
        name=lead.name,
        company=lead.company,
        email=lead.email,
        status=lead.status
    )
    db.add(db_lead)
    db.commit()
    db.refresh(db_lead)
    return db_lead


@app.get("/leads")
def get_leads(db: Session = Depends(get_db)):
    return db.query(models.Lead).all()


@app.get("/analyze/{lead_id}")
def analyze_lead(lead_id: int, db: Session = Depends(get_db)):

    if not client:
        raise HTTPException(status_code=500, detail="Gemini API key not configured properly.")

    db_lead = db.query(models.Lead).filter(models.Lead.id == lead_id).first()
    
    if not db_lead:
        raise HTTPException(status_code=404, detail="Lead not found")
        
    if db_lead.ai_priority and db_lead.ai_next_action:
        return {
            "lead": {
                "id": db_lead.id,
                "name": db_lead.name,
                "company": db_lead.company,
                "email": db_lead.email,
                "status": db_lead.status
            },
            "ai_analysis": {
                "priority": db_lead.ai_priority,
                "next_action": db_lead.ai_next_action,
                "outreach_message": db_lead.ai_outreach_message
            },
            "cached": True
        }

    try:
        prompt = f"""
        Analyze this sales lead and provide your response exactly in this format separated by pipes (|):
        Priority (High/Medium/Low) | Recommend next action | Short personalized outreach message

        Lead Details:
        Name: {db_lead.name}
        Company: {db_lead.company}
        Status: {db_lead.status}
        """

        response = client.models.generate_content(
            model="gemini-flash-latest",
            contents=prompt
        )

        if response.candidates:
            ai_text = response.candidates[0].content.parts[0].text
            parts = ai_text.split('|')
            if len(parts) >= 3:
                db_lead.ai_priority = parts[0].strip()
                db_lead.ai_next_action = parts[1].strip()
                db_lead.ai_outreach_message = '|'.join(parts[2:]).strip()
                db.commit()
            else:
                db_lead.ai_priority = "Unknown"
                db_lead.ai_next_action = "Unknown"
                db_lead.ai_outreach_message = ai_text
                db.commit()
        else:
            db_lead.ai_priority = "Error"
            
        return {
            "lead": {
                "id": db_lead.id,
                "name": db_lead.name,
                "company": db_lead.company,
                "email": db_lead.email,
                "status": db_lead.status
            },
            "ai_analysis": {
                "priority": db_lead.ai_priority,
                "next_action": db_lead.ai_next_action,
                "outreach_message": db_lead.ai_outreach_message
            },
            "cached": False
        }

    except Exception as e:
        return {
            "error": "AI processing failed",
            "details": str(e)
        }

@app.put("/leads/{lead_id}")
def update_lead(lead_id: int, lead_update: LeadUpdate, db: Session = Depends(get_db)):
    db_lead = db.query(models.Lead).filter(models.Lead.id == lead_id).first()
    
    if not db_lead:
        raise HTTPException(status_code=404, detail="Lead not found")
        
    db_lead.status = lead_update.status
    db.commit()
    db.refresh(db_lead)
    return db_lead

@app.delete("/leads/{lead_id}")
def delete_lead(lead_id: int, db: Session = Depends(get_db)):
    db_lead = db.query(models.Lead).filter(models.Lead.id == lead_id).first()
    
    if not db_lead:
        raise HTTPException(status_code=404, detail="Lead not found")
        
    db.delete(db_lead)
    db.commit()
    return {"message": "Lead deleted successfully"}

app.mount("/", StaticFiles(directory="static", html=True), name="static")