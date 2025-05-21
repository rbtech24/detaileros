import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ServiceData {
  serviceId: number;
  serviceName: string;
  revenue: number;
  count: number;
}

interface TopServicesProps {
  services: ServiceData[];
  isLoading: boolean;
}

export function TopServices({ services, isLoading }: TopServicesProps) {
  // Colors for services
  const colors = ["bg-primary", "bg-accent", "bg-emerald-500", "bg-amber-500"];

  // Calculate max revenue for percentage width
  const maxRevenue = services.length > 0
    ? Math.max(...services.map(service => service.revenue))
    : 0;

  return (
    <Card className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-medium">Top Services</h3>
        <a href="#" className="text-primary text-sm font-medium">Details</a>
      </div>
      
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i}>
              <div className="flex justify-between mb-1">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
      ) : services.length > 0 ? (
        <div className="space-y-4">
          {services.map((service, index) => (
            <div key={service.serviceId}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">{service.serviceName}</span>
                <span className="text-sm font-medium">${service.revenue.toLocaleString()}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div 
                  className={`${colors[index % colors.length]} h-2 rounded-full`} 
                  style={{ width: `${(service.revenue / maxRevenue) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-slate-500">No service data available</p>
        </div>
      )}
    </Card>
  );
}
