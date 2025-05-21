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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays, subDays, parseISO } from "date-fns";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { 
  formatDate, 
  formatCurrency,
  getDurationBetweenDates
} from "@/lib/utils";
import { 
  Download, 
  FileText, 
  Plus, 
  Clock, 
  Search, 
  Edit,
  Calendar,
  Percent,
  DollarSign,
  CalendarClock,
  BarChart3,
  Info
} from "lucide-react";

// Mock data for employees
const mockEmployees = [
  {
    id: 1,
    fullName: "John Smith",
    role: "Detailer",
    payType: "hourly",
    hourlyRate: 25.00,
    commissionRate: 10
  },
  {
    id: 2,
    fullName: "Jane Doe",
    role: "Senior Detailer",
    payType: "commission",
    hourlyRate: 18.00,
    commissionRate: 25
  },
  {
    id: 3,
    fullName: "Mike Johnson",
    role: "Manager",
    payType: "both",
    hourlyRate: 30.00,
    commissionRate: 5
  }
];

// Mock data for timesheet entries
const mockTimeEntries = [
  {
    id: 1,
    employeeId: 1,
    date: '2025-05-15',
    clockIn: '08:00',
    clockOut: '16:30',
    jobIds: [101, 102],
    approved: true,
    notes: "Completed 2 full details"
  },
  {
    id: 2,
    employeeId: 1,
    date: '2025-05-16',
    clockIn: '08:30',
    clockOut: '15:45',
    jobIds: [103],
    approved: true,
    notes: ""
  },
  {
    id: 3,
    employeeId: 2,
    date: '2025-05-15',
    clockIn: '09:00',
    clockOut: '17:00',
    jobIds: [104, 105, 106],
    approved: true,
    notes: "3 premium details completed"
  },
  {
    id: 4,
    employeeId: 3,
    date: '2025-05-16',
    clockIn: '08:00',
    clockOut: '17:00',
    jobIds: [107],
    approved: false,
    notes: "Needs approval"
  }
];

// Mock data for jobs/services completed by employees
const mockJobServices = [
  {
    jobId: 101,
    employeeId: 1,
    date: '2025-05-15',
    services: [
      { name: "Full Detail", price: 250.00 },
      { name: "Headlight Restoration", price: 120.00 }
    ]
  },
  {
    jobId: 102,
    employeeId: 1,
    date: '2025-05-15',
    services: [
      { name: "Wash & Wax", price: 100.00 }
    ]
  },
  {
    jobId: 103,
    employeeId: 1,
    date: '2025-05-16',
    services: [
      { name: "Full Detail", price: 250.00 },
      { name: "Clay Bar Treatment", price: 80.00 }
    ]
  },
  {
    jobId: 104,
    employeeId: 2,
    date: '2025-05-15',
    services: [
      { name: "Premium Detail", price: 350.00 }
    ]
  },
  {
    jobId: 105,
    employeeId: 2,
    date: '2025-05-15',
    services: [
      { name: "Premium Detail", price: 350.00 },
      { name: "Paint Correction", price: 300.00 }
    ]
  },
  {
    jobId: 106,
    employeeId: 2,
    date: '2025-05-15',
    services: [
      { name: "Premium Detail", price: 350.00 }
    ]
  },
  {
    jobId: 107,
    employeeId: 3,
    date: '2025-05-16',
    services: [
      { name: "Ceramic Coating", price: 1200.00 }
    ]
  }
];

// Form schema for timesheet entries
const timesheetFormSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  date: z.date(),
  clockIn: z.string().min(1, "Clock-in time is required"),
  clockOut: z.string().min(1, "Clock-out time is required"),
  jobIds: z.array(z.string()).optional(),
  notes: z.string().optional()
});

// Form schema for pay rate adjustments
const payRateFormSchema = z.object({
  hourlyRate: z.string().optional(),
  commissionRate: z.string().optional(),
  payType: z.enum(["hourly", "commission", "both"]),
  effectiveDate: z.date()
});

