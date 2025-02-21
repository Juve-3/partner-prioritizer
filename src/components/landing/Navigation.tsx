
import { Button } from "@/components/ui/button";
import { LogOut, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface NavigationProps {
  isAuthenticated: boolean | null;
  onLogout: () => void;
}

export const Navigation = ({ isAuthenticated, onLogout }: NavigationProps) => {
  const navigate = useNavigate();

  return (
    <nav className="border-b bg-white/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl text-primary">PartnerPriority</span>
          </div>
          {isAuthenticated ? (
            <Button
              variant="outline"
              onClick={onLogout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => navigate('/auth')}
              className="gap-2"
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};
