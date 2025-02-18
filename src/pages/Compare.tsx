
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Partner } from "@/components/partners/PartnerList";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

export const Compare = () => {
  const [selectedPartners, setSelectedPartners] = useState<Partner[]>([]);
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
        </CardContent>
      </Card>

      {selectedPartners.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Comparison Results</CardTitle>
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
