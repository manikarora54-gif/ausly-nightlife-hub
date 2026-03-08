import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Send, X, Loader2, Bot, User, Save, ExternalLink, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useSaveItinerary, useItineraries } from "@/hooks/useItineraries";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import ChatActionButton from "./ChatActionButton";

type Msg = { role: "user" | "assistant"; content: string };

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://dpbsxrqjendnoraasafs.supabase.co";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwYnN4cnFqZW5kbm9yYWFzYWZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMzAyMDksImV4cCI6MjA4MzgwNjIwOX0.785F_72arcwxdfZr2IvfBuxUGPUNFz0dd4cTzZBeXZg";
const CHAT_URL = `${SUPABASE_URL}/functions/v1/ai-planner`;

async function streamChat({
  messages,
  accessToken,
  onDelta,
  onDone,
  onError,
}: {
  messages: Msg[];
  accessToken: string | null;
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (err: string) => void;
}) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken || SUPABASE_KEY}`,
  };

  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({ messages }),
  });

  if (!resp.ok) {
    const data = await resp.json().catch(() => ({}));
    onError(data.error || "Something went wrong. Please try again.");
    return;
  }

  if (!resp.body) { onError("No response stream"); return; }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let idx: number;
    while ((idx = buffer.indexOf("\n")) !== -1) {
      let line = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (!line.startsWith("data: ")) continue;
      const json = line.slice(6).trim();
      if (json === "[DONE]") { onDone(); return; }
      try {
        const parsed = JSON.parse(json);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) onDelta(content);
      } catch { /* partial json, skip */ }
    }
  }
  onDone();
}

const ACTION_REGEX = /\{\{ACTION:([A-Z_]+):([^:]*):([^:]*):?([^}]*)\}\}/g;

function renderMessageWithActions(content: string) {
  const parts: Array<{ type: "text"; value: string } | { type: "action"; actionType: string; param1: string; param2: string; label: string }> = [];
  let lastIndex = 0;

  let match;
  const regex = new RegExp(ACTION_REGEX.source, "g");
  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", value: content.slice(lastIndex, match.index) });
    }
    parts.push({
      type: "action",
      actionType: match[1],
      param1: match[2],
      param2: match[3],
      label: match[4] || match[3] || "View",
    });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < content.length) {
    parts.push({ type: "text", value: content.slice(lastIndex) });
  }

  return (
    <div className="space-y-1">
      {parts.map((part, i) =>
        part.type === "text" ? (
          <div key={i} className="prose prose-sm prose-invert max-w-none [&_p]:mb-2 [&_ul]:mb-2 [&_ol]:mb-2 [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm [&_h1]:font-heading [&_h2]:font-heading [&_h3]:font-heading [&_li]:text-xs">
            <ReactMarkdown>{part.value}</ReactMarkdown>
          </div>
        ) : (
          <ChatActionButton
            key={i}
            type={part.actionType}
            param1={part.param1}
            param2={part.param2}
            label={part.label}
          />
        )
      )}
    </div>
  );
}

const CHAT_STORAGE_KEY = "ausly-ai-chat-history";

function loadChatHistory(): Msg[] {
  try {
    const stored = sessionStorage.getItem(CHAT_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

function saveChatHistory(messages: Msg[]) {
  try {
    sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
  } catch { /* quota exceeded */ }
}

const quickStarters = [
  "Find me a rooftop bar in Berlin for tonight 🌃",
  "Plan a budget date night in Munich under €50 💕",
  "What events are happening this weekend? 🎉",
  "Best restaurants near me for a group dinner 🍽️",
];

export default function AiPlannerChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>(loadChatHistory);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastSavedId, setLastSavedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const saveItinerary = useSaveItinerary();
  const { user } = useAuth();
  const { data: itineraries } = useItineraries();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSave = async () => {
    const lastAssistant = [...messages].reverse().find(m => m.role === "assistant");
    if (!lastAssistant || !user) return;
    try {
      const cityMatch = lastAssistant.content.match(/(?:Berlin|Munich|Hamburg|Frankfurt|Cologne|Düsseldorf)/i);
      const city = cityMatch ? cityMatch[0] : "Germany";
      const titleMatch = lastAssistant.content.match(/^#\s*(.+)/m);
      const title = titleMatch ? titleMatch[1].slice(0, 80) : `Itinerary - ${city}`;
      const saved = await saveItinerary.mutateAsync({
        title,
        city,
        content: lastAssistant.content.replace(ACTION_REGEX, ""),
        stops: [],
      });
      setLastSavedId(saved.id);
      toast({ title: "Itinerary saved! ✨", description: "View it in your profile." });
    } catch {
      toast({ title: "Error saving", description: "Please try again.", variant: "destructive" });
    }
  };

  useEffect(() => {
    saveChatHistory(messages);
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleClearChat = () => {
    setMessages([]);
    setLastSavedId(null);
    sessionStorage.removeItem(CHAT_STORAGE_KEY);
  };

  const send = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Msg = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    setLastSavedId(null);

    let assistantSoFar = "";
    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      const { data: { session } } = await (await import("@/integrations/supabase/client")).supabase.auth.getSession();
      const accessToken = session?.access_token || null;

      await streamChat({
        messages: newMessages,
        accessToken,
        onDelta: upsert,
        onDone: () => setIsLoading(false),
        onError: (err) => {
          upsert(`\n\n⚠️ ${err}`);
          setIsLoading(false);
        },
      });
    } catch {
      upsert("\n\n⚠️ Connection error. Please try again.");
      setIsLoading(false);
    }
  }, [messages, isLoading]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-primary via-secondary to-primary text-primary-foreground shadow-[0_0_24px_hsl(var(--primary)/0.4),0_0_48px_hsl(var(--secondary)/0.2)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200 animate-fade-in group"
        aria-label="Open AI Planner"
      >
        {/* Animated ring */}
        <span className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-secondary opacity-40 animate-ping" />
        <span className="relative font-heading font-black text-lg tracking-tight">A</span>
      </button>
    );
  }

  const recentItineraries = itineraries?.slice(0, 3) || [];

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-4rem)] flex flex-col rounded-2xl border border-border bg-card shadow-2xl shadow-primary/10 animate-fade-in overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-gradient-to-r from-card to-card/80">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-[0_0_12px_hsl(var(--primary)/0.3)]">
          <span className="font-heading font-black text-sm text-primary-foreground">A</span>
        </div>
        <div className="flex-1">
          <h3 className="font-heading font-semibold text-sm">Ausly AI Planner</h3>
          <p className="text-xs text-muted-foreground">Plan, discover & book instantly</p>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && user && (
            <button onClick={handleSave} className="p-1.5 rounded-lg hover:bg-muted transition-colors" title="Save itinerary">
              <Save className="w-4 h-4 text-primary" />
            </button>
          )}
          {messages.length > 0 && (
            <button onClick={handleClearChat} className="p-1.5 rounded-lg hover:bg-muted transition-colors" title="Clear chat">
              <Trash2 className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
          <button onClick={() => setIsOpen(false)} className="p-1 rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                <span className="font-heading font-black text-[10px] text-primary-foreground">A</span>
              </div>
              <div className="glass-card p-3 rounded-2xl rounded-tl-sm text-sm">
                <p>Hey! 👋 I'm your AI nightlife planner. I can help you discover venues, plan itineraries, and even <strong>book directly</strong> — just tell me what you're in the mood for!</p>
              </div>
            </div>
            <div className="space-y-2 pl-9">
              {quickStarters.map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="block w-full text-left text-xs px-3 py-2 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Recent saved itineraries */}
            {recentItineraries.length > 0 && (
              <div className="space-y-2 pt-2">
                <p className="text-xs font-medium text-muted-foreground pl-9">📋 Your recent plans:</p>
                {recentItineraries.map((it) => (
                  <button
                    key={it.id}
                    onClick={() => { setIsOpen(false); navigate(`/itinerary/${it.id}`); }}
                    className="block w-full text-left text-xs px-3 py-2 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors ml-9 mr-0"
                    style={{ maxWidth: "calc(100% - 2.25rem)" }}
                  >
                    <span className="font-medium">{it.title}</span>
                    <span className="text-muted-foreground ml-2">• {it.city}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  msg.role === "user" ? "bg-secondary/20 rounded-full" : "bg-gradient-to-br from-primary to-secondary rounded-lg shadow-sm"
                }`}>
                  {msg.role === "user" ? <User className="w-3.5 h-3.5 text-secondary" /> : <span className="font-heading font-black text-[10px] text-primary-foreground">A</span>}
                </div>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "glass-card rounded-tl-sm"
                }`}>
                  {msg.role === "assistant" ? renderMessageWithActions(msg.content) : <p>{msg.content}</p>}
                </div>
              </div>
            ))}

            {/* Show "View saved" link after saving */}
            {lastSavedId && !isLoading && (
              <div className="pl-9">
                <button
                  onClick={() => { setIsOpen(false); navigate(`/itinerary/${lastSavedId}`); }}
                  className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                >
                  <ExternalLink className="w-3 h-3" /> View saved itinerary
                </button>
              </div>
            )}
          </>
        )}
        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex gap-2">
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="glass-card p-3 rounded-2xl rounded-tl-sm">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border">
        <form
          onSubmit={(e) => { e.preventDefault(); send(input); }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="What are you in the mood for?"
            className="flex-1 text-sm bg-muted/50 border-none"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" variant="default" disabled={!input.trim() || isLoading} className="shrink-0">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
