
import { Button } from "@/components/ui/button";

interface PartnerFormActionsProps {
  loading: boolean;
  onCancel: () => void;
  isCreating?: boolean;
}

export const PartnerFormActions = ({
  loading,
  onCancel,
  isCreating = true,
}: PartnerFormActionsProps) => {
  return (
    <div className="flex justify-end gap-2 pt-2">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
      >
        Cancel
      </Button>
      <Button type="submit" disabled={loading}>
        {loading 
          ? (isCreating ? "Creating..." : "Saving...") 
          : (isCreating ? "Create Partner" : "Save Changes")}
      </Button>
    </div>
  );
};
