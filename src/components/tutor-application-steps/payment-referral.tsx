"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AsyncSearchableCombobox } from "@/components/ui/async-searchable-combobox";
import { useTutorApplication } from "@/contexts/tutor-application-context";
import { PAYOUT_METHOD_LABELS, PayoutMethod, TutorApplicationStep9Payload } from "@/types/tutor-application";

interface StepProps {
  onNext: (errors: Record<string, string>, data?: TutorApplicationStep9Payload) => void;
  errors: Record<string, string>;
}

export default function PaymentReferralStep({ onNext, errors }: StepProps) {
  const { draft, searchReferringTutors } = useTutorApplication();

  const [payoutMethod, setPayoutMethod] = useState<PayoutMethod | "">(draft.step9.payoutMethod || "");
  const [bankName, setBankName] = useState(draft.step9.bankName || "");
  const [accountNumber, setAccountNumber] = useState(draft.step9.accountNumber || "");
  const [accountName, setAccountName] = useState(draft.step9.accountName || "");
  const [wasReferred, setWasReferred] = useState<boolean | undefined>(draft.step9.wasReferred);
  const [referringTutorId, setReferringTutorId] = useState(draft.step9.referringTutorId || "");
  const [referringTutorLabel, setReferringTutorLabel] = useState("");

  const isBankTransfer = payoutMethod === PayoutMethod.BANK_TRANSFER_NIGERIA;

  useEffect(() => {
    const handleValidation = () => {
      const stepErrors: Record<string, string> = {};

      if (!payoutMethod) stepErrors.payoutMethod = "Please select a preferred payout method";
      if (isBankTransfer) {
        if (!bankName.trim()) stepErrors.bankName = "Bank name is required";
        if (!accountNumber.trim()) stepErrors.accountNumber = "Account number is required";
        if (!accountName.trim()) stepErrors.accountName = "Account holder name is required";
      }
      if (wasReferred === undefined) stepErrors.wasReferred = "Please answer this question";
      if (wasReferred && !referringTutorId) {
        stepErrors.referringTutorId = "Please search for and select the referring tutor";
      }

      if (Object.keys(stepErrors).length === 0) {
        onNext(stepErrors, {
          payoutMethod: payoutMethod as PayoutMethod,
          bankName: isBankTransfer ? bankName : undefined,
          accountNumber: isBankTransfer ? accountNumber : undefined,
          accountName: isBankTransfer ? accountName : undefined,
          wasReferred: wasReferred as boolean,
          referringTutorId: wasReferred ? referringTutorId : undefined,
        });
      } else {
        onNext(stepErrors);
      }
    };

    window.addEventListener("validateStep", handleValidation);
    return () => window.removeEventListener("validateStep", handleValidation);
  }, [payoutMethod, bankName, accountNumber, accountName, wasReferred, referringTutorId, isBankTransfer, onNext]);

  return (
    <div className="space-y-6 w-full">
      <Card>
        <CardHeader>
          <CardTitle>Payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="payoutMethod">Preferred Payout Method *</Label>
            <Select value={payoutMethod} onValueChange={(v) => setPayoutMethod(v as PayoutMethod)}>
              <SelectTrigger id="payoutMethod" className={errors.payoutMethod ? "border-red-500" : ""}>
                <SelectValue placeholder="Select a payout method" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(PayoutMethod).map((method) => (
                  <SelectItem key={method} value={method}>
                    {PAYOUT_METHOD_LABELS[method]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.payoutMethod && <p className="text-red-600 text-sm">{errors.payoutMethod}</p>}
          </div>

          {isBankTransfer && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name *</Label>
                <Input id="bankName" value={bankName} onChange={(e) => setBankName(e.target.value)} className={errors.bankName ? "border-red-500" : ""} />
                {errors.bankName && <p className="text-red-600 text-sm">{errors.bankName}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number *</Label>
                <Input id="accountNumber" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} className={errors.accountNumber ? "border-red-500" : ""} />
                {errors.accountNumber && <p className="text-red-600 text-sm">{errors.accountNumber}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountName">Account Holder Name *</Label>
                <Input id="accountName" value={accountName} onChange={(e) => setAccountName(e.target.value)} className={errors.accountName ? "border-red-500" : ""} />
                {errors.accountName && <p className="text-red-600 text-sm">{errors.accountName}</p>}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Referral</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Were you referred by an existing STC tutor or staff member? *</Label>
            <RadioGroup
              value={wasReferred === undefined ? "" : wasReferred ? "yes" : "no"}
              onValueChange={(v) => {
                setWasReferred(v === "yes");
                if (v === "no") {
                  setReferringTutorId("");
                  setReferringTutorLabel("");
                }
              }}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="wasReferredYes" />
                <Label htmlFor="wasReferredYes" className="font-normal cursor-pointer">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="wasReferredNo" />
                <Label htmlFor="wasReferredNo" className="font-normal cursor-pointer">No</Label>
              </div>
            </RadioGroup>
            {errors.wasReferred && <p className="text-red-600 text-sm">{errors.wasReferred}</p>}
          </div>

          {wasReferred && (
            <div className="space-y-2">
              <Label>Referring Tutor *</Label>
              <AsyncSearchableCombobox
                value={referringTutorId}
                selectedLabel={referringTutorLabel}
                onChange={(value, label) => {
                  setReferringTutorId(value);
                  setReferringTutorLabel(label);
                }}
                onSearch={async (query) => {
                  const results = await searchReferringTutors(query);
                  return results.map((t) => ({ value: t.id, label: `${t.firstName} ${t.lastName}` }));
                }}
                placeholder="Search by name..."
              />
              {errors.referringTutorId && <p className="text-red-600 text-sm">{errors.referringTutorId}</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
