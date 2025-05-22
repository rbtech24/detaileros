import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  UserPlus, 
  Filter, 
  ChevronDown, 
  Users,
  CalendarDays,
  Clock,
  Car,
  Link as LinkIcon,
  Unlink,
  Mail,
  Phone
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { getInitials } from "@/lib/utils";

// Interface for Customer
interface Customer {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  assignedTechnicianId?: number | null;
}

// Interface for Technician
interface Technician {
  id: number;
  fullName: string;
  email: string;
  role: string;
  phoneNumber?: string;
  avatarUrl?: string;
  customerCount?: number;
}

export default function CustomerAssignments() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [technicianFilter, setTechnicianFilter] = useState<string>("all");
  const [selectedCustomers, setSelectedCustomers] = useState<number[]>([]);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string>("");

  // Fetch customers with their assigned technicians
  const { data: customers, isLoading: isLoadingCustomers } = useQuery({
    queryKey: ['/api/customers-with-assignments'],
    queryFn: async () => {
      const res = await fetch('/api/customers');
      if (!res.ok) throw new Error('Failed to fetch customers');
      // In a real application, this would come from a dedicated endpoint
      // that includes the assignment information
      const customers = await res.json();
      
      // For now, we'll use mock assignments
      const customersWithAssignments = customers.customers.map((customer: any) => ({
        ...customer,
        assignedTechnicianId: customer.id % 5 === 0 ? 2 : 
                             customer.id % 3 === 0 ? 3 : null
      }));
      
      return customersWithAssignments;
    }
  });

  // Fetch technicians (only those with role "technician")
  const { data: technicians, isLoading: isLoadingTechnicians } = useQuery({
    queryKey: ['/api/technicians'],
    queryFn: async () => {
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error('Failed to fetch technicians');
      
      const users = await res.json();
      // Filter to only include technicians
      const technicianUsers = users.filter((user: any) => 
        user.role === 'technician'
      );
      
      // Count assigned customers for each technician
      if (customers) {
        return technicianUsers.map((tech: any) => ({
          ...tech,
          customerCount: customers.filter((c: Customer) => 
            c.assignedTechnicianId === tech.id
          ).length
        }));
      }
      
      return technicianUsers;
    },
    enabled: !!customers // Only run this query once customers are loaded
  });

  // Assign technician to customer(s) mutation
  const assignTechnicianMutation = useMutation({
    mutationFn: async ({ 
      technicianId, 
      customerIds 
    }: { 
      technicianId: number; 
      customerIds: number[] 
    }) => {
      // In a real app, this would call an API endpoint
      // return apiRequest('POST', '/api/assign-technician', { 
      //   technicianId,
      //   customerIds
      // });
      
      // For now, we'll simulate a successful response
      return new Promise(resolve => setTimeout(() => resolve(true), 500));
    },
    onSuccess: () => {
      toast({
        title: "Customers assigned",
        description: `Successfully assigned ${selectedCustomers.length} customer(s) to technician.`
      });
      setIsAssignDialogOpen(false);
      setSelectedCustomers([]);
      queryClient.invalidateQueries({ queryKey: ['/api/customers-with-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/technicians'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to assign technician. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Unassign technician from customer mutation
  const unassignTechnicianMutation = useMutation({
    mutationFn: async (customerId: number) => {
      // In a real app, this would call an API endpoint
      // return apiRequest('DELETE', `/api/unassign-technician/${customerId}`);
      
      // For now, we'll simulate a successful response
      return new Promise(resolve => setTimeout(() => resolve(true), 500));
    },
    onSuccess: () => {
      toast({
        title: "Customer unassigned",
        description: "Successfully removed technician assignment."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/customers-with-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/technicians'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to unassign technician. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Handle technician assignment
  const handleAssignTechnician = () => {
    if (!selectedTechnicianId || selectedCustomers.length === 0) {
      toast({
        title: "Invalid selection",
        description: "Please select a technician and at least one customer",
        variant: "destructive"
      });
      return;
    }

    assignTechnicianMutation.mutate({
      technicianId: parseInt(selectedTechnicianId),
      customerIds: selectedCustomers
    });
  };

  // Handle unassigning a technician from a customer
  const handleUnassignTechnician = (customerId: number) => {
    if (window.confirm("Are you sure you want to remove this assignment?")) {
      unassignTechnicianMutation.mutate(customerId);
    }
  };

  // Handle select all customers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = filteredCustomers.map(customer => customer.id);
      setSelectedCustomers(allIds);
    } else {
      setSelectedCustomers([]);
    }
  };

  // Handle individual customer selection
  const handleSelectCustomer = (customerId: number, checked: boolean) => {
    if (checked) {
      setSelectedCustomers(prev => [...prev, customerId]);
    } else {
      setSelectedCustomers(prev => prev.filter(id => id !== customerId));
    }
  };

  // Get assigned technician name by ID
  const getTechnicianNameById = (technicianId: number | null | undefined) => {
    if (!technicianId || !technicians) return "Unassigned";
    
    const technician = technicians.find(t => t.id === technicianId);
    return technician ? technician.fullName : "Unknown";
  };

  // Filter customers based on search query and technician filter
  const filteredCustomers = customers ? customers.filter((customer: Customer) => {
    // Apply search filter
    const matchesSearch = !searchQuery || 
      customer.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phoneNumber.includes(searchQuery);
    
    // Apply technician filter
    const matchesTechnician = 
      technicianFilter === "all" ||
      (technicianFilter === "assigned" && customer.assignedTechnicianId) ||
      (technicianFilter === "unassigned" && !customer.assignedTechnicianId) ||
      (customer.assignedTechnicianId === parseInt(technicianFilter));
    
    return matchesSearch && matchesTechnician;
  }) : [];

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold">Customer Assignments</h1>
        <div className="mt-3 md:mt-0 flex flex-wrap gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="flex items-center" 
                disabled={selectedCustomers.length === 0}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Assign Technician
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Assign Technician to Customers</DialogTitle>
                <DialogDescription>
                  Select a technician to assign to {selectedCustomers.length} selected customer(s).
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-4">
                <div className="mb-4">
                  <label className="text-sm font-medium mb-2 block">Select Technician</label>
                  <Select 
                    value={selectedTechnicianId} 
                    onValueChange={setSelectedTechnicianId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a technician" />
                    </SelectTrigger>
                    <SelectContent>
                      {technicians?.map((tech: Technician) => (
                        <SelectItem key={tech.id} value={tech.id.toString()}>
                          {tech.fullName} ({tech.customerCount || 0} customers)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="mb-2">
                  <label className="text-sm font-medium mb-2 block">Selected Customers</label>
                  <div className="text-sm text-muted-foreground">
                    {selectedCustomers.length} customer(s) selected
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsAssignDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAssignTechnician}
                  disabled={!selectedTechnicianId || assignTechnicianMutation.isPending}
                >
                  {assignTechnicianMutation.isPending ? "Assigning..." : "Assign Technician"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                Filter
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filter by Technician</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className={technicianFilter === "all" ? "bg-slate-100" : ""}
                onClick={() => setTechnicianFilter("all")}
              >
                All Customers
              </DropdownMenuItem>
              <DropdownMenuItem
                className={technicianFilter === "assigned" ? "bg-slate-100" : ""}
                onClick={() => setTechnicianFilter("assigned")}
              >
                Assigned Customers
              </DropdownMenuItem>
              <DropdownMenuItem
                className={technicianFilter === "unassigned" ? "bg-slate-100" : ""}
                onClick={() => setTechnicianFilter("unassigned")}
              >
                Unassigned Customers
              </DropdownMenuItem>
              
              {technicians && technicians.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>By Technician</DropdownMenuLabel>
                  {technicians.map((tech: Technician) => (
                    <DropdownMenuItem
                      key={tech.id}
                      className={technicianFilter === tech.id.toString() ? "bg-slate-100" : ""}
                      onClick={() => setTechnicianFilter(tech.id.toString())}
                    >
                      {tech.fullName} ({tech.customerCount || 0})
                    </DropdownMenuItem>
                  ))}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-5 w-5 text-muted-foreground mr-2" />
              <span className="text-2xl font-bold">{customers?.length || 0}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Assigned Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <LinkIcon className="h-5 w-5 text-blue-500 mr-2" />
              <span className="text-2xl font-bold">
                {customers ? customers.filter((c: Customer) => c.assignedTechnicianId).length : 0}
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Unassigned Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Unlink className="h-5 w-5 text-amber-500 mr-2" />
              <span className="text-2xl font-bold">
                {customers ? customers.filter((c: Customer) => !c.assignedTechnicianId).length : 0}
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Active Technicians</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <UserPlus className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-2xl font-bold">{technicians?.length || 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {isLoadingCustomers ? (
          <div className="p-6 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Loading customer data...</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox 
                    checked={
                      filteredCustomers.length > 0 && 
                      selectedCustomers.length === filteredCustomers.length
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Job Type</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer: Customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <Checkbox 
                        checked={selectedCustomers.includes(customer.id)}
                        onCheckedChange={(checked) => 
                          handleSelectCustomer(customer.id, !!checked)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Avatar className="mr-3 h-10 w-10">
                          <AvatarFallback>{getInitials(customer.fullName)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{customer.fullName}</div>
                          <div className="text-xs text-muted-foreground">
                            ID: {customer.id}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm flex items-center">
                          <Mail className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                          {customer.email || 'No email provided'}
                        </div>
                        <div className="text-sm flex items-center">
                          <Phone className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                          {customer.phoneNumber}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {customer.assignedTechnicianId ? (
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                          {getTechnicianNameById(customer.assignedTechnicianId)}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-slate-500">
                          Unassigned
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        {customer.assignedTechnicianId ? (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex items-center"
                            onClick={() => handleUnassignTechnician(customer.id)}
                          >
                            <Unlink className="h-3.5 w-3.5 mr-1" />
                            Unassign
                          </Button>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex items-center"
                            onClick={() => {
                              setSelectedCustomers([customer.id]);
                              setIsAssignDialogOpen(true);
                            }}
                          >
                            <UserPlus className="h-3.5 w-3.5 mr-1" />
                            Assign
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <Users className="h-12 w-12 mb-2 text-slate-300" />
                      <p>No customers found</p>
                      {searchQuery && (
                        <p className="text-sm">Try adjusting your search</p>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
      
      {selectedCustomers.length > 0 && (
        <div className="fixed bottom-6 right-6 bg-primary text-white py-2 px-4 rounded-lg shadow-lg flex items-center">
          <Button 
            variant="ghost" 
            className="text-white p-2 h-8"
            onClick={() => setSelectedCustomers([])}
          >
            Clear
          </Button>
          <span className="mx-2">
            {selectedCustomers.length} customer(s) selected
          </span>
          <Button 
            variant="secondary" 
            size="sm"
            className="ml-2"
            onClick={() => setIsAssignDialogOpen(true)}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Assign
          </Button>
        </div>
      )}
    </div>
  );
}