import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertTriangle, Clock, CheckCircle2, XCircle, Plus, Loader2, MessageSquare,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

const CATEGORIES = [
  "Booking Issue",
  "Payment / Refund",
  "Venue Complaint",
  "Event Complaint",
  "Account Issue",
  "Safety Concern",
  "Other",
];

const PRIORITIES = [
  { value: "low", label: "Low", color: "bg-muted text-muted-foreground" },
  { value: "medium", label: "Medium", color: "bg-yellow-500/20 text-yellow-400" },
  { value: "high", label: "High", color: "bg-orange-500/20 text-orange-400" },
  { value: "urgent", label: "Urgent", color: "bg-destructive/20 text-destructive" },
];

const STATUS_CONFIG: Record<string, { icon: any; label: string; color: string }> = {
  open: { icon: AlertTriangle, label: "Open", color: "bg-yellow-500/20 text-yellow-400" },
  in_progress: { icon: Clock, label: "In Progress", color: "bg-primary/20 text-primary" },
  resolved: { icon: CheckCircle2, label: "Resolved", color: "bg-green-500/20 text-green-400" },
  closed: { icon: XCircle, label: "Closed", color: "bg-muted text-muted-foreground" },
};

interface GrievanceFormProps {
  userType: "customer" | "vendor";
  onSuccess?: () => void;
}

export const GrievanceForm = ({ userType, onSuccess }: GrievanceFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    category: "",
    subject: "",
    description: "",
    priority: "medium",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !form.category || !form.subject || !form.description) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }

    setSaving(true);
    const { error } = await (supabase as any).from("grievances").insert({
      user_id: user.id,
      user_type: userType,
      category: form.category,
      subject: form.subject,
      description: form.description,
      priority: form.priority,
    });

    if (error) {
      toast({ title: "Failed to submit", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Grievance submitted ✅", description: "We'll review your issue shortly." });
      setForm({ category: "", subject: "", description: "", priority: "medium" });
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["grievances"] });
      onSuccess?.();
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" /> Submit Grievance
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Submit a Grievance</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Category *</Label>
            <Select value={form.category} onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select value={form.priority} onValueChange={(v) => setForm((p) => ({ ...p, priority: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PRIORITIES.map((p) => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Subject *</Label>
            <Input
              value={form.subject}
              onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
              placeholder="Brief summary of your issue"
              maxLength={200}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Description *</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Describe your issue in detail..."
              rows={5}
              maxLength={2000}
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Submit
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

interface GrievanceListProps {
  userType: "customer" | "vendor";
}

export const GrievanceList = ({ userType }: GrievanceListProps) => {
  const { user } = useAuth();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: grievances = [], isLoading } = useQuery({
    queryKey: ["grievances", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await (supabase as any)
        .from("grievances")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const { data: responses = [] } = useQuery({
    queryKey: ["grievance-responses", selectedId],
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

  const selected = grievances.find((g: any) => g.id === selectedId);

  if (isLoading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">My Grievances ({grievances.length})</h3>
        <GrievanceForm userType={userType} />
      </div>

      {grievances.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="w-12 h-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No grievances submitted yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* List */}
          <div className="space-y-3">
            {grievances.map((g: any) => {
              const statusConf = STATUS_CONFIG[g.status] || STATUS_CONFIG.open;
              const StatusIcon = statusConf.icon;
              const priorityConf = PRIORITIES.find((p) => p.value === g.priority);

              return (
                <Card
                  key={g.id}
                  className={`glass-card cursor-pointer transition-all hover:ring-1 hover:ring-primary/30 ${
                    selectedId === g.id ? "ring-1 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedId(g.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-medium text-sm line-clamp-1">{g.subject}</h4>
                      <Badge className={`${statusConf.color} text-xs shrink-0`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusConf.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{g.category}</span>
                      <span>·</span>
                      <Badge className={`${priorityConf?.color} text-[10px]`}>{g.priority}</Badge>
                      <span>·</span>
                      <span>{format(new Date(g.created_at), "MMM d, yyyy")}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Detail */}
          {selected ? (
            <Card className="glass-card">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg">{selected.subject}</CardTitle>
                  <Badge className={`${STATUS_CONFIG[selected.status]?.color}`}>
                    {STATUS_CONFIG[selected.status]?.label}
                  </Badge>
                </div>
                <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                  <span>{selected.category}</span>
                  <span>·</span>
                  <span>{format(new Date(selected.created_at), "MMM d, yyyy HH:mm")}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-sm whitespace-pre-wrap">{selected.description}</p>
                </div>

                {responses.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" /> Responses
                    </h4>
                    <ScrollArea className="max-h-[300px]">
                      {responses.map((r: any) => (
                        <div key={r.id} className="bg-primary/5 border border-primary/10 rounded-lg p-3 mb-2">
                          <p className="text-sm">{r.content}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Admin · {format(new Date(r.created_at), "MMM d, HH:mm")}
                          </p>
                        </div>
                      ))}
                    </ScrollArea>
                  </div>
                )}

                {responses.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Awaiting admin response...
                  </p>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="glass-card">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <AlertTriangle className="w-10 h-10 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">Select a grievance to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
