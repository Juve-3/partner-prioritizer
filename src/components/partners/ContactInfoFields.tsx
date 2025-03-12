
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type PartnerFormData } from "@/components/partners/types";

interface ContactInfoFieldsProps {
  formData: PartnerFormData;
  setFormData: (formData: PartnerFormData) => void;
}

export const ContactInfoFields = ({
  formData,
  setFormData,
}: ContactInfoFieldsProps) => {
  return (
    <div className="border-t pt-4 mt-4">
      <h3 className="font-medium mb-3">Contact Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            placeholder="contact@company.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="linkedin">LinkedIn Profile</Label>
          <Input
            id="linkedin"
            value={formData.linkedin}
            onChange={(e) =>
              setFormData({ ...formData, linkedin: e.target.value })
            }
            placeholder="https://linkedin.com/in/..."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="instagram">Instagram Handle</Label>
          <Input
            id="instagram"
            value={formData.instagram}
            onChange={(e) =>
              setFormData({ ...formData, instagram: e.target.value })
            }
            placeholder="@handle"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="whatsapp">WhatsApp Number</Label>
          <Input
            id="whatsapp"
            value={formData.whatsapp}
            onChange={(e) =>
              setFormData({ ...formData, whatsapp: e.target.value })
            }
            placeholder="+1234567890"
          />
        </div>
      </div>
    </div>
  );
};
