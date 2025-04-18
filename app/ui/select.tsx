import * as React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { startStreaming } from "../utils/start_streaming";
import { Mic } from "lucide-react";

// Initialize with default value
export let selectedVoiceId = "FA6HhUjVbervLw2rNl8M";

// Voice mapping
const voiceMap: Record<string, string> = {
  Sofia: "FA6HhUjVbervLw2rNl8M",
  成田悠輔: "TGQoVZu1ti5oWoox4wx4",
};

export function SelectDemo() {
  const [selectedVoice, setSelectedVoice] = React.useState("Sofia");
  const [samplePlaying, setSamplePlaying] = React.useState(false);

  const handleSelectChange = async (value: string) => {
    // 既に再生中なら何もしない
    if (samplePlaying) {
      return;
    }

    setSelectedVoice(value);
    selectedVoiceId = voiceMap[value] || voiceMap["Sofia"];

    // Play a short sample of the selected voice
    try {
      setSamplePlaying(true);
      await startStreaming("Voice selected.", selectedVoiceId);
    } catch (error) {
      console.error("Error playing voice sample:", error);
    } finally {
      setSamplePlaying(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Mic size={16} className="text-zinc-500" />
      <Select onValueChange={handleSelectChange} defaultValue="Sofia">
        <SelectTrigger className="w-[150px] bg-zinc-800 border-zinc-700 text-white focus:ring-blue-400 focus:ring-offset-zinc-800">
          <SelectValue placeholder="音声を選択" />
        </SelectTrigger>
        <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
          <SelectGroup>
            <SelectItem
              value="Sofia"
              className="focus:bg-zinc-700 focus:text-white cursor-pointer"
            >
              Sofia
            </SelectItem>
            <SelectItem
              value="成田悠輔"
              className="focus:bg-zinc-700 focus:text-white cursor-pointer"
            >
              成田悠輔
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      {samplePlaying && (
        <div className="animate-pulse text-blue-400">
          <span className="sr-only">再生中</span>
          <div className="h-2 w-2 rounded-full bg-blue-400"></div>
        </div>
      )}
    </div>
  );
}
