import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageSquare, 
  Send, 
  Search,
  User,
  Clock
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Conversation {
  id: string;
  customerName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  bookingRef?: string;
}

interface Message {
  id: string;
  message: string;
  isFromVendor: boolean;
  createdAt: string;
}

const VendorMessages = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Mock conversations for demo since vendor_messages table may not exist yet
    const mockConversations: Conversation[] = [
      {
        id: "1",
        customerName: "Max Müller",
        lastMessage: "Is it possible to add a birthday cake to our reservation?",
        lastMessageTime: "2 hours ago",
        unreadCount: 2,
        bookingRef: "AUS-ABC123",
      },
      {
        id: "2",
        customerName: "Anna Schmidt",
        lastMessage: "Thank you for the quick response!",
        lastMessageTime: "5 hours ago",
        unreadCount: 0,
        bookingRef: "AUS-DEF456",
      },
      {
        id: "3",
        customerName: "Thomas Weber",
        lastMessage: "Can we change our reservation to 8pm instead?",
        lastMessageTime: "1 day ago",
        unreadCount: 1,
      },
    ];

    setConversations(mockConversations);
    setLoading(false);
  }, []);

  const loadMessages = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    
    // Mock messages
    const mockMessages: Message[] = [
      {
        id: "1",
        message: "Hello! I have a question about my upcoming reservation.",
        isFromVendor: false,
        createdAt: "2 hours ago",
      },
      {
        id: "2",
        message: "Hi! Of course, how can I help you?",
        isFromVendor: true,
        createdAt: "2 hours ago",
      },
      {
        id: "3",
        message: conversation.lastMessage,
        isFromVendor: false,
        createdAt: conversation.lastMessageTime,
      },
    ];

    setMessages(mockMessages);
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message: Message = {
      id: Date.now().toString(),
      message: newMessage,
      isFromVendor: true,
      createdAt: "Just now",
    };

    setMessages([...messages, message]);
    setNewMessage("");

    toast({
      title: "Message sent",
      description: "Your message has been sent successfully.",
    });
  };

  const filteredConversations = conversations.filter(conv =>
    conv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.bookingRef?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-primary">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-bold">Messages</h1>
        <p className="text-muted-foreground mt-1">
          Communicate with your customers
        </p>
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
                    No conversations yet
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {filteredConversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => loadMessages(conv)}
                      className={cn(
                        "w-full text-left p-4 hover:bg-muted/50 transition-colors",
                        selectedConversation?.id === conv.id && "bg-muted/50"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium truncate">{conv.customerName}</p>
                              {conv.unreadCount > 0 && (
                                <Badge className="bg-secondary text-secondary-foreground h-5 min-w-5 flex items-center justify-center">
                                  {conv.unreadCount}
                                </Badge>
                              )}
                            </div>
                            {conv.bookingRef && (
                              <p className="text-xs text-primary">{conv.bookingRef}</p>
                            )}
                            <p className="text-sm text-muted-foreground truncate mt-1">
                              {conv.lastMessage}
                            </p>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {conv.lastMessageTime}
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
          {selectedConversation ? (
            <>
              <CardHeader className="border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{selectedConversation.customerName}</CardTitle>
                    {selectedConversation.bookingRef && (
                      <p className="text-sm text-primary">{selectedConversation.bookingRef}</p>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 p-4 overflow-hidden">
                <ScrollArea className="h-[calc(100vh-480px)] min-h-[300px]">
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex",
                          msg.isFromVendor ? "justify-end" : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[70%] rounded-lg p-3",
                            msg.isFromVendor
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          )}
                        >
                          <p className="text-sm">{msg.message}</p>
                          <p className={cn(
                            "text-xs mt-1",
                            msg.isFromVendor ? "text-primary-foreground/70" : "text-muted-foreground"
                          )}>
                            {msg.createdAt}
                          </p>
                        </div>
                      </div>
                    ))}
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
                  <Button 
                    onClick={sendMessage}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
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
