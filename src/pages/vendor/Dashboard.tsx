import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Store, 
  Calendar, 
  Euro, 
  TrendingUp, 
  Star,
  Users,
  Clock,
  MessageSquare
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DashboardStats {
  totalListings: number;
  totalBookings: number;
  pendingBookings: number;
  totalRevenue: number;
  averageRating: number;
  totalReviews: number;
  unreadMessages: number;
}

const VendorDashboard = () => {
  const { vendorProfile } = useOutletContext<{ vendorProfile: any }>();
  const [stats, setStats] = useState<DashboardStats>({
    totalListings: 0,
    totalBookings: 0,
    pendingBookings: 0,
    totalRevenue: 0,
    averageRating: 0,
    totalReviews: 0,
    unreadMessages: 0,
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch all venues (in production, filter by owner_id when column exists)
      const { data: venues } = await supabase
        .from("venues")
        .select("id, name, average_rating, review_count")
        .limit(10);

      // Fetch all events (in production, filter by organizer_id when column exists)
      const { data: events } = await supabase
        .from("events")
        .select("id, name")
        .limit(10);

      // Fetch sample bookings
      const { data: bookings } = await supabase
        .from("bookings")
        .select("*")
        .limit(50);

      // Calculate stats from available data
      const totalListings = (venues?.length || 0) + (events?.length || 0);
      const totalBookings = bookings?.length || 0;
      const pendingBookings = bookings?.filter(b => b.status === "pending").length || 0;
      const totalRevenue = bookings?.reduce((sum, b) => sum + (Number(b.total_amount) || 0), 0) || 0;
      const avgRating = venues?.length 
        ? venues.reduce((sum, v) => sum + (Number(v.average_rating) || 0), 0) / venues.length 
        : 0;
      const totalReviews = venues?.reduce((sum, v) => sum + (v.review_count || 0), 0) || 0;

      setStats({
        totalListings,
        totalBookings,
        pendingBookings,
        totalRevenue,
        averageRating: Math.round(avgRating * 10) / 10,
        totalReviews,
        unreadMessages: 0, // Messages table not yet available
      });

      // Get recent bookings
      const recentBookingsData = bookings?.slice(0, 5) || [];
      setRecentBookings(recentBookingsData);
      
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { 
      title: "Total Listings", 
      value: stats.totalListings, 
      icon: Store, 
      color: "text-primary" 
    },
    { 
      title: "Total Bookings", 
      value: stats.totalBookings, 
      icon: Calendar, 
      color: "text-secondary" 
    },
    { 
      title: "Pending Bookings", 
      value: stats.pendingBookings, 
      icon: Clock, 
      color: "text-yellow-500" 
    },
    { 
      title: "Total Revenue", 
      value: `€${stats.totalRevenue.toLocaleString()}`, 
      icon: Euro, 
      color: "text-accent" 
    },
    { 
      title: "Average Rating", 
      value: stats.averageRating.toFixed(1), 
      icon: Star, 
      color: "text-yellow-400" 
    },
    { 
      title: "Total Reviews", 
      value: stats.totalReviews, 
      icon: Users, 
      color: "text-primary" 
    },
    { 
      title: "Unread Messages", 
      value: stats.unreadMessages, 
      icon: MessageSquare, 
      color: stats.unreadMessages > 0 ? "text-destructive" : "text-muted-foreground" 
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-primary">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-bold">
          Welcome back{vendorProfile?.business_name ? `, ${vendorProfile.business_name}` : ""}!
        </h1>
        <p className="text-muted-foreground mt-2">
          Here's an overview of your business performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="glass-card hover-glow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Bookings */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Recent Bookings
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentBookings.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No bookings yet. Add your listings to start receiving bookings!
            </p>
          ) : (
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div 
                  key={booking.id} 
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                >
                  <div>
                    <p className="font-medium">
                      Booking #{booking.confirmation_code || booking.id.slice(0, 8)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(booking.booking_date).toLocaleDateString()} 
                      {booking.booking_time && ` at ${booking.booking_time}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      booking.status === "confirmed" 
                        ? "bg-accent/20 text-accent" 
                        : booking.status === "pending"
                        ? "bg-yellow-500/20 text-yellow-500"
                        : "bg-destructive/20 text-destructive"
                    }`}>
                      {booking.status}
                    </span>
                    {booking.total_amount && (
                      <p className="text-sm font-medium mt-1">€{booking.total_amount}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Card className="glass-card border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Tips to Grow Your Business
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Add high-quality photos to increase booking rates by up to 40%
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Respond to messages within 1 hour for better customer satisfaction
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Keep your availability calendar up to date to avoid double bookings
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Encourage happy customers to leave reviews
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorDashboard;
