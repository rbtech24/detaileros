import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { formatDate, formatTime, getStatusColor } from "@/lib/utils";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { JobForm } from "@/components/jobs/job-form";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Eye, MapPin, Phone, Calendar } from "lucide-react";

interface Job {
  id: number;
  customerId: number;
  vehicleId: number;
  technicianId: number;
  scheduledStartTime: string;
  scheduledEndTime: string;
  status: string;
  address: string;
  city: string;
  state: string;
  notes: string;
  customer: {
    fullName: string;
    phoneNumber: string;
  };
  vehicle: {
    make: string;
    model: string;
  };
  technician: {
    fullName: string;
  } | null;
  services: Array<{
    serviceName: string;
    price: number;
    quantity: number;
  }>;
}

export default function Jobs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAddJobOpen, setIsAddJobOpen] = useState(false);
  
  // Fetch jobs
  const { data: jobs, isLoading } = useQuery({
    queryKey: ['/api/jobs', searchQuery, statusFilter],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      
      if (searchQuery) queryParams.append('search', searchQuery);
      if (statusFilter !== "all") queryParams.append('status', statusFilter);
      
      const res = await fetch(`/api/jobs?${queryParams.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch jobs');
      return res.json();
    }
  });

  // Function to calculate total job price
  const calculateJobTotal = (services: Job['services']) => {
    return services.reduce((total, service) => total + (service.price * service.quantity), 0);
  };

  // Function to get human-readable status
  const getStatusText = (status: string) => {
    switch (status) {
      case "in_progress":
        return "In Progress";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold">Jobs</h1>
        <div className="mt-3 md:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Search jobs..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Dialog open={isAddJobOpen} onOpenChange={setIsAddJobOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center">
                <Plus className="h-4 w-4 mr-1" />
                New Job
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Schedule New Job</DialogTitle>
              </DialogHeader>
              <JobForm
                onSuccess={() => setIsAddJobOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="all" value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Jobs</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
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
                    <TableHead>Customer</TableHead>
                    <TableHead>Service Details</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs && jobs.length > 0 ? (
                    jobs.map((job: Job) => (
                      <TableRow key={job.id}>
                        <TableCell>
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold mr-3">
                              {job.customer.fullName.charAt(0)}
                            </div>
                            <div>
                              <div className="font-semibold">{job.customer.fullName}</div>
                              <div className="flex items-center text-sm text-slate-500">
                                <Phone className="h-3 w-3 mr-1" />
                                {job.customer.phoneNumber}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{job.vehicle.make} {job.vehicle.model}</div>
                          <div className="text-sm text-slate-500">
                            {job.services.map(s => s.serviceName).join(", ")}
                          </div>
                          <div className="flex items-center text-xs text-slate-500 mt-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            {job.city}, {job.state}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{formatDate(job.scheduledStartTime)}</div>
                          <div className="text-sm text-slate-500">
                            {formatTime(job.scheduledStartTime)} - {formatTime(job.scheduledEndTime)}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            {job.technician ? `Technician: ${job.technician.fullName}` : "No technician assigned"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(job.status).backgroundColor} ${getStatusColor(job.status).textColor}`}>
                            {getStatusText(job.status)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            ${calculateJobTotal(job.services).toFixed(2)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/jobs/${job.id}`}>
                            <Button variant="outline" size="sm" className="flex items-center">
                              <Eye className="h-3.5 w-3.5 mr-1" />
                              View
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10">
                        <div className="flex flex-col items-center justify-center text-slate-500">
                          <Calendar className="h-12 w-12 mb-2 text-slate-300" />
                          <p>No jobs found</p>
                          {searchQuery && (
                            <p className="text-sm">Try adjusting your search</p>
                          )}
                          <Button 
                            className="mt-4"
                            onClick={() => setIsAddJobOpen(true)}
                          >
                            Schedule a new job
                          </Button>
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
