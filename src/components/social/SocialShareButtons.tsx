import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link2, MessageCircle, Twitter } from "lucide-react";

interface SocialShareButtonsProps {
  title: string;
  url?: string;
  description?: string;
}

const SocialShareButtons = ({ title, url, description }: SocialShareButtonsProps) => {
  const { toast } = useToast();
  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  const text = description || title;

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({ title: "Link copied!", description: "Share it with your friends." });
  };

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(`${text}\n${shareUrl}`)}`, "_blank");
  };

  const shareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`, "_blank");
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="icon" className="rounded-full" onClick={copyLink} title="Copy link">
        <Link2 className="w-4 h-4" />
      </Button>
      <Button variant="outline" size="icon" className="rounded-full" onClick={shareWhatsApp} title="Share on WhatsApp">
        <MessageCircle className="w-4 h-4" />
      </Button>
      <Button variant="outline" size="icon" className="rounded-full" onClick={shareTwitter} title="Share on Twitter">
        <Twitter className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default SocialShareButtons;
