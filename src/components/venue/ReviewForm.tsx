import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCreateReview } from "@/hooks/useReviews";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface ReviewFormProps {
  venueId: string;
}

const ReviewForm = ({ venueId }: ReviewFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const createReview = useCreateReview();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState("");

  if (!user) {
    return (
      <div className="border border-border rounded-xl p-4 text-center">
        <p className="text-sm text-muted-foreground mb-3">Sign in to leave a review</p>
        <Button variant="outline" size="sm" onClick={() => navigate("/signin", { state: { from: window.location.pathname } })}>
          Sign In
        </Button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast({ title: "Please select a rating", variant: "destructive" });
      return;
    }

    try {
      await createReview.mutateAsync({
        venue_id: venueId,
        rating,
        content: content.trim() || null,
      });
      toast({ title: "Review submitted! ⭐", description: "Thanks for your feedback." });
      setRating(0);
      setContent("");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border border-border rounded-xl p-4 space-y-3">
      <p className="text-sm font-medium">Leave a review</p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="p-0.5"
          >
            <Star
              className={`w-6 h-6 transition-colors ${
                star <= (hoverRating || rating)
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-muted"
              }`}
            />
          </button>
        ))}
      </div>
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Share your experience (optional)"
        rows={3}
        className="resize-none"
      />
      <Button type="submit" size="sm" disabled={createReview.isPending}>
        {createReview.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
        Submit Review
      </Button>
    </form>
  );
};

export default ReviewForm;
