import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { format, eachDayOfInterval, startOfDay } from "date-fns";

interface RevenueChartProps {
  startDate: Date;
  endDate: Date;
  serviceFilter: string;
}

export function RevenueChart({ startDate, endDate, serviceFilter }: RevenueChartProps) {
  // Fetch top services for chart data
  const { data: topServicesData, isLoading } = useQuery({
    queryKey: ['/api/stats/top-services', startDate.toISOString(), endDate.toISOString()],
    queryFn: async () => {
      const res = await fetch(`/api/stats/top-services?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&limit=3`);
      if (!res.ok) throw new Error('Failed to fetch top services');
      return res.json();
    }
  });

  // Generate mock daily data based on the top services
  // In a real implementation, this would be fetched from an API endpoint that provides daily revenue data
  const generateDailyData = () => {
    if (!topServicesData) return [];
    
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    
    return days.map(day => {
      const result: { [key: string]: any } = {
        date: format(day, 'MMM dd'),
      };
      
      // Add revenue for each service
      topServicesData.forEach((service: any) => {
        // Generate some mock data variations
        const baseValue = service.revenue / days.length;
        const randomFactor = 0.5 + Math.random();
        result[service.serviceName] = Math.round(baseValue * randomFactor);
      });
      
      return result;
    });
  };

  const chartData = generateDailyData();
  
  // Generate colors for services
  const colors = ['#3b82f6', '#f97316', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <Card className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-medium">Revenue Breakdown</h3>
        <select className="text-sm border-none focus:ring-0">
          <option>Last 30 Days</option>
          <option>Last 90 Days</option>
          <option>Year to Date</option>
        </select>
      </div>
      
      {isLoading ? (
        <div className="h-64">
          <Skeleton className="h-full w-full" />
        </div>
      ) : topServicesData && topServicesData.length > 0 ? (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12, fill: '#64748b' }}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#64748b' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip 
                formatter={(value) => [`$${value}`, '']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Legend />
              {topServicesData.map((service: any, index: number) => (
                <Area
                  key={service.serviceName}
                  type="monotone"
                  dataKey={service.serviceName}
                  stackId="1"
                  stroke={colors[index % colors.length]}
                  fill={colors[index % colors.length]}
                  fillOpacity={0.6}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="mt-2 text-sm text-slate-500">No revenue data available</p>
          </div>
        </div>
      )}
      
      {/* Chart Legend */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        {topServicesData && topServicesData.map((service: any, index: number) => (
          <div key={service.serviceName} className="text-center">
            <div className="flex items-center justify-center">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: colors[index % colors.length] }}
              ></div>
              <span className="text-sm text-slate-600">{service.serviceName}</span>
            </div>
            <p className="mt-1 font-medium">${service.revenue.toLocaleString()}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
