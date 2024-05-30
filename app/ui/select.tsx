import * as React from "react"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { startStreaming } from "../utils/start_streaming"; // Import the function

export let selectedVoiceId = "FA6HhUjVbervLw2rNl8M"; // default voiceId

export function SelectDemo() {
  const handleSelectChange = async (value: string) => {
    if (value === "成田悠輔") {
      selectedVoiceId = "TGQoVZu1ti5oWoox4wx4";
    } else {
      selectedVoiceId = "FA6HhUjVbervLw2rNl8M";
    }
    await startStreaming("Emotional involvement.", selectedVoiceId); // Call startStreaming
  };

  return (
    <Select onValueChange={handleSelectChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a voice" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="Sofia">Sofia</SelectItem>
          <SelectItem value="成田悠輔">成田悠輔</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
