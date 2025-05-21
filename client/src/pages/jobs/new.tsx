import { JobForm } from "@/components/jobs/job-form";
import { ChevronLeft } from "lucide-react";
import { Link } from "wouter";

export default function NewJob() {
  return (
    <div>
      <div className="flex items-center mb-6">
        <Link href="/jobs">
          <a className="mr-2 text-slate-500 hover:text-slate-700">
            <ChevronLeft className="h-5 w-5" />
          </a>
        </Link>
        <h1 className="text-2xl font-bold">Schedule New Job</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <JobForm />
      </div>
    </div>
  );
}
