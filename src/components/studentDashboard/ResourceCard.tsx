// components/lms/schedule/ResourceCard.tsx
import { FileText } from "lucide-react";

interface ResourceCardProps {
  title: string;
  type: string;
  added: string;
  size: string;
}

export default function ResourceCard({ title, type, added, size }: ResourceCardProps) {
  return (
    <div className="flex items-center justify-between border-b py-4">
      <div className="flex items-center space-x-4">
        <FileText className="text-blue-500" size={32} />
        <div>
          <h4 className="font-medium">{title}</h4>
          <p className="text-sm text-muted-foreground">{type} • {added}</p>
        </div>
      </div>
      <div className="text-sm text-muted-foreground">{size}</div>
    </div>
  );
}
