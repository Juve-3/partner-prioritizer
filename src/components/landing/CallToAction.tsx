
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface CallToActionProps {
  onGetStarted: () => void;
}

export const CallToAction = ({ onGetStarted }: CallToActionProps) => {
  return (
    <div className="text-center bg-primary-50 rounded-2xl p-12">
      <h2 className="text-3xl font-bold text-primary-900 mb-4">
        Ready to Optimize Your Partnerships?
      </h2>
      <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
        Start adding your potential partners and let our AI help you make data-driven partnership decisions.
      </p>
      <Button 
        size="lg" 
        className="gap-2"
        onClick={onGetStarted}
      >
        Get Started Now <ArrowRight className="h-5 w-5" />
      </Button>
    </div>
  );
};
