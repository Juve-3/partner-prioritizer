
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Partners from "./pages/Partners";

// Move queryClient inside the component to ensure it's created in the React context
const App = () => {
  // Create a client
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });

  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
      const checkAuth = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
      };

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        console.log("Auth state changed:", !!session);
        setIsAuthenticated(!!session);
      });

      checkAuth();

      return () => subscription.unsubscribe();
    }, []);

    if (isAuthenticated === null) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-primary">Loading...</div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return <Navigate to="/auth" replace />;
    }

    return <>{children}</>;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen">
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route 
                path="/auth" 
                element={<Auth />} 
              />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/partners"
                element={
                  <ProtectedRoute>
                    <Partners />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
