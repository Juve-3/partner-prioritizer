
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Copy, CheckCircle, User, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface SmartOutreachDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Platform = 'email' | 'linkedin' | 'instagram';

interface Partner {
  id: string;
  company_name: string;
  industry?: string;
  description?: string;
}

interface GeneratedMessage {
  partnerId: string;
  message: string;
  isEditing: boolean;
}

export const SmartOutreachDialog = ({
  open,
  onOpenChange,
}: SmartOutreachDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [platform, setPlatform] = useState<Platform>('email');
  const [prompt, setPrompt] = useState('');
  const [selectedPartners, setSelectedPartners] = useState<Partner[]>([]);
  const [generatedMessages, setGeneratedMessages] = useState<GeneratedMessage[]>([]);
  const [copied, setCopied] = useState<Record<string, boolean>>({});

  // Fetch partners
  const { data: partners = [] } = useQuery({
    queryKey: ['partners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('partners')
        .select('id, company_name, industry, description');
      
      if (error) throw error;
      return data as Partner[];
    },
  });

  const handlePartnerSelect = (partnerId: string) => {
    const partner = partners.find(p => p.id === partnerId);
    if (!partner) return;

    setSelectedPartners(prev => {
      if (prev.length >= 3) {
        toast({
          title: "Maximum partners reached",
          description: "You can only select up to 3 partners",
          variant: "destructive"
        });
        return prev;
      }
      if (prev.find(p => p.id === partnerId)) return prev;
      return [...prev, partner];
    });
  };

  const handlePartnerRemove = (partnerId: string) => {
    setSelectedPartners(prev => prev.filter(p => p.id !== partnerId));
    setGeneratedMessages(prev => prev.filter(m => m.partnerId !== partnerId));
  };

  const handleGenerateMessage = async () => {
    if (selectedPartners.length === 0) {
      toast({
        title: "No partners selected",
        description: "Please select at least one partner",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const newMessages: GeneratedMessage[] = [];
      
      for (const partner of selectedPartners) {
        const { data, error } = await supabase.functions.invoke('generate-outreach-message', {
          body: {
            platform,
            prompt,
            partnerContext: {
              companyName: partner.company_name,
              industry: partner.industry,
              description: partner.description
            }
          },
        });

        if (error) throw error;
        if (!data?.message) throw new Error('No message generated');

        newMessages.push({
          partnerId: partner.id,
          message: data.message,
          isEditing: false
        });
      }

      setGeneratedMessages(newMessages);
    } catch (error) {
      console.error('Error generating messages:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to generate messages. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMessageEdit = (partnerId: string) => {
    setGeneratedMessages(prev =>
      prev.map(m => m.partnerId === partnerId ? { ...m, isEditing: true } : m)
    );
  };

  const handleMessageSave = (partnerId: string, newMessage: string) => {
    setGeneratedMessages(prev =>
      prev.map(m => m.partnerId === partnerId ? { ...m, message: newMessage, isEditing: false } : m)
    );
  };

  const handleCopy = async (partnerId: string, message: string) => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(prev => ({ ...prev, [partnerId]: true }));
      toast({
        title: "Copied!",
        description: "Message copied to clipboard",
      });
      setTimeout(() => {
        setCopied(prev => ({ ...prev, [partnerId]: false }));
      }, 2000);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to copy message",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Smart Outreach Message Generator</DialogTitle>
          <DialogDescription>
            Select up to 3 partners and generate personalized messages for each
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Select Partners (max 3)</Label>
            <Select onValueChange={handlePartnerSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a partner" />
              </SelectTrigger>
              <SelectContent>
                {partners.map(partner => (
                  <SelectItem
                    key={partner.id}
                    value={partner.id}
                    disabled={selectedPartners.length >= 3 && !selectedPartners.find(p => p.id === partner.id)}
                  >
                    {partner.company_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedPartners.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedPartners.map(partner => (
                  <div key={partner.id} className="flex items-center gap-2 bg-secondary p-2 rounded-md">
                    <User className="h-4 w-4" />
                    <span>{partner.company_name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePartnerRemove(partner.id)}
                      className="h-auto p-1"
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="platform">Select Platform</Label>
            <Select
              value={platform}
              onValueChange={(value: Platform) => setPlatform(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prompt">Outreach Goal & Context</Label>
            <Textarea
              id="prompt"
              placeholder="Describe your outreach goal and any specific details you'd like to include..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
            />
          </div>

          <Button
            onClick={handleGenerateMessage}
            disabled={loading || !prompt || selectedPartners.length === 0}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Messages'
            )}
          </Button>

          {generatedMessages.length > 0 && (
            <div className="space-y-4">
              {generatedMessages.map((msg) => {
                const partner = selectedPartners.find(p => p.id === msg.partnerId);
                if (!partner) return null;

                return (
                  <div key={msg.partnerId} className="space-y-2 border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <Label>{partner.company_name}</Label>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => msg.isEditing ? handleMessageSave(msg.partnerId, msg.message) : handleMessageEdit(msg.partnerId)}
                        >
                          {msg.isEditing ? 'Save' : <Edit className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopy(msg.partnerId, msg.message)}
                        >
                          {copied[msg.partnerId] ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <Textarea
                      value={msg.message}
                      onChange={(e) => {
                        if (msg.isEditing) {
                          setGeneratedMessages(prev =>
                            prev.map(m => m.partnerId === msg.partnerId ? { ...m, message: e.target.value } : m)
                          );
                        }
                      }}
                      readOnly={!msg.isEditing}
                      rows={6}
                      className={msg.isEditing ? "" : "bg-muted"}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
