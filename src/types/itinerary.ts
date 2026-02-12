export interface Itinerary {
  id: string;
  user_id: string;
  title: string;
  city: string;
  content: string | null;
  stops: any[] | null;
  estimated_cost: number | null;
  created_at: string;
  updated_at: string;
}
