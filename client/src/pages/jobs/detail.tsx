import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { formatDate, formatTime, formatCurrency, getStatusColor } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { JobForm } from "@/components/jobs/job-form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { ChevronLeft, Edit, Calendar, MapPin, Phone, Mail, Car, User, Clipboard, Clock, DollarSign, FileText, Check, X } from "lucide-react";

interface JobDetailProps {
  id: number;
}

export default function JobDetail({ id }: JobDetailProps) {
  const [_, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isEditJobOpen, setIsEditJobOpen] = useState(false);
  
  // Fetch job details
  const { data: job, isLoading } = useQuery({
    queryKey: [`/api/jobs/${id}`],
    queryFn: async () => {
      const res = await fetch(`/api/jobs/${id}`);
      if (!res.ok) throw new Error('Failed to fetch job details');
      return res.json();
    }
  });

  // Update job status mutation
  const updateJobStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      return apiRequest('PUT', `/api/jobs/${id}`, { status });
    },
    onSuccess: () => {
      toast({
        title: "Job status updated",
        description: "The job status has been successfully updated."
      });
      queryClient.invalidateQueries({ queryKey: [`/api/jobs/${id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update job status. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Cancel job mutation
  const cancelJobMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('PUT', `/api/jobs/${id}`, { status: 'cancelled' });
    },
    onSuccess: () => {
      toast({
        title: "Job cancelled",
        description: "The job has been successfully cancelled."
      });
      queryClient.invalidateQueries({ queryKey: [`/api/jobs/${id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to cancel job. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Complete job mutation
  const completeJobMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('PUT', `/api/jobs/${id}`, { 
        status: 'completed',
        actualEndTime: new Date().toISOString()
      });
    },
    onSuccess: () => {
      toast({
        title: "Job completed",
        description: "The job has been marked as completed."
      });
      queryClient.invalidateQueries({ queryKey: [`/api/jobs/${id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to complete job. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Start job mutation
  const startJobMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('PUT', `/api/jobs/${id}`, { 
        status: 'in_progress',
        actualStartTime: new Date().toISOString()
      });
    },
    onSuccess: () => {
      toast({
        title: "Job started",
        description: "The job has been marked as in progress."
      });
      queryClient.invalidateQueries({ queryKey: [`/api/jobs/${id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to start job. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleStartJob = () => {
    if (window.confirm("Are you sure you want to start this job?")) {
      startJobMutation.mutate();
    }
  };

  const handleCompleteJob = () => {
    if (window.confirm("Are you sure you want to mark this job as completed?")) {
      completeJobMutation.mutate();
    }
  };

  const handleCancelJob = () => {
    if (window.confirm("Are you sure you want to cancel this job? This action cannot be undone.")) {
      cancelJobMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-10">
        <div className="text-3xl mb-4">😕</div>
        <h2 className="text-2xl font-bold mb-2">Job Not Found</h2>
        <p className="mb-4">The job you're looking for doesn't exist or has been removed.</p>
        <Link href="/jobs">
          <Button>Go Back to Jobs</Button>
        </Link>
      </div>
    );
  }

  // Calculate job total
  const calculateTotal = () => {
    return job.services.reduce((total, service) => total + (service.price * service.quantity), 0);
  };

  // Format status for display
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
        <div className="flex items-center">
          <Link href="/jobs">
            <a className="mr-2 text-slate-500 hover:text-slate-700">
              <ChevronLeft className="h-5 w-5" />
            </a>
          </Link>
          <h1 className="text-2xl font-bold">Job Details</h1>
        </div>
        <div className="mt-3 md:mt-0 flex items-center space-x-2">
          <Dialog open={isEditJobOpen} onOpenChange={setIsEditJobOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center">
                <Edit className="h-4 w-4 mr-1" />
                Edit Job
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Edit Job</DialogTitle>
              </DialogHeader>
              <JobForm
                job={job}
                onSuccess={() => {
                  setIsEditJobOpen(false);
                  queryClient.invalidateQueries({ queryKey: [`/api/jobs/${id}`] });
                }}
              />
            </DialogContent>
          </Dialog>
          
          {job.status === 'scheduled' && (
            <Button onClick={handleStartJob} className="flex items-center">
              <Check className="h-4 w-4 mr-1" />
              Start Job
            </Button>
          )}
          
          {job.status === 'in_progress' && (
            <Button onClick={handleCompleteJob} className="flex items-center">
              <Check className="h-4 w-4 mr-1" />
              Complete Job
            </Button>
          )}
          
          {(job.status === 'scheduled' || job.status === 'in_progress') && (
            <Button variant="destructive" onClick={handleCancelJob} className="flex items-center">
              <X className="h-4 w-4 mr-1" />
              Cancel Job
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">Job Information</CardTitle>
                  <CardDescription>
                    ID: #{job.id} • Created {formatDate(job.createdAt)}
                  </CardDescription>
                </div>
                <Badge className={`${getStatusColor(job.status).backgroundColor} ${getStatusColor(job.status).textColor}`}>
                  {getStatusText(job.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium flex items-center mb-2">
                    <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                    Appointment Details
                  </h3>
                  <div className="text-sm space-y-1.5">
                    <div>
                      <span className="text-slate-500">Date:</span> {formatDate(job.scheduledStartTime)}
                    </div>
                    <div>
                      <span className="text-slate-500">Time:</span> {formatTime(job.scheduledStartTime)} - {formatTime(job.scheduledEndTime)}
                    </div>
                    <div>
                      <span className="text-slate-500">Technician:</span> {job.technician ? job.technician.fullName : "Unassigned"}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium flex items-center mb-2">
                    <MapPin className="h-4 w-4 mr-2 text-slate-400" />
                    Service Location
                  </h3>
                  <div className="text-sm space-y-1.5">
                    <div>{job.address}</div>
                    <div>{job.city}, {job.state} {job.zipCode}</div>
                    <Button variant="link" className="p-0 h-auto text-sm">
                      Open in Maps
                    </Button>
                  </div>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div>
                <h3 className="font-medium flex items-center mb-3">
                  <Clipboard className="h-4 w-4 mr-2 text-slate-400" />
                  Service Details
                </h3>
                <div className="border rounded-md">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Service</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Qty</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Price</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {job.services.map((service, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm text-slate-900">{service.serviceName}</td>
                          <td className="px-4 py-3 text-sm text-slate-900 text-right">{service.quantity}</td>
                          <td className="px-4 py-3 text-sm text-slate-900 text-right">{formatCurrency(service.price)}</td>
                          <td className="px-4 py-3 text-sm text-slate-900 text-right">{formatCurrency(service.price * service.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={3} className="px-4 py-3 text-sm font-medium text-right">Total</td>
                        <td className="px-4 py-3 text-sm font-bold text-right">{formatCurrency(calculateTotal())}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
              
              {job.notes && (
                <>
                  <Separator className="my-6" />
                  <div>
                    <h3 className="font-medium flex items-center mb-2">
                      <FileText className="h-4 w-4 mr-2 text-slate-400" />
                      Job Notes
                    </h3>
                    <div className="p-3 bg-slate-50 rounded-md text-sm">
                      {job.notes}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          
          {/* Additional sections could go here (e.g., job activity timeline, etc.) */}
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold mr-3">
                  {job.customer.fullName.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold">{job.customer.fullName}</div>
                  <Link href={`/customers/${job.customer.id}`}>
                    <a className="text-xs text-primary hover:underline">View customer profile</a>
                  </Link>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <Phone className="h-4 w-4 mr-2 text-slate-400" />
                  {job.customer.phoneNumber}
                </div>
                {job.customer.email && (
                  <div className="flex items-center text-sm">
                    <Mail className="h-4 w-4 mr-2 text-slate-400" />
                    {job.customer.email}
                  </div>
                )}
              </div>
              
              <Separator className="my-4" />
              
              <h3 className="font-medium flex items-center mb-3">
                <Car className="h-4 w-4 mr-2 text-slate-400" />
                Vehicle Information
              </h3>
              
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-slate-500">Make/Model:</span> {job.vehicle.make} {job.vehicle.model}
                </div>
                {job.vehicle.year && (
                  <div>
                    <span className="text-slate-500">Year:</span> {job.vehicle.year}
                  </div>
                )}
                {job.vehicle.color && (
                  <div>
                    <span className="text-slate-500">Color:</span> {job.vehicle.color}
                  </div>
                )}
                {job.vehicle.licensePlate && (
                  <div>
                    <span className="text-slate-500">License Plate:</span> {job.vehicle.licensePlate}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Total Amount:</span>
                  <span className="font-bold">{formatCurrency(calculateTotal())}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Status:</span>
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
                    Pending
                  </Badge>
                </div>
                
                <Button 
                  className="w-full flex items-center justify-center"
                  disabled={job.status !== "completed"}
                >
                  <DollarSign className="h-4 w-4 mr-1" />
                  Create Invoice
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Activity Buttons */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Phone className="h-4 w-4 mr-2" />
                Call Customer
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <MapPin className="h-4 w-4 mr-2" />
                Get Directions
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                Reschedule Job
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
