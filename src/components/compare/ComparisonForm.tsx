
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Partner } from "@/components/partners/PartnerList";

interface ComparisonFormProps {
  partners: Partner[];
  selectedPartners: Partner[];
  setSelectedPartners: (partners: Partner[]) => void;
  criteria: string;
  setCriteria: (criteria: string) => void;
  onCompare: () => void;
  isComparing: boolean;
}

export const ComparisonForm = ({
  partners,
  selectedPartners,
  setSelectedPartners,
  criteria,
  setCriteria,
  onCompare,
  isComparing
}: ComparisonFormProps) => {
  const { toast } = useToast();

  return (
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
        
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Comparison Focus</Label>
            <Select 
              value={criteria} 
              onValueChange={setCriteria}
            >
              <SelectTrigger className="w-full md:w-[300px]">
                <SelectValue placeholder="Select comparison criteria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="balanced">Balanced Evaluation</SelectItem>
                <SelectItem value="growth">Growth Potential</SelectItem>
                <SelectItem value="industry">Industry Presence</SelectItem>
                <SelectItem value="innovation">Innovation & Technology</SelectItem>
                <SelectItem value="financial">Financial Stability</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
            <div>
              <Button 
                onClick={onCompare} 
                disabled={isComparing}
                className="w-full"
              >
                {isComparing ? "Comparing Partners..." : "Compare Selected Partners"}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
