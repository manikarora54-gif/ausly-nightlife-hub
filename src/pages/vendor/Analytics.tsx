import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Euro,
  Users,
  Calendar,
  Star
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";
import { supabase } from "@/integrations/supabase/client";

const VendorAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    revenueChange: 12.5,
    totalBookings: 0,
    bookingsChange: 8.2,
    averageRating: 0,
    ratingChange: 0.3,
    totalViews: 0,
    viewsChange: 15.7,
  });
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [bookingsData, setBookingsData] = useState<any[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch bookings for analytics
      const { data: bookings } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(100);

      // Fetch venues for ratings
      const { data: venues } = await supabase
        .from("venues")
        .select("average_rating, review_count")
        .limit(10);

      // Calculate stats
      const totalRevenue = bookings?.reduce((sum, b) => sum + (Number(b.total_amount) || 0), 0) || 0;
      const avgRating = venues?.length 
        ? venues.reduce((sum, v) => sum + (Number(v.average_rating) || 0), 0) / venues.length 
        : 0;

      setStats(prev => ({
        ...prev,
        totalRevenue,
        totalBookings: bookings?.length || 0,
        averageRating: Math.round(avgRating * 10) / 10,
        totalViews: Math.floor(Math.random() * 5000) + 1000, // Mock data
      }));

      // Generate chart data from bookings
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split('T')[0];
      });

      const revenueByDay = last7Days.map(date => {
        const dayBookings = bookings?.filter(b => 
          b.created_at.split('T')[0] === date
        ) || [];
        return {
          name: new Date(date).toLocaleDateString('en-DE', { weekday: 'short' }),
          revenue: dayBookings.reduce((sum, b) => sum + (Number(b.total_amount) || 0), 0),
          bookings: dayBookings.length,
        };
      });

      setRevenueData(revenueByDay);
      setBookingsData(revenueByDay);

    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Revenue",
      value: `€${stats.totalRevenue.toLocaleString()}`,
      change: stats.revenueChange,
      icon: Euro,
      color: "text-accent",
    },
    {
      title: "Total Bookings",
      value: stats.totalBookings.toString(),
      change: stats.bookingsChange,
      icon: Calendar,
      color: "text-primary",
    },
    {
      title: "Average Rating",
      value: stats.averageRating.toFixed(1),
      change: stats.ratingChange,
      icon: Star,
      color: "text-yellow-400",
    },
    {
      title: "Profile Views",
      value: stats.totalViews.toLocaleString(),
      change: stats.viewsChange,
      icon: Users,
      color: "text-secondary",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-primary">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Track your business performance and insights
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
              <div className="flex items-center mt-1">
                {stat.change >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-accent mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-destructive mr-1" />
                )}
                <span className={`text-sm ${stat.change >= 0 ? "text-accent" : "text-destructive"}`}>
                  {stat.change >= 0 ? "+" : ""}{stat.change}%
                </span>
                <span className="text-sm text-muted-foreground ml-1">vs last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <Tabs defaultValue="revenue" className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Euro className="w-5 h-5 text-accent" />
                Revenue Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="name" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickFormatter={(value) => `€${value}`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                      formatter={(value: number) => [`€${value}`, "Revenue"]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="hsl(var(--accent))" 
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--accent))" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Bookings Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bookingsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="name" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                    />
                    <Bar 
                      dataKey="bookings" 
                      fill="hsl(var(--primary))" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Insights */}
      <Card className="glass-card border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Performance Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold">Top Performing Days</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex justify-between">
                  <span>Friday</span>
                  <span className="text-accent">32% of bookings</span>
                </li>
                <li className="flex justify-between">
                  <span>Saturday</span>
                  <span className="text-accent">28% of bookings</span>
                </li>
                <li className="flex justify-between">
                  <span>Thursday</span>
                  <span className="text-primary">18% of bookings</span>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Popular Times</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex justify-between">
                  <span>8:00 PM - 9:00 PM</span>
                  <span className="text-accent">Peak hour</span>
                </li>
                <li className="flex justify-between">
                  <span>7:00 PM - 8:00 PM</span>
                  <span className="text-primary">High demand</span>
                </li>
                <li className="flex justify-between">
                  <span>9:00 PM - 10:00 PM</span>
                  <span className="text-primary">High demand</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorAnalytics;
