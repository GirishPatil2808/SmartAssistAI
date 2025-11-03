import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables
load_dotenv()

# Get the OpenRouter API Key
api_key = os.getenv("OPENROUTER_API_KEY")

# Create a custom client that points to OpenRouter
client = OpenAI(
    api_key=api_key,
    base_url="https://openrouter.ai/api/v1",
    default_headers={
        "HTTP-Referer": "http://localhost",
        "X-Title": "SmartAssistAI",
    },
)

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ProcessTextRequest(BaseModel):
    text: str
    action: str

@app.post("/api/process-text")
def process_text(request: ProcessTextRequest):
    try:
        # --- NEW: We will combine the system message and prompt ---
        # This special [INST] format is for the Mistral model
        
        final_prompt = ""

        if request.action == "improve":
            print("Received action: IMPROVE")
            final_prompt = f"""
[INST] You are a helpful assistant. Your only task is to correct the grammar and improve the tone of the following text. Make it sound more professional and clear. Do not say anything else, just provide the corrected text.

Text to improve: "{request.text}"
[/INST]
"""
        
        elif request.action == "explain":
            print("Received action: EXPLAIN")
            final_prompt = f"""
[INST] You are a helpful assistant. Your only task is to explain the following text in simple, clear terms for a beginner. Do not say anything else, just provide the simple explanation.

Text to explain: "{request.text}"
[/INST]
"""
        
        else:
            return {"error": "Invalid action."}

        # Use our custom client and the new prompt
        response = client.chat.completions.create(
            model="mistralai/mistral-7b-instruct:free",
            messages=[
                # We now send only one "user" message
                {"role": "user", "content": final_prompt}
            ],
            max_tokens=200
        )

        ai_reply = response.choices[0].message.content.strip()
        print(f"AI Reply: {ai_reply}")

        return {"reply": ai_reply}

    except Exception as e:
        print(f"An error occurred: {e}")
        return {"error": "Failed to get a response from the AI."}