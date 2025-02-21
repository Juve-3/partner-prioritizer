
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Building2, BrainCircuit, Mail } from "lucide-react";

interface FeatureCardsProps {
  onViewPartners: () => void;
  onRunAnalysis: () => void;
  onStartOutreach: () => void;
}

export const FeatureCards = ({ onViewPartners, onRunAnalysis, onStartOutreach }: FeatureCardsProps) => {
  return (
    <div className="grid md:grid-cols-3 gap-8 mb-16">
      <Card className="glass-card p-8 hover:shadow-lg transition-shadow">
        <div className="mb-6">
          <div className="bg-primary/10 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Partner Database</h3>
          <p className="text-gray-600">
            Create and maintain detailed profiles of potential and existing partners, track interactions, and store important documents.
          </p>
        </div>
        <Button 
          variant="ghost" 
          className="w-full"
          onClick={onViewPartners}
        >
          View Partners
        </Button>
      </Card>

      <Card className="glass-card p-8 hover:shadow-lg transition-shadow">
        <div className="mb-6">
          <div className="bg-primary/10 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
            <BrainCircuit className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">AI Analysis</h3>
          <p className="text-gray-600">
            Get intelligent insights and partnership recommendations based on your business goals and partner data.
          </p>
        </div>
        <Button 
          variant="ghost" 
          className="w-full"
          onClick={onRunAnalysis}
        >
          Run Analysis
        </Button>
      </Card>

      <Card className="glass-card p-8 hover:shadow-lg transition-shadow">
        <div className="mb-6">
          <div className="bg-primary/10 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Smart Outreach</h3>
          <p className="text-gray-600">
            Generate personalized outreach templates and manage communication with potential partners.
          </p>
        </div>
        <Button 
          variant="ghost" 
          className="w-full"
          onClick={onStartOutreach}
        >
          Start Outreach
        </Button>
      </Card>
    </div>
  );
};
