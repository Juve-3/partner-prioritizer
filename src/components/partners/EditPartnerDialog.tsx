
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PartnerFormFields } from "./PartnerFormFields";
import { PartnerDescriptionField } from "./PartnerDescriptionField";
import { ContactInfoFields } from "./ContactInfoFields";
import { PartnerFormActions } from "./PartnerFormActions";
import { type PartnerFormData } from "./types";

interface Partner {
  id: string;
  company_name: string;
  website: string | null;
  industry: string | null;
  status: 'potential' | 'active' | 'inactive' | 'archived';
  priority_score: number;
  description?: string;
  email?: string;
  linkedin?: string;
  instagram?: string;
  whatsapp?: string;
}

interface EditPartnerDialogProps {
  partner: Partner | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const EditPartnerDialog = ({
  partner,
  open,
  onOpenChange,
  onSuccess,
}: EditPartnerDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<PartnerFormData>({
    company_name: "",
    website: "",
    industry: "",
    status: "potential",
    priority_score: 0,
    description: "",
    email: "",
    linkedin: "",
    instagram: "",
    whatsapp: "",
  });

  useEffect(() => {
    if (partner) {
      setFormData({
        company_name: partner.company_name,
        website: partner.website || "",
        industry: partner.industry || "",
        status: partner.status,
        priority_score: partner.priority_score,
        description: partner.description || "",
        email: partner.email || "",
        linkedin: partner.linkedin || "",
        instagram: partner.instagram || "",
        whatsapp: partner.whatsapp || "",
      });
    }
  }, [partner]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partner) return;
    
    setLoading(true);

    try {
      const { error } = await supabase
        .from("partners")
        .update(formData)
        .eq("id", partner.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Partner updated successfully",
      });
      
      onSuccess();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update partner",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!partner) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Partner</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto pr-6 scrollbar-left">
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <PartnerFormFields 
              formData={formData} 
              setFormData={setFormData} 
            />

            <PartnerDescriptionField 
              formData={formData} 
              setFormData={setFormData} 
            />

            <ContactInfoFields 
              formData={formData} 
              setFormData={setFormData} 
            />

            <PartnerFormActions 
              loading={loading} 
              onCancel={() => onOpenChange(false)} 
              isCreating={false}
            />
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
