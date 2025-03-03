
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Partner } from "@/components/partners/PartnerList";

interface ComparisonResultsProps {
  comparisonResult: string | null;
  selectedPartners: Partner[];
}

export const ComparisonResults = ({ 
  comparisonResult, 
  selectedPartners 
}: ComparisonResultsProps) => {
  if (!comparisonResult && selectedPartners.length === 0) {
    return null;
  }

  return (
    <>
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
    </>
  );
};
