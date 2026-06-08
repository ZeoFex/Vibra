"use client";

import { useState } from "react";
import { Sparkles, Send, Music, Loader2 } from "lucide-react";
import { aiSuggestions, songs, moods } from "@/lib/mock-data";
import { usePlayer } from "@/lib/contexts/app-context";
import { SongCard } from "@/components/music/music-cards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  songs?: typeof songs;
}

export default function AIPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm Vibra AI. Tell me what kind of music you're in the mood for, and I'll curate the perfect playlist for you.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const { play } = usePlayer();

  const generateResponse = async (prompt: string) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));

    const lower = prompt.toLowerCase();
    let responseSongs = [...songs].sort(() => Math.random() - 0.5).slice(0, 5);
    let responseText = "Here's a personalized playlist based on your request:";

    if (lower.includes("workout") || lower.includes("energy")) {
      responseSongs = songs.filter((s) => ["Rock", "Hip-Hop", "Electronic"].includes(s.genre)).slice(0, 5);
      responseText = "Here's a high-energy workout playlist to keep you moving:";
    } else if (lower.includes("chill") || lower.includes("relax") || lower.includes("evening")) {
      responseSongs = songs.filter((s) => ["Lo-Fi", "Ambient", "Indie"].includes(s.genre)).slice(0, 5);
      responseText = "Here's a chill mix perfect for winding down:";
    } else if (lower.includes("focus") || lower.includes("coding") || lower.includes("work")) {
      responseSongs = songs.filter((s) => ["Lo-Fi", "Ambient"].includes(s.genre)).slice(0, 5);
      responseText = "Here's a focus playlist to boost your productivity:";
    } else if (lower.includes("similar") || lower.includes("neon")) {
      responseSongs = songs.filter((s) => s.genre === "Electronic").slice(0, 5);
      responseText = "Based on your taste, you might enjoy these similar tracks:";
    }

    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: responseText, songs: responseSongs },
    ]);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const prompt = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: prompt }]);
    await generateResponse(prompt);
  };

  const handleSuggestion = async (suggestion: string) => {
    setMessages((prev) => [...prev, { role: "user", content: suggestion }]);
    await generateResponse(suggestion);
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600">
          <Sparkles size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Vibra AI</h1>
          <p className="text-sm text-white/50">Your intelligent music curator</p>
        </div>
      </div>

      {/* Mood quick picks */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {moods.map((mood) => (
          <button
            key={mood.id}
            onClick={() => handleSuggestion(`Play ${mood.name.toLowerCase()} music`)}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-full bg-gradient-to-r px-4 py-2 text-sm font-medium transition-transform hover:scale-105",
              mood.gradient
            )}
          >
            <span>{mood.emoji}</span>
            {mood.name}
          </button>
        ))}
      </div>

      {/* Chat */}
      <div className="flex min-h-[280px] flex-col rounded-2xl border border-white/10 bg-white/5 sm:min-h-[400px]">
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3",
                  msg.role === "user"
                    ? "bg-violet-600 text-white"
                    : "bg-white/10 text-white/90"
                )}
              >
                <p className="text-sm">{msg.content}</p>
                {msg.songs && (
                  <div className="mt-3 space-y-1 border-t border-white/10 pt-3">
                    {msg.songs.map((song, j) => (
                      <SongCard
                        key={song.id}
                        song={song}
                        index={j + 1}
                        onPlay={() => play(song, msg.songs!)}
                      />
                    ))}
                    <Button
                      variant="secondary"
                      size="sm"
                      className="mt-2 w-full gap-1"
                      onClick={() => msg.songs?.[0] && play(msg.songs[0], msg.songs)}
                    >
                      <Music size={14} />
                      Play All
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-white/50">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm">Vibra AI is thinking...</span>
            </div>
          )}
        </div>

        {/* Suggestions */}
        <div className="border-t border-white/10 p-3">
          <div className="mb-3 flex flex-wrap gap-2">
            {aiSuggestions.slice(0, 3).map((s) => (
              <button
                key={s}
                onClick={() => handleSuggestion(s)}
                className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              >
                {s}
              </button>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              placeholder="Ask Vibra AI anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <Button type="submit" size="icon" disabled={loading || !input.trim()}>
              <Send size={18} />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
