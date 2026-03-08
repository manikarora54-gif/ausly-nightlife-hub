import { useAdminStats } from "@/hooks/useAdminData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, TrendingUp, Users, Calendar, DollarSign, Star } from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const COLORS = ["hsl(185, 100%, 50%)", "hsl(320, 100%, 60%)", "hsl(0, 84%, 60%)", "hsl(120, 100%, 50%)"];

const Analytics = () => {
  const { data: stats, isLoading } = useAdminStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const statCards = [
    { title: "Total Users", value: stats?.totalUsers || 0, icon: Users, change: `+${stats?.newUsersLast30 || 0} last 30d`, color: "text-primary" },
    { title: "Total Bookings", value: stats?.totalBookings || 0, icon: Calendar, change: `${stats?.pendingBookings || 0} pending`, color: "text-secondary" },
    { title: "Revenue", value: `€${(stats?.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, change: "", color: "text-accent" },
    { title: "Active Venues", value: stats?.totalVenues || 0, icon: Star, change: `${stats?.totalEvents || 0} events`, color: "text-primary" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold mb-2">Analytics</h1>
        <p className="text-muted-foreground">Platform performance metrics and insights.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <Card key={s.title} className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.title}</CardTitle>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{s.value}</div>
              {s.change && (
                <div className="text-xs mt-1 flex items-center gap-1 text-muted-foreground">
                  <TrendingUp className="w-3 h-3" />
                  {s.change}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="status">Booking Status</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Revenue (Last 6 Months)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats?.revenueByMonth || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(230, 15%, 20%)" />
                    <XAxis dataKey="month" stroke="hsl(230, 10%, 60%)" />
                    <YAxis stroke="hsl(230, 10%, 60%)" />
                    <Tooltip
                      contentStyle={{ background: "hsl(230, 20%, 10%)", border: "1px solid hsl(230, 15%, 20%)", borderRadius: "8px" }}
                      labelStyle={{ color: "hsl(0, 0%, 98%)" }}
                    />
                    <Line type="monotone" dataKey="revenue" stroke="hsl(185, 100%, 50%)" strokeWidth={2} dot={{ fill: "hsl(185, 100%, 50%)" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Bookings (Last 6 Months)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats?.revenueByMonth || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(230, 15%, 20%)" />
                    <XAxis dataKey="month" stroke="hsl(230, 10%, 60%)" />
                    <YAxis stroke="hsl(230, 10%, 60%)" />
                    <Tooltip
                      contentStyle={{ background: "hsl(230, 20%, 10%)", border: "1px solid hsl(230, 15%, 20%)", borderRadius: "8px" }}
                      labelStyle={{ color: "hsl(0, 0%, 98%)" }}
                    />
                    <Bar dataKey="bookings" fill="hsl(320, 100%, 60%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Bookings by Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats?.bookingsByStatus || []}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      label={({ status, count }) => `${status}: ${count}`}
                    >
                      {(stats?.bookingsByStatus || []).map((_: any, i: number) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: "hsl(230, 20%, 10%)", border: "1px solid hsl(230, 15%, 20%)", borderRadius: "8px" }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Top Venues */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Top Venues by Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(stats?.topVenues || []).length === 0 ? (
              <p className="text-muted-foreground text-sm">No booking data yet.</p>
            ) : (
              (stats?.topVenues || []).map((v: any, i: number) => (
                <div key={v.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-primary">#{i + 1}</span>
                    <div>
                      <p className="font-semibold">{v.name}</p>
                      <p className="text-xs text-muted-foreground">
                        ★ {v.average_rating || 0} ({v.review_count || 0} reviews)
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold">{v.booking_count} bookings</span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
