
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Partner } from "@/components/partners/PartnerList";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

export const Compare = () => {
  const [selectedPartners, setSelectedPartners] = useState<Partner[]>([]);
  const [comparisonResult, setComparisonResult] = useState<string | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const { toast } = useToast();

  const { data: partners, isLoading } = useQuery({
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
        description: "Partners have been analyzed and ranked"
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
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Selected Partners for Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            {selectedPartners.length === 0 
              ? "Select partners to compare their analyses" 
              : `${selectedPartners.length} partners selected`}
          </p>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {partners.map(partner => (
              <Button
                key={partner.id}
                variant={selectedPartners.some(p => p.id === partner.id) ? "default" : "outline"}
                onClick={() => {
                  if (selectedPartners.some(p => p.id === partner.id)) {
                    setSelectedPartners(selectedPartners.filter(p => p.id !== partner.id));
                  } else if (selectedPartners.length < 3) {
                    setSelectedPartners([...selectedPartners, partner]);
                  } else {
                    toast({
                      title: "Maximum partners reached",
                      description: "You can only compare up to 3 partners at a time",
                      variant: "destructive"
                    });
                  }
                }}
                className="w-full justify-start"
              >
                {partner.company_name}
              </Button>
            ))}
          </div>

          {selectedPartners.length >= 2 && (
            <div className="mt-6">
              <Button 
                onClick={handleCompare} 
                disabled={isComparing}
                className="w-full"
              >
                {isComparing ? "Comparing Partners..." : "Compare Selected Partners"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {comparisonResult && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>AI Comparison Analysis</CardTitle>
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
    </div>
  );
};

export default Compare;
