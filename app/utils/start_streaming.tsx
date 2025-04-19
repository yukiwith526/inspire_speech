import axios, { AxiosError } from "axios";

// 音声API用エラー応答型
export type AudioAPIErrorResponse = {
  type: "audio_error" | "api_error" | "network_error" | "unknown_error";
  message: string;
  code?: string | number;
  details?: string;
};

// 音声API用エラーメッセージ
export const AUDIO_ERROR_MESSAGES = {
  invalid_api_key: "APIキーが無効です。有効なAPIキーを設定してください。",
  missing_api_key:
    "APIキーが設定されていません。.env.localファイルでNEXT_PUBLIC_ELEVEN_API_KEYを設定してください。",
  rate_limit_exceeded:
    "APIレート制限を超えました。しばらく待ってから再試行してください。",
  text_too_long: "テキストが長すぎます。短いテキストで再試行してください。",
  model_not_found: "指定された音声モデルが見つかりません。",
  voice_not_found: "指定された音声が見つかりません。",
  playback_failed:
    "音声の再生に失敗しました。ブラウザが音声をサポートしているか確認してください。",
  network_error:
    "ネットワークエラーが発生しました。インターネット接続を確認してください。",
  api_error: "APIエラーが発生しました。",
  unknown_error: "予期しないエラーが発生しました。",
};

const apiKey = process.env.NEXT_PUBLIC_ELEVEN_API_KEY;
const voiceSettings = {
  stability: 1,
  similarity_boost: 1,
};

// 現在再生中のオーディオを追跡するための変数
let currentAudio: HTMLAudioElement | null = null;
let currentAudioURL: string | null = null;

// コンポーネントのアンマウント時やクリーンアップ時に呼び出す関数
export const cleanupAudio = () => {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.src = "";
    currentAudio.load();
    currentAudio = null;
  }

  if (currentAudioURL) {
    URL.revokeObjectURL(currentAudioURL);
    currentAudioURL = null;
  }
};

export const startStreaming = async (
  text: string,
  selectedVoiceId: string
): Promise<{ success: boolean; error?: AudioAPIErrorResponse }> => {
  // APIキー確認
  if (!apiKey) {
    return {
      success: false,
      error: {
        type: "api_error",
        message: AUDIO_ERROR_MESSAGES.missing_api_key,
        code: "missing_api_key",
      },
    };
  }

  if (apiKey === "your_eleven_api_key") {
    return {
      success: false,
      error: {
        type: "api_error",
        message: AUDIO_ERROR_MESSAGES.invalid_api_key,
        code: "invalid_api_key",
      },
    };
  }

  // 入力テキスト確認
  if (!text || text.trim() === "") {
    return {
      success: false,
      error: {
        type: "api_error",
        message: "テキストが空です。テキストを入力してください。",
        code: "empty_text",
      },
    };
  }

  // 既に再生中のオーディオがあれば停止して完全にクリーンアップする
  cleanupAudio();

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
      try {
        // Blob URLの作成と保持
        currentAudioURL = URL.createObjectURL(response.data);
        const audio = new Audio(currentAudioURL);

        // 再生失敗時のエラーハンドリング
        audio.onerror = (event) => {
          console.error("Audio playback error:", event);
          cleanupAudio();
          throw new Error("音声の再生に失敗しました。");
        };

        // 再生終了時のイベントハンドラを設定
        audio.onended = () => {
          cleanupAudio();
          console.log("Audio playback completed");
        };

        // 現在のオーディオを追跡
        currentAudio = audio;

        // 再生開始
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.error("Audio playback promise error:", error);
            cleanupAudio();
            return {
              success: false,
              error: {
                type: "audio_error",
                message: AUDIO_ERROR_MESSAGES.playback_failed,
                details: error.message,
              },
            };
          });
        }

        return { success: true };
      } catch (error) {
        console.error("Audio creation error:", error);
        cleanupAudio();
        return {
          success: false,
          error: {
            type: "audio_error",
            message: AUDIO_ERROR_MESSAGES.playback_failed,
            details:
              error instanceof Error ? error.message : "Unknown audio error",
          },
        };
      }
    } else {
      return {
        success: false,
        error: {
          type: "api_error",
          message: AUDIO_ERROR_MESSAGES.api_error,
          code: response.status,
          details: `Status: ${response.status}`,
        },
      };
    }
  } catch (error) {
    console.error("API request error:", error);

    const axiosError = error as AxiosError;

    // ネットワークエラーの場合
    if (
      axiosError.code === "ECONNABORTED" ||
      axiosError.code === "ERR_NETWORK"
    ) {
      return {
        success: false,
        error: {
          type: "network_error",
          message: AUDIO_ERROR_MESSAGES.network_error,
          code: axiosError.code,
        },
      };
    }

    // レート制限エラー
    if (axiosError.response?.status === 429) {
      return {
        success: false,
        error: {
          type: "api_error",
          message: AUDIO_ERROR_MESSAGES.rate_limit_exceeded,
          code: 429,
        },
      };
    }

    // 音声またはモデルが見つからない
    if (axiosError.response?.status === 404) {
      return {
        success: false,
        error: {
          type: "api_error",
          message: AUDIO_ERROR_MESSAGES.voice_not_found,
          code: 404,
        },
      };
    }

    // APIキーエラー
    if (
      axiosError.response?.status === 401 ||
      axiosError.response?.status === 403
    ) {
      return {
        success: false,
        error: {
          type: "api_error",
          message: AUDIO_ERROR_MESSAGES.invalid_api_key,
          code: axiosError.response.status,
        },
      };
    }

    // その他のAPI応答エラー
    if (axiosError.response) {
      return {
        success: false,
        error: {
          type: "api_error",
          message: AUDIO_ERROR_MESSAGES.api_error,
          code: axiosError.response.status,
          details: JSON.stringify(axiosError.response.data),
        },
      };
    }

    // その他のエラー
    return {
      success: false,
      error: {
        type: "unknown_error",
        message: AUDIO_ERROR_MESSAGES.unknown_error,
        details: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
};
