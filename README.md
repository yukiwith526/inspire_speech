# inspire_speech

## Overview

This project uses ElevenLabs for text-to-speech (TTS) and OpenAI's GPT API to create an interactive conversational application.

## Stack

- **Next.js**: A React framework for server-side rendering and static site generation.
- **Shadcn**: A UI component library.
- **FastAPI**: A modern, fast (high-performance) web framework for building APIs with Python 3.6+.

## Getting Started

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yukiwith5267/inspire_speech
   cd inspire_speech
   ```

2. **Install frontend dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file in the root directory and add your API keys:
   You can get your API keys from the [OpenAI docs](https://platform.openai.com/docs/quickstart) and the [ElevenLabs docs](https://docs.elevenlabs.io/).

   ```plaintext
   OPENAI_API_KEY=your_openai_api_key
   NEXT_PUBLIC_ELEVEN_API_KEY=your_eleven_api_key
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

## Deployment

### Frontend

The frontend is deployed on [Vercel](https://vercel.com/).

### Backend

The backend is hosted on a Raspberry Pi using ngrok.

1. **Install backend dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

2. **Run the FastAPI server:**

   ```bash
   uvicorn index:app --reload --port 8080
   ```

3. **Expose the backend using ngrok:**
   ```bash
   ngrok http 8080
   ```
