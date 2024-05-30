import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.NEXT_PUBLIC_ELEVEN_API_KEY;
const voiceSettings = {
  stability: 1,
  similarity_boost: 1,
};

export const startStreaming = async (text: string, selectedVoiceId: string) => {
  console.log("Loading: true");
  console.log("Error: ");

  const baseUrl = "https://api.elevenlabs.io/v1/text-to-speech";
  const headers = {
    "Content-Type": "application/json",
    "xi-api-key": apiKey,
  };

  const requestBody = {
    text,
    voice_settings: voiceSettings,
    model_id: "eleven_multilingual_v2",
  };

  try {
    const response = await axios.post(`${baseUrl}/${selectedVoiceId}`, requestBody, {
      headers,
      responseType: "blob",
    });

    if (response.status === 200) {
      const audio = new Audio(URL.createObjectURL(response.data));
      audio.play();
    } else {
      console.log("Error: Unable to stream audio.");
    }
  } catch (error) {
    console.log("Error: Unable to stream audio.");
  } finally {
    console.log("Loading: false");
  }
};
