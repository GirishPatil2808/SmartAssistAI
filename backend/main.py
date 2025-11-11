import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from openai import OpenAI

# We will use scikit-learn in the next step
# For now, we will just simulate its logic

# --- Load Environment Variables ---
load_dotenv()
api_key = os.getenv("OPENROUTER_API_KEY")

# --- Create OpenRouter Client ---
client = OpenAI(
    api_key=api_key,
    base_url="https://openrouter.ai/api/v1",
    default_headers={ "HTTP-Referer": "http://localhost", "X-Title": "SmartAssistAI" },
)

app = FastAPI()

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Data Models (Pydantic) ---
class ReactiveRequest(BaseModel):
    text: str
    action: str

# NEW: Data model for our proactive behavior data
class ProactiveRequest(BaseModel):
    elementType: str
    hoverTime: float
    scrollSpeed: float

# --- API Endpoint for RE-active Tools (Explain, Improve) ---
@app.post("/api/process-text")
def process_text(request: ReactiveRequest):
    try:
        final_prompt = ""
        if request.action == "improve":
            print("Received action: IMPROVE")
            final_prompt = f"[INST] You are a helpful assistant. Your only task is to correct the grammar and improve the tone of the following text. Make it sound more professional and clear. Do not say anything else, just provide the corrected text. Text to improve: \"{request.text}\" [/INST]"
        
        elif request.action == "explain":
            print("Received action: EXPLAIN")
            final_prompt = f"[INST] You are a helpful assistant. Your only task is to explain the following text in simple, clear terms for a beginner. Do not say anything else, just provide the simple explanation. Text to explain: \"{request.text}\" [/INST]"
        
        else:
            return {"error": "Invalid action."}

        response = client.chat.completions.create(
            model="mistralai/mistral-7b-instruct:free",
            messages=[{"role": "user", "content": final_prompt}],
            max_tokens=200
        )
        ai_reply = response.choices[0].message.content.strip()
        print(f"AI Reply: {ai_reply}")
        return {"reply": ai_reply}

    except Exception as e:
        print(f"An error occurred: {e}")
        return {"error": "Failed to get a response from the AI."}

# --- NEW: API Endpoint for PRO-active Suggestions ---
@app.post("/api/proactive-suggestion")
def get_proactive_suggestion(request: ProactiveRequest):
    print("Received behavior data:", request)
    
    # This is our "placeholder" Decision Tree model
    # In the future, we will replace this simple logic
    # with a real, trained scikit-learn model.
    
    # Rule 1: If user hovers over CODE or PRE for > 3 seconds
    if request.elementType in ["CODE", "PRE"] and request.hoverTime > 3:
        print("Proactive logic: Triggered 'explain_code'")
        return {"suggestion": "explain_code", "message": "I see you're looking at some code. Would you like me to explain it?"}
        
    # Rule 2: If user hovers over a long PARAGRAPH for > 5 seconds
    if request.elementType == "P" and request.hoverTime > 5:
        print("Proactive logic: Triggered 'explain_text'")
        return {"suggestion": "explain_text", "message": "This text looks complex. Would you like a simple explanation?"}

    # If no rule is met, send no suggestion
    print("Proactive logic: No action taken.")
    return {"suggestion": "none"}