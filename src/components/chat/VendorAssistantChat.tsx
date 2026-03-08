import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, X, Loader2, User, Trash2, BriefcaseBusiness } from "lucide-react";
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

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-lg overflow-hidden shadow-[0_0_24px_hsl(var(--primary)/0.4)] hover:scale-110 active:scale-95 transition-all duration-200 animate-fade-in group"
        aria-label="Open Vendor Assistant"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-600 opacity-90" />
        <div className="absolute inset-[2px] rounded-[6px] bg-background flex items-center justify-center">
          <BriefcaseBusiness className="w-6 h-6 text-amber-500" />
        </div>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-2rem)] h-[580px] max-h-[calc(100vh-4rem)] flex flex-col rounded-2xl border border-border bg-card shadow-2xl animate-fade-in overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-gradient-to-r from-amber-500/10 to-orange-500/5">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
          <BriefcaseBusiness className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-heading font-semibold text-sm">Vendor Assistant</h3>
          <p className="text-[10px] text-muted-foreground">Your AI business advisor</p>
        </div>
        <div className="flex items-center gap-1">
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
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 ? (
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shrink-0 mt-0.5">
                <BriefcaseBusiness className="w-4 h-4 text-white" />
              </div>
               <div className="glass-card p-3 rounded-2xl rounded-tl-sm text-sm">
                 <p className="mb-1">Hey there! 👋 I'm your <strong>business buddy</strong> — I've got all your stats, reviews, and bookings right here.</p>
                 <p className="text-xs text-muted-foreground">Ask me anything — let's grow your business together 🚀</p>
               </div>
            </div>
            <div className="grid grid-cols-2 gap-2 pl-9">
              {quickStarters.map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="text-left text-[11px] px-3 py-2.5 rounded-xl border border-border hover:border-amber-500/50 hover:bg-amber-500/5 transition-colors leading-tight"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              {msg.role === "user" ? (
                <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3 h-3 text-secondary" />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shrink-0 mt-0.5">
                  <BriefcaseBusiness className="w-3 h-3 text-white" />
                </div>
              )}
              <div className="max-w-[90%]">
                {msg.role === "user" ? (
                  <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm p-2.5 text-sm">
                    <p>{msg.content}</p>
                  </div>
                ) : (
                  <div className="glass-card p-2.5 rounded-2xl rounded-tl-sm text-sm">
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
          <div className="flex gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shrink-0">
              <BriefcaseBusiness className="w-3 h-3 text-white" />
            </div>
            <div className="glass-card p-2.5 rounded-2xl rounded-tl-sm">
              <div className="flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />
                <span className="text-xs text-muted-foreground">Analyzing your business...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border">
        <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your business..."
            className="flex-1 text-sm bg-muted/50 border-none h-9"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" variant="default" disabled={!input.trim() || isLoading} className="shrink-0 h-9 w-9 bg-amber-500 hover:bg-amber-600">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
