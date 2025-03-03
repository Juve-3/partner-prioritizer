
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const businessFields = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Retail",
  "Manufacturing",
  "Real Estate",
  "Transportation",
  "Hospitality",
  "Entertainment",
  "Agriculture",
  "Energy",
  "Construction",
  "Marketing",
  "Legal Services",
  "Consulting",
  "Media",
  "Telecommunications",
  "Food & Beverage",
  "Fitness & Wellness",
  "Other"
];

export const BusinessProfileForm = ({ onSkip }: { onSkip?: () => void }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    business_name: "",
    business_email: "",
    business_field: "",
    business_description: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, business_field: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        throw new Error("No authenticated user found");
      }

      // Using updateTable method with explicit column names to avoid TypeScript errors
      const { error } = await supabase
        .from('profiles')
        .update({
          business_name: formData.business_name,
          business_email: formData.business_email,
          business_field: formData.business_field,
          business_description: formData.business_description,
          profile_completed: true
        } as any) // Type assertion to bypass TypeScript checks
        .eq('id', session.user.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your business information has been saved successfully.",
      });

      navigate("/");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update profile",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted">
      <Card className="w-full max-w-md p-6 md:p-8 max-h-[85vh] overflow-hidden flex flex-col">
        <div className="space-y-6 overflow-y-auto pr-6 scrollbar-left">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Tell us about your business</h1>
            <p className="text-muted-foreground mt-2">
              This information helps us tailor the experience to your needs
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="business_name">Business Name</Label>
              <Input
                id="business_name"
                name="business_name"
                value={formData.business_name}
                onChange={handleChange}
                placeholder="Enter your business name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_email">Business Email</Label>
              <Input
                id="business_email"
                name="business_email"
                type="email"
                value={formData.business_email}
                onChange={handleChange}
                placeholder="contact@yourbusiness.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_field">Business Field</Label>
              <Select
                value={formData.business_field}
                onValueChange={handleSelectChange}
              >
                <SelectTrigger id="business_field" className="w-full">
                  <SelectValue placeholder="Select a business field" />
                </SelectTrigger>
                <SelectContent className="max-h-80">
                  {businessFields.map((field) => (
                    <SelectItem key={field} value={field}>
                      {field}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_description">Business Description</Label>
              <Textarea
                id="business_description"
                name="business_description"
                value={formData.business_description}
                onChange={handleChange}
                placeholder="Briefly describe what your business does"
                rows={4}
              />
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
              {onSkip && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onSkip}
                  className="w-full sm:w-auto"
                >
                  Skip for now
                </Button>
              )}
              <Button 
                type="submit" 
                className="w-full sm:w-auto"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Information"}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};
