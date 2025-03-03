
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface BusinessProfile {
  business_name?: string;
  business_field?: string;
  business_description?: string;
}

export const useBusinessProfile = () => {
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchBusinessProfile = async () => {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) throw error;

        setBusinessProfile({
          business_name: (data as any).business_name || "",
          business_field: (data as any).business_field || "",
          business_description: (data as any).business_description || ""
        });
      } catch (error) {
        console.error("Error fetching business profile:", error);
        setError(error instanceof Error ? error : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchBusinessProfile();
  }, []);

  return { businessProfile, isLoading, error };
};
