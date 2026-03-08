import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle, Clock, CheckCircle2, XCircle, Search, Loader2, Send, MessageSquare, User,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

const STATUS_CONFIG: Record<string, { icon: any; label: string; color: string }> = {
  open: { icon: AlertTriangle, label: "Open", color: "bg-yellow-500/20 text-yellow-400" },
  in_progress: { icon: Clock, label: "In Progress", color: "bg-primary/20 text-primary" },
  resolved: { icon: CheckCircle2, label: "Resolved", color: "bg-green-500/20 text-green-400" },
  closed: { icon: XCircle, label: "Closed", color: "bg-muted text-muted-foreground" },
};

const PRIORITIES: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-yellow-500/20 text-yellow-400",
  high: "bg-orange-500/20 text-orange-400",
  urgent: "bg-destructive/20 text-destructive",
};

const AdminGrievances = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("open");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState("");
  const [sending, setSending] = useState(false);

  const { data: grievances = [], isLoading } = useQuery({
    queryKey: ["admin-grievances"],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("grievances")
        .select("*")
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const { data: responses = [], refetch: refetchResponses } = useQuery({
    queryKey: ["admin-grievance-responses", selectedId],
    queryFn: async () => {
      if (!selectedId) return [];
      const { data } = await (supabase as any)
        .from("grievance_responses")
        .select("*")
        .eq("grievance_id", selectedId)
        .order("created_at", { ascending: true });
      return data || [];
    },
    enabled: !!selectedId,
  });

  // Fetch submitter profiles
  const submitterIds = [...new Set(grievances.map((g: any) => g.user_id))] as string[];
  const { data: profiles = [] } = useQuery({
    queryKey: ["grievance-profiles", submitterIds.join(",")],
    queryFn: async () => {
      if (submitterIds.length === 0) return [];
      const { data } = await supabase.from("profiles").select("id, display_name, email").in("id", submitterIds);
      return data || [];
    },
    enabled: submitterIds.length > 0,
  });

  const profileMap: Record<string, string> = {};
  profiles.forEach((p: any) => { profileMap[p.id] = p.display_name || p.email || "Unknown"; });

  const selected = grievances.find((g: any) => g.id === selectedId);

  const filtered = grievances.filter((g: any) => {
    const matchesTab = activeTab === "all" || g.status === activeTab;
    const matchesSearch = !searchQuery ||
      g.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (profileMap[g.user_id] || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const updateStatus = async (id: string, status: string) => {
    const { error } = await (supabase as any)
      .from("grievances")
      .update({ status })
      .eq("id", id);
    if (error) {
      toast({ title: "Failed to update status", variant: "destructive" });
    } else {
      toast({ title: `Status updated to ${status}` });
      queryClient.invalidateQueries({ queryKey: ["admin-grievances"] });
    }
  };

  const sendResponse = async () => {
    if (!responseText.trim() || !selectedId || !user) return;
    setSending(true);
    const { error } = await (supabase as any).from("grievance_responses").insert({
      grievance_id: selectedId,
      responder_id: user.id,
      responder_type: "admin",
      content: responseText.trim(),
    });
    if (error) {
      toast({ title: "Failed to send", description: error.message, variant: "destructive" });
    } else {
      setResponseText("");
      refetchResponses();
      toast({ title: "Response sent" });
    }
    setSending(false);
  };

  const stats = {
    total: grievances.length,
    open: grievances.filter((g: any) => g.status === "open").length,
    in_progress: grievances.filter((g: any) => g.status === "in_progress").length,
    resolved: grievances.filter((g: any) => g.status === "resolved").length,
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">Grievance Management</h1>
        <p className="text-muted-foreground mt-1">Track and resolve customer & vendor issues</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-400">{stats.open}</p>
            <p className="text-xs text-muted-foreground">Open</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{stats.in_progress}</p>
            <p className="text-xs text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-400">{stats.resolved}</p>
            <p className="text-xs text-muted-foreground">Resolved</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search grievances..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="open" className="text-xs">Open</TabsTrigger>
              <TabsTrigger value="in_progress" className="text-xs">Active</TabsTrigger>
              <TabsTrigger value="resolved" className="text-xs">Resolved</TabsTrigger>
              <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
            </TabsList>
          </Tabs>

          <ScrollArea className="h-[calc(100vh-420px)] min-h-[400px]">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <AlertTriangle className="w-10 h-10 mx-auto mb-2" />
                <p>No grievances found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map((g: any) => {
                  const statusConf = STATUS_CONFIG[g.status] || STATUS_CONFIG.open;
                  const StatusIcon = statusConf.icon;
                  return (
                    <Card
                      key={g.id}
                      className={`glass-card cursor-pointer transition-all hover:ring-1 hover:ring-primary/30 ${
                        selectedId === g.id ? "ring-1 ring-primary" : ""
                      }`}
                      onClick={() => setSelectedId(g.id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-medium text-sm line-clamp-1">{g.subject}</h4>
                          <StatusIcon className={`w-4 h-4 shrink-0 ${statusConf.color.split(" ")[1]}`} />
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground flex-wrap">
                          <Badge className={`${PRIORITIES[g.priority]} text-[10px] px-1.5 py-0`}>{g.priority}</Badge>
                          <span>{g.category}</span>
                          <span>·</span>
                          <span className="capitalize">{g.user_type}</span>
                          <span>·</span>
                          <span>{format(new Date(g.created_at), "MMM d")}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {profileMap[g.user_id] || "Loading..."}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Right: Detail */}
        <Card className="glass-card lg:col-span-2 flex flex-col">
          {selected ? (
            <>
              <CardHeader className="border-b border-border/50">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg">{selected.subject}</CardTitle>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <User className="w-3 h-3" />
                      <span>{profileMap[selected.user_id] || "Unknown"}</span>
                      <span>·</span>
                      <span className="capitalize">{selected.user_type}</span>
                      <span>·</span>
                      <span>{selected.category}</span>
                      <span>·</span>
                      <span>{format(new Date(selected.created_at), "MMM d, yyyy HH:mm")}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`${PRIORITIES[selected.priority]} shrink-0`}>{selected.priority}</Badge>
                    <Select value={selected.status} onValueChange={(v) => updateStatus(selected.id, v)}>
                      <SelectTrigger className="w-[130px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 p-4 overflow-hidden">
                <ScrollArea className="h-[calc(100vh-520px)] min-h-[250px]">
                  {/* Original grievance */}
                  <div className="bg-muted/50 rounded-lg p-4 mb-4">
                    <p className="text-sm whitespace-pre-wrap">{selected.description}</p>
                  </div>

                  {/* Responses */}
                  {responses.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" /> Responses ({responses.length})
                      </h4>
                      {responses.map((r: any) => (
                        <div key={r.id} className="bg-primary/5 border border-primary/10 rounded-lg p-3">
                          <p className="text-sm">{r.content}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Admin · {format(new Date(r.created_at), "MMM d, HH:mm")}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>

              {/* Reply box */}
              <div className="p-4 border-t border-border/50">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Type your response..."
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    className="resize-none"
                    rows={2}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendResponse();
                      }
                    }}
                  />
                  <Button onClick={sendResponse} disabled={sending || !responseText.trim()}>
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <CardContent className="flex-1 flex flex-col items-center justify-center py-16">
              <AlertTriangle className="w-14 h-14 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-1">Select a grievance</h3>
              <p className="text-muted-foreground text-center max-w-md text-sm">
                Choose an issue from the list to view details, respond, and update status.
              </p>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminGrievances;
