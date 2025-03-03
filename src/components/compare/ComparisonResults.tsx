
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Partner } from "@/components/partners/PartnerList";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface ComparisonResultsProps {
  comparisonResult: string | null;
  selectedPartners: Partner[];
  criteria: string;
  onSaveSuccess?: () => void;
}

export const ComparisonResults = ({ 
  comparisonResult, 
  selectedPartners,
  criteria,
  onSaveSuccess
}: ComparisonResultsProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  if (!comparisonResult && selectedPartners.length === 0) {
    return null;
  }

  const handleSaveComparison = async () => {
    if (!comparisonResult || selectedPartners.length < 2) {
      toast({
        title: "Cannot save comparison",
        description: "A valid comparison result is required",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to save comparisons",
          variant: "destructive"
        });
        return;
      }

      const partnersData = selectedPartners.map(partner => ({
        id: partner.id,
        company_name: partner.company_name,
        industry: partner.industry,
        status: partner.status
      }));

      const { error } = await supabase
        .from('comparison_results')
        .insert({
          criteria,
          partners: partnersData,
          result: comparisonResult
        });

      if (error) throw error;

      toast({
        title: "Comparison saved",
        description: "Your comparison analysis has been saved successfully"
      });

      if (onSaveSuccess) {
        onSaveSuccess();
      }
    } catch (error: any) {
      console.error("Error saving comparison:", error);
      toast({
        title: "Save failed",
        description: error.message || "Failed to save comparison",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {comparisonResult && (
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>AI Comparison Analysis</CardTitle>
            <Button 
              onClick={handleSaveComparison} 
              disabled={isSaving || !comparisonResult}
              size="sm"
            >
              {isSaving ? "Saving..." : "Save Comparison"}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm">
              <p className="whitespace-pre-line">{comparisonResult}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedPartners.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Individual Analyses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              {selectedPartners.map(partner => (
                <div key={partner.id} className="space-y-2">
                  <h3 className="font-semibold">{partner.company_name}</h3>
                  <div className="bg-muted p-4 rounded-md">
                    {partner.ai_analysis ? (
                      <p className="text-sm">{partner.ai_analysis.analysis}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">No analysis available yet</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};
