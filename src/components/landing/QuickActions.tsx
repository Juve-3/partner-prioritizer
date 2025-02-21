
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Users, BarChart2, Mail, Target } from "lucide-react";

interface QuickActionsProps {
  onAddPartner: () => void;
  onViewAnalytics: () => void;
  onStartOutreach: () => void;
  onViewGoals: () => void;
}

export const QuickActions = ({
  onAddPartner,
  onViewAnalytics,
  onStartOutreach,
  onViewGoals,
}: QuickActionsProps) => {
  return (
    <Card className="p-8 mb-16">
      <h2 className="text-2xl font-semibold mb-6">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button 
          variant="outline" 
          className="h-auto py-4 flex flex-col gap-2"
          onClick={onAddPartner}
        >
          <Users className="h-6 w-6" />
          <span>Add Partner</span>
        </Button>
        <Button 
          variant="outline" 
          className="h-auto py-4 flex flex-col gap-2"
          onClick={onViewAnalytics}
        >
          <BarChart2 className="h-6 w-6" />
          <span>Analytics</span>
        </Button>
        <Button 
          variant="outline" 
          className="h-auto py-4 flex flex-col gap-2"
          onClick={onStartOutreach}
        >
          <Mail className="h-6 w-6" />
          <span>Messages</span>
        </Button>
        <Button 
          variant="outline" 
          className="h-auto py-4 flex flex-col gap-2"
          onClick={onViewGoals}
        >
          <Target className="h-6 w-6" />
          <span>Goals</span>
        </Button>
      </div>
    </Card>
  );
};
