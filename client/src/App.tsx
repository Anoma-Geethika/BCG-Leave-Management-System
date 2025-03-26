import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LeaveManagement from "@/pages/LeaveManagement";
import Reports from "@/pages/Reports";
import TeacherManagement from "@/pages/TeacherManagement";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/" component={() => {
        // Redirect to login page initially
        window.location.href = "/login";
        return null;
      }} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/reports" component={Reports} />
      <Route path="/teacher-management" component={TeacherManagement} />
      <Route path="/leave-management" component={LeaveManagement} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();
  const isLoginPage = location === "/login";

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col">
        {!isLoginPage && <Header />}
        <main className={`flex-grow ${isLoginPage ? 'p-0' : ''}`}>
          <Router />
        </main>
        {!isLoginPage && <Footer />}
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
