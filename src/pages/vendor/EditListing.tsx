import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ImageUpload from "@/components/vendor/ImageUpload";

const venueTypes = [
  "Restaurant", "Bar", "Club", "Café", "Lounge",
  "Beer Garden", "Pub", "Wine Bar", "Cocktail Bar", "Other",
];
const cities = ["Berlin", "Hamburg", "Munich", "Frankfurt", "Cologne", "Düsseldorf"];

const EditListing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    type: "",
    city: "Berlin",
    address: "",
    short_description: "",
    description: "",
    phone: "",
    email: "",
    website: "",
    price_range: 1,
    cuisine: "",
    features: [] as string[],
    images: [] as string[],
  });
  const [newFeature, setNewFeature] = useState("");

  useEffect(() => {
    if (id) fetchVenue();
  }, [id]);

  const fetchVenue = async () => {
    try {
      const { data, error } = await supabase
        .from("venues")
        .select("*")
        .eq("id", id!)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        toast({ title: "Venue not found", variant: "destructive" });
        navigate("/vendor/listings");
        return;
      }

      setForm({
        name: data.name || "",
        type: data.type || "",
        city: data.city || "Berlin",
        address: data.address || "",
        short_description: data.short_description || "",
        description: data.description || "",
        phone: data.phone || "",
        email: data.email || "",
        website: data.website || "",
        price_range: data.price_range || 1,
        cuisine: data.cuisine || "",
        features: data.features || [],
        images: data.images || [],
      });
    } catch (error) {
      console.error("Error fetching venue:", error);
      toast({ title: "Failed to load venue", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const addFeature = () => {
    if (newFeature.trim() && !form.features.includes(newFeature.trim())) {
      setForm((prev) => ({ ...prev, features: [...prev.features, newFeature.trim()] }));
      setNewFeature("");
    }
  };

  const removeFeature = (f: string) => {
    setForm((prev) => ({ ...prev, features: prev.features.filter((x) => x !== f) }));
  };

  const handleImagesChange = (images: string[]) => {
    setForm((prev) => ({ ...prev, images }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.type || !form.address) {
      toast({ title: "Missing fields", description: "Name, type and address are required.", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("venues")
        .update({
          name: form.name,
          type: form.type,
          city: form.city,
          address: form.address,
          short_description: form.short_description || null,
          description: form.description || null,
          phone: form.phone || null,
          email: form.email || null,
          website: form.website || null,
          price_range: form.price_range,
          cuisine: form.cuisine || null,
          features: form.features,
          images: form.images,
        })
        .eq("id", id!);

      if (error) throw error;

      toast({ title: "Listing updated! ✅", description: `${form.name} has been saved.` });
      navigate("/vendor/listings");
    } catch (error: any) {
      console.error("Error updating listing:", error);
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
        <Button variant="ghost" size="icon" onClick={() => navigate("/vendor/listings")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-heading font-bold">Edit Listing</h1>
          <p className="text-muted-foreground mt-1">Update details for {form.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card className="glass-card">
          <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Venue Name *</Label>
              <Input id="name" value={form.name} onChange={(e) => handleChange("name", e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type *</Label>
                <Select value={form.type} onValueChange={(v) => handleChange("type", v)}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {venueTypes.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>City *</Label>
                <Select value={form.city} onValueChange={(v) => handleChange("city", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {cities.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input id="address" value={form.address} onChange={(e) => handleChange("address", e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cuisine</Label>
                <Input value={form.cuisine} onChange={(e) => handleChange("cuisine", e.target.value)} placeholder="e.g. Italian, German" />
              </div>
              <div className="space-y-2">
                <Label>Price Range</Label>
                <Select value={String(form.price_range)} onValueChange={(v) => handleChange("price_range", Number(v))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">€ – Budget</SelectItem>
                    <SelectItem value="2">€€ – Moderate</SelectItem>
                    <SelectItem value="3">€€€ – Upscale</SelectItem>
                    <SelectItem value="4">€€€€ – Fine Dining</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card className="glass-card">
          <CardHeader><CardTitle>Description</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Short Description</Label>
              <Input value={form.short_description} onChange={(e) => handleChange("short_description", e.target.value)} maxLength={120} placeholder="Brief tagline" />
            </div>
            <div className="space-y-2">
              <Label>Full Description</Label>
              <Textarea value={form.description} onChange={(e) => handleChange("description", e.target.value)} rows={5} placeholder="Tell customers about your venue…" />
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card className="glass-card">
          <CardHeader><CardTitle>Images</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {form.images.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {form.images.map((img, idx) => (
                  <div key={idx} className="relative group rounded-lg overflow-hidden h-24">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                    >
                      <Trash2 className="w-5 h-5 text-destructive" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Input value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} placeholder="Paste image URL…" />
              <Button type="button" variant="outline" onClick={addImage}><ImagePlus className="w-4 h-4" /></Button>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card className="glass-card">
          <CardHeader><CardTitle>Features & Amenities</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {form.features.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.features.map((f) => (
                  <span key={f} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                    {f}
                    <button type="button" onClick={() => removeFeature(f)} className="hover:text-destructive">×</button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Input value={newFeature} onChange={(e) => setNewFeature(e.target.value)} placeholder="e.g. Outdoor Seating, Live Music" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addFeature(); } }} />
              <Button type="button" variant="outline" onClick={addFeature}>Add</Button>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="glass-card">
          <CardHeader><CardTitle>Contact Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} placeholder="+49 30 1234567" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} placeholder="info@venue.com" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <Input value={form.website} onChange={(e) => handleChange("website", e.target.value)} placeholder="https://…" />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={() => navigate("/vendor/listings")}>Cancel</Button>
          <Button type="submit" disabled={saving}>
            {saving ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</>) : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditListing;
