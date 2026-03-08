import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ImageUpload from "@/components/vendor/ImageUpload";

const eventTypes = ["concert", "party", "festival", "exhibition", "comedy", "theater", "sport", "workshop", "other"];

const NewEvent = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [venues, setVenues] = useState<{ id: string; name: string }[]>([]);

  const [form, setForm] = useState({
    name: "",
    event_type: "",
    venue_id: "",
    start_date: "",
    end_date: "",
    short_description: "",
    description: "",
    ticket_price: "",
    max_capacity: "",
    genre: "",
    images: [] as string[],
  });

  useEffect(() => {
    const loadVenues = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("venues").select("id, name").eq("owner_id", user.id);
      setVenues(data || []);
    };
    loadVenues();
  }, []);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const slugify = (text: string) =>
    text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.event_type || !form.start_date || !form.venue_id) {
      toast({ title: "Missing fields", description: "Name, type, venue and start date are required.", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const slug = `${slugify(form.name)}-${Date.now().toString(36)}`;

      const { error } = await supabase.from("events").insert({
        name: form.name,
        slug,
        event_type: form.event_type,
        venue_id: form.venue_id,
        start_date: new Date(form.start_date).toISOString(),
        end_date: form.end_date ? new Date(form.end_date).toISOString() : null,
        short_description: form.short_description || null,
        description: form.description || null,
        ticket_price: form.ticket_price ? Number(form.ticket_price) : null,
        max_capacity: form.max_capacity ? Number(form.max_capacity) : null,
        genre: form.genre || null,
      });

      if (error) throw error;

      toast({ title: "Event created! 🎉", description: `${form.name} has been added.` });
      navigate("/vendor/events");
    } catch (error: any) {
      console.error("Error creating event:", error);
      toast({ title: "Failed to create event", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/vendor/events")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-heading font-bold">Create New Event</h1>
          <p className="text-muted-foreground mt-1">Fill in the event details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="glass-card">
          <CardHeader><CardTitle>Event Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Event Name *</Label>
              <Input value={form.name} onChange={(e) => handleChange("name", e.target.value)} placeholder="e.g. Summer Rooftop Party" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Event Type *</Label>
                <Select value={form.event_type} onValueChange={(v) => handleChange("event_type", v)}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {eventTypes.map((t) => (<SelectItem key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Genre</Label>
                <Input value={form.genre} onChange={(e) => handleChange("genre", e.target.value)} placeholder="e.g. Techno, Jazz, Hip-Hop" />
              </div>
            </div>
            {venues.length > 0 ? (
              <div className="space-y-2">
                <Label>Venue *</Label>
                <Select value={form.venue_id} onValueChange={(v) => handleChange("venue_id", v)}>
                  <SelectTrigger><SelectValue placeholder="Select venue" /></SelectTrigger>
                  <SelectContent>
                    {venues.map((v) => (<SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">You need to create a venue listing first before creating events.</p>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader><CardTitle>Date & Time</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date & Time *</Label>
                <Input type="datetime-local" value={form.start_date} onChange={(e) => handleChange("start_date", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>End Date & Time</Label>
                <Input type="datetime-local" value={form.end_date} onChange={(e) => handleChange("end_date", e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader><CardTitle>Description</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Short Description</Label>
              <Input value={form.short_description} onChange={(e) => handleChange("short_description", e.target.value)} maxLength={120} placeholder="Quick summary" />
            </div>
            <div className="space-y-2">
              <Label>Full Description</Label>
              <Textarea value={form.description} onChange={(e) => handleChange("description", e.target.value)} rows={5} placeholder="Describe the event, lineup, what to expect…" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader><CardTitle>Tickets & Capacity</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ticket Price (€)</Label>
                <Input type="number" min="0" step="0.01" value={form.ticket_price} onChange={(e) => handleChange("ticket_price", e.target.value)} placeholder="0.00 = Free" />
              </div>
              <div className="space-y-2">
                <Label>Max Capacity</Label>
                <Input type="number" min="1" value={form.max_capacity} onChange={(e) => handleChange("max_capacity", e.target.value)} placeholder="e.g. 200" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={() => navigate("/vendor/events")}>Cancel</Button>
          <Button type="submit" disabled={saving}>
            {saving ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating…</>) : "Create Event"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewEvent;
