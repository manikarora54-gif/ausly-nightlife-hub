import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Send, X, Loader2, Bot, User, Save } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useSaveItinerary } from "@/hooks/useItineraries";
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

// Parse action markers from AI response and split into text segments and action buttons
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const saveItinerary = useSaveItinerary();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSave = async () => {
    const lastAssistant = [...messages].reverse().find(m => m.role === "assistant");
    if (!lastAssistant || !user) return;
    try {
      const cityMatch = lastAssistant.content.match(/(?:Berlin|Munich|Hamburg|Frankfurt|Cologne|Düsseldorf)/i);
      const city = cityMatch ? cityMatch[0] : "Germany";
      const titleMatch = lastAssistant.content.match(/^#\s*(.+)/m);
      const title = titleMatch ? titleMatch[1].slice(0, 80) : `Itinerary - ${city}`;
      await saveItinerary.mutateAsync({
        title,
        city,
        content: lastAssistant.content.replace(ACTION_REGEX, ""),
        stops: [],
      });
      toast({ title: "Itinerary saved! ✨", description: "View it in your profile." });
    } catch {
      toast({ title: "Error saving", description: "Please try again.", variant: "destructive" });
    }
  };

  // Persist chat history to sessionStorage
  useEffect(() => {
    saveChatHistory(messages);
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const send = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Msg = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

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
      // Get the user's session token for proper server-side auth
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
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 flex items-center justify-center hover:scale-110 transition-transform animate-fade-in"
        aria-label="Open AI Planner"
      >
        <Sparkles className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-4rem)] flex flex-col rounded-2xl border border-border bg-card shadow-2xl shadow-primary/10 animate-fade-in overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-heading font-semibold text-sm">Ausly AI Planner</h3>
          <p className="text-xs text-muted-foreground">Plan, discover & book instantly</p>
        </div>
        {messages.length > 0 && user && (
          <button onClick={handleSave} className="p-1.5 rounded-lg hover:bg-muted transition-colors" title="Save itinerary">
            <Save className="w-4 h-4 text-primary" />
          </button>
        )}
        <button onClick={() => setIsOpen(false)} className="p-1 rounded-lg hover:bg-muted transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5 text-primary" />
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
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                msg.role === "user" ? "bg-secondary/20" : "bg-primary/20"
              }`}>
                {msg.role === "user" ? <User className="w-3.5 h-3.5 text-secondary" /> : <Bot className="w-3.5 h-3.5 text-primary" />}
              </div>
              <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-tr-sm"
                  : "glass-card rounded-tl-sm"
              }`}>
                {msg.role === "assistant" ? renderMessageWithActions(msg.content) : <p>{msg.content}</p>}
              </div>
            </div>
          ))
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
