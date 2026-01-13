import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CalendarDays, 
  Plus, 
  Edit, 
  Eye, 
  Users,
  MapPin,
  MoreVertical,
  Trash2,
  Ticket
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const VendorEvents = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch events (when organizer_id column exists, filter by it)
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("start_date", { ascending: false })
        .limit(20);

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast({
        title: "Error",
        description: "Failed to load your events",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleEventActive = async (eventId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("events")
        .update({ is_active: !currentStatus })
        .eq("id", eventId);

      if (error) throw error;

      setEvents(events.map(e => 
        e.id === eventId ? { ...e, is_active: !currentStatus } : e
      ));

      toast({
        title: "Success",
        description: `Event ${!currentStatus ? "activated" : "deactivated"} successfully`,
      });
    } catch (error) {
      console.error("Error updating event:", error);
      toast({
        title: "Error",
        description: "Failed to update event",
        variant: "destructive",
      });
    }
  };

  const deleteEvent = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", eventId);

      if (error) throw error;

      setEvents(events.filter(e => e.id !== eventId));
      toast({
        title: "Success",
        description: "Event deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting event:", error);
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-DE", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-primary">Loading events...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold">My Events</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage your events
          </p>
        </div>
        <Link to="/vendor/events/new">
          <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
            <Plus className="w-4 h-4 mr-2" />
            Create New Event
          </Button>
        </Link>
      </div>

      {/* Events Grid */}
      {events.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <CalendarDays className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No events yet</h3>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              Create your first event to start selling tickets and attracting attendees.
            </p>
            <Link to="/vendor/events/new">
              <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Event
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card key={event.id} className="glass-card overflow-hidden hover-glow">
              {/* Event Image */}
              <div className="relative h-48 bg-muted">
                {event.images && event.images[0] ? (
                  <img 
                    src={event.images[0]} 
                    alt={event.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary/20 to-primary/20">
                    <CalendarDays className="w-12 h-12 text-secondary" />
                  </div>
                )}
                <div className="absolute top-3 right-3 flex gap-2">
                  <Badge variant={event.is_active ? "default" : "secondary"}>
                    {event.is_active ? "Active" : "Inactive"}
                  </Badge>
                  {event.is_featured && (
                    <Badge className="bg-secondary text-secondary-foreground">
                      Featured
                    </Badge>
                  )}
                </div>
              </div>

              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-lg line-clamp-1">{event.name}</h3>
                    <p className="text-sm text-muted-foreground capitalize">{event.event_type}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to={`/event/${event.slug}`} className="flex items-center">
                          <Eye className="w-4 h-4 mr-2" />
                          View Public Page
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={`/vendor/events/${event.id}/edit`} className="flex items-center">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Event
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => toggleEventActive(event.id, event.is_active)}
                      >
                        {event.is_active ? "Deactivate" : "Activate"}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => deleteEvent(event.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <CalendarDays className="w-4 h-4" />
                    {formatDate(event.start_date)}
                  </div>
                  {event.max_capacity && (
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {event.tickets_sold || 0}/{event.max_capacity}
                    </div>
                  )}
                </div>

                {event.ticket_price && (
                  <div className="flex items-center gap-2 mb-3">
                    <Ticket className="w-4 h-4 text-secondary" />
                    <span className="font-semibold text-secondary">
                      {event.ticket_currency || "€"}{event.ticket_price}
                    </span>
                  </div>
                )}

                <p className="text-sm text-muted-foreground line-clamp-2">
                  {event.short_description || event.description || "No description available"}
                </p>

                <div className="mt-4 pt-4 border-t border-border/50 flex gap-2">
                  <Link to={`/vendor/events/${event.id}/edit`} className="flex-1">
                    <Button variant="outline" className="w-full" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                  <Link to={`/event/${event.slug}`} className="flex-1">
                    <Button variant="secondary" className="w-full" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorEvents;
