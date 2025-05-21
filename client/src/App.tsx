import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { MainLayout } from "@/components/layout/main-layout";
import Dashboard from "@/pages/dashboard";
import Customers from "@/pages/customers";
import Employees from "@/pages/employees";
import Calendar from "@/pages/calendar";
import Jobs from "@/pages/jobs";
import Invoices from "@/pages/invoices";
import Reports from "@/pages/reports";
import Login from "@/pages/login";
import NewJob from "@/pages/jobs/new";
import JobDetail from "@/pages/jobs/detail";

function Router() {
  return (
    <Switch>
      <Route path="/login">
        <MainLayout requireAuth={false}>
          <Login />
        </MainLayout>
      </Route>
      <Route path="/dashboard">
        <MainLayout>
          <Dashboard />
        </MainLayout>
      </Route>
      <Route path="/customers">
        <MainLayout>
          <Customers />
        </MainLayout>
      </Route>
      <Route path="/employees">
        <MainLayout>
          <Employees />
        </MainLayout>
      </Route>
      <Route path="/calendar">
        <MainLayout>
          <Calendar />
        </MainLayout>
      </Route>
      <Route path="/jobs">
        <MainLayout>
          <Jobs />
        </MainLayout>
      </Route>
      <Route path="/jobs/new">
        <MainLayout>
          <NewJob />
        </MainLayout>
      </Route>
      <Route path="/jobs/:id">
        {(params) => (
          <MainLayout>
            <JobDetail id={parseInt(params.id)} />
          </MainLayout>
        )}
      </Route>
      <Route path="/invoices">
        <MainLayout>
          <Invoices />
        </MainLayout>
      </Route>
      <Route path="/reports">
        <MainLayout>
          <Reports />
        </MainLayout>
      </Route>
      <Route path="/">
        <MainLayout>
          <Dashboard />
        </MainLayout>
      </Route>
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