export default function Payroll() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [timePeriod, setTimePeriod] = useState("week");
  const [dateRange, setDateRange] = useState({
    from: startOfWeek(new Date(), { weekStartsOn: 1 }),
    to: endOfWeek(new Date(), { weekStartsOn: 1 })
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [isTimesheetDialogOpen, setIsTimesheetDialogOpen] = useState(false);
  const [isPayRateDialogOpen, setIsPayRateDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  
  // Update date range based on time period selection
  useEffect(() => {
    const today = new Date();
    if (timePeriod === "week") {
      setDateRange({
        from: startOfWeek(today, { weekStartsOn: 1 }),
        to: endOfWeek(today, { weekStartsOn: 1 })
      });
    } else if (timePeriod === "biweekly") {
      const twoWeeksAgo = subDays(today, 14);
      setDateRange({
        from: startOfWeek(twoWeeksAgo, { weekStartsOn: 1 }),
        to: endOfWeek(today, { weekStartsOn: 1 })
      });
    } else if (timePeriod === "month") {
      setDateRange({
        from: startOfMonth(today),
        to: endOfMonth(today)
      });
    }
  }, [timePeriod]);

  // In a real app, we would fetch from API
  // const { data: employees, isLoading: isLoadingEmployees } = useQuery({
  //   queryKey: ['/api/employees'],
  // });

  // const { data: timeEntries, isLoading: isLoadingTimeEntries } = useQuery({
  //   queryKey: ['/api/timeEntries', dateRange.from, dateRange.to],
  // });
  
  // const { data: jobServices, isLoading: isLoadingJobServices } = useQuery({
  //   queryKey: ['/api/jobServices', dateRange.from, dateRange.to],
  // });
  
  // Using mock data for now
  const employees = mockEmployees;
  const isLoadingEmployees = false;
  
  // Filter time entries based on date range
  const timeEntries = mockTimeEntries.filter(entry => {
    const entryDate = parseISO(entry.date);
    return entryDate >= dateRange.from && entryDate <= dateRange.to;
  });
  const isLoadingTimeEntries = false;
  
  // Filter job services based on date range
  const jobServices = mockJobServices.filter(job => {
    const jobDate = parseISO(job.date);
    return jobDate >= dateRange.from && jobDate <= dateRange.to;
  });
  const isLoadingJobServices = false;

  // Form setup for timesheet entry
  const timesheetForm = useForm<z.infer<typeof timesheetFormSchema>>({
    resolver: zodResolver(timesheetFormSchema),
    defaultValues: {
      employeeId: "",
      date: new Date(),
      clockIn: "",
      clockOut: "",
      jobIds: [],
      notes: ""
    }
  });

  // Form setup for pay rate adjustments
  const payRateForm = useForm<z.infer<typeof payRateFormSchema>>({
    resolver: zodResolver(payRateFormSchema),
    defaultValues: {
      hourlyRate: "",
      commissionRate: "",
      payType: "hourly",
      effectiveDate: new Date()
    }
  });

  // Handle timesheet entry submission
  const onSubmitTimesheet = (data: z.infer<typeof timesheetFormSchema>) => {
    // In a real app, you would call an API mutation here
    // createTimesheetMutation.mutate(data);
    
    toast({
      title: "Timesheet Entry Added",
      description: `Entry for ${format(data.date, 'MMM d, yyyy')} has been added.`,
    });
    
    setIsTimesheetDialogOpen(false);
    timesheetForm.reset();
  };

  // Handle pay rate adjustment submission
  const onSubmitPayRate = (data: z.infer<typeof payRateFormSchema>) => {
    if (!selectedEmployee) return;
    
    // In a real app, you would call an API mutation here
    // updatePayRateMutation.mutate({
    //   employeeId: selectedEmployee.id,
    //   ...data
    // });
    
    toast({
      title: "Pay Rate Updated",
      description: `${selectedEmployee.fullName}'s pay rate has been updated.`,
    });
    
    setIsPayRateDialogOpen(false);
    payRateForm.reset();
  };

  // Open pay rate dialog for an employee
  const handleOpenPayRateDialog = (employee: any) => {
    setSelectedEmployee(employee);
    payRateForm.reset({
      hourlyRate: employee.hourlyRate.toString(),
      commissionRate: employee.commissionRate.toString(),
      payType: employee.payType,
      effectiveDate: new Date()
    });
    setIsPayRateDialogOpen(true);
  };

  // Calculate hours worked for a time entry
  const calculateHoursWorked = (clockIn: string, clockOut: string) => {
    const [inHours, inMinutes] = clockIn.split(':').map(Number);
    const [outHours, outMinutes] = clockOut.split(':').map(Number);
    
    const inTime = inHours + (inMinutes / 60);
    const outTime = outHours + (outMinutes / 60);
    
    return outTime - inTime;
  };

  // Get time entries for a specific employee
  const getEmployeeTimeEntries = (employeeId: number) => {
    return timeEntries.filter(entry => entry.employeeId === employeeId);
  };

  // Get job services for a specific employee
  const getEmployeeJobServices = (employeeId: number) => {
    return jobServices.filter(job => job.employeeId === employeeId);
  };

  // Calculate total hours worked for an employee within the date range
  const calculateTotalHours = (employeeId: number) => {
    const entries = getEmployeeTimeEntries(employeeId);
    let totalHours = 0;
    
    entries.forEach(entry => {
      totalHours += calculateHoursWorked(entry.clockIn, entry.clockOut);
    });
    
    return totalHours;
  };

  // Calculate total service revenue for an employee within the date range
  const calculateTotalRevenue = (employeeId: number) => {
    const services = getEmployeeJobServices(employeeId);
    let totalRevenue = 0;
    
    services.forEach(job => {
      job.services.forEach(service => {
        totalRevenue += service.price;
      });
    });
    
    return totalRevenue;
  };

  // Calculate pay for an employee based on their pay type, hours, and revenue
  const calculateEmployeePay = (employee: any) => {
    const hours = calculateTotalHours(employee.id);
    const revenue = calculateTotalRevenue(employee.id);
    
    let hourlyPay = 0;
    let commissionPay = 0;
    
    if (employee.payType === "hourly" || employee.payType === "both") {
      hourlyPay = hours * employee.hourlyRate;
    }
    
    if (employee.payType === "commission" || employee.payType === "both") {
      commissionPay = revenue * (employee.commissionRate / 100);
    }
    
    return {
      hours,
      revenue,
      hourlyPay,
      commissionPay,
      totalPay: hourlyPay + commissionPay
    };
  };

  // Generate payroll summary for all employees
  const generatePayrollSummary = () => {
    return employees.map(employee => {
      const payData = calculateEmployeePay(employee);
      
      return {
        employee,
        ...payData
      };
    });
  };

  // Filter employees based on search query
  const filteredEmployees = employees ? employees.filter(emp => 
    emp.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.role.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  // Calculate payroll summary
  const payrollSummary = generatePayrollSummary();
  
  // Calculate totals for all employees
  const totalHours = payrollSummary.reduce((sum, item) => sum + item.hours, 0);
  const totalRevenue = payrollSummary.reduce((sum, item) => sum + item.revenue, 0);
  const totalPayroll = payrollSummary.reduce((sum, item) => sum + item.totalPay, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Payroll Management</h1>
        
        <div className="mt-3 sm:mt-0 flex flex-col sm:flex-row gap-2">
          <Select value={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Current Week</SelectItem>
              <SelectItem value="biweekly">Bi-Weekly</SelectItem>
              <SelectItem value="month">Current Month</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          
          {timePeriod === "custom" && (
            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
            />
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Total Hours</CardTitle>
            <CardDescription>For current period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-muted-foreground mr-2" />
              <span className="text-2xl font-bold">{totalHours.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Total Revenue</CardTitle>
            <CardDescription>Services performed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-muted-foreground mr-2" />
              <span className="text-2xl font-bold">{formatCurrency(totalRevenue)}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Total Payroll</CardTitle>
            <CardDescription>Wages and commissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <BarChart3 className="h-5 w-5 text-muted-foreground mr-2" />
              <span className="text-2xl font-bold">{formatCurrency(totalPayroll)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full md:w-auto grid-cols-3 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timesheets">Timesheets</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:justify-between sm:items-center pb-2">
              <div>
                <CardTitle>Payroll Summary</CardTitle>
                <CardDescription>
                  {format(dateRange.from, 'MMM d, yyyy')} - {format(dateRange.to, 'MMM d, yyyy')}
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                className="mt-2 sm:mt-0"
                onClick={() => {
                  toast({
                    title: "Report Downloaded",
                    description: "Payroll report has been downloaded as a CSV file.",
                  });
                }}
              >
                <Download className="mr-2 h-4 w-4" />
                Export Report
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Pay Type</TableHead>
                      <TableHead>Hours</TableHead>
                      <TableHead>Service Revenue</TableHead>
                      <TableHead>Hourly Pay</TableHead>
                      <TableHead>Commission</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingEmployees || isLoadingTimeEntries || isLoadingJobServices ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          <div className="flex justify-center">
                            <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full"></div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : payrollSummary.length > 0 ? (
                      payrollSummary.map((item) => (
                        <TableRow key={item.employee.id}>
                          <TableCell className="font-medium">{item.employee.fullName}</TableCell>
                          <TableCell>
                            <span className="capitalize">{item.employee.payType}</span>
                          </TableCell>
                          <TableCell>{item.hours.toFixed(2)}</TableCell>
                          <TableCell>{formatCurrency(item.revenue)}</TableCell>
                          <TableCell>{formatCurrency(item.hourlyPay)}</TableCell>
                          <TableCell>{formatCurrency(item.commissionPay)}</TableCell>
                          <TableCell className="text-right font-bold">
                            {formatCurrency(item.totalPay)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No payroll data for the selected period
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="timesheets">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:justify-between sm:items-center pb-2">
              <div>
                <CardTitle>Employee Timesheets</CardTitle>
                <CardDescription>
                  {format(dateRange.from, 'MMM d, yyyy')} - {format(dateRange.to, 'MMM d, yyyy')}
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 mt-2 sm:mt-0">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search employees..."
                    className="pl-8 w-full sm:w-[200px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <Dialog open={isTimesheetDialogOpen} onOpenChange={setIsTimesheetDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Time Entry
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Timesheet Entry</DialogTitle>
                      <DialogDescription>
                        Record work hours and associate with jobs.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <Form {...timesheetForm}>
                      <form onSubmit={timesheetForm.handleSubmit(onSubmitTimesheet)} className="space-y-4">
                        <FormField
                          control={timesheetForm.control}
                          name="employeeId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Employee</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select employee" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {employees.map((employee) => (
                                    <SelectItem key={employee.id} value={employee.id.toString()}>
                                      {employee.fullName}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <FormField
                            control={timesheetForm.control}
                            name="date"
                            render={({ field }) => (
                              <FormItem className="sm:col-span-1">
                                <FormLabel>Date</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="date" 
                                    value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
                                    onChange={(e) => field.onChange(new Date(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={timesheetForm.control}
                            name="clockIn"
                            render={({ field }) => (
                              <FormItem className="sm:col-span-1">
                                <FormLabel>Clock In</FormLabel>
                                <FormControl>
                                  <Input type="time" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={timesheetForm.control}
                            name="clockOut"
                            render={({ field }) => (
                              <FormItem className="sm:col-span-1">
                                <FormLabel>Clock Out</FormLabel>
                                <FormControl>
                                  <Input type="time" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={timesheetForm.control}
                          name="notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Notes</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Add any notes about this time entry"
                                  className="resize-none"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <DialogFooter>
                          <Button type="submit">Save Entry</Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Clock In</TableHead>
                      <TableHead>Clock Out</TableHead>
                      <TableHead>Hours</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingTimeEntries ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">
                          <div className="flex justify-center">
                            <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full"></div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : timeEntries.length > 0 ? (
                      timeEntries
                        .filter(entry => {
                          // Filter by search query if set
                          if (!searchQuery) return true;
                          
                          const employee = employees.find(e => e.id === entry.employeeId);
                          return employee?.fullName.toLowerCase().includes(searchQuery.toLowerCase());
                        })
                        .map((entry) => {
                          const employee = employees.find(e => e.id === entry.employeeId);
                          const hours = calculateHoursWorked(entry.clockIn, entry.clockOut);
                          
                          return (
                            <TableRow key={entry.id}>
                              <TableCell className="font-medium">
                                {employee?.fullName || "Unknown"}
                              </TableCell>
                              <TableCell>{format(parseISO(entry.date), 'MMM d, yyyy')}</TableCell>
                              <TableCell>{entry.clockIn}</TableCell>
                              <TableCell>{entry.clockOut}</TableCell>
                              <TableCell>{hours.toFixed(2)}</TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  entry.approved 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {entry.approved ? 'Approved' : 'Pending'}
                                </span>
                              </TableCell>
                              <TableCell className="truncate max-w-[150px]">
                                {entry.notes || "—"}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="icon">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">
                          No timesheet entries for the selected period
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Settings</CardTitle>
              <CardDescription>
                Configure employee pay rates and payment methods.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Pay Type</TableHead>
                      <TableHead>Hourly Rate</TableHead>
                      <TableHead>Commission Rate</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingEmployees ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          <div className="flex justify-center">
                            <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full"></div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredEmployees.length > 0 ? (
                      filteredEmployees.map((employee) => (
                        <TableRow key={employee.id}>
                          <TableCell className="font-medium">{employee.fullName}</TableCell>
                          <TableCell>{employee.role}</TableCell>
                          <TableCell>
                            <span className="capitalize">{employee.payType}</span>
                          </TableCell>
                          <TableCell>
                            {employee.payType !== "commission" ? formatCurrency(employee.hourlyRate) : "—"}
                          </TableCell>
                          <TableCell>
                            {employee.payType !== "hourly" ? `${employee.commissionRate}%` : "—"}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              onClick={() => handleOpenPayRateDialog(employee)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Rates
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          No employees found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              
              <div className="bg-slate-50 rounded-md p-4 flex items-start">
                <Info className="h-5 w-5 text-slate-500 mr-3 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium mb-1">About Pay Types</h4>
                  <p className="text-sm text-slate-600">
                    <strong>Hourly:</strong> Employees are paid based on hours worked.<br />
                    <strong>Commission:</strong> Employees earn a percentage of the service revenue.<br />
                    <strong>Both:</strong> Employees receive both hourly pay and commission.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Pay rate adjustment dialog */}
          <Dialog open={isPayRateDialogOpen} onOpenChange={setIsPayRateDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {selectedEmployee ? `Edit Pay Rates for ${selectedEmployee.fullName}` : 'Edit Pay Rates'}
                </DialogTitle>
                <DialogDescription>
                  Update the employee's pay structure and rates.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...payRateForm}>
                <form onSubmit={payRateForm.handleSubmit(onSubmitPayRate)} className="space-y-4">
                  <FormField
                    control={payRateForm.control}
                    name="payType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pay Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select pay type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="hourly">Hourly Only</SelectItem>
                            <SelectItem value="commission">Commission Only</SelectItem>
                            <SelectItem value="both">Hourly + Commission</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          The pay structure for this employee.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {(payRateForm.watch("payType") === "hourly" || payRateForm.watch("payType") === "both") && (
                    <FormField
                      control={payRateForm.control}
                      name="hourlyRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hourly Rate</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input className="pl-8" placeholder="0.00" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  {(payRateForm.watch("payType") === "commission" || payRateForm.watch("payType") === "both") && (
                    <FormField
                      control={payRateForm.control}
                      name="commissionRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Commission Rate</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Percent className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input className="pl-8" placeholder="0" {...field} />
                            </div>
                          </FormControl>
                          <FormDescription>
                            Percentage of service revenue
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  <FormField
                    control={payRateForm.control}
                    name="effectiveDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Effective Date</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
                            onChange={(e) => field.onChange(new Date(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          When these rate changes take effect
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button type="submit">Save Changes</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
}