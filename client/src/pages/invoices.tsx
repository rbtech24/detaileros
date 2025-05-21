import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Search, Plus, Eye, FileText, FileClock, Mail } from "lucide-react";

interface Invoice {
  id: number;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  paid: boolean;
  paidDate: string | null;
  paidAmount: number | null;
  jobId: number;
  job: {
    id: number;
    status: string;
    customer: {
      id: number;
      fullName: string;
    };
    vehicle: {
      make: string;
      model: string;
    };
  };
}

export default function Invoices() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch invoices
  const { data: invoices, isLoading } = useQuery({
    queryKey: ['/api/invoices', searchQuery, statusFilter],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      
      if (searchQuery) queryParams.append('search', searchQuery);
      if (statusFilter === "paid") queryParams.append('paid', "true");
      if (statusFilter === "unpaid") queryParams.append('paid', "false");
      
      const res = await fetch(`/api/invoices?${queryParams.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch invoices');
      return res.json();
    }
  });

  // Mark invoice as paid mutation
  const markAsPaidMutation = useMutation({
    mutationFn: async (invoiceId: number) => {
      return apiRequest('PUT', `/api/invoices/${invoiceId}`, { 
        paid: true,
        paidDate: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      toast({
        title: "Invoice marked as paid",
        description: "The invoice has been successfully marked as paid."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update invoice. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleMarkAsPaid = (invoiceId: number) => {
    if (window.confirm("Are you sure you want to mark this invoice as paid?")) {
      markAsPaidMutation.mutate(invoiceId);
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <div className="mt-3 md:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Search invoices..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Link href="/jobs">
            <Button className="flex items-center">
              <Plus className="h-4 w-4 mr-1" />
              New Invoice
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="all" value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Invoices</TabsTrigger>
          <TabsTrigger value="unpaid">Unpaid</TabsTrigger>
          <TabsTrigger value="paid">Paid</TabsTrigger>
        </TabsList>
        
        <TabsContent value={statusFilter}>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="p-4">
                <div className="flex flex-col space-y-3">
                  {Array(5).fill(0).map((_, idx) => (
                    <div key={idx} className="flex space-x-4 items-center">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices && invoices.length > 0 ? (
                    invoices.map((invoice: Invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell>
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold mr-3">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="font-semibold">{invoice.invoiceNumber}</div>
                              <div className="text-xs text-slate-500">
                                {invoice.job?.vehicle?.make ? `${invoice.job.vehicle.make} ${invoice.job.vehicle.model}` : 'No vehicle info'}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{invoice.job?.customer?.fullName || 'No customer assigned'}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{formatDate(invoice.issueDate)}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{formatDate(invoice.dueDate)}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{formatCurrency(invoice.total)}</div>
                        </TableCell>
                        <TableCell>
                          {invoice.paid ? (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Paid
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Unpaid
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" size="sm" className="flex items-center">
                              <Eye className="h-3.5 w-3.5 mr-1" />
                              View
                            </Button>
                            
                            {!invoice.paid && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex items-center"
                                onClick={() => handleMarkAsPaid(invoice.id)}
                              >
                                <FileClock className="h-3.5 w-3.5 mr-1" />
                                Mark Paid
                              </Button>
                            )}
                            
                            <Button variant="outline" size="sm" className="flex items-center">
                              <Mail className="h-3.5 w-3.5 mr-1" />
                              Email
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10">
                        <div className="flex flex-col items-center justify-center text-slate-500">
                          <FileText className="h-12 w-12 mb-2 text-slate-300" />
                          <p>No invoices found</p>
                          {searchQuery && (
                            <p className="text-sm">Try adjusting your search</p>
                          )}
                          <Link href="/jobs">
                            <Button className="mt-4">
                              Create your first invoice
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
