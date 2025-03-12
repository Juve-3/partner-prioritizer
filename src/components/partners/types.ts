
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

export interface Partner {
  id: string;
  company_name: string;
  website: string | null;
  industry: string | null;
  status: PartnerStatus;
  priority_score: number;
  description?: string | null;
  email?: string | null;
  linkedin?: string | null;
  instagram?: string | null;
  whatsapp?: string | null;
  last_contact_date?: string | null;
  next_follow_up_date?: string | null;
  logo_url?: string | null;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  ai_analysis?: any;
  last_analysis_date?: string | null;
}

export interface EditPartnerDialogProps {
  partner: Partner | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}
