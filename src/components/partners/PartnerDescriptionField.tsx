
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { type PartnerFormData } from "@/components/partners/types";

interface PartnerDescriptionFieldProps {
  formData: PartnerFormData;
  setFormData: (formData: PartnerFormData) => void;
}

export const PartnerDescriptionField = ({
  formData,
  setFormData,
}: PartnerDescriptionFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="description">Description</Label>
      <Textarea
        id="description"
        value={formData.description}
        onChange={(e) =>
          setFormData({ ...formData, description: e.target.value })
        }
        rows={3}
      />
    </div>
  );
};
