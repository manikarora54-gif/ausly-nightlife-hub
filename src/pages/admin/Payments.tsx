import { useState } from "react";
import { Search, Filter, Download, CheckCircle, XCircle, Clock } from "lucide-react";
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

const mockPayments = [
  {
    id: "PAY-001",
    bookingId: "BK-001",
    customer: "John Doe",
    amount: "€120",
    method: "Credit Card",
    status: "completed",
    date: "2024-01-15",
    time: "14:23"
  },
  {
    id: "PAY-002",
    bookingId: "BK-002",
    customer: "Jane Smith",
    amount: "€280",
    method: "Credit Card",
    status: "completed",
    date: "2024-01-14",
    time: "10:15"
  },
  {
    id: "PAY-003",
    bookingId: "BK-003",
    customer: "Mike Johnson",
    amount: "€195",
    method: "PayPal",
    status: "completed",
    date: "2024-01-16",
    time: "16:45"
  },
  {
    id: "PAY-004",
    bookingId: "BK-004",
    customer: "Sarah Williams",
    amount: "€50",
    method: "Credit Card",
    status: "completed",
    date: "2024-01-14",
    time: "11:30"
  },
  {
    id: "PAY-005",
    bookingId: "BK-005",
    customer: "David Brown",
    amount: "€720",
    method: "Credit Card",
    status: "completed",
    date: "2024-01-17",
    time: "20:12"
  },
  {
    id: "PAY-006",
    bookingId: "BK-006",
    customer: "Emma Davis",
    amount: "€90",
    method: "PayPal",
    status: "pending",
    date: "2024-01-13",
    time: "09:15"
  },
  {
    id: "PAY-007",
    bookingId: "BK-007",
    customer: "Tom Wilson",
    amount: "€240",
    method: "Credit Card",
    status: "completed",
    date: "2024-01-15",
    time: "15:30"
  },
  {
    id: "PAY-008",
    bookingId: "BK-008",
    customer: "Lisa Anderson",
    amount: "€75",
    method: "Credit Card",
    status: "completed",
    date: "2024-01-14",
    time: "18:20"
  },
  {
    id: "PAY-009",
    bookingId: "BK-009",
    customer: "Robert Miller",
    amount: "€250",
    method: "Bank Transfer",
    status: "pending",
    date: "2024-01-16",
    time: "12:45"
  },
  {
    id: "PAY-010",
    bookingId: "BK-010",
    customer: "Sophie Martin",
    amount: "€320",
    method: "Credit Card",
    status: "completed",
    date: "2024-01-18",
    time: "14:10"
  },
  {
    id: "PAY-011",
    bookingId: "BK-011",
    customer: "James Taylor",
    amount: "€50",
    method: "Credit Card",
    status: "refunded",
    date: "2024-01-15",
    time: "16:00"
  },
  {
    id: "PAY-012",
    bookingId: "BK-012",
    customer: "Maria Garcia",
    amount: "€165",
    method: "PayPal",
    status: "completed",
    date: "2024-01-17",
    time: "19:30"
  },
  {
    id: "PAY-013",
    bookingId: "BK-013",
    customer: "Peter Schmidt",
    amount: "€380",
    method: "Credit Card",
    status: "pending",
    date: "2024-01-19",
    time: "10:00"
  },
  {
    id: "PAY-014",
    bookingId: "BK-014",
    customer: "Anna Müller",
    amount: "€110",
    method: "Credit Card",
    status: "completed",
    date: "2024-01-16",
    time: "13:20"
  },
  {
    id: "PAY-015",
    bookingId: "BK-015",
    customer: "Thomas Weber",
    amount: "€240",
    method: "Credit Card",
    status: "completed",
    date: "2024-01-15",
    time: "17:45"
  }
];

const Payments = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredPayments = mockPayments.filter((payment) => {
    const matchesSearch =
      payment.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.bookingId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive", icon: any, label: string }> = {
      completed: { variant: "default", icon: CheckCircle, label: "Completed" },
      pending: { variant: "secondary", icon: Clock, label: "Pending" },
      refunded: { variant: "secondary", icon: CheckCircle, label: "Refunded" },
      failed: { variant: "destructive", icon: XCircle, label: "Failed" }
    };
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const totalRevenue = mockPayments
    .filter(p => p.status === "completed")
    .reduce((sum, p) => sum + parseFloat(p.amount.replace("€", "")), 0);

  const pendingAmount = mockPayments
    .filter(p => p.status === "pending")
    .reduce((sum, p) => sum + parseFloat(p.amount.replace("€", "")), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">Payments Management</h1>
          <p className="text-muted-foreground">Track and manage all payment transactions</p>
        </div>
        <Button 
          variant="neon"
          onClick={() => {
            alert('Exporting payment report... In production, this would download a CSV/Excel file with all payment transactions.');
          }}
        >
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">€{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">From completed payments</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">€{pendingAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting processing</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockPayments.length}</div>
            <p className="text-xs text-muted-foreground mt-1">All payment records</p>
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
                placeholder="Search payments..."
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
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Payment Transactions ({filteredPayments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment ID</TableHead>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No payments found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{payment.id}</TableCell>
                      <TableCell>{payment.bookingId}</TableCell>
                      <TableCell>{payment.customer}</TableCell>
                      <TableCell className="font-semibold">{payment.amount}</TableCell>
                      <TableCell>{payment.method}</TableCell>
                      <TableCell>
                        <div>
                          <div>{payment.date}</div>
                          <div className="text-sm text-muted-foreground">{payment.time}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
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

export default Payments;
