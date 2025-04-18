import axios from "axios";

const apiKey = process.env.NEXT_PUBLIC_ELEVEN_API_KEY;
const voiceSettings = {
  stability: 1,
  similarity_boost: 1,
};

// 現在再生中のオーディオを追跡するための変数
let currentAudio: HTMLAudioElement | null = null;

export const startStreaming = async (text: string, selectedVoiceId: string) => {
  if (!apiKey || apiKey === "your_eleven_api_key") {
    console.error("ElevenLabs API key is not set");
    throw new Error("ElevenLabs API key is not configured");
  }

  console.log("Loading: true");
  console.log("Error: ");

  // 既に再生中のオーディオがあれば停止する
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }

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
    const response = await axios.post(
      `${baseUrl}/${selectedVoiceId}`,
      requestBody,
      {
        headers,
        responseType: "blob",
      }
    );

    if (response.status === 200) {
      const audio = new Audio(URL.createObjectURL(response.data));

      // 再生終了時のイベントハンドラを設定
      audio.onended = () => {
        currentAudio = null;
        console.log("Audio playback completed");
      };

      // 現在のオーディオを追跡
      currentAudio = audio;

      // 再生開始
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
