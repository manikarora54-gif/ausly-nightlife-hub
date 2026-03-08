import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X, Loader2, ImagePlus, Link as LinkIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  bucket?: string;
  folder?: string;
  maxImages?: number;
}

const ImageUpload = ({ images, onImagesChange, bucket = "venue-images", folder = "uploads", maxImages = 5 }: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [mode, setMode] = useState<"upload" | "url">("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > maxImages) {
      toast({ title: `Max ${maxImages} images allowed`, variant: "destructive" });
      return;
    }

    setUploading(true);
    const newUrls: string[] = [];

    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error } = await supabase.storage.from(bucket).upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

      if (error) {
        toast({ title: "Upload failed", description: error.message, variant: "destructive" });
        continue;
      }

      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
      newUrls.push(urlData.publicUrl);
    }

    onImagesChange([...images, ...newUrls]);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const addUrl = () => {
    if (!urlInput.trim()) return;
    if (images.length >= maxImages) {
      toast({ title: `Max ${maxImages} images allowed`, variant: "destructive" });
      return;
    }
    onImagesChange([...images, urlInput.trim()]);
    setUrlInput("");
  };

  const removeImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {/* Image grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((url, i) => (
            <div key={i} className="relative group aspect-video rounded-lg overflow-hidden border border-border">
              <img src={url} alt={`Image ${i + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 p-1 rounded-full bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Toggle mode */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant={mode === "upload" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("upload")}
        >
          <Upload className="w-3 h-3 mr-1" /> Upload
        </Button>
        <Button
          type="button"
          variant={mode === "url" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("url")}
        >
          <LinkIcon className="w-3 h-3 mr-1" /> URL
        </Button>
      </div>

      {mode === "upload" ? (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || images.length >= maxImages}
            className="w-full border-dashed"
          >
            {uploading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...</>
            ) : (
              <><ImagePlus className="w-4 h-4 mr-2" /> Choose images</>
            )}
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Input
            placeholder="https://example.com/image.jpg"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addUrl())}
          />
          <Button type="button" variant="outline" onClick={addUrl} disabled={images.length >= maxImages}>
            Add
          </Button>
        </div>
      )}

      <p className="text-xs text-muted-foreground">{images.length}/{maxImages} images</p>
    </div>
  );
};

export default ImageUpload;
