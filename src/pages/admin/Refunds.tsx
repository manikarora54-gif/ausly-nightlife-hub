import { useState } from "react";
import { Search, RefreshCw, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
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

const mockRefunds = [
  {
    id: "REF-001",
    bookingId: "BK-011",
    customer: "James Taylor",
    email: "james.t@email.com",
    venue: "Tresor",
    originalAmount: "€50",
    refundAmount: "€50",
    reason: "Customer cancellation - change of plans",
    status: "processed",
    requestedDate: "2024-01-15",
    type: "cancellation"
  },
  {
    id: "REF-002",
    bookingId: "BK-016",
    customer: "Michael Chen",
    email: "michael.c@email.com",
    venue: "Watergate",
    originalAmount: "€120",
    refundAmount: "€100",
    reason: "Venue technical issues - event cancelled",
    status: "approved",
    requestedDate: "2024-01-18",
    type: "refund"
  },
  {
    id: "REF-003",
    bookingId: "BK-017",
    customer: "Laura Fischer",
    email: "laura.f@email.com",
    venue: "Nobelhart & Schmutzig",
    originalAmount: "€280",
    refundAmount: "€280",
    reason: "Service quality below expectations",
    status: "rejected",
    requestedDate: "2024-01-17",
    type: "refund"
  },
  {
    id: "REF-004",
    bookingId: "BK-018",
    customer: "Daniel Klein",
    email: "daniel.k@email.com",
    venue: "Buck and Breck",
    originalAmount: "€195",
    refundAmount: "€195",
    reason: "Customer request - personal emergency",
    status: "pending",
    requestedDate: "2024-01-19",
    type: "cancellation"
  },
  {
    id: "REF-005",
    bookingId: "BK-019",
    customer: "Julia Hoffmann",
    email: "julia.h@email.com",
    venue: "Tantris",
    originalAmount: "€720",
    refundAmount: "€650",
    reason: "Group size reduced - partial refund requested",
    status: "pending",
    requestedDate: "2024-01-18",
    type: "refund"
  },
  {
    id: "REF-006",
    bookingId: "BK-020",
    customer: "Markus Bauer",
    email: "markus.b@email.com",
    venue: "Sisyphos",
    originalAmount: "€75",
    refundAmount: "€75",
    reason: "Double booking - customer error",
    status: "approved",
    requestedDate: "2024-01-16",
    type: "cancellation"
  },
  {
    id: "REF-007",
    bookingId: "BK-021",
    customer: "Nicole Wagner",
    email: "nicole.w@email.com",
    venue: "P1 Club",
    originalAmount: "€250",
    refundAmount: "€250",
    reason: "Event postponed by venue",
    status: "pending",
    requestedDate: "2024-01-19",
    type: "refund"
  }
];

const Refunds = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRefund, setSelectedRefund] = useState<any>(null);
  const [refundNote, setRefundNote] = useState("");

  const filteredRefunds = mockRefunds.filter((refund) => {
    const matchesSearch =
      refund.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      refund.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      refund.bookingId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || refund.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive", icon: any, label: string }> = {
      pending: { variant: "secondary", icon: Clock, label: "Pending" },
      approved: { variant: "default", icon: CheckCircle, label: "Approved" },
      rejected: { variant: "destructive", icon: XCircle, label: "Rejected" },
      processed: { variant: "default", icon: CheckCircle, label: "Processed" }
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

  const handleApprove = (refund: any) => {
    setSelectedRefund(refund);
    // In real app, this would make an API call
    console.log("Approving refund:", refund.id);
  };

  const handleReject = (refund: any) => {
    setSelectedRefund(refund);
    // In real app, this would make an API call
    console.log("Rejecting refund:", refund.id);
  };

  const pendingCount = mockRefunds.filter(r => r.status === "pending").length;
  const totalPendingAmount = mockRefunds
    .filter(r => r.status === "pending")
    .reduce((sum, r) => sum + parseFloat(r.refundAmount.replace("€", "")), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">Cancellations & Refunds</h1>
          <p className="text-muted-foreground">Manage booking cancellations and refund requests</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{pendingCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting review</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">€{totalPendingAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">To be refunded</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockRefunds.length}</div>
            <p className="text-xs text-muted-foreground mt-1">All refund requests</p>
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
                placeholder="Search refunds..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="processed">Processed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Refunds Table */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Refund Requests ({filteredRefunds.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Refund ID</TableHead>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Venue</TableHead>
                  <TableHead>Original Amount</TableHead>
                  <TableHead>Refund Amount</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRefunds.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      No refund requests found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRefunds.map((refund) => (
                    <TableRow key={refund.id}>
                      <TableCell className="font-medium">{refund.id}</TableCell>
                      <TableCell>{refund.bookingId}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{refund.customer}</div>
                          <div className="text-sm text-muted-foreground">{refund.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{refund.venue}</TableCell>
                      <TableCell>{refund.originalAmount}</TableCell>
                      <TableCell className="font-semibold">{refund.refundAmount}</TableCell>
                      <TableCell>
                        <div className="max-w-[200px] truncate" title={refund.reason}>
                          {refund.reason}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(refund.status)}</TableCell>
                      <TableCell>{refund.requestedDate}</TableCell>
                      <TableCell className="text-right">
                        {refund.status === "pending" && (
                          <div className="flex justify-end gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => setSelectedRefund(refund)}
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Approve
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Approve Refund</DialogTitle>
                                  <DialogDescription>
                                    Approve refund of {refund.refundAmount} for {refund.customer}?
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <label className="text-sm font-medium">Refund Note (Optional)</label>
                                    <Textarea
                                      placeholder="Add a note for this refund..."
                                      value={refundNote}
                                      onChange={(e) => setRefundNote(e.target.value)}
                                      className="mt-2"
                                    />
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => setRefundNote("")}>
                                    Cancel
                                  </Button>
                                  <Button variant="neon" onClick={() => handleApprove(refund)}>
                                    Approve Refund
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => setSelectedRefund(refund)}
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Reject
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Reject Refund</DialogTitle>
                                  <DialogDescription>
                                    Reject refund request from {refund.customer}?
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <label className="text-sm font-medium">Rejection Reason</label>
                                    <Textarea
                                      placeholder="Explain why this refund is being rejected..."
                                      value={refundNote}
                                      onChange={(e) => setRefundNote(e.target.value)}
                                      className="mt-2"
                                      required
                                    />
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => setRefundNote("")}>
                                    Cancel
                                  </Button>
                                  <Button variant="destructive" onClick={() => handleReject(refund)}>
                                    Reject Refund
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        )}
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

export default Refunds;
