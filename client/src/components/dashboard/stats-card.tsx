import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: number;
  change: number;
  changeLabel: string;
  icon: React.ReactNode;
  isLoading?: boolean;
  formatValue?: (value: number) => string;
}

export function StatsCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  isLoading = false,
  formatValue = (val) => val.toString(),
}: StatsCardProps) {
  return (
    <Card className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium text-slate-500">{title}</h3>
        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
          +{change}%
        </span>
      </div>
      
      {isLoading ? (
        <Skeleton className="h-8 w-24 mb-4" />
      ) : (
        <p className="text-2xl font-bold">{formatValue(value)}</p>
      )}
      
      <div className="mt-4 flex items-center text-sm">
        {icon}
        <span className="text-green-600 font-medium">{changeLabel}</span>
      </div>
    </Card>
  );
}
