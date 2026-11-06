"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import InlineLoader from "@/components/shared/InlineLoader";
import { useUser } from "@/contexts/user-context";
import { CreatePartnerProposalAction, GetMyPartnerContractAction, GetMyPartnerProposalsAction, WithdrawPartnerProposalAction } from "@/server/partner";
import { GetServicesAction } from "@/server/service-catalog";
import { GetTutorApplicationsAction } from "@/server/tutor-application";
import { IService } from "@/types/service-catalog";
import { TutorApplication, TutorApplicationApplicant } from "@/types/tutor-application";
import { PARTNER_PROPOSAL_TYPE_LABEL, PartnerContract, PartnerProposal, PartnerProposalStatus, PartnerProposalType } from "@/types/partner";

const CURRENCIES = ["NGN", "USD", "GBP", "EUR", "CAD", "GHS", "ZAR", "KES", "ZMW", "TZS", "UGX", "RWF", "XOF", "AED", "INR"];

const STATUS_STYLE: Record<PartnerProposalStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  APPROVED: "bg-green-100 text-green-700",
  IMPLEMENTED: "bg-blue-100 text-blue-700",
  REJECTED: "bg-red-100 text-red-700",
  WITHDRAWN: "bg-gray-100 text-gray-600",
};
const STATUS_LABEL: Record<PartnerProposalStatus, string> = {
  PENDING: "Waiting for STC",
  APPROVED: "Approved - STC will put it into effect",
  IMPLEMENTED: "Done",
  REJECTED: "Not approved",
  WITHDRAWN: "Withdrawn",
};

const num = (v: string) => (v.trim() === "" ? undefined : Number(v));

