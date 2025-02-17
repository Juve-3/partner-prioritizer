
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, BarChart2, LogOut, Mail, Users, Target, Building2, BrainCircuit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const { toast } = useToast();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
      {/* Navigation */}
      <nav className="border-b bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Target className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl text-primary">PartnerPriority</span>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16 max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-primary-900 mb-6">
            Smart Partnership Management Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Use AI-powered analysis to identify, prioritize, and manage your most valuable business partnerships.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" className="gap-2">
              Add New Partner <ArrowRight className="h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="gap-2">
              View Dashboard <BarChart2 className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Main Features */}
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
            <Button variant="ghost" className="w-full">View Partners</Button>
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
            <Button variant="ghost" className="w-full">Run Analysis</Button>
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
            <Button variant="ghost" className="w-full">Start Outreach</Button>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="p-8 mb-16">
          <h2 className="text-2xl font-semibold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
              <Users className="h-6 w-6" />
              <span>Add Partner</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
              <BarChart2 className="h-6 w-6" />
              <span>Analytics</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
              <Mail className="h-6 w-6" />
              <span>Messages</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
              <Target className="h-6 w-6" />
              <span>Goals</span>
            </Button>
          </div>
        </Card>

        {/* Get Started Section */}
        <div className="text-center bg-primary-50 rounded-2xl p-12">
          <h2 className="text-3xl font-bold text-primary-900 mb-4">
            Ready to Optimize Your Partnerships?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Start adding your potential partners and let our AI help you make data-driven partnership decisions.
          </p>
          <Button size="lg" className="gap-2">
            Get Started Now <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Index;
