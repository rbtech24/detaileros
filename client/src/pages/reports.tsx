import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, subDays, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { cn, formatCurrency } from "@/lib/utils";
import { CalendarIcon, Download, BarChart3, TrendingUp, Users, Car, ClipboardCheck } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";

export default function Reports() {
  const [reportType, setReportType] = useState("revenue");
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [datePreset, setDatePreset] = useState("this-month");

  // Revenue stats query
  const { data: revenueStats, isLoading: isLoadingRevenue } = useQuery({
    queryKey: ['/api/stats/revenue', dateRange.from.toISOString(), dateRange.to.toISOString()],
    queryFn: async () => {
      const res = await fetch(`/api/stats/revenue?startDate=${dateRange.from.toISOString()}&endDate=${dateRange.to.toISOString()}`);
      if (!res.ok) throw new Error('Failed to fetch revenue stats');
      return res.json();
    }
  });

  // Top services query
  const { data: topServices, isLoading: isLoadingTopServices } = useQuery({
    queryKey: ['/api/stats/top-services', dateRange.from.toISOString(), dateRange.to.toISOString()],
    queryFn: async () => {
      const res = await fetch(`/api/stats/top-services?startDate=${dateRange.from.toISOString()}&endDate=${dateRange.to.toISOString()}&limit=5`);
      if (!res.ok) throw new Error('Failed to fetch top services');
      return res.json();
    }
  });

  // Handle date range presets
  const handleDatePreset = (preset: string) => {
    const now = new Date();
    let from: Date, to: Date;

    switch (preset) {
      case "this-month":
        from = startOfMonth(now);
        to = endOfMonth(now);
        break;
      case "last-month":
        from = startOfMonth(subMonths(now, 1));
        to = endOfMonth(subMonths(now, 1));
        break;
      case "last-30-days":
        from = subDays(now, 30);
        to = now;
        break;
      case "last-90-days":
        from = subDays(now, 90);
        to = now;
        break;
      default:
        from = startOfMonth(now);
        to = endOfMonth(now);
    }

    setDateRange({ from, to });
    setDatePreset(preset);
  };

  // Generate mock monthly data
  const generateMonthlyData = () => {
    // In a real app, this would be fetched from an API
    return [
      { name: "Jan", revenue: 8400 },
      { name: "Feb", revenue: 9200 },
      { name: "Mar", revenue: 11500 },
      { name: "Apr", revenue: 10300 },
      { name: "May", revenue: 12800 },
      { name: "Jun", revenue: 14500 },
      { name: "Jul", revenue: 15200 },
      { name: "Aug", revenue: 16100 },
      { name: "Sep", revenue: 14800 },
      { name: "Oct", revenue: 15600 },
      { name: "Nov", revenue: 13200 },
      { name: "Dec", revenue: 10900 },
    ];
  };

  // Generate service data for pie chart
  const generateServiceData = () => {
    if (!topServices || topServices.length === 0) {
      return [];
    }
    return topServices.map((service: any) => ({
      name: service.serviceName,
      value: service.revenue,
    }));
  };

  // Generate customer data
  const generateCustomerData = () => {
    // In a real app, this would be fetched from an API
    return [
      { name: "Jan", newCustomers: 5, returning: 12 },
      { name: "Feb", newCustomers: 8, returning: 14 },
      { name: "Mar", newCustomers: 12, returning: 16 },
      { name: "Apr", newCustomers: 10, returning: 18 },
      { name: "May", newCustomers: 15, returning: 20 },
      { name: "Jun", newCustomers: 18, returning: 22 },
      { name: "Jul", newCustomers: 20, returning: 25 },
      { name: "Aug", newCustomers: 22, returning: 28 },
      { name: "Sep", newCustomers: 18, returning: 30 },
      { name: "Oct", newCustomers: 16, returning: 32 },
      { name: "Nov", newCustomers: 14, returning: 28 },
      { name: "Dec", newCustomers: 10, returning: 25 },
    ];
  };

  // COLORS
  const COLORS = ['#3b82f6', '#f97316', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold">Reports</h1>
        <div className="mt-3 md:mt-0 flex flex-wrap gap-2">
          <div className="flex items-center">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(dateRange.from, "MMM d, yyyy")} - {format(dateRange.to, "MMM d, yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={{
                    from: dateRange.from,
                    to: dateRange.to
                  }}
                  onSelect={(range) => {
                    if (range?.from && range?.to) {
                      setDateRange({
                        from: range.from,
                        to: range.to
                      });
                      setDatePreset("custom");
                    }
                  }}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>

          <Select value={datePreset} onValueChange={handleDatePreset}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
              <SelectItem value="last-30-days">Last 30 Days</SelectItem>
              <SelectItem value="last-90-days">Last 90 Days</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <Tabs defaultValue="revenue" value={reportType} onValueChange={setReportType} className="mb-6">
        <TabsList>
          <TabsTrigger value="revenue" className="flex items-center">
            <BarChart3 className="h-4 w-4 mr-2" />
            Revenue
          </TabsTrigger>
          <TabsTrigger value="services" className="flex items-center">
            <ClipboardCheck className="h-4 w-4 mr-2" />
            Services
          </TabsTrigger>
          <TabsTrigger value="customers" className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Customers
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            Trends
          </TabsTrigger>
        </TabsList>

        {/* Revenue Report */}
        <TabsContent value="revenue" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Revenue</CardTitle>
                <CardDescription>
                  {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d, yyyy")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {isLoadingRevenue ? (
                    <div className="h-9 bg-slate-100 animate-pulse rounded"></div>
                  ) : (
                    formatCurrency(revenueStats?.totalRevenue || 0)
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Average job value: {formatCurrency(revenueStats?.avgJobValue || 0)}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Completed Jobs</CardTitle>
                <CardDescription>
                  {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d, yyyy")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {isLoadingRevenue ? (
                    <div className="h-9 bg-slate-100 animate-pulse rounded"></div>
                  ) : (
                    revenueStats?.jobsCompleted || 0
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Jobs completed in selected period
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">New Customers</CardTitle>
                <CardDescription>
                  {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d, yyyy")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {isLoadingRevenue ? (
                    <div className="h-9 bg-slate-100 animate-pulse rounded"></div>
                  ) : (
                    revenueStats?.newCustomers || 0
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  New customers acquired
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue</CardTitle>
              <CardDescription>Revenue trend over the past year</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={generateMonthlyData()}
                    margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis 
                      tickFormatter={(value) => `$${value}`}
                      width={80}
                    />
                    <Tooltip 
                      formatter={(value) => [`$${value}`, 'Revenue']}
                      contentStyle={{ 
                        backgroundColor: '#fff',
                        border: '1px solid #ccc',
                        borderRadius: '0.5rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                      }}
                    />
                    <Bar 
                      dataKey="revenue" 
                      fill="#3b82f6" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Services Report */}
        <TabsContent value="services" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Services by Revenue</CardTitle>
                <CardDescription>
                  {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d, yyyy")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {isLoadingTopServices ? (
                    <div className="h-full w-full flex items-center justify-center">
                      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  ) : topServices && topServices.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={generateServiceData()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {generateServiceData().map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => [`$${value}`, 'Revenue']}
                          contentStyle={{ 
                            backgroundColor: '#fff',
                            border: '1px solid #ccc',
                            borderRadius: '0.5rem',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <p className="text-slate-500">No service data available for the selected period</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Service Breakdown</CardTitle>
                <CardDescription>
                  {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d, yyyy")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoadingTopServices ? (
                    Array(5).fill(0).map((_, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between">
                          <div className="w-32 h-4 bg-slate-100 animate-pulse rounded"></div>
                          <div className="w-16 h-4 bg-slate-100 animate-pulse rounded"></div>
                        </div>
                        <div className="h-2 bg-slate-100 animate-pulse rounded-full"></div>
                      </div>
                    ))
                  ) : topServices && topServices.length > 0 ? (
                    topServices.map((service: any, index: number) => (
                      <div key={service.serviceId} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{service.serviceName}</span>
                          <span className="text-sm font-medium">{formatCurrency(service.revenue)}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div 
                            className="rounded-full h-2"
                            style={{ 
                              width: `${(service.revenue / topServices[0].revenue) * 100}%`,
                              backgroundColor: COLORS[index % COLORS.length]
                            }}
                          ></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center">
                      <p className="text-slate-500">No service data available for the selected period</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Customers Report */}
        <TabsContent value="customers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Acquisition</CardTitle>
                <CardDescription>New vs returning customers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={generateCustomerData()}
                      margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff',
                          border: '1px solid #ccc',
                          borderRadius: '0.5rem',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                        }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="newCustomers" 
                        stroke="#3b82f6" 
                        name="New Customers"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="returning" 
                        stroke="#10b981" 
                        name="Returning Customers"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Statistics</CardTitle>
                <CardDescription>Key customer metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Total Customers</span>
                      <span className="font-medium">235</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Active in last 30 days</span>
                        <span>68%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="rounded-full h-2 bg-blue-500" style={{ width: '68%' }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Avg. Services Per Customer</span>
                      <span className="font-medium">3.2</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Growth from last period</span>
                        <span>+12%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="rounded-full h-2 bg-green-500" style={{ width: '73%' }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Customer Retention Rate</span>
                      <span className="font-medium">81%</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>vs. industry average</span>
                        <span>+5%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="rounded-full h-2 bg-blue-500" style={{ width: '81%' }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Customer Satisfaction Score</span>
                      <span className="font-medium">4.7/5</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Based on recent reviews</span>
                        <span>94%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="rounded-full h-2 bg-green-500" style={{ width: '94%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trends Report */}
        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Business Trends Analysis</CardTitle>
                <CardDescription>
                  Key metrics and trends for the selected period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Average Job Value</span>
                        <span className="text-sm text-green-600">↑ 12%</span>
                      </div>
                      <div className="text-2xl font-bold">
                        {formatCurrency(revenueStats?.avgJobValue || 0)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        vs {formatCurrency((revenueStats?.avgJobValue || 0) * 0.88)} last period
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Customer Growth</span>
                        <span className="text-sm text-green-600">↑ 8%</span>
                      </div>
                      <div className="text-2xl font-bold">
                        {revenueStats?.newCustomers || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        vs {Math.floor((revenueStats?.newCustomers || 0) * 0.92)} last period
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Service Efficiency</span>
                        <span className="text-sm text-green-600">↑ 5%</span>
                      </div>
                      <div className="text-2xl font-bold">
                        94%
                      </div>
                      <p className="text-xs text-muted-foreground">
                        vs 89% last period
                      </p>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <h3 className="text-sm font-medium mb-4">Emerging Business Trends</h3>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <TrendingUp className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Premium Service Uptake</h4>
                          <p className="text-sm text-muted-foreground">
                            Premium detailing services have increased by 23% over the last quarter,
                            indicating growing customer preference for high-value services.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="bg-green-100 p-2 rounded-full">
                          <TrendingUp className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Repeat Customer Rate</h4>
                          <p className="text-sm text-muted-foreground">
                            Customer retention has improved with 68% of customers returning within 
                            3 months, up from 62% in the previous period.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="bg-orange-100 p-2 rounded-full">
                          <TrendingUp className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Seasonal Service Demand</h4>
                          <p className="text-sm text-muted-foreground">
                            Seasonal analysis shows a 34% increase in ceramic coating services
                            during spring months, suggesting opportunity for seasonal promotions.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}