export function Field({ label, value }: { label: string; value: React.ReactNode }) {
  if (value === undefined || value === null) return null;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-3 py-1.5 border-b border-gray-100 last:border-0">
      <dt className="text-xs font-medium text-gray-500 sm:col-span-1">{label}</dt>
      <dd className="text-sm text-gray-900 sm:col-span-2 break-words">{value}</dd>
    </div>
  );
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border rounded-md p-3">
      <h4 className="text-sm font-semibold text-gray-800 mb-1">{title}</h4>
      <dl>{children}</dl>
    </div>
  );
}
