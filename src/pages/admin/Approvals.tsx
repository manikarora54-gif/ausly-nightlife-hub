import { usePendingApprovals } from "@/hooks/useAdminData";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, CheckCircle, XCircle, MapPin, Calendar, Store } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const Approvals = () => {
  const { data, isLoading } = usePendingApprovals();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleApproveVenue = async (id: string) => {
    const { error } = await supabase.from("venues").update({ is_active: true }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Venue approved", description: "The venue is now live." });
      queryClient.invalidateQueries({ queryKey: ["admin-pending-approvals"] });
    }
  };

  const handleRejectVenue = async (id: string) => {
    const { error } = await supabase.from("venues").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Venue rejected", description: "The venue has been removed." });
      queryClient.invalidateQueries({ queryKey: ["admin-pending-approvals"] });
    }
  };

  const handleApproveEvent = async (id: string) => {
    const { error } = await supabase.from("events").update({ is_active: true }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Event approved", description: "The event is now live." });
      queryClient.invalidateQueries({ queryKey: ["admin-pending-approvals"] });
    }
  };

  const handleRejectEvent = async (id: string) => {
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Event rejected", description: "The event has been removed." });
      queryClient.invalidateQueries({ queryKey: ["admin-pending-approvals"] });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalPending = (data?.venues?.length || 0) + (data?.events?.length || 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold mb-2">Approvals</h1>
        <p className="text-muted-foreground">
          Review and approve vendor-submitted venues and events.
          {totalPending > 0 && (
            <Badge variant="destructive" className="ml-2">{totalPending} pending</Badge>
          )}
        </p>
      </div>

      <Tabs defaultValue="venues" className="space-y-4">
        <TabsList>
          <TabsTrigger value="venues" className="gap-2">
            <Store className="w-4 h-4" />
            Venues ({data?.venues?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="events" className="gap-2">
            <Calendar className="w-4 h-4" />
            Events ({data?.events?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="venues">
          {data?.venues?.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="py-12 text-center text-muted-foreground">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-accent" />
                <p>No venues pending approval.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {data?.venues?.map((v: any) => (
                <Card key={v.id} className="glass-card">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{v.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <MapPin className="w-3 h-3" /> {v.address}, {v.city}
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline">{v.type}</Badge>
                          {v.cuisine && <Badge variant="outline">{v.cuisine}</Badge>}
                        </div>
                        {v.short_description && (
                          <p className="text-sm text-muted-foreground mt-2">{v.short_description}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          Submitted {format(new Date(v.created_at), "MMM d, yyyy")}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleApproveVenue(v.id)} className="gap-1">
                          <CheckCircle className="w-4 h-4" /> Approve
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleRejectVenue(v.id)} className="gap-1">
                          <XCircle className="w-4 h-4" /> Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="events">
          {data?.events?.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="py-12 text-center text-muted-foreground">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-accent" />
                <p>No events pending approval.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {data?.events?.map((e: any) => (
                <Card key={e.id} className="glass-card">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{e.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {(e as any).venues?.name || "No venue"} • {format(new Date(e.start_date), "MMM d, yyyy")}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline">{e.event_type}</Badge>
                          {e.genre && <Badge variant="outline">{e.genre}</Badge>}
                        </div>
                        {e.ticket_price && (
                          <p className="text-sm mt-1">€{e.ticket_price}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleApproveEvent(e.id)} className="gap-1">
                          <CheckCircle className="w-4 h-4" /> Approve
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleRejectEvent(e.id)} className="gap-1">
                          <XCircle className="w-4 h-4" /> Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Approvals;
