import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  MessageSquare,
  Send,
  Search,
  User,
  Clock,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface ConversationRow {
  id: string;
  venue_id: string | null;
  customer_id: string;
  vendor_id: string;
  booking_id: string | null;
  last_message_at: string;
  created_at: string;
}

interface MessageRow {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

const VendorMessages = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<ConversationRow[]>([]);
  const [selectedConv, setSelectedConv] = useState<ConversationRow | null>(null);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [customerNames, setCustomerNames] = useState<Record<string, string>>({});
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [lastMessages, setLastMessages] = useState<Record<string, string>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load conversations
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data, error } = await (supabase as any)
        .from("conversations")
        .select("*")
        .eq("vendor_id", user.id)
        .order("last_message_at", { ascending: false });

      if (error) {
        console.error("Error loading conversations:", error);
        setLoading(false);
        return;
      }

      const convs = (data || []) as ConversationRow[];
      setConversations(convs);

      // Load customer names
      const customerIds = [...new Set(convs.map((c) => c.customer_id))];
      if (customerIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, display_name, email")
          .in("id", customerIds);

        const names: Record<string, string> = {};
        (profiles || []).forEach((p: any) => {
          names[p.id] = p.display_name || p.email || "Customer";
        });
        setCustomerNames(names);
      }

      // Load unread counts & last messages
      const counts: Record<string, number> = {};
      const lasts: Record<string, string> = {};
      for (const conv of convs) {
        const { count } = await (supabase as any)
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("conversation_id", conv.id)
          .eq("is_read", false)
          .neq("sender_id", user.id);
        counts[conv.id] = count || 0;

        const { data: lastMsg } = await (supabase as any)
          .from("messages")
          .select("content")
          .eq("conversation_id", conv.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        lasts[conv.id] = (lastMsg as any)?.content || "No messages yet";
      }
      setUnreadCounts(counts);
      setLastMessages(lasts);
      setLoading(false);
    };
    load();
  }, [user]);

  // Load messages for selected conversation
  useEffect(() => {
    if (!selectedConv) return;
    const load = async () => {
      const { data } = await (supabase as any)
        .from("messages")
        .select("*")
        .eq("conversation_id", selectedConv.id)
        .order("created_at", { ascending: true });
      setMessages((data || []) as MessageRow[]);

      // Mark as read
      await (supabase as any)
        .from("messages")
        .update({ is_read: true })
        .eq("conversation_id", selectedConv.id)
        .neq("sender_id", user?.id || "");

      setUnreadCounts((prev) => ({ ...prev, [selectedConv.id]: 0 }));
    };
    load();
  }, [selectedConv, user]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("vendor-messages")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const msg = payload.new as MessageRow;
        if (selectedConv && msg.conversation_id === selectedConv.id) {
          setMessages((prev) => [...prev, msg]);
          // Mark as read immediately
          if (msg.sender_id !== user.id) {
            supabase.from("messages").update({ is_read: true }).eq("id", msg.id);
          }
        } else {
          // Update unread count
          setUnreadCounts((prev) => ({
            ...prev,
            [msg.conversation_id]: (prev[msg.conversation_id] || 0) + 1,
          }));
        }
        setLastMessages((prev) => ({ ...prev, [msg.conversation_id]: msg.content }));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, selectedConv]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConv || !user) return;
    const content = newMessage.trim();
    setNewMessage("");

    const { error } = await supabase.from("messages").insert({
      conversation_id: selectedConv.id,
      sender_id: user.id,
      content,
    });

    if (error) {
      toast({ title: "Failed to send", description: error.message, variant: "destructive" });
      return;
    }

    // Update conversation last_message_at
    await supabase
      .from("conversations")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", selectedConv.id);
  };

  const filteredConversations = conversations.filter((conv) => {
    const name = customerNames[conv.customer_id] || "";
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-primary">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">Messages</h1>
        <p className="text-muted-foreground mt-1">Communicate with your customers</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-250px)] min-h-[500px]">
        {/* Conversations List */}
        <Card className="glass-card lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-380px)] min-h-[400px]">
              {filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground text-center">
                    {conversations.length === 0 ? "No conversations yet. Messages from customers will appear here." : "No matching conversations"}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {filteredConversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConv(conv)}
                      className={cn(
                        "w-full text-left p-4 hover:bg-muted/50 transition-colors",
                        selectedConv?.id === conv.id && "bg-muted/50"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium truncate">
                                {customerNames[conv.customer_id] || "Customer"}
                              </p>
                              {(unreadCounts[conv.id] || 0) > 0 && (
                                <Badge className="bg-secondary text-secondary-foreground h-5 min-w-5 flex items-center justify-center">
                                  {unreadCounts[conv.id]}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground truncate mt-1">
                              {lastMessages[conv.id] || "No messages yet"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(conv.last_message_at), "MMM d, HH:mm")}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Message Thread */}
        <Card className="glass-card lg:col-span-2 flex flex-col">
          {selectedConv ? (
            <>
              <CardHeader className="border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {customerNames[selectedConv.customer_id] || "Customer"}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 p-4 overflow-hidden">
                <ScrollArea className="h-[calc(100vh-480px)] min-h-[300px]">
                  <div className="space-y-4">
                    {messages.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">No messages yet. Start the conversation!</p>
                    )}
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn("flex", msg.sender_id === user?.id ? "justify-end" : "justify-start")}
                      >
                        <div
                          className={cn(
                            "max-w-[70%] rounded-lg p-3",
                            msg.sender_id === user?.id
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          )}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <p
                            className={cn(
                              "text-xs mt-1",
                              msg.sender_id === user?.id ? "text-primary-foreground/70" : "text-muted-foreground"
                            )}
                          >
                            {format(new Date(msg.created_at), "HH:mm")}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={scrollRef} />
                  </div>
                </ScrollArea>
              </CardContent>

              <div className="p-4 border-t border-border/50">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="resize-none"
                    rows={2}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                  <Button onClick={sendMessage} className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              <MessageSquare className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Select a conversation</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Choose a conversation from the list to view and respond to customer messages.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default VendorMessages;
