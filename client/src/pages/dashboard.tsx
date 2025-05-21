import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, subDays } from "date-fns";
import { Link } from "wouter";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/dashboard/stats-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { ScheduleList } from "@/components/dashboard/schedule-list";
import { ActivityList } from "@/components/dashboard/activity-list";
import { TopServices } from "@/components/dashboard/top-services";
import { RecentReviews } from "@/components/dashboard/recent-reviews";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const today = new Date();
  const thirtyDaysAgo = subDays(today, 30);
  
  const [dateRange, setDateRange] = useState({
    from: thirtyDaysAgo,
    to: today,
  });
  const [service, setService] = useState<string>("all");
  const [date, setDate] = useState<Date>();
  
  // Fetch revenue stats
  const { data: revenueStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['/api/stats/revenue', dateRange.from.toISOString(), dateRange.to.toISOString()],
    queryFn: async () => {
      const res = await fetch(`/api/stats/revenue?startDate=${dateRange.from.toISOString()}&endDate=${dateRange.to.toISOString()}`);
      if (!res.ok) throw new Error('Failed to fetch revenue stats');
      return res.json();
    }
  });

  // Fetch today's jobs
  const { data: todayJobs, isLoading: isLoadingJobs } = useQuery({
    queryKey: ['/api/jobs', 'today'],
    queryFn: async () => {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
      
      const res = await fetch(`/api/jobs?startDate=${todayStart.toISOString()}&endDate=${todayEnd.toISOString()}`);
      if (!res.ok) throw new Error('Failed to fetch today\'s jobs');
      return res.json();
    }
  });

  // Fetch recent activities
  const { data: recentActivities, isLoading: isLoadingActivities } = useQuery({
    queryKey: ['/api/activities'],
    queryFn: async () => {
      const res = await fetch('/api/activities?limit=5');
      if (!res.ok) throw new Error('Failed to fetch activities');
      return res.json();
    }
  });

  // Fetch top services
  const { data: topServices, isLoading: isLoadingTopServices } = useQuery({
    queryKey: ['/api/stats/top-services', dateRange.from.toISOString(), dateRange.to.toISOString()],
    queryFn: async () => {
      const res = await fetch(`/api/stats/top-services?startDate=${dateRange.from.toISOString()}&endDate=${dateRange.to.toISOString()}`);
      if (!res.ok) throw new Error('Failed to fetch top services');
      return res.json();
    }
  });

  // Fetch recent reviews
  const { data: recentReviews, isLoading: isLoadingReviews } = useQuery({
    queryKey: ['/api/reviews'],
    queryFn: async () => {
      const res = await fetch('/api/reviews?limit=2');
      if (!res.ok) throw new Error('Failed to fetch reviews');
      return res.json();
    }
  });

  // Format date range for display
  const formattedDateRange = `${format(dateRange.from, 'MMM d')} - ${format(dateRange.to, 'MMM d, yyyy')}`;

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="mt-3 md:mt-0 flex flex-col sm:flex-row sm:space-x-3">
          <div className="relative flex items-center mb-2 sm:mb-0">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formattedDateRange}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={{
                    from: dateRange.from,
                    to: dateRange.to,
                  }}
                  onSelect={(range) => {
                    if (range?.from && range?.to) {
                      setDateRange({
                        from: range.from,
                        to: range.to,
                      });
                    }
                  }}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
          <Select value={service} onValueChange={setService}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="All Services" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Services</SelectItem>
              <SelectItem value="interior">Interior Detailing</SelectItem>
              <SelectItem value="exterior">Exterior Detailing</SelectItem>
              <SelectItem value="full">Full Detail</SelectItem>
              <SelectItem value="ceramic">Ceramic Coating</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
        <StatsCard
          title="Total Revenue"
          value={revenueStats?.totalRevenue ?? 0}
          formatValue={(value) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          change={12}
          changeLabel="from last month"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
          isLoading={isLoadingStats}
        />
        
        <StatsCard
          title="Completed Jobs"
          value={revenueStats?.jobsCompleted ?? 0}
          change={5}
          changeLabel="more than last month"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
          isLoading={isLoadingStats}
        />
        
        <StatsCard
          title="New Customers"
          value={revenueStats?.newCustomers ?? 0}
          change={18}
          changeLabel="more than last month"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
          isLoading={isLoadingStats}
        />
        
        <StatsCard
          title="Avg. Job Value"
          value={revenueStats?.avgJobValue ?? 0}
          formatValue={(value) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          change={7}
          changeLabel="increase from last month"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
          isLoading={isLoadingStats}
        />
      </div>
      
      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Revenue Chart */}
          <RevenueChart
            startDate={dateRange.from}
            endDate={dateRange.to}
            serviceFilter={service}
          />
          
          {/* Today's Schedule */}
          <ScheduleList
            jobs={todayJobs || []}
            isLoading={isLoadingJobs}
          />
        </div>
        
        {/* Right Column */}
        <div className="space-y-6">
          {/* Recent Customer Activity */}
          <ActivityList
            activities={recentActivities || []}
            isLoading={isLoadingActivities}
          />
          
          {/* Top Services */}
          <TopServices
            services={topServices || []}
            isLoading={isLoadingTopServices}
          />
          
          {/* Recent Reviews */}
          <RecentReviews
            reviews={recentReviews || []}
            isLoading={isLoadingReviews}
          />
        </div>
      </div>
    </div>
  );
}
