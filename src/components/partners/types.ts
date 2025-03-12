
export type PartnerStatus = 'potential' | 'active' | 'inactive' | 'archived';

export interface PartnerFormData {
  company_name: string;
  website: string;
  industry: string;
  status: PartnerStatus;
  priority_score: number;
  description: string;
  email: string;
  linkedin: string;
  instagram: string;
  whatsapp: string;
}

export interface CreatePartnerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}
