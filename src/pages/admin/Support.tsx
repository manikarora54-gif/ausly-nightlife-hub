import { useState } from "react";
import { Search, Filter, MessageSquare, Mail, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const mockTickets = [
  {
    id: "TKT-001",
    customer: "John Doe",
    email: "john.doe@email.com",
    subject: "Booking confirmation email not received",
    message: "I made a booking for Watergate on Jan 20th but haven't received the confirmation email. Can you please resend it?",
    status: "open",
    priority: "high",
    category: "booking",
    createdAt: "2024-01-15 10:30",
    updatedAt: "2024-01-15 14:20"
  },
  {
    id: "TKT-002",
    customer: "Jane Smith",
    email: "jane.smith@email.com",
    subject: "Urgent refund request for cancelled booking",
    message: "I need to cancel my booking at Nobelhart & Schmutzig for Jan 19th due to a family emergency. I would like to request a full refund please.",
    status: "in_progress",
    priority: "high",
    category: "refund",
    createdAt: "2024-01-14 15:45",
    updatedAt: "2024-01-15 09:10"
  },
  {
    id: "TKT-003",
    customer: "Mike Johnson",
    email: "mike.j@email.com",
    subject: "Venue opening hours inquiry",
    message: "What are the opening hours for Watergate? I'm planning to visit this weekend and want to make sure they're open.",
    status: "resolved",
    priority: "low",
    category: "general",
    createdAt: "2024-01-13 11:20",
    updatedAt: "2024-01-13 16:45"
  },
  {
    id: "TKT-004",
    customer: "Sarah Williams",
    email: "sarah.w@email.com",
    subject: "Cannot reset password - account locked",
    message: "I can't log into my account and the password reset link isn't working. I've tried multiple times and now my account seems to be locked. Please help!",
    status: "open",
    priority: "medium",
    category: "technical",
    createdAt: "2024-01-15 08:15",
    updatedAt: "2024-01-15 08:15"
  },
  {
    id: "TKT-005",
    customer: "David Brown",
    email: "david.brown@email.com",
    subject: "Event cancelled - refund options",
    message: "The event I booked at Tantris was cancelled by the venue. What are my refund options? I paid €720 for a table of 6.",
    status: "in_progress",
    priority: "high",
    category: "booking",
    createdAt: "2024-01-14 20:30",
    updatedAt: "2024-01-15 10:00"
  },
  {
    id: "TKT-006",
    customer: "Emma Davis",
    email: "emma.d@email.com",
    subject: "Payment failed but booking shows pending",
    message: "My payment failed but the booking still shows as pending. I want to complete the payment for my reservation at Skyline Bar.",
    status: "open",
    priority: "high",
    category: "payment",
    createdAt: "2024-01-16 09:30",
    updatedAt: "2024-01-16 09:30"
  },
  {
    id: "TKT-007",
    customer: "Tom Wilson",
    email: "tom.wilson@email.com",
    subject: "Dietary requirements for restaurant booking",
    message: "I have a booking at Katz Orange and need to inform them about my gluten allergy. How can I add this information to my reservation?",
    status: "resolved",
    priority: "low",
    category: "booking",
    createdAt: "2024-01-12 14:20",
    updatedAt: "2024-01-12 15:45"
  },
  {
    id: "TKT-008",
    customer: "Lisa Anderson",
    email: "lisa.a@email.com",
    subject: "Group booking discount inquiry",
    message: "I'm planning to book a table for 10 people at Tim Raue. Do you offer any group discounts or special packages?",
    status: "open",
    priority: "medium",
    category: "general",
    createdAt: "2024-01-17 11:00",
    updatedAt: "2024-01-17 11:00"
  },
  {
    id: "TKT-009",
    customer: "Robert Miller",
    email: "robert.m@email.com",
    subject: "VIP access request for P1 Club",
    message: "I have a booking at P1 Club and would like to upgrade to VIP access. Is this possible and what are the additional costs?",
    status: "in_progress",
    priority: "medium",
    category: "booking",
    createdAt: "2024-01-16 16:30",
    updatedAt: "2024-01-17 09:15"
  },
  {
    id: "TKT-010",
    customer: "Sophie Martin",
    email: "sophie.m@email.com",
    subject: "Change booking date",
    message: "I need to change my booking date at Tim Raue from Jan 23rd to Jan 25th. Is this possible?",
    status: "open",
    priority: "medium",
    category: "booking",
    createdAt: "2024-01-18 10:20",
    updatedAt: "2024-01-18 10:20"
  },
  {
    id: "TKT-011",
    customer: "James Taylor",
    email: "james.t@email.com",
    subject: "Refund not processed after cancellation",
    message: "I cancelled my booking at Tresor 3 days ago but haven't received my refund yet. The payment was made via credit card.",
    status: "in_progress",
    priority: "high",
    category: "refund",
    createdAt: "2024-01-15 12:00",
    updatedAt: "2024-01-16 14:30"
  },
  {
    id: "TKT-012",
    customer: "Maria Garcia",
    email: "maria.g@email.com",
    subject: "App not loading on mobile device",
    message: "The Ausly app keeps crashing when I try to view my bookings. I'm using an iPhone 13 with the latest iOS. Can you help?",
    status: "open",
    priority: "medium",
    category: "technical",
    createdAt: "2024-01-17 15:45",
    updatedAt: "2024-01-17 15:45"
  }
];

const Support = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [replyMessage, setReplyMessage] = useState("");

  const filteredTickets = mockTickets.filter((ticket) => {
    const matchesSearch =
      ticket.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive", icon: any, label: string }> = {
      open: { variant: "destructive", icon: AlertCircle, label: "Open" },
      in_progress: { variant: "secondary", icon: Clock, label: "In Progress" },
      resolved: { variant: "default", icon: CheckCircle, label: "Resolved" }
    };
    const config = statusConfig[status] || statusConfig.open;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      high: "destructive",
      medium: "secondary",
      low: "default"
    };
    return <Badge variant={variants[priority] || "secondary"}>{priority}</Badge>;
  };

  const handleReply = (ticket: any) => {
    setSelectedTicket(ticket);
    // In real app, this would make an API call
    console.log("Replying to ticket:", ticket.id);
  };

  const handleResolve = (ticket: any) => {
    // In real app, this would make an API call
    console.log("Resolving ticket:", ticket.id);
  };

  const openCount = mockTickets.filter(t => t.status === "open").length;
  const inProgressCount = mockTickets.filter(t => t.status === "in_progress").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">Customer Support</h1>
          <p className="text-muted-foreground">Manage customer support tickets and inquiries</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Open Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{openCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Requiring attention</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{inProgressCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Being handled</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockTickets.length}</div>
            <p className="text-xs text-muted-foreground mt-1">All support requests</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="glass-card">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Support Tickets ({filteredTickets.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No tickets found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-medium">{ticket.id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{ticket.customer}</div>
                          <div className="text-sm text-muted-foreground">{ticket.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[250px]">
                          <div className="font-medium truncate">{ticket.subject}</div>
                          <div className="text-sm text-muted-foreground truncate">{ticket.message}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{ticket.category}</Badge>
                      </TableCell>
                      <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                      <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm">{ticket.createdAt.split(" ")[0]}</div>
                          <div className="text-xs text-muted-foreground">{ticket.createdAt.split(" ")[1]}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedTicket(ticket)}
                              >
                                <MessageSquare className="w-4 h-4 mr-1" />
                                Reply
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Reply to Ticket {ticket.id}</DialogTitle>
                                <DialogDescription>
                                  Responding to {ticket.customer} about: {ticket.subject}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="p-4 bg-muted rounded-lg">
                                  <div className="text-sm font-medium mb-2">Original Message:</div>
                                  <div className="text-sm text-muted-foreground">{ticket.message}</div>
                                </div>
                                <div>
                                  <label className="text-sm font-medium mb-2 block">Your Reply</label>
                                  <Textarea
                                    placeholder="Type your response here..."
                                    value={replyMessage}
                                    onChange={(e) => setReplyMessage(e.target.value)}
                                    rows={6}
                                    className="resize-none"
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setReplyMessage("")}>
                                  Cancel
                                </Button>
                                <Button variant="neon" onClick={() => handleReply(ticket)}>
                                  Send Reply
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          {ticket.status !== "resolved" && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleResolve(ticket)}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Resolve
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Support;
