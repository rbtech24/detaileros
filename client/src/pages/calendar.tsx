import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { JobForm } from "@/components/jobs/job-form";
import { formatDate } from "@/lib/utils";
import { addDays, startOfDay, endOfDay, format, isSameDay, parseISO } from "date-fns";
import { CalendarIcon, ChevronLeft, ChevronRight, Plus } from "lucide-react";

interface Job {
  id: number;
  customerId: number;
  vehicleId: number;
  technicianId: number;
  scheduledStartTime: string;
  scheduledEndTime: string;
  status: string;
  customer: {
    fullName: string;
  };
  vehicle: {
    make: string;
    model: string;
  };
  services: Array<{
    serviceName: string;
  }>;
}

export default function Calendar() {
  const [date, setDate] = useState<Date>(new Date());
  const [view, setView] = useState<"day" | "week" | "month">("day");
  const [technicianFilter, setTechnicianFilter] = useState<string>("all");
  const [isNewJobDialogOpen, setIsNewJobDialogOpen] = useState(false);
  
  // Calculate start and end dates based on selected view
  const getDateRange = () => {
    const currentDate = startOfDay(date);
    
    if (view === "day") {
      return {
        start: currentDate,
        end: endOfDay(currentDate)
      };
    } else if (view === "week") {
      // Start from current day and include the next 6 days
      return {
        start: currentDate,
        end: endOfDay(addDays(currentDate, 6))
      };
    } else { // month
      // In a real app, this would calculate the correct month range
      // For simplicity, we'll just show 30 days from the current date
      return {
        start: currentDate,
        end: endOfDay(addDays(currentDate, 29))
      };
    }
  };
  
  const dateRange = getDateRange();
  
  // Fetch jobs for the selected date range
  const { data: jobs, isLoading } = useQuery({
    queryKey: ['/api/jobs', dateRange.start.toISOString(), dateRange.end.toISOString(), technicianFilter],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      queryParams.append('startDate', dateRange.start.toISOString());
      queryParams.append('endDate', dateRange.end.toISOString());
      
      if (technicianFilter !== "all") {
        queryParams.append('technicianId', technicianFilter);
      }
      
      const res = await fetch(`/api/jobs?${queryParams.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch jobs');
      return res.json();
    }
  });

  // Fetch technicians for filter
  const { data: technicians } = useQuery({
    queryKey: ['/api/users'],
    queryFn: async () => {
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error('Failed to fetch technicians');
      return res.json();
    }
  });

  // Handle navigation
  const navigatePrevious = () => {
    if (view === "day") {
      setDate(prev => addDays(prev, -1));
    } else if (view === "week") {
      setDate(prev => addDays(prev, -7));
    } else { // month
      setDate(prev => addDays(prev, -30));
    }
  };

  const navigateNext = () => {
    if (view === "day") {
      setDate(prev => addDays(prev, 1));
    } else if (view === "week") {
      setDate(prev => addDays(prev, 7));
    } else { // month
      setDate(prev => addDays(prev, 30));
    }
  };

  const navigateToday = () => {
    setDate(new Date());
  };

  // Function to format date range title
  const formatDateRangeTitle = () => {
    if (view === "day") {
      return format(date, "MMMM d, yyyy");
    } else if (view === "week") {
      const endDate = addDays(date, 6);
      return `${format(date, "MMM d")} - ${format(endDate, "MMM d, yyyy")}`;
    } else { // month
      return format(date, "MMMM yyyy");
    }
  };

  // Get hours for day view (8am to 6pm)
  const hours = Array.from({ length: 11 }, (_, i) => i + 8);

  // Render time slots for day view
  const renderDayView = () => {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="flex flex-col h-[600px] overflow-y-auto">
          {hours.map(hour => {
            const currentHourJobs = jobs?.filter(job => {
              const startTime = parseISO(job.scheduledStartTime);
              return startTime.getHours() === hour && isSameDay(startTime, date);
            });
            
            return (
              <div key={hour} className="flex border-b min-h-[60px] group">
                <div className="w-20 p-2 text-sm text-slate-500 border-r">
                  {format(new Date().setHours(hour, 0, 0), "h:mm a")}
                </div>
                <div className="flex-1 p-2 relative">
                  {currentHourJobs?.map(job => (
                    <div 
                      key={job.id}
                      className="absolute bg-blue-100 border-l-4 border-primary rounded-r-md p-2 text-sm"
                      style={{
                        top: `${parseISO(job.scheduledStartTime).getMinutes() * (100 / 60)}%`,
                        height: "50px",
                        left: "4px",
                        right: "4px",
                      }}
                    >
                      <div className="font-medium truncate">{job.customer.fullName}</div>
                      <div className="text-xs text-slate-500 truncate">
                        {job.vehicle.make} {job.vehicle.model} - {job.services.map(s => s.serviceName).join(", ")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render the week view
  const renderWeekView = () => {
    const days = Array.from({ length: 7 }, (_, i) => addDays(date, i));
    
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="grid grid-cols-7 border-b">
          {days.map(day => (
            <div key={day.toISOString()} className="p-2 text-center border-r last:border-r-0">
              <div className="text-sm font-medium">{format(day, "EEE")}</div>
              <div className={`text-lg ${isSameDay(day, new Date()) ? "bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto" : ""}`}>
                {format(day, "d")}
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 h-[600px] overflow-y-auto">
          {days.map(day => {
            const dayJobs = jobs?.filter(job => isSameDay(parseISO(job.scheduledStartTime), day));
            
            return (
              <div key={day.toISOString()} className="border-r last:border-r-0 min-h-full p-1">
                {dayJobs?.map(job => (
                  <div 
                    key={job.id}
                    className="bg-blue-100 border-l-4 border-primary rounded-r-md p-2 text-sm mb-1"
                  >
                    <div className="text-xs text-slate-500">
                      {format(parseISO(job.scheduledStartTime), "h:mm a")} - {format(parseISO(job.scheduledEndTime), "h:mm a")}
                    </div>
                    <div className="font-medium truncate">{job.customer.fullName}</div>
                    <div className="text-xs text-slate-500 truncate">
                      {job.vehicle.make} {job.vehicle.model}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render the month view
  const renderMonthView = () => {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4">
        <CalendarComponent
          mode="single"
          selected={date}
          onSelect={(newDate) => newDate && setDate(newDate)}
          className="rounded-md border"
          components={{
            DayContent: (props) => {
              const day = props.date;
              const dayJobs = jobs?.filter(job => isSameDay(parseISO(job.scheduledStartTime), day));
              
              return (
                <div className="w-full h-full">
                  <div className={`text-center ${props.selected ? "text-white" : ""}`}>
                    {format(day, "d")}
                  </div>
                  <div className="mt-1">
                    {dayJobs && dayJobs.length > 0 && (
                      <div className="text-xs text-center">
                        <span className="bg-blue-100 text-blue-800 px-1 rounded">
                          {dayJobs.length} job{dayJobs.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            }
          }}
        />
      </div>
    );
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold">Calendar</h1>
        <div className="mt-3 md:mt-0 flex flex-wrap gap-2 items-center">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={navigatePrevious}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={navigateToday}>
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={navigateNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <div className="text-lg font-medium">
              {formatDateRangeTitle()}
            </div>
          </div>
          
          <div className="flex space-x-2 ml-auto">
            <Select value={technicianFilter} onValueChange={setTechnicianFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Technicians" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Technicians</SelectItem>
                {technicians?.map((tech: any) => (
                  <SelectItem key={tech.id} value={tech.id.toString()}>
                    {tech.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={view} onValueChange={(value: "day" | "week" | "month") => setView(value)}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="View" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Day</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
              </SelectContent>
            </Select>
            
            <Dialog open={isNewJobDialogOpen} onOpenChange={setIsNewJobDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-1" />
                  New Job
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Schedule New Job</DialogTitle>
                </DialogHeader>
                <JobForm 
                  initialDate={date}
                  onSuccess={() => setIsNewJobDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-lg shadow-sm p-10 text-center">
          <CalendarIcon className="mx-auto h-10 w-10 text-slate-300 mb-3" />
          <p className="text-slate-500">Loading calendar...</p>
        </div>
      ) : (
        <>
          {view === "day" && renderDayView()}
          {view === "week" && renderWeekView()}
          {view === "month" && renderMonthView()}
        </>
      )}
    </div>
  );
}
