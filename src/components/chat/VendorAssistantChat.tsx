import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, X, User, Trash2, BriefcaseBusiness, Zap } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/hooks/useAuth";

type Msg = { role: "user" | "assistant"; content: string };

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://dpbsxrqjendnoraasafs.supabase.co";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwYnN4cnFqZW5kbm9yYWFzYWZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMzAyMDksImV4cCI6MjA4MzgwNjIwOX0.785F_72arcwxdfZr2IvfBuxUGPUNFz0dd4cTzZBeXZg";
const CHAT_URL = `${SUPABASE_URL}/functions/v1/vendor-assistant`;

const VENDOR_STORAGE_KEY = "ausly-vendor-chat-history";

function loadChatHistory(): Msg[] {
  try {
    const stored = sessionStorage.getItem(VENDOR_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

function saveChatHistory(messages: Msg[]) {
  try {
    sessionStorage.setItem(VENDOR_STORAGE_KEY, JSON.stringify(messages));
  } catch { /* quota exceeded */ }
}

const quickStarters = [
  "How's my business doing? 📊",
  "Any tips for better reviews? ⭐",
  "Help me get more bookings 📈",
  "I want to create an event 🎉",
];

async function streamChat({
  messages,
  accessToken,
  onDelta,
  onDone,
  onError,
}: {
  messages: Array<{ role: string; content: string }>;
  accessToken: string | null;
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (err: string) => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken || SUPABASE_KEY}`,
    },
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
      } catch { /* partial json */ }
    }
  }
  onDone();
}

export default function VendorAssistantChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>(loadChatHistory);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => { saveChatHistory(messages); }, [messages]);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  const handleClearChat = () => {
    setMessages([]);
    sessionStorage.removeItem(VENDOR_STORAGE_KEY);
  };

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

  // --- FUTURISTIC FAB ---
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 group"
        aria-label="Open Vendor Assistant"
      >
        <span className="absolute inset-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary via-accent to-primary opacity-40 blur-lg group-hover:opacity-70 transition-opacity duration-500 animate-pulse" />
        <span className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-card/80 backdrop-blur-xl border border-secondary/30 shadow-[0_0_30px_hsl(var(--secondary)/0.2)] group-hover:shadow-[0_0_40px_hsl(var(--secondary)/0.4)] group-hover:border-secondary/60 transition-all duration-300 group-hover:scale-105 active:scale-95">
          <BriefcaseBusiness className="w-6 h-6 text-secondary drop-shadow-[0_0_8px_hsl(var(--secondary)/0.5)]" />
        </span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[420px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-4rem)] flex flex-col rounded-3xl overflow-hidden animate-scale-in
      bg-card/90 backdrop-blur-2xl
      border border-secondary/20
      shadow-[0_0_60px_hsl(var(--secondary)/0.1),0_8px_32px_hsl(var(--background)/0.8)]">

      {/* Header */}
      <div className="relative px-5 py-4 border-b border-secondary/10">
        <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-secondary/50 to-transparent" />

        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="absolute -inset-1 rounded-xl bg-gradient-to-br from-secondary to-accent opacity-30 blur-sm animate-pulse" />
            <div className="relative w-10 h-10 rounded-xl bg-card border border-secondary/30 flex items-center justify-center">
              <BriefcaseBusiness className="w-5 h-5 text-secondary" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-heading font-bold text-sm tracking-wide text-foreground">Vendor Assistant</h3>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_6px_hsl(var(--accent)/0.8)]" />
              <p className="text-[10px] text-muted-foreground">Your AI business advisor</p>
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            {messages.length > 0 && (
              <button onClick={handleClearChat} className="p-2 rounded-xl hover:bg-muted/50 transition-colors" title="Clear chat">
                <Trash2 className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
              </button>
            )}
            <button onClick={() => setIsOpen(false)} className="p-2 rounded-xl hover:bg-muted/50 transition-colors">
              <X className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {messages.length === 0 ? (
          <div className="space-y-4 pt-2">
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-lg bg-card border border-secondary/20 flex items-center justify-center shrink-0 mt-0.5">
                <BriefcaseBusiness className="w-3.5 h-3.5 text-secondary" />
              </div>
              <div className="rounded-2xl rounded-tl-md p-4 bg-muted/40 border border-border/50 backdrop-blur-sm">
                <p className="text-sm mb-1.5">Hey! 👋 I'm your <strong className="text-secondary">business buddy</strong> — stats, reviews, and bookings at my fingertips.</p>
                <p className="text-xs text-muted-foreground">Ask me anything — let's grow together 🚀</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 pl-10">
              {quickStarters.map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="group/qs text-left text-[11px] px-3 py-3 rounded-xl
                    bg-muted/30 border border-border/50
                    hover:border-secondary/40 hover:bg-secondary/5 hover:shadow-[0_0_15px_hsl(var(--secondary)/0.1)]
                    transition-all duration-300 leading-tight"
                >
                  <span className="group-hover/qs:text-secondary transition-colors">{q}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              {msg.role === "user" ? (
                <div className="w-7 h-7 rounded-lg bg-secondary/15 border border-secondary/20 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5 text-secondary" />
                </div>
              ) : (
                <div className="w-7 h-7 rounded-lg bg-card border border-secondary/20 flex items-center justify-center shrink-0 mt-0.5">
                  <BriefcaseBusiness className="w-3.5 h-3.5 text-secondary" />
                </div>
              )}
              <div className="max-w-[85%]">
                {msg.role === "user" ? (
                  <div className="rounded-2xl rounded-tr-md px-4 py-2.5 text-sm
                    bg-gradient-to-br from-secondary/90 to-secondary text-secondary-foreground
                    shadow-[0_2px_12px_hsl(var(--secondary)/0.2)]">
                    <p>{msg.content}</p>
                  </div>
                ) : (
                  <div className="rounded-2xl rounded-tl-md p-3 text-sm bg-muted/40 border border-border/50 backdrop-blur-sm">
                    <div className="prose prose-sm prose-invert max-w-none [&_p]:mb-1.5 [&_ul]:mb-1.5 [&_ol]:mb-1.5 [&_li]:text-xs [&_h1]:text-sm [&_h2]:text-xs [&_h3]:text-xs">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-lg bg-card border border-secondary/20 flex items-center justify-center shrink-0">
              <BriefcaseBusiness className="w-3.5 h-3.5 text-secondary animate-pulse" />
            </div>
            <div className="rounded-2xl rounded-tl-md p-3 bg-muted/40 border border-border/50 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary/80 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary/80 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary/80 animate-bounce" style={{ animationDelay: "300ms" }} />
                </span>
                <span className="text-xs text-muted-foreground">analyzing your data...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-secondary/10">
        <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your business..."
            className="flex-1 text-sm h-10 rounded-xl bg-muted/30 border-border/50 focus:border-secondary/50 focus:shadow-[0_0_12px_hsl(var(--secondary)/0.1)] transition-all placeholder:text-muted-foreground/60"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isLoading}
            className="shrink-0 h-10 w-10 rounded-xl bg-secondary/90 hover:bg-secondary text-secondary-foreground shadow-[0_0_15px_hsl(var(--secondary)/0.25)] hover:shadow-[0_0_25px_hsl(var(--secondary)/0.45)] transition-all disabled:shadow-none"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
