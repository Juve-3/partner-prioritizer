
import { Target } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-white/50 backdrop-blur-sm border-t mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Target className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl text-primary">PartnerPriority</span>
            </div>
            <p className="text-gray-600">
              Making partnership management smarter and more efficient.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Features</h3>
            <ul className="space-y-2 text-gray-600">
              <li>Partner Database</li>
              <li>AI Analysis</li>
              <li>Smart Outreach</li>
              <li>Analytics</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-gray-600">
              <li>Documentation</li>
              <li>API Reference</li>
              <li>Support</li>
              <li>Blog</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-gray-600">
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
              <li>Cookie Policy</li>
              <li>Contact Us</li>
            </ul>
          </div>
        </div>
        <div className="border-t mt-8 pt-8 text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} PartnerPriority. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
