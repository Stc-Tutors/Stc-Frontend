// components/lms/schedule/ResourceCard.tsx
import { FileText } from "lucide-react";

interface ResourceCardProps {
  title: string;
  type: string;
  added: string;
  size: string;
  href?: string;
}

export default function ResourceCard({ title, type, added, size, href }: ResourceCardProps) {
  const content = (
    <>
      <div className="flex items-center space-x-4">
        <FileText className="text-blue-500" size={32} />
        <div>
          <h4 className="font-medium">{title}</h4>
          <p className="text-sm text-muted-foreground">{type} • {added}</p>
        </div>
      </div>
      <div className="text-sm text-muted-foreground">{size}</div>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-between border-b py-4 hover:bg-gray-50 transition-colors"
      >
        {content}
      </a>
    );
  }

  return <div className="flex items-center justify-between border-b py-4">{content}</div>;
}
