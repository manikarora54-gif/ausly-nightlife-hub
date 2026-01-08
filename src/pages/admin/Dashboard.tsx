import { Link } from "react-router-dom";
import { 
  Calendar, 
  CreditCard, 
  Users, 
  TrendingUp, 
  AlertCircle,
  DollarSign,
  MessageSquare,
  RefreshCw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const stats = [
  {
    title: "Total Bookings",
    value: "2,847",
    change: "+18.5%",
    trend: "up",
    icon: Calendar,
    color: "text-primary"
  },
  {
    title: "Revenue",
    value: "€128,450",
    change: "+12.3%",
    trend: "up",
    icon: DollarSign,
    color: "text-green-500"
  },
  {
    title: "Active Users",
    value: "12,492",
    change: "+8.7%",
    trend: "up",
    icon: Users,
    color: "text-blue-500"
  },
  {
    title: "Pending Refunds",
    value: "7",
    change: "-5",
    trend: "down",
    icon: RefreshCw,
    color: "text-orange-500"
  }
];

const recentBookings = [
  {
    id: "BK-015",
    customer: "Thomas Weber",
    venue: "Zum Schneider",
    date: "2024-01-20",
    time: "19:00",
    amount: "€240",
    status: "confirmed"
  },
  {
    id: "BK-014",
    customer: "Anna Müller",
    venue: "Clouds Heaven's Bar",
    date: "2024-01-21",
    time: "20:00",
    amount: "€110",
    status: "confirmed"
  },
  {
    id: "BK-013",
    customer: "Peter Schmidt",
    venue: "Fischers Fritz",
    date: "2024-01-24",
    time: "19:30",
    amount: "€380",
    status: "pending"
  },
  {
    id: "BK-012",
    customer: "Maria Garcia",
    venue: "Bar Tausend",
    date: "2024-01-22",
    time: "21:00",
    amount: "€165",
    status: "confirmed"
  },
  {
    id: "BK-011",
    customer: "James Taylor",
    venue: "Tresor",
    date: "2024-01-20",
    time: "23:00",
    amount: "€50",
    status: "cancelled"
  }
];

const pendingActions = [
  { type: "refund", count: 5, priority: "high" },
  { type: "support", count: 12, priority: "medium" },
  { type: "payment", count: 3, priority: "high" },
  { type: "cancellation", count: 8, priority: "medium" }
];

const Dashboard = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-bold mb-2">Dashboard Overview</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className={`text-xs mt-1 flex items-center gap-1 ${
                stat.trend === "up" ? "text-green-500" : "text-red-500"
              }`}>
                <TrendingUp className="w-3 h-3" />
                {stat.change} from last month
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pending Actions */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            Pending Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {pendingActions.map((action) => (
              <div
                key={action.type}
                className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer"
              >
                <div className="text-sm text-muted-foreground capitalize mb-1">
                  {action.type}
                </div>
                <div className="text-2xl font-bold mb-1">{action.count}</div>
                <Badge
                  variant={action.priority === "high" ? "destructive" : "secondary"}
                  className="text-xs"
                >
                  {action.priority} priority
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{booking.customer}</span>
                      <Badge
                        variant={
                          booking.status === "confirmed"
                            ? "default"
                            : booking.status === "pending"
                            ? "secondary"
                            : "destructive"
                        }
                        className="text-xs"
                      >
                        {booking.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {booking.venue} • {booking.date} at {booking.time}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{booking.amount}</div>
                    <div className="text-xs text-muted-foreground">{booking.id}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

          {/* Quick Actions */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/admin/bookings" className="block p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-all">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-semibold">Manage Bookings</div>
                    <div className="text-sm text-muted-foreground">View and update all bookings</div>
                  </div>
                </div>
              </Link>
              <Link to="/admin/payments" className="block p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-all">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-semibold">Process Payments</div>
                    <div className="text-sm text-muted-foreground">Handle payment transactions</div>
                  </div>
                </div>
              </Link>
              <Link to="/admin/support" className="block p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-all">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-semibold">Customer Support</div>
                    <div className="text-sm text-muted-foreground">Respond to support tickets</div>
                  </div>
                </div>
              </Link>
              <Link to="/admin/refunds" className="block p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-all">
                <div className="flex items-center gap-3">
                  <RefreshCw className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-semibold">Handle Refunds</div>
                    <div className="text-sm text-muted-foreground">Process cancellations and refunds</div>
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>
      </div>
    </div>
  );
};

export default Dashboard;
