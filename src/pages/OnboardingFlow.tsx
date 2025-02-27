
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { BusinessProfileForm } from "@/components/profile/BusinessProfileForm";
import { useToast } from "@/components/ui/use-toast";

const OnboardingFlow = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate("/auth");
          return;
        }

        // Check if user has already completed profile
        const { data, error } = await supabase
          .from('profiles')
          .select('*') // Select all columns to avoid field not found errors
          .eq('id', session.user.id)
          .single();

        if (error) throw error;

        // If profile is already completed, redirect to home
        if ((data as any)?.profile_completed) {
          navigate("/");
        }
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Something went wrong",
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate, toast]);

  const handleSkip = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }
      
      // Mark as completed but with empty values
      await supabase
        .from('profiles')
        .update({ profile_completed: true } as any) // Type assertion to bypass TypeScript check
        .eq('id', session.user.id);
      
      navigate("/");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to skip onboarding",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  return <BusinessProfileForm onSkip={handleSkip} />;
};

export default OnboardingFlow;
