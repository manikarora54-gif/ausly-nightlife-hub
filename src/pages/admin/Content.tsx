import { useState } from "react";
import { Search, Plus, Edit, Trash2, Eye, Save, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const mockVenues = [
  {
    id: "VEN-001",
    name: "Watergate",
    type: "Club",
    city: "Berlin",
    status: "published",
    featured: true,
    lastUpdated: "2024-01-10"
  },
  {
    id: "VEN-002",
    name: "Nobelhart & Schmutzig",
    type: "Restaurant",
    city: "Berlin",
    status: "published",
    featured: true,
    lastUpdated: "2024-01-09"
  },
  {
    id: "VEN-003",
    name: "Buck and Breck",
    type: "Bar",
    city: "Berlin",
    status: "published",
    featured: true,
    lastUpdated: "2024-01-08"
  },
  {
    id: "VEN-004",
    name: "Berghain",
    type: "Club",
    city: "Berlin",
    status: "published",
    featured: true,
    lastUpdated: "2024-01-07"
  },
  {
    id: "VEN-005",
    name: "Tantris",
    type: "Restaurant",
    city: "Munich",
    status: "published",
    featured: true,
    lastUpdated: "2024-01-06"
  },
  {
    id: "VEN-006",
    name: "Katz Orange",
    type: "Restaurant",
    city: "Berlin",
    status: "published",
    featured: false,
    lastUpdated: "2024-01-05"
  },
  {
    id: "VEN-007",
    name: "Tresor",
    type: "Club",
    city: "Berlin",
    status: "published",
    featured: false,
    lastUpdated: "2024-01-04"
  },
  {
    id: "VEN-008",
    name: "Skyline Bar 20up",
    type: "Bar",
    city: "Hamburg",
    status: "published",
    featured: true,
    lastUpdated: "2024-01-03"
  },
  {
    id: "VEN-009",
    name: "Bar Tausend",
    type: "Bar",
    city: "Berlin",
    status: "published",
    featured: false,
    lastUpdated: "2024-01-02"
  },
  {
    id: "VEN-010",
    name: "P1 Club",
    type: "Club",
    city: "Munich",
    status: "published",
    featured: false,
    lastUpdated: "2024-01-01"
  },
  {
    id: "VEN-011",
    name: "Tim Raue",
    type: "Restaurant",
    city: "Berlin",
    status: "published",
    featured: true,
    lastUpdated: "2023-12-30"
  },
  {
    id: "VEN-012",
    name: "Sisyphos",
    type: "Club",
    city: "Berlin",
    status: "published",
    featured: false,
    lastUpdated: "2023-12-29"
  },
  {
    id: "VEN-013",
    name: "Fischers Fritz",
    type: "Restaurant",
    city: "Berlin",
    status: "draft",
    featured: false,
    lastUpdated: "2023-12-28"
  }
];

const mockEvents = [
  {
    id: "EVT-001",
    name: "Techno Paradise Festival",
    venue: "Berghain",
    date: "2024-01-27",
    status: "published",
    featured: true,
    lastUpdated: "2024-01-05"
  },
  {
    id: "EVT-002",
    name: "Jazz Night Live",
    venue: "Buck and Breck",
    date: "2024-01-20",
    status: "published",
    featured: false,
    lastUpdated: "2024-01-04"
  },
  {
    id: "EVT-003",
    name: "Wine Tasting Evening",
    venue: "Nobelhart & Schmutzig",
    date: "2024-01-25",
    status: "published",
    featured: true,
    lastUpdated: "2024-01-03"
  },
  {
    id: "EVT-004",
    name: "Berlin Jazz Festival",
    venue: "Multiple Venues",
    date: "2024-02-10",
    status: "published",
    featured: true,
    lastUpdated: "2024-01-02"
  },
  {
    id: "EVT-005",
    name: "Oktoberfest Afterparty",
    venue: "P1 Club",
    date: "2024-09-30",
    status: "published",
    featured: true,
    lastUpdated: "2024-01-01"
  },
  {
    id: "EVT-006",
    name: "Hamburg Music Week",
    venue: "Multiple Venues",
    date: "2024-03-15",
    status: "published",
    featured: false,
    lastUpdated: "2023-12-30"
  },
  {
    id: "EVT-007",
    name: "Wine & Dine Night",
    venue: "Tantris",
    date: "2024-02-14",
    status: "published",
    featured: true,
    lastUpdated: "2023-12-29"
  },
  {
    id: "EVT-008",
    name: "Summer Rooftop Party",
    venue: "Skyline Bar 20up",
    date: "2024-06-15",
    status: "draft",
    featured: false,
    lastUpdated: "2023-12-28"
  }
];

const Content = () => {
  const [activeTab, setActiveTab] = useState("venues");
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const filteredVenues = mockVenues.filter((venue) =>
    venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    venue.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredEvents = mockEvents.filter((event) =>
    event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.venue.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    return (
      <Badge variant={status === "published" ? "default" : "secondary"}>
        {status}
      </Badge>
    );
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setIsEditing(true);
  };

  const handleSave = () => {
    // In real app, this would make an API call
    console.log("Saving:", editingItem);
    setIsEditing(false);
    setEditingItem(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">Content Management</h1>
          <p className="text-muted-foreground">Manage venues, events, and frontend content</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="neon">
              <Plus className="w-4 h-4 mr-2" />
              Add New
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New {activeTab === "venues" ? "Venue" : "Event"}</DialogTitle>
              <DialogDescription>
                Create a new {activeTab === "venues" ? "venue" : "event"} listing
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Name</label>
                <Input placeholder={`Enter ${activeTab === "venues" ? "venue" : "event"} name`} />
              </div>
              {activeTab === "events" && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Venue</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select venue" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockVenues.map((venue) => (
                        <SelectItem key={venue.id} value={venue.id}>
                          {venue.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea placeholder="Enter description" rows={4} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline">Cancel</Button>
              <Button variant="neon">Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card className="glass-card">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="venues">Venues</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="pages">Pages</TabsTrigger>
        </TabsList>

        {/* Venues Tab */}
        <TabsContent value="venues" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Venues ({filteredVenues.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Featured</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVenues.map((venue) => (
                      <TableRow key={venue.id}>
                        <TableCell className="font-medium">{venue.id}</TableCell>
                        <TableCell className="font-medium">{venue.name}</TableCell>
                        <TableCell>{venue.type}</TableCell>
                        <TableCell>{venue.city}</TableCell>
                        <TableCell>{getStatusBadge(venue.status)}</TableCell>
                        <TableCell>
                          {venue.featured ? (
                            <Badge variant="default">Featured</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>{venue.lastUpdated}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(venue)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Events ({filteredEvents.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Venue</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Featured</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEvents.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell className="font-medium">{event.id}</TableCell>
                        <TableCell className="font-medium">{event.name}</TableCell>
                        <TableCell>{event.venue}</TableCell>
                        <TableCell>{event.date}</TableCell>
                        <TableCell>{getStatusBadge(event.status)}</TableCell>
                        <TableCell>
                          {event.featured ? (
                            <Badge variant="default">Featured</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>{event.lastUpdated}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(event)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pages Tab */}
        <TabsContent value="pages" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Frontend Pages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {["Home", "Discover", "Map", "Plan", "Sign In", "Sign Up", "Help", "Contact", "Privacy", "Terms"].map((page) => (
                  <div
                    key={page}
                    className="p-4 border border-border rounded-lg hover:border-primary/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{page}</h3>
                      <Button variant="ghost" size="icon">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">Edit page content and settings</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      {isEditing && editingItem && (
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit {activeTab === "venues" ? "Venue" : "Event"}</DialogTitle>
              <DialogDescription>
                Update the details for {editingItem.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Name</label>
                <Input defaultValue={editingItem.name} />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea placeholder="Enter description" rows={4} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <Select defaultValue={editingItem.status}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Featured</label>
                  <Select defaultValue={editingItem.featured ? "yes" : "no"}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button variant="neon" onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Content;
