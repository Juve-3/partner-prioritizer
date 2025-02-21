
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart2 } from "lucide-react";

interface HeroSectionProps {
  onAddPartner: () => void;
  onViewDashboard: () => void;
}

export const HeroSection = ({ onAddPartner, onViewDashboard }: HeroSectionProps) => {
  return (
    <div className="text-center mb-16 max-w-4xl mx-auto">
      <h1 className="text-5xl font-bold text-primary-900 mb-6">
        Smart Partnership Management Platform
      </h1>
      <p className="text-xl text-gray-600 mb-8">
        Use AI-powered analysis to identify, prioritize, and manage your most valuable business partnerships.
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        <Button 
          size="lg" 
          className="gap-2" 
          onClick={onAddPartner}
        >
          Add New Partner <ArrowRight className="h-5 w-5" />
        </Button>
        <Button 
          size="lg" 
          variant="outline" 
          className="gap-2" 
          onClick={onViewDashboard}
        >
          View Dashboard <BarChart2 className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};
