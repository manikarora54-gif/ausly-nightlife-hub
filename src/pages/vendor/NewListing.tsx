import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

const venueTypes = [
  "Restaurant",
  "Bar",
  "Club",
  "Café",
  "Lounge",
  "Beer Garden",
  "Pub",
  "Wine Bar",
  "Cocktail Bar",
  "Other",
];

const cities = ["Berlin", "Hamburg", "Munich", "Frankfurt", "Cologne", "Düsseldorf"];

const NewListing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

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
  });

  const slugify = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.type || !form.address) {
      toast({
        title: "Missing fields",
        description: "Please fill in name, type, and address.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      const slug = `${slugify(form.name)}-${slugify(form.city)}`;

      // Check if slug already exists
      const { data: existing } = await supabase
        .from("venues")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();

      if (existing) {
        toast({
          title: "Duplicate listing",
          description: "A venue with this name already exists in this city. Please use a different name.",
          variant: "destructive",
        });
        setSaving(false);
        return;
      }

      const { error } = await supabase.from("venues").insert({
        name: form.name,
        slug,
        type: form.type,
        city: form.city,
        address: form.address,
        short_description: form.short_description || null,
        description: form.description || null,
        phone: form.phone || null,
        email: form.email || null,
        website: form.website || null,
      });

      if (error) throw error;

      toast({
        title: "Listing created! 🎉",
        description: `${form.name} has been added successfully.`,
      });

      navigate("/vendor/listings");
    } catch (error: any) {
      console.error("Error creating listing:", error);
      toast({
        title: "Failed to create listing",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/vendor/listings")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-heading font-bold">Add New Listing</h1>
          <p className="text-muted-foreground mt-1">Fill in details for your venue</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Venue Name *</Label>
              <Input
                id="name"
                placeholder="e.g. The Blue Note"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type *</Label>
                <Select value={form.type} onValueChange={(v) => handleChange("type", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {venueTypes.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>City *</Label>
                <Select value={form.city} onValueChange={(v) => handleChange("city", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                placeholder="e.g. Friedrichstraße 123, 10117"
                value={form.address}
                onChange={(e) => handleChange("address", e.target.value)}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="short_description">Short Description</Label>
              <Input
                id="short_description"
                placeholder="A brief tagline for your venue"
                value={form.short_description}
                onChange={(e) => handleChange("short_description", e.target.value)}
                maxLength={120}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Full Description</Label>
              <Textarea
                id="description"
                placeholder="Tell customers about your venue, atmosphere, specialities…"
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={5}
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  placeholder="+49 30 1234567"
                  value={form.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="info@venue.com"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                placeholder="https://www.venue.com"
                value={form.website}
                onChange={(e) => handleChange("website", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={() => navigate("/vendor/listings")}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating…
              </>
            ) : (
              "Create Listing"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewListing;
