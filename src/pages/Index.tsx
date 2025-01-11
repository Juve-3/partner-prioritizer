import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, BarChart2, LogOut, Mail, Users } from "lucide-react";
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
    <div className="min-h-screen gradient-bg">
      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-end mb-4">
          <Button
            variant="outline"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-primary-900 mb-6">
            Prioritize Your Business Partnerships
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            AI-powered company analysis and outreach prioritization to help you
            make better partnership decisions.
          </p>
          <Button className="bg-primary hover:bg-primary-700 text-white px-8 py-6 text-lg rounded-full">
            Get Started <ArrowRight className="ml-2" />
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="glass-card p-6">
            <div className="mb-4">
              <BarChart2 className="w-12 h-12 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Smart Prioritization</h3>
            <p className="text-gray-600">
              AI-powered analysis to rank potential partners based on your criteria
            </p>
          </Card>

          <Card className="glass-card p-6">
            <div className="mb-4">
              <Mail className="w-12 h-12 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Email Generation</h3>
            <p className="text-gray-600">
              Personalized outreach templates tailored to each company
            </p>
          </Card>

          <Card className="glass-card p-6">
            <div className="mb-4">
              <Users className="w-12 h-12 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Team Collaboration</h3>
            <p className="text-gray-600">
              Work together with your team to manage partnerships effectively
            </p>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-primary-900 mb-4">
            Ready to Transform Your Partnership Strategy?
          </h2>
          <p className="text-gray-600 mb-8">
            Join thousands of businesses making smarter partnership decisions.
          </p>
          <Button
            variant="outline"
            className="text-primary border-primary hover:bg-primary hover:text-white"
          >
            Learn More
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;