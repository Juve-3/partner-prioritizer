
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Partner } from "@/components/partners/types";
import { useToast } from "@/components/ui/use-toast";
import { ComparisonForm } from "@/components/compare/ComparisonForm";
import { ComparisonResults } from "@/components/compare/ComparisonResults";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";

export const Compare = () => {
  const [selectedPartners, setSelectedPartners] = useState<Partner[]>([]);
  const [comparisonResult, setComparisonResult] = useState<string | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [criteria, setCriteria] = useState<string>("balanced");
  const { businessProfile } = useBusinessProfile();
  const { toast } = useToast();

  const { data: partners, isLoading, refetch } = useQuery({
    queryKey: ['partners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .order('company_name', { ascending: true });
      
      if (error) throw error;
      return data as Partner[];
    }
  });

  const handleCompare = async () => {
    if (selectedPartners.length < 2) {
      toast({
        title: "Not enough partners",
        description: "Please select at least 2 partners to compare",
        variant: "destructive"
      });
      return;
    }

    setIsComparing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-partner', {
        body: {
          action: 'compare',
          criteria,
          businessContext: {
            name: businessProfile.business_name,
            field: businessProfile.business_field,
            description: businessProfile.business_description
          },
          partners: selectedPartners.map(p => ({
            id: p.id,
            companyName: p.company_name,
            website: p.website,
            industry: p.industry,
            description: p.description,
            status: p.status,
            analysis: p.ai_analysis?.analysis
          }))
        }
      });

      if (error) throw error;

      setComparisonResult(data.analysis);
      toast({
        title: "Comparison Complete",
        description: "Partners have been analyzed and ranked based on your business context"
      });
    } catch (error: any) {
      console.error('Comparison error:', error);
      toast({
        variant: "destructive",
        title: "Comparison Failed",
        description: error.message || "Failed to compare partners"
      });
    } finally {
      setIsComparing(false);
    }
  };

  const handleSaveSuccess = () => {
    // Optionally perform actions after successful save
    refetch();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse text-primary">Loading partners...</div>
      </div>
    );
  }

  if (!partners?.length) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>No partners available</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Add some partners first to use the comparison feature.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Compare Partners</h1>
      
      <ComparisonForm
        partners={partners}
        selectedPartners={selectedPartners}
        setSelectedPartners={setSelectedPartners}
        criteria={criteria}
        setCriteria={setCriteria}
        onCompare={handleCompare}
        isComparing={isComparing}
      />

      <ComparisonResults
        comparisonResult={comparisonResult}
        selectedPartners={selectedPartners}
        criteria={criteria}
        onSaveSuccess={handleSaveSuccess}
      />
    </div>
  );
};

export default Compare;
