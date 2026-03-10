import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "./lib/auth";
import NotFound from "@/pages/not-found";

import Login from "./pages/Login";
import StudentDashboard from "./pages/student/Dashboard";
import FacultyDashboard from "./pages/faculty/Dashboard";

function ProtectedRoute({ component: Component, allowedRole, path }: { component: any, allowedRole: "student" | "faculty", path: string }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="h-screen bg-slate-950" />;
  if (!user) return <Redirect to="/" />;
  if (user.role !== allowedRole) return <Redirect to={`/${user.role}`} />;

  return <Route path={path} component={Component} />;
}

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="h-screen bg-slate-950" />;

  return (
    <Switch>
      <Route path="/">
        {user ? <Redirect to={`/${user.role}`} /> : <Login />}
      </Route>
      
      {/* Dynamic routes for students */}
      <ProtectedRoute path="/student" allowedRole="student" component={StudentDashboard} />
      <ProtectedRoute path="/student/:tab" allowedRole="student" component={StudentDashboard} />

      {/* Dynamic routes for faculty */}
      <ProtectedRoute path="/faculty" allowedRole="faculty" component={FacultyDashboard} />
      <ProtectedRoute path="/faculty/:tab" allowedRole="faculty" component={FacultyDashboard} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
