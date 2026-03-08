import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, X, Loader2, User, Save, ExternalLink, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useSaveItinerary, useItineraries } from "@/hooks/useItineraries";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import ChatActionButton from "./ChatActionButton";
import ChatItineraryCards, { type ItineraryData, type ItineraryOption } from "./ChatItineraryCards";

type Msg = {
  role: "user" | "assistant";
  content: string;
  itineraryData?: ItineraryData | null;
};

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://dpbsxrqjendnoraasafs.supabase.co";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwYnN4cnFqZW5kbm9yYWFzYWZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMzAyMDksImV4cCI6MjA4MzgwNjIwOX0.785F_72arcwxdfZr2IvfBuxUGPUNFz0dd4cTzZBeXZg";
const CHAT_URL = `${SUPABASE_URL}/functions/v1/ai-planner`;

interface StreamResult {
  textContent: string;
  toolCallData: ItineraryData | null;
}

async function streamChat({
  messages,
  accessToken,
  onDelta,
  onDone,
  onError,
  onToolCall,
}: {
  messages: Array<{ role: string; content: string }>;
  accessToken: string | null;
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (err: string) => void;
  onToolCall: (data: ItineraryData) => void;
}) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken || SUPABASE_KEY}`,
  };

  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({ messages: messages.map(m => ({ role: m.role, content: m.content })) }),
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

  // Track tool call arguments being streamed
  let toolCallArgs = "";
  let hasToolCall = false;

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
      if (json === "[DONE]") {
        // If we accumulated a tool call, parse and emit it
        if (hasToolCall && toolCallArgs) {
          try {
            const parsed = JSON.parse(toolCallArgs);
            onToolCall(parsed);
          } catch (e) {
            console.error("Failed to parse tool call args:", e, toolCallArgs.slice(0, 200));
          }
        }
        onDone();
        return;
      }
      try {
        const parsed = JSON.parse(json);
        const choice = parsed.choices?.[0];

        // Check for tool call in delta
        if (choice?.delta?.tool_calls?.[0]) {
          const tc = choice.delta.tool_calls[0];
          if (tc.function?.arguments) {
            hasToolCall = true;
            toolCallArgs += tc.function.arguments;
          }
        }

        // Regular text content
        const content = choice?.delta?.content;
        if (content) onDelta(content);
      } catch { /* partial json, skip */ }
    }
  }

  // Final flush
  if (hasToolCall && toolCallArgs) {
    try {
      const parsed = JSON.parse(toolCallArgs);
      onToolCall(parsed);
    } catch (e) {
      console.error("Failed to parse tool call args:", e);
    }
  }
  onDone();
}

const ACTION_REGEX = /\{\{ACTION:([A-Z_]+):([^:]*):([^:]*):?([^}]*)\}\}/g;

function renderMessageContent(content: string) {
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
          <div key={i} className="prose prose-sm prose-invert max-w-none [&_p]:mb-1.5 [&_ul]:mb-1.5 [&_ol]:mb-1.5 [&_li]:text-xs [&_h1]:text-sm [&_h2]:text-xs [&_h3]:text-xs [&_h1]:font-heading [&_h2]:font-heading [&_h3]:font-heading">
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
  "Plan my night out in Berlin 🌃",
  "Date night in Munich under €50 💕",
  "Best weekend plan for Hamburg 🎉",
  "Chill evening in Frankfurt 🍷",
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

  const handleSaveItinerary = async (itinerary: ItineraryOption, city: string) => {
    if (!user) {
      toast({ title: "Sign in required", description: "Create an account to save itineraries.", variant: "destructive" });
      return;
    }
    try {
      const stops = itinerary.stops.map(s => ({
        name: s.name,
        type: s.type,
        time: s.time,
        description: s.description,
        cost: s.cost_estimate,
        venue_slug: s.slug,
        address: "",
      }));

      const saved = await saveItinerary.mutateAsync({
        title: `${itinerary.emoji} ${itinerary.title}`,
        city,
        content: `# ${itinerary.title}\n\n${itinerary.stops.map(s => `**${s.time}** — ${s.name}\n${s.description}\n*${s.cost_estimate}*`).join("\n\n")}`,
        stops,
        estimated_cost: itinerary.estimated_total,
      });
      setLastSavedId(saved.id);
      toast({ title: "Plan saved! ✨", description: "View it anytime from your profile." });
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
    let itineraryData: ItineraryData | null = null;

    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar, itineraryData } : m);
        }
        return [...prev, { role: "assistant", content: assistantSoFar, itineraryData }];
      });
    };

    const setToolData = (data: ItineraryData) => {
      itineraryData = data;
      // Update the current assistant message with the itinerary data
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => i === prev.length - 1 ? { ...m, itineraryData: data } : m);
        }
        return [...prev, { role: "assistant", content: assistantSoFar || "Here are your plans! ✨", itineraryData: data }];
      });
    };

    try {
      const { data: { session } } = await (await import("@/integrations/supabase/client")).supabase.auth.getSession();
      const accessToken = session?.access_token || null;

      await streamChat({
        messages: newMessages,
        accessToken,
        onDelta: upsert,
        onToolCall: setToolData,
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
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-lg overflow-hidden shadow-[0_0_24px_hsl(var(--primary)/0.4),0_0_48px_hsl(var(--secondary)/0.2)] hover:scale-110 active:scale-95 transition-all duration-200 animate-fade-in group"
        aria-label="Open AI Planner"
      >
        <span className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary to-secondary opacity-40 animate-ping" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-primary opacity-90" />
        <div className="absolute inset-[2px] rounded-[6px] bg-background flex items-center justify-center">
          <span className="text-xl font-heading font-extrabold gradient-text leading-none">A</span>
        </div>
      </button>
    );
  }

  const recentItineraries = itineraries?.slice(0, 3) || [];

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-2rem)] h-[580px] max-h-[calc(100vh-4rem)] flex flex-col rounded-2xl border border-border bg-card shadow-2xl shadow-primary/10 animate-fade-in overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-gradient-to-r from-card to-card/80">
        <div className="relative w-9 h-9 rounded-lg overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-primary opacity-90" />
          <div className="absolute inset-[2px] rounded-[6px] bg-background flex items-center justify-center">
            <span className="text-sm font-heading font-extrabold gradient-text leading-none">A</span>
          </div>
        </div>
        <div className="flex-1">
          <h3 className="font-heading font-semibold text-sm">Ausly AI Planner</h3>
          <p className="text-[10px] text-muted-foreground">Visual plans for your perfect night</p>
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
              <div className="relative w-7 h-7 rounded-lg overflow-hidden shrink-0 mt-0.5">
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-primary opacity-90" />
                <div className="absolute inset-[1.5px] rounded-[5px] bg-background flex items-center justify-center">
                  <span className="text-[10px] font-heading font-extrabold gradient-text leading-none">A</span>
                </div>
              </div>
              <div className="glass-card p-3 rounded-2xl rounded-tl-sm text-sm">
                <p className="mb-1">Hey! 👋 I'll create <strong>visual itinerary cards</strong> with venues you can tap to explore.</p>
                <p className="text-xs text-muted-foreground">Tell me your city & vibe — I'll do the rest!</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 pl-9">
              {quickStarters.map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="text-left text-[11px] px-3 py-2.5 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors leading-tight"
                >
                  {q}
                </button>
              ))}
            </div>

            {recentItineraries.length > 0 && (
              <div className="space-y-1.5 pt-2">
                <p className="text-[10px] font-medium text-muted-foreground pl-9">📋 Recent plans:</p>
                {recentItineraries.map((it) => (
                  <button
                    key={it.id}
                    onClick={() => { setIsOpen(false); navigate(`/itinerary/${it.id}`); }}
                    className="block w-full text-left text-[11px] px-3 py-2 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors ml-9"
                    style={{ maxWidth: "calc(100% - 2.25rem)" }}
                  >
                    <span className="font-medium">{it.title}</span>
                    <span className="text-muted-foreground ml-1.5">• {it.city}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                {msg.role === "user" ? (
                  <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3 h-3 text-secondary" />
                  </div>
                ) : (
                  <div className="relative w-6 h-6 rounded-md overflow-hidden shrink-0 mt-0.5">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-primary opacity-90" />
                    <div className="absolute inset-[1.5px] rounded-[3px] bg-background flex items-center justify-center">
                      <span className="text-[8px] font-heading font-extrabold gradient-text leading-none">A</span>
                    </div>
                  </div>
                )}
                <div className={`max-w-[90%] ${msg.role === "user" ? "" : ""}`}>
                  {msg.role === "user" ? (
                    <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm p-2.5 text-sm">
                      <p>{msg.content}</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {msg.content && (
                        <div className="glass-card p-2.5 rounded-2xl rounded-tl-sm text-sm">
                          {renderMessageContent(msg.content)}
                        </div>
                      )}
                      {msg.itineraryData && (
                        <ChatItineraryCards
                          data={msg.itineraryData}
                          onSelect={(itinerary) => handleSaveItinerary(itinerary, msg.itineraryData!.city)}
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {lastSavedId && !isLoading && (
              <div className="pl-8">
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
            <div className="relative w-6 h-6 rounded-md overflow-hidden shrink-0">
              <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-primary opacity-90" />
              <div className="absolute inset-[1.5px] rounded-[3px] bg-background flex items-center justify-center">
                <span className="text-[8px] font-heading font-extrabold gradient-text leading-none">A</span>
              </div>
            </div>
            <div className="glass-card p-2.5 rounded-2xl rounded-tl-sm">
              <div className="flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                <span className="text-xs text-muted-foreground">Planning your night...</span>
              </div>
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
            className="flex-1 text-sm bg-muted/50 border-none h-9"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" variant="default" disabled={!input.trim() || isLoading} className="shrink-0 h-9 w-9">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
