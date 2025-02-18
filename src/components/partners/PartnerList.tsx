import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Brain } from "lucide-react";
import { useState } from "react";
import { EditPartnerDialog } from "./EditPartnerDialog";
import { DeletePartnerDialog } from "./DeletePartnerDialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface Partner {
  id: string;
  company_name: string;
  website: string | null;
  industry: string | null;
  status: 'potential' | 'active' | 'inactive' | 'archived';
  priority_score: number;
  description?: string | null;
  last_contact_date?: string | null;
  next_follow_up_date?: string | null;
  logo_url?: string | null;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  ai_analysis?: any;
  last_analysis_date?: string | null;
}

interface PartnerListProps {
  partners: Partner[];
  onRefresh: () => void;
}

export const PartnerList = ({ partners, onRefresh }: PartnerListProps) => {
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [deletingPartner, setDeletingPartner] = useState<Partner | null>(null);
  const [analyzingPartnerId, setAnalyzingPartnerId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAnalyzePartner = async (partner: Partner) => {
    setAnalyzingPartnerId(partner.id);
    
    try {
      const { data, error } = await supabase.functions.invoke('analyze-partner', {
        body: {
          partnerId: partner.id,
          companyName: partner.company_name,
          website: partner.website,
          industry: partner.industry,
          description: partner.description,
          status: partner.status
        }
      });

      if (error) throw error;

      toast({
        title: "Analysis Complete",
        description: "Partner analysis has been updated successfully."
      });

      onRefresh();
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: error.message || "Failed to analyze partner data"
      });
    } finally {
      setAnalyzingPartnerId(null);
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company Name</TableHead>
            <TableHead>Industry</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority Score</TableHead>
            <TableHead>Website</TableHead>
            <TableHead className="w-[150px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {partners.map((partner) => (
            <TableRow key={partner.id}>
              <TableCell className="font-medium">
                <div>
                  {partner.company_name}
                  {partner.ai_analysis && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Last analyzed: {new Date(partner.last_analysis_date!).toLocaleDateString()}
                    </div>
                  )}
                </div>
                {partner.ai_analysis && (
                  <div className="mt-2 text-sm text-muted-foreground bg-muted p-2 rounded-md">
                    {partner.ai_analysis.analysis}
                  </div>
                )}
              </TableCell>
              <TableCell>{partner.industry || '-'}</TableCell>
              <TableCell>
                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                  ${
                    partner.status === 'active' ? 'bg-green-100 text-green-800' :
                    partner.status === 'potential' ? 'bg-blue-100 text-blue-800' :
                    partner.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                  {partner.status}
                </div>
              </TableCell>
              <TableCell>{partner.priority_score}</TableCell>
              <TableCell>
                {partner.website ? (
                  <a 
                    href={partner.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Visit
                  </a>
                ) : '-'}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAnalyzePartner(partner)}
                    disabled={analyzingPartnerId === partner.id}
                  >
                    <Brain className={`h-4 w-4 ${analyzingPartnerId === partner.id ? 'animate-pulse' : ''}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingPartner(partner)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeletingPartner(partner)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <EditPartnerDialog
        partner={editingPartner}
        open={!!editingPartner}
        onOpenChange={(open) => !open && setEditingPartner(null)}
        onSuccess={() => {
          setEditingPartner(null);
          onRefresh();
        }}
      />

      <DeletePartnerDialog
        partner={deletingPartner}
        open={!!deletingPartner}
        onOpenChange={(open) => !open && setDeletingPartner(null)}
        onSuccess={() => {
          setDeletingPartner(null);
          onRefresh();
        }}
      />
    </>
  );
};
