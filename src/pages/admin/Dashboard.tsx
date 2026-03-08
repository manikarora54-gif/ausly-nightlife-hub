import { Link } from "react-router-dom";
import { 
  Calendar, CreditCard, Users, TrendingUp, AlertCircle,
  DollarSign, MessageSquare, RefreshCw, BarChart3, Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAdminStats, useAdminBookings } from "@/hooks/useAdminData";
import { format } from "date-fns";

const Dashboard = () => {
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: bookings, isLoading: bookingsLoading } = useAdminBookings();

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const statCards = [
    { title: "Total Bookings", value: stats?.totalBookings || 0, change: `${stats?.pendingBookings || 0} pending`, icon: Calendar, color: "text-primary" },
    { title: "Revenue", value: `€${(stats?.totalRevenue || 0).toLocaleString()}`, change: "", icon: DollarSign, color: "text-accent" },
    { title: "Active Users", value: stats?.totalUsers || 0, change: `+${stats?.newUsersLast30 || 0} last 30d`, icon: Users, color: "text-secondary" },
    { title: "Open Grievances", value: stats?.pendingGrievances || 0, change: "", icon: RefreshCw, color: "text-destructive" },
  ];

  const recentBookings = (bookings || []).slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold mb-2">Dashboard Overview</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening on the platform.</p>
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

      {/* Recent Bookings + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {bookingsLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : recentBookings.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4">No bookings yet.</p>
            ) : (
              <div className="space-y-3">
                {recentBookings.map((b: any) => (
                  <div key={b.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">{(b as any).venues?.name || "Direct"}</span>
                        <Badge variant={b.status === "confirmed" ? "default" : b.status === "pending" ? "secondary" : "destructive"} className="text-xs">
                          {b.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(b.booking_date), "MMM d, yyyy")} {b.booking_time && `at ${b.booking_time}`}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-sm">€{b.total_amount || 0}</div>
                      <div className="text-xs text-muted-foreground">{b.confirmation_code}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { to: "/admin/analytics", icon: BarChart3, label: "View Analytics", desc: "Platform metrics & charts" },
              { to: "/admin/bookings", icon: Calendar, label: "Manage Bookings", desc: "View and update all bookings" },
              { to: "/admin/users", icon: Users, label: "Manage Users", desc: "User roles & accounts" },
              { to: "/admin/approvals", icon: CreditCard, label: "Pending Approvals", desc: "Review venue & event submissions" },
              { to: "/admin/support", icon: MessageSquare, label: "Customer Support", desc: "Respond to support tickets" },
            ].map((a) => (
              <Link key={a.to} to={a.to} className="block p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-all">
                <div className="flex items-center gap-3">
                  <a.icon className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-semibold">{a.label}</div>
                    <div className="text-sm text-muted-foreground">{a.desc}</div>
                  </div>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
