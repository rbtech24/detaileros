import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatTime } from "@/lib/utils";
import { Phone, MapPin, Eye } from "lucide-react";

interface Job {
  id: number;
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
  address: string;
  city: string;
  state: string;
}

interface ScheduleListProps {
  jobs: Job[];
  isLoading: boolean;
}

export function ScheduleList({ jobs, isLoading }: ScheduleListProps) {
  // Function to get status badge class
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-yellow-100 text-yellow-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  // Function to get formatted status text
  const getStatusText = (status: string) => {
    switch (status) {
      case "in_progress":
        return "In Progress";
      case "scheduled":
        return "Upcoming";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  return (
    <Card className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-medium">Today's Schedule</h3>
        <Link href="/calendar" className="text-primary text-sm font-medium">
          View Calendar
        </Link>
      </div>
      
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex p-3 border border-slate-100 rounded-lg">
              <div className="mr-4 flex flex-col items-center">
                <Skeleton className="h-4 w-10 mb-1" />
                <div className="my-1 h-full w-px bg-slate-200"></div>
                <Skeleton className="h-4 w-10 mt-1" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <Skeleton className="h-5 w-48 mb-2" />
                    <Skeleton className="h-4 w-32 mb-2" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
                <Skeleton className="h-4 w-56 mt-2 mb-3" />
                <div className="flex space-x-2">
                  <Skeleton className="h-9 w-20" />
                  <Skeleton className="h-9 w-28" />
                  <Skeleton className="h-9 w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : jobs.length > 0 ? (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="flex p-3 border border-slate-100 rounded-lg hover:bg-slate-50">
              <div className="mr-4 flex flex-col items-center">
                <span className="text-slate-500 text-sm">
                  {formatTime(job.scheduledStartTime)}
                </span>
                <div className="my-1 h-full w-px bg-slate-200"></div>
                <span className="text-slate-500 text-sm">
                  {formatTime(job.scheduledEndTime)}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">
                      {job.vehicle ? `${job.vehicle.make} ${job.vehicle.model}` : "Vehicle Service"}
                    </h4>
                    <p className="text-sm text-slate-500">
                      {job.customer ? job.customer.fullName : "Customer"} • {job.vehicle ? `${job.vehicle.make} ${job.vehicle.model}` : "Vehicle"}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusBadgeClass(job.status)}`}>
                    {getStatusText(job.status)}
                  </span>
                </div>
                <div className="mt-2 flex items-center text-sm">
                  <MapPin className="h-4 w-4 text-slate-400 mr-1" />
                  <span className="text-slate-500">
                    {job.address}, {job.city}, {job.state}
                  </span>
                </div>
                <div className="mt-3 flex space-x-2">
                  <Button variant="outline" size="sm" className="flex items-center">
                    <Phone className="h-4 w-4 mr-1" />
                    Call
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    Directions
                  </Button>
                  <Button variant="default" size="sm" className="flex items-center" asChild>
                    <Link href={`/jobs/${job.id}`}>
                      <Eye className="h-4 w-4 mr-1" />
                      View Job
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="mt-2 text-slate-500">No jobs scheduled for today</p>
          <Button className="mt-4" asChild>
            <Link href="/jobs/new">Schedule a Job</Link>
          </Button>
        </div>
      )}
    </Card>
  );
}