// What a partner may ask STC for. Nothing here changes anything by itself - STC approves, then carries it out.
export default function PartnerProposalsPage() {
  const { hodAssignment } = useUser();
  const [contract, setContract] = useState<PartnerContract | null | undefined>(undefined);
  const [proposals, setProposals] = useState<PartnerProposal[]>([]);
  const [services, setServices] = useState<IService[]>([]);
  const [applications, setApplications] = useState<TutorApplication[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const [type, setType] = useState<PartnerProposalType>("TUTOR");
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [service, setService] = useState("");
  const [country, setCountry] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [currentPrice, setCurrentPrice] = useState("");
  const [proposedPrice, setProposedPrice] = useState("");
  const [discountType, setDiscountType] = useState<"PERCENT" | "FIXED">("PERCENT");
  const [discountValue, setDiscountValue] = useState("");
  const [maxRedemptions, setMaxRedemptions] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [code, setCode] = useState("");
  const [outline, setOutline] = useState("");
  const [applicationId, setApplicationId] = useState("");
  const [recommendation, setRecommendation] = useState<"APPROVE" | "REJECT">("APPROVE");

  const load = useCallback(async () => {
    const [c] = await GetMyPartnerContractAction();
    setContract(c?.data ?? null);
    const [p, pErr] = await GetMyPartnerProposalsAction();
    if (pErr) toast.error(pErr);
    setProposals(p?.data ?? []);
  }, []);

  useEffect(() => {
    queueMicrotask(load);
    GetServicesAction().then(([res]) => setServices(res?.data ?? []));
    GetTutorApplicationsAction().then(([res]) => setApplications(res?.data ?? []));
  }, [load]);

  const scopes = hodAssignment?.hodScopes ?? [];
  const countries = useMemo(() => Array.from(new Set(scopes.flatMap((s) => s.countries ?? []))), [scopes]);
  // A scope with no service reaches every service; otherwise only the services the partner's scopes name.
  const serviceOptions = useMemo(() => {
    if (scopes.some((s) => !s.service)) return services.map((s) => s.serviceName);
    return Array.from(new Set(scopes.map((s) => s.service as string)));
  }, [scopes, services]);

  const operating = contract?.effectiveStatus === "ACTIVE";
  const businessTypes: PartnerProposalType[] = ["PRICING", "PROMOTION", "CURRICULUM"];
  const typeLocked = (t: PartnerProposalType) => businessTypes.includes(t) && !operating;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    let payload: Record<string, unknown> = {};
    if (type === "PRICING") payload = { currency, proposedPrice: num(proposedPrice), ...(num(currentPrice) !== undefined ? { currentPrice: num(currentPrice) } : {}) };
    if (type === "PROMOTION")
      payload = {
        discountType,
        discountValue: num(discountValue),
        ...(num(maxRedemptions) !== undefined ? { maxRedemptions: num(maxRedemptions) } : {}),
        ...(expiresAt ? { expiresAt } : {}),
        ...(code.trim() ? { code: code.trim() } : {}),
      };
    if (type === "CURRICULUM") payload = { outline };
    if (type === "TUTOR") payload = { applicationId, recommendation };

    setIsSaving(true);
    const [, error] = await CreatePartnerProposalAction({ type, title, details, service: service || undefined, country: country || undefined, payload });
    setIsSaving(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Sent to STC");
    setTitle("");
    setDetails("");
    setProposedPrice("");
    setCurrentPrice("");
    setDiscountValue("");
    setOutline("");
    load();
  };

  const withdraw = async (id: string) => {
    const [, error] = await WithdrawPartnerProposalAction(id);
    if (error) toast.error(error);
    load();
  };

  if (contract === undefined) return <InlineLoader />;
  if (!contract || contract.locked) {
    return (
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-gray-900">Proposals</h1>
        <p className="text-sm text-gray-500">Proposals are for partners with an active contract.</p>
        <Link href="/lms-home/admin/partner" className="text-sm text-blue-600 underline">
          Back to Partner
        </Link>
      </div>
    );
  }

  const field = "w-full border border-gray-300 rounded-md px-3 py-2 text-sm";

  return (
    <div className="space-y-6">
      <div>
        <Link href="/lms-home/admin/partner" className="text-sm text-blue-600 underline">
          Back to Partner
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900 mt-1">Proposals to STC</h1>
        <p className="text-sm text-gray-500 mt-1">
          STC decides every proposal and carries out the ones it approves - nothing changes by itself.
          {!operating && " Pricing, promotion and curriculum proposals open once you pass probation; tutor recommendations are open now."}
        </p>
      </div>

      <form onSubmit={submit} className="bg-white rounded-xl shadow-sm p-5 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="text-sm text-gray-700 space-y-1">
            <span>Type</span>
            <select value={type} onChange={(e) => setType(e.target.value as PartnerProposalType)} className={field}>
              {(Object.keys(PARTNER_PROPOSAL_TYPE_LABEL) as PartnerProposalType[]).map((t) => (
                <option key={t} value={t} disabled={typeLocked(t)}>
                  {PARTNER_PROPOSAL_TYPE_LABEL[t]}
                  {typeLocked(t) ? " (after probation)" : ""}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-gray-700 space-y-1">
            <span>Title</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={160} required className={field} />
          </label>
          {type !== "TUTOR" && (
            <label className="text-sm text-gray-700 space-y-1">
              <span>Service{type === "PRICING" || type === "CURRICULUM" ? " *" : ""}</span>
              <select value={service} onChange={(e) => setService(e.target.value)} required={type === "PRICING" || type === "CURRICULUM"} className={field}>
                <option value="">{type === "PROMOTION" ? "All my services" : "Choose..."}</option>
                {serviceOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          )}
          {type !== "TUTOR" && countries.length > 0 && (
            <label className="text-sm text-gray-700 space-y-1">
              <span>Country</span>
              <select value={country} onChange={(e) => setCountry(e.target.value)} className={field}>
                <option value="">{countries.length === 1 ? countries[0] : "Choose..."}</option>
                {countries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>

        {type === "PRICING" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className="text-sm text-gray-700 space-y-1">
              <span>Currency</span>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={field}>
                {CURRENCIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className="text-sm text-gray-700 space-y-1">
              <span>Current price (optional)</span>
              <input type="number" min={0} value={currentPrice} onChange={(e) => setCurrentPrice(e.target.value)} className={field} />
            </label>
            <label className="text-sm text-gray-700 space-y-1">
              <span>Price you propose *</span>
              <input type="number" min={0} value={proposedPrice} onChange={(e) => setProposedPrice(e.target.value)} required className={field} />
            </label>
          </div>
        )}

        {type === "PROMOTION" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className="text-sm text-gray-700 space-y-1">
              <span>Discount type</span>
              <select value={discountType} onChange={(e) => setDiscountType(e.target.value as "PERCENT" | "FIXED")} className={field}>
                <option value="PERCENT">Percentage (max {contract.maxDiscountPercent}%)</option>
                <option value="FIXED">Fixed amount</option>
              </select>
            </label>
            <label className="text-sm text-gray-700 space-y-1">
              <span>Discount *</span>
              <input type="number" min={0} value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} required className={field} />
            </label>
            <label className="text-sm text-gray-700 space-y-1">
              <span>Most uses (optional)</span>
              <input type="number" min={1} value={maxRedemptions} onChange={(e) => setMaxRedemptions(e.target.value)} className={field} />
            </label>
            <label className="text-sm text-gray-700 space-y-1">
              <span>Ends on (optional)</span>
              <input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className={field} />
            </label>
            <label className="text-sm text-gray-700 space-y-1">
              <span>Code you suggest (optional)</span>
              <input value={code} onChange={(e) => setCode(e.target.value)} maxLength={64} className={field} />
            </label>
          </div>
        )}

        {type === "CURRICULUM" && (
          <label className="text-sm text-gray-700 space-y-1 block">
            <span>Outline of the course or programme (optional)</span>
            <textarea value={outline} onChange={(e) => setOutline(e.target.value)} rows={4} className={field} />
          </label>
        )}

        {type === "TUTOR" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="text-sm text-gray-700 space-y-1">
              <span>Tutor application *</span>
              <select value={applicationId} onChange={(e) => setApplicationId(e.target.value)} required className={field}>
                <option value="">Choose...</option>
                {applications.map((a) => {
                  const who = typeof a.user === "object" ? (a.user as TutorApplicationApplicant) : null;
                  return (
                    <option key={a.id} value={a.id}>
                      {who ? `${who.firstName} ${who.lastName}` : a.id} - {a.status}
                    </option>
                  );
                })}
              </select>
            </label>
            <label className="text-sm text-gray-700 space-y-1">
              <span>Your recommendation</span>
              <select value={recommendation} onChange={(e) => setRecommendation(e.target.value as "APPROVE" | "REJECT")} className={field}>
                <option value="APPROVE">Approve this tutor</option>
                <option value="REJECT">Reject this tutor</option>
              </select>
            </label>
          </div>
        )}

        <label className="text-sm text-gray-700 space-y-1 block">
          <span>Reasoning *</span>
          <textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={4} maxLength={5000} required className={field} />
        </label>
        <button type="submit" disabled={isSaving} className="bg-[#0a7ac2] text-white px-5 py-2 rounded-md text-sm hover:bg-indigo-700 disabled:opacity-60">
          {isSaving ? "Sending..." : "Send to STC"}
        </button>
      </form>

      <section className="space-y-3">
        <h2 className="font-semibold text-gray-900">My proposals</h2>
        {proposals.length === 0 ? (
          <p className="text-sm text-gray-500">None yet.</p>
        ) : (
          proposals.map((p) => (
            <div key={p.id} className="bg-white rounded-xl shadow-sm p-4 space-y-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-gray-900">{p.title}</p>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[p.status]}`}>{STATUS_LABEL[p.status]}</span>
              </div>
              <p className="text-xs text-gray-500">
                {PARTNER_PROPOSAL_TYPE_LABEL[p.type]}
                {p.service ? ` - ${p.service}` : ""}
                {p.country ? ` - ${p.country}` : ""} - {new Date(p.createdAt).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{p.details}</p>
              {p.decisionNote && <p className="text-sm text-gray-600">STC: {p.decisionNote}</p>}
              {p.status === "PENDING" && (
                <button onClick={() => withdraw(p.id)} className="text-xs text-red-600 underline">
                  Withdraw
                </button>
              )}
            </div>
          ))
        )}
      </section>
    </div>
  );
}
