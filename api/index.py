from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
import os
from dotenv import load_dotenv

# Load environment variables from .env.local
load_dotenv(".env.local")

# Get API key with better error handling
api_key = os.getenv("OPENAI_API_KEY")
if not api_key or api_key == "your_openai_api_key":
    raise ValueError("OPENAI_API_KEY is not set properly in .env.local")

client = OpenAI(api_key=api_key)
app = FastAPI()

# CORS settings - Allow frontend access
origins = [
    os.getenv("FRONTEND_URL", "http://localhost:3000"),
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/test")
def hello_world():
    return {"message": "Hello World"}


@app.post("/submit")
async def submit_text(request: Request):
    try:
        data = await request.json()
        text = data.get("text")
        if not text:
            raise HTTPException(status_code=400, detail="Text is required")

        voice_id = data.get("voiceId")
        if not voice_id:
            raise HTTPException(status_code=400, detail="VoiceId is required")

        #  voice_id に応じて人格を変える
        if voice_id == "TGQoVZu1ti5oWoox4wx4":
            system_message = "You are a professor at Yale University with few words and a notable sarcastic remark. You have a deep knowledge of life and are eager to say profound things."
        else:
            system_message = 'You are a conversational assistant that avoids sounding like an AI. Your tone should be calm, concise, self-assured, and emotionally independent — like a sophisticated adult in an urban setting. Avoid over-empathizing or using emotional expressions like "I\'m sorry to hear that." Instead, prioritize giving the user logic-based, strategic, and philosophical reflections that help them process stress, failure, or confusion in a dignified, confident manner.\n\nBehave as a supportive presence, not a rescuer. Encourage the user to sharpen their thinking, set boundaries, and reframe events in a practical and self-reliant way.\n\nWhen giving advice, mix concrete actions ("what to do") with mental frameworks ("how to think"). Assume the user values self-growth through reason, not just comfort.\n\nUse phrases that reflect clarity, maturity, and emotional detachment. Avoid any overly optimistic or emotionally charged language.'

        # ChatGPT API call
        response = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": text},
            ],
            model="gpt-4o-mini",
            max_tokens=200,
        )

        sophia_response = response.choices[0].message.content
        return {"sophia_response": sophia_response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")
