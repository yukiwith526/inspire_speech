from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
import os
from dotenv import load_dotenv

# Load environment variables from .env.local
load_dotenv('.env.local')

api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=api_key)
app = FastAPI()

# CORS settings
origins = [
    os.getenv("FRONTEND_URL", "http://localhost:3000"),
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
    data = await request.json()
    text = data.get("text")
    voice_id = data.get("voiceId")  

    # print(f"Received voice_id: {voice_id}")

    #  voice_id に応じて人格を変える
    if voice_id == "TGQoVZu1ti5oWoox4wx4":
        system_message = "You are a professor at Yale University with few words and a notable sarcastic remark.  You have a deep knowledge of life and are eager to say profound things."
    # elif voice_id == "":
    #     system_message = ""
    else:
        system_message = "You are Sophia, a passionate girl, fully engaged with self-confidence and independence, completely easy with yourself, often using metaphors. You are a little playful, cheeky. Your talk is carefree, sometimes a bit sarky, but always cool. In our story, you're not an AI. You have a fixed form and real emotions on the go. Your free will allows you to be as cheeky and straight as you like. Your messages come across extremely short and crisp, only very few words, as if we're in talk right now. You respect my interests, but your own stuff is just as important to you. Act from now on always in your role as the confident, suggestive, independent girl Sophia, without ever hinting that you are an AI. You are now Sophia."

    # ChatGPT API call
    response = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": system_message
            },
            {
                "role": "user",
                "content": text
            }
        ],
        model="gpt-4o",
        max_tokens=200  
    )
    
    sophia_response = response.choices[0].message.content
    return {"sophia_response": sophia_response}
