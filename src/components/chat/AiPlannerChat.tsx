import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, X, User, Save, ExternalLink, Trash2, Sparkles, Zap } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useSaveItinerary, useItineraries } from "@/hooks/useItineraries";
import { useAuth } from "@/hooks/useAuth";
import { useCopilot } from "@/contexts/CopilotContext";
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
    body: JSON.stringify({ messages: messages.map(m => ({ role: m.role, content: m.content || "Here are your plans!" })) }),
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
        if (hasToolCall && toolCallArgs) {
          try {
            const parsed = JSON.parse(toolCallArgs);
            if (parsed.city && Array.isArray(parsed.itineraries) && parsed.itineraries.length > 0) {
              const validItineraries = parsed.itineraries.filter((it: any) =>
                it.title && Array.isArray(it.stops) && it.stops.length > 0
              );
              if (validItineraries.length > 0) {
                onToolCall({ ...parsed, itineraries: validItineraries });
              }
            }
          } catch (e) {
            console.error("Failed to parse tool call args:", e);
          }
        }
        onDone();
        return;
      }
      try {
        const parsed = JSON.parse(json);
        const choice = parsed.choices?.[0];
        if (choice?.delta?.tool_calls?.[0]) {
          const tc = choice.delta.tool_calls[0];
          if (tc.function?.arguments) {
            hasToolCall = true;
            toolCallArgs += tc.function.arguments;
          }
        }
        const content = choice?.delta?.content;
        if (content) onDelta(content);
      } catch { /* partial json, skip */ }
    }
  }

  if (hasToolCall && toolCallArgs) {
    try {
      const parsed = JSON.parse(toolCallArgs);
      if (parsed.city && Array.isArray(parsed.itineraries) && parsed.itineraries.length > 0) {
        const validItineraries = parsed.itineraries.filter((it: any) =>
          it.title && Array.isArray(it.stops) && it.stops.length > 0
        );
        if (validItineraries.length > 0) {
          onToolCall({ ...parsed, itineraries: validItineraries });
        }
      }
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
  "Plan my night out in Berlin! 🌃",
  "Cheap date night in Munich? 💕",
  "What's happening this weekend? 🎉",
  "Something unique in Frankfurt 🍷",
];

export default function AiPlannerChat() {
  const { isOpen, setIsOpen, toggle } = useCopilot();
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

  const recentItineraries = itineraries?.slice(0, 3) || [];

  return (
    <>
      {/* Copilot toggle button - fixed to right edge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed top-1/2 -translate-y-1/2 z-50 group transition-all duration-500 ${
          isOpen ? "right-[400px] md:right-[420px]" : "right-0"
        }`}
        aria-label={isOpen ? "Close AI Planner" : "Open AI Planner"}
      >
        <span className={`relative flex items-center justify-center w-10 h-20 rounded-l-2xl
          bg-card/90 backdrop-blur-xl border border-r-0 border-primary/30
          shadow-[0_0_30px_hsl(var(--primary)/0.15)]
          group-hover:shadow-[0_0_40px_hsl(var(--primary)/0.35)]
          group-hover:border-primary/60 transition-all duration-300
          ${isOpen ? "bg-muted/80" : ""}`}
        >
          {isOpen ? (
            <X className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          ) : (
            <>
              <span className="absolute inset-0 rounded-l-2xl bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Sparkles className="w-5 h-5 text-primary drop-shadow-[0_0_8px_hsl(var(--primary)/0.6)] relative z-10" />
            </>
          )}
        </span>
      </button>

      {/* Backdrop overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Copilot side panel */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-[400px] md:w-[420px] max-w-[calc(100vw-3rem)] flex flex-col
          bg-card/95 backdrop-blur-2xl
          border-l border-primary/20
          shadow-[-8px_0_60px_hsl(var(--primary)/0.08),0_0_40px_hsl(var(--background)/0.6)]
          transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >

      {/* Header - Futuristic glassmorphism */}
      <div className="relative px-5 py-4 border-b border-primary/10">
        {/* Subtle gradient line at top */}
        <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

        <div className="flex items-center gap-3">
          {/* Avatar with animated ring */}
          <div className="relative">
            <span className="absolute -inset-1 rounded-xl bg-gradient-to-br from-primary via-secondary to-accent opacity-40 blur-sm animate-pulse" />
            <div className="relative w-10 h-10 rounded-xl bg-card border border-primary/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-heading font-bold text-sm tracking-wide text-foreground">Ausly AI</h3>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_6px_hsl(var(--accent)/0.8)]" />
              <p className="text-[10px] text-muted-foreground">Ready to plan your night</p>
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

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {messages.length === 0 ? (
          <div className="space-y-4 pt-2">
            {/* Welcome message */}
            <div className="flex gap-3">
              <div className="relative shrink-0 mt-0.5">
                <div className="w-7 h-7 rounded-lg bg-card border border-primary/20 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                </div>
              </div>
              <div className="rounded-2xl rounded-tl-md p-4 bg-muted/40 border border-border/50 backdrop-blur-sm">
                <p className="text-sm mb-1.5">Hey! 👋 I'm your AI nightlife guide for <strong className="text-primary">Germany</strong>.</p>
                <p className="text-xs text-muted-foreground">Tell me what you're in the mood for — I'll craft a plan you'll love ✨</p>
              </div>
            </div>

            {/* Quick starters - futuristic cards */}
            <div className="grid grid-cols-2 gap-2 pl-10">
              {quickStarters.map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="group/qs text-left text-[11px] px-3 py-3 rounded-xl
                    bg-muted/30 border border-border/50
                    hover:border-primary/40 hover:bg-primary/5 hover:shadow-[0_0_15px_hsl(var(--primary)/0.1)]
                    transition-all duration-300 leading-tight"
                >
                  <span className="group-hover/qs:text-primary transition-colors">{q}</span>
                </button>
              ))}
            </div>

            {recentItineraries.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <p className="text-[10px] font-medium text-muted-foreground pl-10 uppercase tracking-wider">Recent plans</p>
                {recentItineraries.map((it) => (
                  <button
                    key={it.id}
                    onClick={() => { setIsOpen(false); navigate(`/itinerary/${it.id}`); }}
                    className="block w-full text-left text-[11px] px-3 py-2 rounded-xl bg-muted/20 border border-border/30 hover:border-primary/30 hover:bg-primary/5 transition-all ml-10"
                    style={{ maxWidth: "calc(100% - 2.5rem)" }}
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
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                {msg.role === "user" ? (
                  <div className="w-7 h-7 rounded-lg bg-secondary/15 border border-secondary/20 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5 text-secondary" />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-card border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                  </div>
                )}
                <div className="max-w-[85%]">
                  {msg.role === "user" ? (
                    <div className="rounded-2xl rounded-tr-md px-4 py-2.5 text-sm
                      bg-gradient-to-br from-primary/90 to-primary text-primary-foreground
                      shadow-[0_2px_12px_hsl(var(--primary)/0.2)]">
                      <p>{msg.content}</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {msg.content && (
                        <div className="rounded-2xl rounded-tl-md p-3 text-sm
                          bg-muted/40 border border-border/50 backdrop-blur-sm">
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
              <div className="pl-10">
                <button
                  onClick={() => { setIsOpen(false); navigate(`/itinerary/${lastSavedId}`); }}
                  className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" /> View saved itinerary
                </button>
              </div>
            )}
          </>
        )}

        {/* Loading indicator */}
        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-lg bg-card border border-primary/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
            </div>
            <div className="rounded-2xl rounded-tl-md p-3 bg-muted/40 border border-border/50 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/80 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/80 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/80 animate-bounce" style={{ animationDelay: "300ms" }} />
                </span>
                <span className="text-xs text-muted-foreground">crafting your plan...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area - Futuristic */}
      <div className="p-3 border-t border-primary/10">
        {/* Gradient line */}
        <div className="absolute left-4 right-4 -top-[1px] h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <form
          onSubmit={(e) => { e.preventDefault(); send(input); }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="What are you in the mood for?"
            className="flex-1 text-sm h-10 rounded-xl bg-muted/30 border-border/50 focus:border-primary/50 focus:shadow-[0_0_12px_hsl(var(--primary)/0.1)] transition-all placeholder:text-muted-foreground/60"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isLoading}
            className="shrink-0 h-10 w-10 rounded-xl bg-primary/90 hover:bg-primary text-primary-foreground shadow-[0_0_15px_hsl(var(--primary)/0.3)] hover:shadow-[0_0_25px_hsl(var(--primary)/0.5)] transition-all disabled:shadow-none"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
    </>
  );
}
