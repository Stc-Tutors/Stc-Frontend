"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CampaignLead, GetCampaignLeadsAction } from "@/server/admin";

export default function AdminCampaignLeadsPage() {
  const [leads, setLeads] = useState<CampaignLead[]>([]);
  const [search, setSearch] = useState("");
  const [campaign, setCampaign] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const [res, err] = await GetCampaignLeadsAction();
      setLeads(res?.data ?? []);
      setError(err);
      setIsLoading(false);
    })();
  }, []);

  const campaigns = useMemo(() => Array.from(new Set(leads.map((l) => l.campaignSlug).filter(Boolean))) as string[], [leads]);

  const shown = leads.filter((l) => {
    if (campaign && l.campaignSlug !== campaign) return false;
    const q = search.trim().toLowerCase();
    return !q || [l.name, l.email, l.phone].some((v) => v?.toLowerCase().includes(q));
  });

  return (
    <div className="bg-white shadow rounded-2xl p-6">
      <h1 className="text-2xl font-bold mb-1">Campaign leads</h1>
      <p className="text-sm text-gray-500 mb-6">
        Parents who signed up from a campaign page (/go/...) but have not completed a payment. Follow up with them. &quot;Started payment&quot; means they opened a payment and did not finish it.
      </p>

      <div className="flex flex-wrap gap-3 mb-4">
        <Input placeholder="Search name, email or phone..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        <select value={campaign} onChange={(e) => setCampaign(e.target.value)} className="border rounded-md px-3 py-2 text-sm bg-white">
          <option value="">All campaigns</option>
          {campaigns.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-500 py-4">Loading leads...</p>
      ) : error ? (
        <p className="text-sm text-red-600 py-4">{error}</p>
      ) : shown.length === 0 ? (
        <p className="text-sm text-gray-500 py-4">No unpaid campaign signups.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Campaign</TableHead>
              <TableHead>Signed up</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shown.map((l) => (
              <TableRow key={l.id}>
                <TableCell className="font-medium">{l.name}</TableCell>
                <TableCell className="text-sm text-gray-600">{l.email ? <a href={`mailto:${l.email}`} className="hover:underline">{l.email}</a> : "—"}</TableCell>
                <TableCell className="text-sm text-gray-600">{l.phone ? <a href={`tel:${l.phone}`} className="hover:underline">{l.phone}</a> : "—"}</TableCell>
                <TableCell className="text-sm text-gray-600">{l.campaignSlug ?? "Unknown (older signup)"}</TableCell>
                <TableCell className="text-sm text-gray-600">{new Date(l.signedUpAt).toLocaleString()}</TableCell>
                <TableCell>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${l.startedPayment ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-700"}`}>
                    {l.startedPayment ? "Started payment" : "Signed up only"}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
