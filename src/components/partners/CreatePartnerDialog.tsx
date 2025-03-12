
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PartnerFormFields } from "./PartnerFormFields";
import { PartnerDescriptionField } from "./PartnerDescriptionField";
import { ContactInfoFields } from "./ContactInfoFields";
import { PartnerFormActions } from "./PartnerFormActions";
import { type PartnerFormData, type CreatePartnerDialogProps } from "./types";

export const CreatePartnerDialog = ({
  open,
  onOpenChange,
  onSuccess,
}: CreatePartnerDialogProps) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user?.id) {
        throw new Error("No authenticated user");
      }

      const { error } = await supabase
        .from("partners")
        .insert({
          ...formData,
          user_id: session.user.id,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Partner created successfully",
      });
      
      onSuccess();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create partner",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Add New Partner</DialogTitle>
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
              isCreating={true}
            />
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
