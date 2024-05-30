"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { startStreaming } from "./utils/start_streaming"; // Import the startStreaming function
import * as React from "react"
import { SelectDemo, selectedVoiceId } from "./ui/select"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function Home() {
  const [text, setText] = useState(
    "Life without inspiration is like a blank canvas."
  );
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(event.target.value);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text, voiceId: selectedVoiceId }), // Include selectedVoiceId
      });

      if (!res.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await res.json();
      console.log("Success:", data);

      setResponse(data.sophia_response);

      // Start streaming the response as audio
      await startStreaming(data.sophia_response, selectedVoiceId);

    } catch (error) {
      console.error("Error:", error);
      setResponse("Server is not running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-cream">
      <div className="flex flex-col justify-center items-center w-[300px] sm:w-[500px]">
        <Textarea
          placeholder="Type your message here."
          className="w-full mb-2"
          value={text}
          onChange={handleChange}
        />
        <div className="mb-2"></div>
        <div className="flex items-center justify-between w-full mb-2">
          <SelectDemo />
          <Button onClick={handleSubmit} disabled={loading}>Submit</Button>
        </div>
      </div>
      {response && (
        <div className="fixed bottom-8 center p-4 text-sm">
          <p>{response}</p>
        </div>
      )}
    </div>
  );
}
