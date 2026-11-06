import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SupabaseAuthProvider, useSupabaseAuth } from "./contexts/SupabaseAuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";

function ProtectedWorkspace() {
  const { user, loading, configured } = useSupabaseAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center bg-[#f7f8fb]"><Loader2 className="h-6 w-6 animate-spin text-[#5b5ce2]" /></div>;
  if (!configured || !user) return <Redirect to="/login" />;
  return <Home />;
}

function Router() {
  return <Switch>
    <Route path="/login" component={Login} />
    <Route path="/" component={ProtectedWorkspace} />
    <Route path="/history" component={ProtectedWorkspace} />
    <Route path="/analytics" component={ProtectedWorkspace} />
    <Route path="/strategy" component={ProtectedWorkspace} />
    <Route path="/generator" component={ProtectedWorkspace} />
    <Route path="/brand" component={ProtectedWorkspace} />
    <Route path="/settings" component={ProtectedWorkspace} />
    <Route path="/404" component={NotFound} />
    <Route component={NotFound} />
  </Switch>;
}

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><SupabaseAuthProvider><TooltipProvider><Toaster position="bottom-right" /><Router /></TooltipProvider></SupabaseAuthProvider></ThemeProvider></ErrorBoundary>;
}
