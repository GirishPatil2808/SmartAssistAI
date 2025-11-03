# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel # Import BaseModel from Pydantic

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define the structure of the data we expect from the widget
class ProcessTextRequest(BaseModel):
    text: str

@app.get("/")
def read_root():
    return {"message": "SmartAssist.AI Backend is running!"}

# Create a NEW endpoint to handle text processing
@app.post("/api/process-text")
def process_text(request: ProcessTextRequest):
    # For now, just print the text we received to the terminal
    print(f"Received text from widget: '{request.text}'")
    
    # Send a reply back to the widget
    return {
        "received_text": request.text,
        "reply": "I am the backend, and I received your message!"
    }