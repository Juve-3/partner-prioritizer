
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

const Settings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    business_name: "",
    business_email: "",
    business_field: "",
    business_description: "",
    username: "",
    email: ""
  });

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          throw new Error("No authenticated user found");
        }

        // Get user email from auth
        const userEmail = session.user.email;
        
        // Get profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*') // Select all fields to avoid TS errors
          .eq('id', session.user.id)
          .single();

        if (profileError) throw profileError;

        setProfileData({
          business_name: profileData.business_name || "",
          business_email: profileData.business_email || "",
          business_field: profileData.business_field || "",
          business_description: profileData.business_description || "",
          username: profileData.username || "",
          email: userEmail || ""
        });
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error loading profile",
          description: error.message,
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [toast]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setProfileData((prev) => ({ ...prev, business_field: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        throw new Error("No authenticated user found");
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          business_name: profileData.business_name,
          business_email: profileData.business_email,
          business_field: profileData.business_field,
          business_description: profileData.business_description,
          profile_completed: true
        } as any) // Type assertion to bypass TS check
        .eq('id', session.user.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your business information has been saved successfully.",
      });
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

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-primary">Loading...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Account Settings</h1>
        
        <Tabs defaultValue="business" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="business">Business Information</TabsTrigger>
            <TabsTrigger value="account">Account Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="business">
            <Card className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Business Profile</h2>
                  <p className="text-muted-foreground mb-6">
                    Update your business information
                  </p>
                </div>
                
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="business_name">Business Name</Label>
                    <Input
                      id="business_name"
                      name="business_name"
                      value={profileData.business_name}
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
                      value={profileData.business_email}
                      onChange={handleChange}
                      placeholder="contact@yourbusiness.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="business_field">Business Field</Label>
                  <Select
                    value={profileData.business_field}
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
                    value={profileData.business_description}
                    onChange={handleChange}
                    placeholder="Briefly describe what your business does"
                    rows={4}
                  />
                </div>

                <Button type="submit" className="w-full sm:w-auto" disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </Card>
          </TabsContent>
          
          <TabsContent value="account">
            <Card className="p-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Account Information</h2>
                <p className="text-muted-foreground mb-6">
                  View your account details
                </p>
              </div>
              
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={profileData.username}
                    readOnly
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    value={profileData.email}
                    readOnly
                    className="bg-muted"
                  />
                </div>
              </div>
              
              <div className="mt-6">
                <p className="text-sm text-muted-foreground">
                  To change your email address or password, please sign out and use the reset password option on the login page.
                </p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default Settings;
