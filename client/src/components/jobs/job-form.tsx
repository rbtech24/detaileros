import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { addMinutes, format, parseISO } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, Plus, Trash, Clock } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { generateTimeSlots, formatCurrency, cn } from "@/lib/utils";

// Define job schema based on the API schema
const jobFormSchema = z.object({
  customerId: z.coerce.number().min(1, "Customer is required"),
  vehicleId: z.coerce.number().min(1, "Vehicle is required"),
  technicianId: z.coerce.number().optional(),
  scheduledStartTime: z.date(),
  scheduledEndTime: z.date(),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "Zip code is required"),
  status: z.string().default("scheduled"),
  notes: z.string().optional(),
  services: z.array(
    z.object({
      serviceId: z.coerce.number(),
      quantity: z.coerce.number().min(1),
    })
  ).min(1, "At least one service must be selected"),
});

type JobFormValues = z.infer<typeof jobFormSchema>;

interface JobFormProps {
  job?: any; // Using any to match existing data structure
  initialDate?: Date;
  onSuccess?: () => void;
}

export function JobForm({ job, initialDate, onSuccess }: JobFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<number | null>(
    job?.customerId || null
  );
  const [selectedDate, setSelectedDate] = useState<Date>(
    job?.scheduledStartTime ? new Date(job.scheduledStartTime) : initialDate || new Date()
  );
  const [selectedStartTime, setSelectedStartTime] = useState<string>(
    job?.scheduledStartTime
      ? format(new Date(job.scheduledStartTime), "HH:mm")
      : "09:00"
  );
  const [selectedServices, setSelectedServices] = useState<Array<{ serviceId: number; quantity: number }>>(
    job?.services?.map((s: any) => ({ serviceId: s.serviceId, quantity: s.quantity })) || []
  );
  
  // Generate time slots for selection
  const timeSlots = generateTimeSlots(8, 18, 30);

  // Set default values based on existing job or empty values
  const defaultValues: Partial<JobFormValues> = {
    customerId: job?.customerId || "",
    vehicleId: job?.vehicleId || "",
    technicianId: job?.technicianId || "",
    scheduledStartTime: job?.scheduledStartTime ? new Date(job.scheduledStartTime) : initialDate || new Date(),
    scheduledEndTime: job?.scheduledEndTime ? new Date(job.scheduledEndTime) : addMinutes(initialDate || new Date(), 120),
    address: job?.address || "",
    city: job?.city || "",
    state: job?.state || "",
    zipCode: job?.zipCode || "",
    status: job?.status || "scheduled",
    notes: job?.notes || "",
    services: job?.services?.map((s: any) => ({ serviceId: s.serviceId, quantity: s.quantity })) || [],
  };

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues,
  });

  // Fetch customers
  const { data: customers, isLoading: isLoadingCustomers } = useQuery({
    queryKey: ['/api/customers'],
    queryFn: async () => {
      const res = await fetch(`/api/customers?pageSize=100`);
      if (!res.ok) throw new Error('Failed to fetch customers');
      return res.json();
    }
  });

  // Fetch vehicles for selected customer
  const { data: vehicles, isLoading: isLoadingVehicles } = useQuery({
    queryKey: ['/api/customers', selectedCustomer, 'vehicles'],
    queryFn: async () => {
      if (!selectedCustomer) return [];
      const res = await fetch(`/api/customers/${selectedCustomer}/vehicles`);
      if (!res.ok) throw new Error('Failed to fetch vehicles');
      return res.json();
    },
    enabled: !!selectedCustomer
  });

  // Fetch technicians
  const { data: technicians, isLoading: isLoadingTechnicians } = useQuery({
    queryKey: ['/api/users'],
    queryFn: async () => {
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error('Failed to fetch technicians');
      return res.json().then(users => users.filter((user: any) => user.role === 'technician' || user.role === 'admin'));
    }
  });

  // Fetch services
  const { data: services, isLoading: isLoadingServices } = useQuery({
    queryKey: ['/api/services'],
    queryFn: async () => {
      const res = await fetch('/api/services');
      if (!res.ok) throw new Error('Failed to fetch services');
      return res.json();
    }
  });

  // Handle customer selection change
  const handleCustomerChange = (customerId: string) => {
    setSelectedCustomer(parseInt(customerId));
    form.setValue('customerId', parseInt(customerId));
    form.setValue('vehicleId', ''); // Reset vehicle when customer changes
    
    // If we have the customer data, auto-fill address
    const customer = customers?.customers?.find((c: any) => c.id === parseInt(customerId));
    if (customer) {
      form.setValue('address', customer.address || '');
      form.setValue('city', customer.city || '');
      form.setValue('state', customer.state || '');
      form.setValue('zipCode', customer.zipCode || '');
    }
  };

  // Handle date change
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      
      // Create new date objects with the selected date but keep the time
      const startDateTime = new Date(date);
      const [hours, minutes] = selectedStartTime.split(':').map(Number);
      startDateTime.setHours(hours, minutes, 0, 0);
      
      form.setValue('scheduledStartTime', startDateTime);
      
      // Calculate end time based on selected services duration
      const totalDuration = selectedServices.reduce((total, item) => {
        const service = services?.find((s: any) => s.id === item.serviceId);
        return total + (service?.duration || 60) * item.quantity;
      }, 0);
      
      const endDateTime = addMinutes(startDateTime, totalDuration || 120);
      form.setValue('scheduledEndTime', endDateTime);
    }
  };

  // Handle time change
  const handleTimeChange = (time: string) => {
    setSelectedStartTime(time);
    
    // Create new date object with the selected time
    const startDateTime = new Date(selectedDate);
    const [hours, minutes] = time.split(':').map(Number);
    startDateTime.setHours(hours, minutes, 0, 0);
    
    form.setValue('scheduledStartTime', startDateTime);
    
    // Calculate end time based on selected services duration
    const totalDuration = selectedServices.reduce((total, item) => {
      const service = services?.find((s: any) => s.id === item.serviceId);
      return total + (service?.duration || 60) * item.quantity;
    }, 0);
    
    const endDateTime = addMinutes(startDateTime, totalDuration || 120);
    form.setValue('scheduledEndTime', endDateTime);
  };

  // Handle service selection
  const handleServiceChange = (serviceId: number, isChecked: boolean) => {
    let updatedServices = [...selectedServices];
    
    if (isChecked) {
      // Add service if not already in the list
      if (!updatedServices.some(s => s.serviceId === serviceId)) {
        updatedServices.push({ serviceId, quantity: 1 });
      }
    } else {
      // Remove service
      updatedServices = updatedServices.filter(s => s.serviceId !== serviceId);
    }
    
    setSelectedServices(updatedServices);
    form.setValue('services', updatedServices);
    
    // Update end time based on new services
    const startDateTime = form.getValues('scheduledStartTime');
    const totalDuration = updatedServices.reduce((total, item) => {
      const service = services?.find((s: any) => s.id === item.serviceId);
      return total + (service?.duration || 60) * item.quantity;
    }, 0);
    
    const endDateTime = addMinutes(startDateTime, totalDuration || 120);
    form.setValue('scheduledEndTime', endDateTime);
  };

  // Handle service quantity change
  const handleQuantityChange = (serviceId: number, quantity: number) => {
    const updatedServices = selectedServices.map(service => 
      service.serviceId === serviceId ? { ...service, quantity } : service
    );
    
    setSelectedServices(updatedServices);
    form.setValue('services', updatedServices);
    
    // Update end time based on new quantities
    const startDateTime = form.getValues('scheduledStartTime');
    const totalDuration = updatedServices.reduce((total, item) => {
      const service = services?.find((s: any) => s.id === item.serviceId);
      return total + (service?.duration || 60) * item.quantity;
    }, 0);
    
    const endDateTime = addMinutes(startDateTime, totalDuration || 120);
    form.setValue('scheduledEndTime', endDateTime);
  };

  const calculateTotalPrice = () => {
    if (!services) return 0;
    
    return selectedServices.reduce((total, item) => {
      const service = services.find((s: any) => s.id === item.serviceId);
      return total + (service?.price || 0) * item.quantity;
    }, 0);
  };

  // Save job mutation
  const saveMutation = useMutation({
    mutationFn: async (data: JobFormValues) => {
      if (job) {
        return apiRequest("PUT", `/api/jobs/${job.id}`, data);
      } else {
        return apiRequest("POST", "/api/jobs", data);
      }
    },
    onSuccess: () => {
      toast({
        title: job ? "Job updated" : "Job created",
        description: job
          ? "Job has been updated successfully"
          : "New job has been scheduled successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      console.error("Error saving job:", error);
      toast({
        title: "Error",
        description: "Failed to save job information. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: JobFormValues) => {
    setIsSubmitting(true);
    try {
      await saveMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Selection */}
            <FormField
              control={form.control}
              name="customerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer*</FormLabel>
                  <Select
                    value={field.value.toString()}
                    onValueChange={handleCustomerChange}
                    disabled={isLoadingCustomers}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a customer" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {customers?.customers?.map((customer: any) => (
                        <SelectItem
                          key={customer.id}
                          value={customer.id.toString()}
                        >
                          {customer.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Vehicle Selection */}
            <FormField
              control={form.control}
              name="vehicleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehicle*</FormLabel>
                  <Select
                    value={field.value.toString()}
                    onValueChange={(value) => form.setValue('vehicleId', parseInt(value))}
                    disabled={isLoadingVehicles || !selectedCustomer}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={selectedCustomer ? "Select a vehicle" : "Select a customer first"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {vehicles?.map((vehicle: any) => (
                        <SelectItem
                          key={vehicle.id}
                          value={vehicle.id.toString()}
                        >
                          {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.color && `(${vehicle.color})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date Selection */}
            <FormField
              control={form.control}
              name="scheduledStartTime"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date*</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={handleDateChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Time Selection */}
            <FormField
              control={form.control}
              name="scheduledStartTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Time*</FormLabel>
                  <Select
                    value={selectedStartTime}
                    onValueChange={handleTimeChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a time" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {format(
                            new Date().setHours(
                              parseInt(time.split(":")[0]),
                              parseInt(time.split(":")[1])
                            ),
                            "h:mm a"
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Technician Selection */}
          <FormField
            control={form.control}
            name="technicianId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Technician</FormLabel>
                <Select
                  value={field.value?.toString() || ""}
                  onValueChange={(value) => 
                    form.setValue('technicianId', value ? parseInt(value) : undefined)
                  }
                  disabled={isLoadingTechnicians}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Assign a technician (optional)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">Unassigned</SelectItem>
                    {technicians?.map((tech: any) => (
                      <SelectItem
                        key={tech.id}
                        value={tech.id.toString()}
                      >
                        {tech.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Address */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address*</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Main St" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* City */}
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City*</FormLabel>
                  <FormControl>
                    <Input placeholder="Anytown" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* State */}
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State*</FormLabel>
                  <FormControl>
                    <Input placeholder="CA" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Zip Code */}
            <FormField
              control={form.control}
              name="zipCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zip Code*</FormLabel>
                  <FormControl>
                    <Input placeholder="90210" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Services */}
          <div>
            <FormLabel className="block mb-2">Services*</FormLabel>
            <div className="border rounded-md p-4 space-y-4">
              {isLoadingServices ? (
                <div className="text-center py-4 text-sm text-slate-500">
                  Loading services...
                </div>
              ) : services?.length > 0 ? (
                <>
                  <div className="space-y-2">
                    {services.map((service: any) => (
                      <div key={service.id} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div className="flex items-center">
                          <Checkbox
                            id={`service-${service.id}`}
                            checked={selectedServices.some(s => s.serviceId === service.id)}
                            onCheckedChange={(checked) => 
                              handleServiceChange(service.id, checked as boolean)
                            }
                          />
                          <label
                            htmlFor={`service-${service.id}`}
                            className="ml-2 text-sm font-medium leading-none cursor-pointer"
                          >
                            {service.name} - {formatCurrency(service.price)}
                          </label>
                        </div>
                        
                        {selectedServices.some(s => s.serviceId === service.id) && (
                          <div className="flex items-center">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => {
                                const currentService = selectedServices.find(s => s.serviceId === service.id);
                                const currentQuantity = currentService?.quantity || 1;
                                if (currentQuantity > 1) {
                                  handleQuantityChange(service.id, currentQuantity - 1);
                                }
                              }}
                              disabled={selectedServices.find(s => s.serviceId === service.id)?.quantity === 1}
                            >
                              -
                            </Button>
                            <span className="mx-2 text-sm">
                              {selectedServices.find(s => s.serviceId === service.id)?.quantity || 1}
                            </span>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => {
                                const currentService = selectedServices.find(s => s.serviceId === service.id);
                                const currentQuantity = currentService?.quantity || 1;
                                handleQuantityChange(service.id, currentQuantity + 1);
                              }}
                            >
                              +
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {selectedServices.length > 0 && (
                    <div className="flex justify-between pt-2 border-t">
                      <span className="font-medium">Total:</span>
                      <span className="font-bold">{formatCurrency(calculateTotalPrice())}</span>
                    </div>
                  )}
                  
                  {form.formState.errors.services && (
                    <p className="text-sm font-medium text-destructive">
                      {form.formState.errors.services.message}
                    </p>
                  )}
                </>
              ) : (
                <div className="text-center py-4 text-sm text-slate-500">
                  No services available
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Any additional notes about this job..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Job Duration Summary */}
        <div className="bg-slate-50 p-4 rounded-md">
          <div className="flex items-center mb-2">
            <Clock className="h-4 w-4 mr-2 text-slate-500" />
            <h3 className="text-sm font-medium">Job Duration</h3>
          </div>
          <p className="text-sm text-slate-600">
            {form.getValues('scheduledStartTime') && form.getValues('scheduledEndTime') ? (
              <>
                {format(form.getValues('scheduledStartTime'), "h:mm a")} - {format(form.getValues('scheduledEndTime'), "h:mm a")} (
                {Math.round(
                  (form.getValues('scheduledEndTime').getTime() - form.getValues('scheduledStartTime').getTime()) / 60000
                )} minutes)
              </>
            ) : (
              "Select date, time, and services to calculate duration"
            )}
          </p>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            variant="outline"
            type="button"
            onClick={onSuccess}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Saving..."
              : job
              ? "Update Job"
              : "Schedule Job"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
