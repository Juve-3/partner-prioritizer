
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Plus, RefreshCcw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PartnerList } from "@/components/partners/PartnerList";
import { CreatePartnerDialog } from "@/components/partners/CreatePartnerDialog";

// Define a type guard to validate partner status
const isValidStatus = (status: string): status is 'potential' | 'active' | 'inactive' | 'archived' => {
  return ['potential', 'active', 'inactive', 'archived'].includes(status);
};

export const Partners = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: partners, isLoading, refetch } = useQuery({
    queryKey: ['partners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .order('company_name', { ascending: true });
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load partners"
        });
        throw error;
      }
      
      // Transform and validate the data
      return data.map(partner => ({
        ...partner,
        status: isValidStatus(partner.status) ? partner.status : 'potential',
        priority_score: Number(partner.priority_score) || 0
      }));
    }
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Partner Management</h1>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => refetch()} className="gap-2">
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Partner
          </Button>
        </div>
      </div>

      <Card className="p-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : !partners?.length ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No partners yet</h3>
            <p className="text-gray-500 mb-4">Get started by adding your first partner</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>Add Partner</Button>
          </div>
        ) : (
          <PartnerList partners={partners} onRefresh={refetch} />
        )}
      </Card>

      <CreatePartnerDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={() => {
          refetch();
          setIsCreateDialogOpen(false);
        }}
      />
    </div>
  );
};

export default Partners;
