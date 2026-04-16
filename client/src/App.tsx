import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Project from "@/pages/project";
import Jobs from "@/pages/jobs";
import { ThemeProvider } from "next-themes";
import { ResumeProvider } from "@/context/ResumeContext";

import Landing from "@/pages/landing";
import { FloatingNav } from "@/components/floating-nav";

function Router() {
  const [location] = useLocation();
  const showFloatingNav =
    location === "/builder" || location.startsWith("/jobs");

  return (
    <>
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/builder" component={Home} />
        <Route path="/jobs" component={Jobs} />
        <Route path="/project/:id" component={Project} />
        <Route component={NotFound} />
      </Switch>
      {showFloatingNav && <FloatingNav />}
    </>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ResumeProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </QueryClientProvider>
      </ResumeProvider>
    </ThemeProvider>
  );
}

export default App;
