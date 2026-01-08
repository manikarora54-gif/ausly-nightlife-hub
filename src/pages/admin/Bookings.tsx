import { useState } from "react";
import { Search, Filter, MoreVertical, Eye, Edit, X } from "lucide-react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const mockBookings = [
  {
    id: "BK-001",
    customer: "John Doe",
    email: "john.doe@email.com",
    venue: "Watergate",
    date: "2024-01-20",
    time: "22:00",
    guests: 4,
    amount: "€120",
    status: "confirmed",
    paymentStatus: "paid"
  },
  {
    id: "BK-002",
    customer: "Jane Smith",
    email: "jane.smith@email.com",
    venue: "Nobelhart & Schmutzig",
    date: "2024-01-19",
    time: "19:00",
    guests: 2,
    amount: "€280",
    status: "confirmed",
    paymentStatus: "paid"
  },
  {
    id: "BK-003",
    customer: "Mike Johnson",
    email: "mike.j@email.com",
    venue: "Buck and Breck",
    date: "2024-01-21",
    time: "21:30",
    guests: 3,
    amount: "€195",
    status: "confirmed",
    paymentStatus: "paid"
  },
  {
    id: "BK-004",
    customer: "Sarah Williams",
    email: "sarah.w@email.com",
    venue: "Berghain",
    date: "2024-01-19",
    time: "23:00",
    guests: 2,
    amount: "€50",
    status: "confirmed",
    paymentStatus: "paid"
  },
  {
    id: "BK-005",
    customer: "David Brown",
    email: "david.brown@email.com",
    venue: "Tantris",
    date: "2024-01-22",
    time: "20:00",
    guests: 6,
    amount: "€720",
    status: "confirmed",
    paymentStatus: "paid"
  },
  {
    id: "BK-006",
    customer: "Emma Davis",
    email: "emma.d@email.com",
    venue: "Skyline Bar 20up",
    date: "2024-01-18",
    time: "20:30",
    guests: 2,
    amount: "€90",
    status: "pending",
    paymentStatus: "pending"
  },
  {
    id: "BK-007",
    customer: "Tom Wilson",
    email: "tom.wilson@email.com",
    venue: "Katz Orange",
    date: "2024-01-20",
    time: "19:30",
    guests: 4,
    amount: "€240",
    status: "confirmed",
    paymentStatus: "paid"
  },
  {
    id: "BK-008",
    customer: "Lisa Anderson",
    email: "lisa.a@email.com",
    venue: "Sisyphos",
    date: "2024-01-19",
    time: "23:30",
    guests: 3,
    amount: "€75",
    status: "confirmed",
    paymentStatus: "paid"
  },
  {
    id: "BK-009",
    customer: "Robert Miller",
    email: "robert.m@email.com",
    venue: "P1 Club",
    date: "2024-01-21",
    time: "22:00",
    guests: 5,
    amount: "€250",
    status: "pending",
    paymentStatus: "pending"
  },
  {
    id: "BK-010",
    customer: "Sophie Martin",
    email: "sophie.m@email.com",
    venue: "Tim Raue",
    date: "2024-01-23",
    time: "19:00",
    guests: 2,
    amount: "€320",
    status: "confirmed",
    paymentStatus: "paid"
  },
  {
    id: "BK-011",
    customer: "James Taylor",
    email: "james.t@email.com",
    venue: "Tresor",
    date: "2024-01-20",
    time: "23:00",
    guests: 2,
    amount: "€50",
    status: "cancelled",
    paymentStatus: "refunded"
  },
  {
    id: "BK-012",
    customer: "Maria Garcia",
    email: "maria.g@email.com",
    venue: "Bar Tausend",
    date: "2024-01-22",
    time: "21:00",
    guests: 3,
    amount: "€165",
    status: "confirmed",
    paymentStatus: "paid"
  },
  {
    id: "BK-013",
    customer: "Peter Schmidt",
    email: "peter.s@email.com",
    venue: "Fischers Fritz",
    date: "2024-01-24",
    time: "19:30",
    guests: 4,
    amount: "€380",
    status: "pending",
    paymentStatus: "pending"
  },
  {
    id: "BK-014",
    customer: "Anna Müller",
    email: "anna.m@email.com",
    venue: "Clouds Heaven's Bar",
    date: "2024-01-21",
    time: "20:00",
    guests: 2,
    amount: "€110",
    status: "confirmed",
    paymentStatus: "paid"
  },
  {
    id: "BK-015",
    customer: "Thomas Weber",
    email: "thomas.w@email.com",
    venue: "Zum Schneider",
    date: "2024-01-20",
    time: "19:00",
    guests: 8,
    amount: "€240",
    status: "confirmed",
    paymentStatus: "paid"
  }
];

const Bookings = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredBookings = mockBookings.filter((booking) => {
    const matchesSearch =
      booking.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      confirmed: "default",
      pending: "secondary",
      cancelled: "destructive"
    };
    return (
      <Badge variant={variants[status] || "secondary"}>
        {status}
      </Badge>
    );
  };

  const getPaymentBadge = (status: string) => {
    if (status === "paid") {
      return <Badge variant="default" className="bg-green-500">Paid</Badge>;
    } else if (status === "pending") {
      return <Badge variant="secondary">Pending</Badge>;
    } else {
      return <Badge variant="destructive">Refunded</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">Bookings Management</h1>
          <p className="text-muted-foreground">Manage all venue and event bookings</p>
        </div>
        <Button 
          variant="neon"
          onClick={() => {
            // Export bookings functionality
            alert('Exporting bookings... In production, this would download a CSV/Excel file.');
          }}
        >
          Export Bookings
        </Button>
      </div>

      {/* Filters */}
      <Card className="glass-card">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search bookings..."
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
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>All Bookings ({filteredBookings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Venue</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Guests</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No bookings found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">{booking.id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{booking.customer}</div>
                          <div className="text-sm text-muted-foreground">{booking.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{booking.venue}</TableCell>
                      <TableCell>
                        <div>
                          <div>{booking.date}</div>
                          <div className="text-sm text-muted-foreground">{booking.time}</div>
                        </div>
                      </TableCell>
                      <TableCell>{booking.guests}</TableCell>
                      <TableCell className="font-semibold">{booking.amount}</TableCell>
                      <TableCell>{getStatusBadge(booking.status)}</TableCell>
                      <TableCell>{getPaymentBadge(booking.paymentStatus)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                alert(`Viewing details for booking ${booking.id}\nCustomer: ${booking.customer}\nVenue: ${booking.venue}\nDate: ${booking.date} at ${booking.time}\nGuests: ${booking.guests}\nAmount: ${booking.amount}`);
                              }}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                alert(`Opening edit form for booking ${booking.id}. In production, this would open an edit dialog.`);
                              }}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Booking
                            </DropdownMenuItem>
                            {booking.status !== "cancelled" && (
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => {
                                  if (confirm(`Are you sure you want to cancel booking ${booking.id}?`)) {
                                    alert(`Booking ${booking.id} cancelled. In production, this would update the booking status.`);
                                  }
                                }}
                              >
                                <X className="w-4 h-4 mr-2" />
                                Cancel Booking
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
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

export default Bookings;
