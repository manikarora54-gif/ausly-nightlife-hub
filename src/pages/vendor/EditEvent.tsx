import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
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
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from("venues").select("id, name").eq("owner_id", user.id);
        setVenues(data || []);
      }

      if (id) {
        const { data, error } = await supabase.from("events").select("*").eq("id", id).maybeSingle();
        if (error || !data) {
          toast({ title: "Event not found", variant: "destructive" });
          navigate("/vendor/events");
          return;
        }

        const toLocal = (iso: string) => {
          const d = new Date(iso);
          return d.toISOString().slice(0, 16);
        };

        setForm({
          name: data.name || "",
          event_type: data.event_type || "",
          venue_id: data.venue_id || "",
          start_date: toLocal(data.start_date),
          end_date: data.end_date ? toLocal(data.end_date) : "",
          short_description: data.short_description || "",
          description: data.description || "",
          ticket_price: data.ticket_price != null ? String(data.ticket_price) : "",
          max_capacity: data.max_capacity != null ? String(data.max_capacity) : "",
          genre: data.genre || "",
          images: data.images || [],
        });
      }
      setLoading(false);
    };
    load();
  }, [id]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImagesChange = (images: string[]) => {
    setForm((prev) => ({ ...prev, images }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.event_type || !form.start_date) {
      toast({ title: "Missing fields", description: "Name, type and start date are required.", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("events")
        .update({
          name: form.name,
          event_type: form.event_type,
          venue_id: form.venue_id || null,
          start_date: new Date(form.start_date).toISOString(),
          end_date: form.end_date ? new Date(form.end_date).toISOString() : null,
          short_description: form.short_description || null,
          description: form.description || null,
          ticket_price: form.ticket_price ? Number(form.ticket_price) : null,
          max_capacity: form.max_capacity ? Number(form.max_capacity) : null,
          genre: form.genre || null,
          images: form.images,
        })
        .eq("id", id!);

      if (error) throw error;

      toast({ title: "Event updated! ✅", description: `${form.name} has been saved.` });
      navigate("/vendor/events");
    } catch (error: any) {
      console.error("Error updating event:", error);
      toast({ title: "Failed to update", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/vendor/events")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-heading font-bold">Edit Event</h1>
          <p className="text-muted-foreground mt-1">Update details for {form.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="glass-card">
          <CardHeader><CardTitle>Event Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Event Name *</Label>
              <Input value={form.name} onChange={(e) => handleChange("name", e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Event Type *</Label>
                <Select value={form.event_type} onValueChange={(v) => handleChange("event_type", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {eventTypes.map((t) => (<SelectItem key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Genre</Label>
                <Input value={form.genre} onChange={(e) => handleChange("genre", e.target.value)} placeholder="e.g. Techno, Jazz" />
              </div>
            </div>
            {venues.length > 0 && (
              <div className="space-y-2">
                <Label>Venue</Label>
                <Select value={form.venue_id} onValueChange={(v) => handleChange("venue_id", v)}>
                  <SelectTrigger><SelectValue placeholder="Select venue" /></SelectTrigger>
                  <SelectContent>
                    {venues.map((v) => (<SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader><CardTitle>Date & Time</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start *</Label>
              <Input type="datetime-local" value={form.start_date} onChange={(e) => handleChange("start_date", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>End</Label>
              <Input type="datetime-local" value={form.end_date} onChange={(e) => handleChange("end_date", e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader><CardTitle>Description</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Short Description</Label>
              <Input value={form.short_description} onChange={(e) => handleChange("short_description", e.target.value)} maxLength={120} />
            </div>
            <div className="space-y-2">
              <Label>Full Description</Label>
              <Textarea value={form.description} onChange={(e) => handleChange("description", e.target.value)} rows={5} />
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card className="glass-card">
          <CardHeader><CardTitle>Images</CardTitle></CardHeader>
          <CardContent>
            <ImageUpload images={form.images} onImagesChange={handleImagesChange} />
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader><CardTitle>Tickets & Capacity</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Ticket Price (€)</Label>
              <Input type="number" min="0" step="0.01" value={form.ticket_price} onChange={(e) => handleChange("ticket_price", e.target.value)} placeholder="0 = Free" />
            </div>
            <div className="space-y-2">
              <Label>Max Capacity</Label>
              <Input type="number" min="1" value={form.max_capacity} onChange={(e) => handleChange("max_capacity", e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={() => navigate("/vendor/events")}>Cancel</Button>
          <Button type="submit" disabled={saving}>
            {saving ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</>) : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditEvent;
