
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CreatePartnerDialog } from "@/components/partners/CreatePartnerDialog";
import { SmartOutreachDialog } from "@/components/outreach/SmartOutreachDialog";
import { Navigation } from "@/components/landing/Navigation";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeatureCards } from "@/components/landing/FeatureCards";
import { QuickActions } from "@/components/landing/QuickActions";
import { CallToAction } from "@/components/landing/CallToAction";
import { Footer } from "@/components/landing/Footer";

const Index = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isOutreachDialogOpen, setIsOutreachDialogOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setIsAuthenticated(!!session);
      });

      return () => subscription.unsubscribe();
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const handleAuthenticatedAction = (action: () => void) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access this feature",
      });
      navigate('/auth');
      return;
    }
    action();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary-50 via-white to-primary-50">
      <Navigation 
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
      />

      <main className="container mx-auto px-4 py-12 flex-grow">
        <HeroSection 
          onAddPartner={() => handleAuthenticatedAction(() => setIsCreateDialogOpen(true))}
          onViewDashboard={() => handleAuthenticatedAction(() => navigate('/partners'))}
        />

        <FeatureCards 
          onViewPartners={() => handleAuthenticatedAction(() => navigate('/partners'))}
          onRunAnalysis={() => handleAuthenticatedAction(() => navigate('/compare'))}
          onStartOutreach={() => handleAuthenticatedAction(() => setIsOutreachDialogOpen(true))}
        />

        <QuickActions 
          onAddPartner={() => handleAuthenticatedAction(() => setIsCreateDialogOpen(true))}
          onViewAnalytics={() => handleAuthenticatedAction(() => navigate('/compare'))}
          onStartOutreach={() => handleAuthenticatedAction(() => setIsOutreachDialogOpen(true))}
          onViewGoals={() => handleAuthenticatedAction(() => navigate('/partners'))}
        />

        <CallToAction 
          onGetStarted={() => handleAuthenticatedAction(() => setIsCreateDialogOpen(true))}
        />

        <CreatePartnerDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onSuccess={() => {
            setIsCreateDialogOpen(false);
            toast({
              title: "Success",
              description: "Partner added successfully",
            });
          }}
        />

        <SmartOutreachDialog
          open={isOutreachDialogOpen}
          onOpenChange={setIsOutreachDialogOpen}
        />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
