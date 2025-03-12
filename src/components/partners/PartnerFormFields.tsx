
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type PartnerStatus, type PartnerFormData } from "@/components/partners/types";

interface PartnerFormFieldsProps {
  formData: PartnerFormData;
  setFormData: (formData: PartnerFormData) => void;
}

export const PartnerFormFields = ({
  formData,
  setFormData,
}: PartnerFormFieldsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="company_name">Company Name *</Label>
        <Input
          id="company_name"
          required
          value={formData.company_name}
          onChange={(e) =>
            setFormData({ ...formData, company_name: e.target.value })
          }
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          type="url"
          value={formData.website}
          onChange={(e) =>
            setFormData({ ...formData, website: e.target.value })
          }
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="industry">Industry</Label>
        <Input
          id="industry"
          value={formData.industry}
          onChange={(e) =>
            setFormData({ ...formData, industry: e.target.value })
          }
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          value={formData.status}
          onValueChange={(value: PartnerStatus) =>
            setFormData({ ...formData, status: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="potential">Potential</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="priority_score">Priority Score</Label>
        <Input
          id="priority_score"
          type="number"
          min="0"
          max="100"
          value={formData.priority_score}
          onChange={(e) =>
            setFormData({
              ...formData,
              priority_score: parseInt(e.target.value) || 0,
            })
          }
        />
      </div>
    </div>
  );
};
