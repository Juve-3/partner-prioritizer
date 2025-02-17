
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import { useState } from "react";
import { EditPartnerDialog } from "./EditPartnerDialog";
import { DeletePartnerDialog } from "./DeletePartnerDialog";

interface Partner {
  id: string;
  company_name: string;
  website: string | null;
  industry: string | null;
  status: 'potential' | 'active' | 'inactive' | 'archived';
  priority_score: number;
}

interface PartnerListProps {
  partners: Partner[];
  onRefresh: () => void;
}

export const PartnerList = ({ partners, onRefresh }: PartnerListProps) => {
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [deletingPartner, setDeletingPartner] = useState<Partner | null>(null);

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company Name</TableHead>
            <TableHead>Industry</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority Score</TableHead>
            <TableHead>Website</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {partners.map((partner) => (
            <TableRow key={partner.id}>
              <TableCell className="font-medium">{partner.company_name}</TableCell>
              <TableCell>{partner.industry || '-'}</TableCell>
              <TableCell>
                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                  ${
                    partner.status === 'active' ? 'bg-green-100 text-green-800' :
                    partner.status === 'potential' ? 'bg-blue-100 text-blue-800' :
                    partner.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                  {partner.status}
                </div>
              </TableCell>
              <TableCell>{partner.priority_score}</TableCell>
              <TableCell>
                {partner.website ? (
                  <a 
                    href={partner.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Visit
                  </a>
                ) : '-'}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingPartner(partner)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeletingPartner(partner)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <EditPartnerDialog
        partner={editingPartner}
        open={!!editingPartner}
        onOpenChange={(open) => !open && setEditingPartner(null)}
        onSuccess={() => {
          setEditingPartner(null);
          onRefresh();
        }}
      />

      <DeletePartnerDialog
        partner={deletingPartner}
        open={!!deletingPartner}
        onOpenChange={(open) => !open && setDeletingPartner(null)}
        onSuccess={() => {
          setDeletingPartner(null);
          onRefresh();
        }}
      />
    </>
  );
};
