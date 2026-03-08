import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell, CheckCheck, Trash2, Loader2, Calendar, Star, AlertTriangle,
  Megaphone, ChevronRight, Inbox,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  useNotifications, useMarkAsRead, useMarkAllAsRead, useDeleteNotification,
  useNotificationRealtime, Notification,
} from "@/hooks/useNotifications";
import SEOHead from "@/components/seo/SEOHead";

const typeConfig: Record<string, { icon: typeof Bell; color: string; label: string }> = {
  booking: { icon: Calendar, color: "text-primary", label: "Booking" },
  review: { icon: Star, color: "text-yellow-500", label: "Review" },
  grievance: { icon: AlertTriangle, color: "text-orange-500", label: "Grievance" },
  announcement: { icon: Megaphone, color: "text-secondary", label: "Announcement" },
  general: { icon: Bell, color: "text-muted-foreground", label: "General" },
};

const Notifications = () => {
  const { user } = useAuth();
  const { data: notifications, isLoading } = useNotifications();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const deleteNotification = useDeleteNotification();
  const [filter, setFilter] = useState("all");

  useNotificationRealtime();

  const filtered = notifications?.filter((n) => filter === "all" || (filter === "unread" ? !n.is_read : n.type === filter)) || [];
  const unreadCount = notifications?.filter((n) => !n.is_read).length || 0;

  const handleClick = (notif: Notification) => {
    if (!notif.is_read) markAsRead.mutate(notif.id);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-24 pb-12 text-center">
          <Bell className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-heading font-bold mb-2">Sign in to view notifications</h1>
          <p className="text-muted-foreground mb-6">You need to be signed in to see your notifications.</p>
          <Link to="/signin"><Button>Sign In</Button></Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Notifications – Ausly" description="Stay updated with your booking confirmations, reviews, and announcements." noindex />
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-12 max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-heading font-bold flex items-center gap-3">
              <Bell className="w-8 h-8 text-primary" />
              Notifications
              {unreadCount > 0 && (
                <Badge className="bg-primary text-primary-foreground">{unreadCount} new</Badge>
              )}
            </h1>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" className="rounded-xl gap-2" onClick={() => markAllAsRead.mutate()}>
              <CheckCheck className="w-4 h-4" />
              Mark all read
            </Button>
          )}
        </div>

        {/* Filter Tabs */}
        <Tabs value={filter} onValueChange={setFilter} className="space-y-4">
          <TabsList className="bg-muted/50 rounded-xl p-1 flex-wrap h-auto">
            <TabsTrigger value="all" className="rounded-lg">All</TabsTrigger>
            <TabsTrigger value="unread" className="rounded-lg">Unread</TabsTrigger>
            <TabsTrigger value="booking" className="rounded-lg gap-1">
              <Calendar className="w-3.5 h-3.5" /> Bookings
            </TabsTrigger>
            <TabsTrigger value="review" className="rounded-lg gap-1">
              <Star className="w-3.5 h-3.5" /> Reviews
            </TabsTrigger>
            <TabsTrigger value="grievance" className="rounded-lg gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Grievances
            </TabsTrigger>
            <TabsTrigger value="announcement" className="rounded-lg gap-1">
              <Megaphone className="w-3.5 h-3.5" /> Announcements
            </TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="space-y-3">
            {isLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : !filtered.length ? (
              <Card className="glass-card">
                <CardContent className="py-16 text-center">
                  <Inbox className="w-14 h-14 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-heading font-semibold text-lg mb-2">
                    {filter === "unread" ? "All caught up!" : "No notifications yet"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {filter === "unread"
                      ? "You've read all your notifications."
                      : "Notifications about your bookings, reviews, and more will appear here."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filtered.map((notif) => {
                const config = typeConfig[notif.type] || typeConfig.general;
                const Icon = config.icon;
                return (
                  <Card
                    key={notif.id}
                    className={`glass-card transition-all hover:border-primary/30 cursor-pointer ${
                      !notif.is_read ? "border-l-4 border-l-primary bg-primary/5" : ""
                    }`}
                    onClick={() => handleClick(notif)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={`mt-0.5 ${config.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                              {config.label}
                            </Badge>
                            {!notif.is_read && (
                              <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                            )}
                            <span className="text-xs text-muted-foreground ml-auto flex-shrink-0">
                              {new Date(notif.created_at).toLocaleDateString("en-US", {
                                month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <h4 className="font-medium text-sm mb-0.5">{notif.title}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">{notif.message}</p>
                          {notif.link && (
                            <Link
                              to={notif.link}
                              className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              View details <ChevronRight className="w-3 h-3" />
                            </Link>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full flex-shrink-0 text-muted-foreground hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification.mutate(notif.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default Notifications;
