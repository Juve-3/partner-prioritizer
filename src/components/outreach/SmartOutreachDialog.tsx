
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { Loader2, Copy, CheckCircle } from "lucide-react";

interface SmartOutreachDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Platform = 'email' | 'linkedin' | 'instagram';

export const SmartOutreachDialog = ({
  open,
  onOpenChange,
}: SmartOutreachDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [platform, setPlatform] = useState<Platform>('email');
  const [prompt, setPrompt] = useState('');
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerateMessage = async () => {
    setLoading(true);
    try {
      const response = await fetch('/functions/v1/generate-outreach-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform,
          prompt,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to generate message');
      }

      const data = await response.json();
      setGeneratedMessage(data.message);
    } catch (error) {
      console.error('Error generating message:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to generate message. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedMessage);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Message copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
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
        </DialogHeader>

        <div className="space-y-4">
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
            disabled={loading || !prompt}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Message'
            )}
          </Button>

          {generatedMessage && (
            <div className="space-y-2">
              <Label>Generated Message</Label>
              <Textarea
                value={generatedMessage}
                readOnly
                rows={8}
                className="bg-muted"
              />
              <Button
                variant="outline"
                onClick={handleCopy}
                className="w-full gap-2"
              >
                {copied ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy to Clipboard
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
