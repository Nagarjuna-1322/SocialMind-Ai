import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SupabaseAuthProvider, useSupabaseAuth } from "./contexts/SupabaseAuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import VerifyEmail from "./pages/VerifyEmail";
import ResetPassword from "./pages/ResetPassword";
import AuthCallback from "./pages/AuthCallback";
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";

function WorkspaceApp() {
  const { loading } = useSupabaseAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center bg-[#f7f8fb]"><Loader2 className="h-6 w-6 animate-spin text-[#5b5ce2]" /></div>;
  return <Home />;
}

function Router() {
  return <Switch>
    <Route path="/login" component={Login} />
    <Route path="/auth/verify" component={VerifyEmail} />
    <Route path="/auth/callback" component={AuthCallback} />
    <Route path="/reset-password" component={ResetPassword} />
    <Route path="/" component={WorkspaceApp} />
    <Route path="/history" component={WorkspaceApp} />
    <Route path="/analytics" component={WorkspaceApp} />
    <Route path="/strategy" component={WorkspaceApp} />
    <Route path="/generator" component={WorkspaceApp} />
    <Route path="/brand" component={WorkspaceApp} />
    <Route path="/settings" component={WorkspaceApp} />
    <Route path="/404" component={NotFound} />
    <Route component={NotFound} />
  </Switch>;
}

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><SupabaseAuthProvider><TooltipProvider><Toaster position="bottom-right" /><Router /></TooltipProvider></SupabaseAuthProvider></ThemeProvider></ErrorBoundary>;
}
