// components/lms/schedule/ResourceCard.tsx
import { FileText, Lock } from "lucide-react";

interface ResourceCardProps {
  title: string;
  type: string;
  added: string;
  size: string;
  href?: string;
  // When set, the file is withheld until unlocked (see stcbe's
  // ResourceService.getApprovedByCourse) - shows a lock + unlock button
  // instead of the normal open-in-new-tab link.
  locked?: { price: number; currency: string; onUnlock: () => void };
}

export default function ResourceCard({ title, type, added, size, href, locked }: ResourceCardProps) {
  const content = (
    <>
      <div className="flex items-center space-x-4">
        {locked ? <Lock className="text-amber-500" size={32} /> : <FileText className="text-blue-500" size={32} />}
        <div>
          <h4 className="font-medium">{title}</h4>
          <p className="text-sm text-muted-foreground">{type} • {added}</p>
        </div>
      </div>
      {locked ? (
        <button
          onClick={(e) => {
            e.preventDefault();
            locked.onUnlock();
          }}
          className="text-sm font-medium text-amber-600 hover:text-amber-700 whitespace-nowrap"
        >
          Unlock for {locked.currency} {locked.price}
        </button>
      ) : (
        <div className="text-sm text-muted-foreground">{size}</div>
      )}
    </>
  );

  if (locked) {
    return <div className="flex items-center justify-between border-b py-4">{content}</div>;
  }

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
