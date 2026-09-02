"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchableCombobox } from "@/components/ui/searchable-combobox";
import { useUser } from "@/contexts/user-context";
import { ConfirmEnrollmentAction, GetEnrollmentAction, RejectEnrollmentAction } from "@/server/enrollment";
import { VerifyPaymentAction } from "@/server/payment";
import { GetTaxonomyOptionsAction } from "@/server/taxonomy-option";
import { ITaxonomyOption, TaxonomyOptionKind } from "@/types/service-catalog";
import { IServiceDetails, ISchedule } from "@/types/student";
import { UserRole } from "@/types/user";
import { ToastError, ToastSuccess } from "@/components/ui/custom/toast";

export default function CompleteProfileForm({ studentId, dashboardPath }: { studentId: string; dashboardPath: string }) {
  const router = useRouter();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [phone, setPhone] = useState("");
  const [countryOfResidence, setCountryOfResidence] = useState("");
  const [primaryLanguage, setPrimaryLanguage] = useState("English");
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [countries, setCountries] = useState<ITaxonomyOption[]>([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(true);
  const [serviceDetails, setServiceDetails] = useState<IServiceDetails | undefined>(undefined);
  const [schedule, setSchedule] = useState<ISchedule[] | undefined>(undefined);
  const [requiresPayment, setRequiresPayment] = useState(false);

  const isSelfEnrolling = user?.role === UserRole.STUDENT;

  useEffect(() => {
    GetTaxonomyOptionsAction(TaxonomyOptionKind.COUNTRY).then(([res]) => {
      setCountries(res?.data ?? []);
      setIsLoadingCountries(false);
    });
  }, []);

  useEffect(() => {
    (async () => {
      const [res, err] = await GetEnrollmentAction(studentId);
      if (err || !res?.data) {
        setError(err || "Could not load this record");
        setIsLoading(false);
        return;
      }
      const s = res.data;
      setFullName(s.fullName || "");
      setGender(s.gender || "");
      setDateOfBirth(s.dateOfBirth ? new Date(s.dateOfBirth).toISOString().slice(0, 10) : "");
      setPhone(s.phone || "");
      setCountryOfResidence(s.countryOfResidence || "");
      setPrimaryLanguage(s.primaryLanguage || "English");
      setParentName(s.parentName || "");
      setParentPhone(s.parentPhone || "");
      setParentEmail(s.parentEmail || "");
      // Only present on a full registration an admin completed on your
      // behalf (StudentService.createFullRegistrationByAdmin) - a bare stub
      // has no serviceDetails yet, that's still up to you to fill in later.
      setServiceDetails(s.serviceDetails);
      setSchedule(s.schedule);
      setRequiresPayment(!!s.adminRegistrationRequiresPayment);
      setIsLoading(false);
    })();
  }, [studentId]);

  const handleConfirm = async () => {
    if (!fullName || !gender || !dateOfBirth || !countryOfResidence || !primaryLanguage) {
      setError("Please fill in every required field");
      return;
    }
    if (isSelfEnrolling && (!parentName || !parentPhone || !parentEmail)) {
      setError("Parent/guardian details are required");
      return;
    }

    setIsSaving(true);
    setError(null);
    const [res, err] = await ConfirmEnrollmentAction(studentId, {
      fullName,
      gender,
      dateOfBirth: new Date(dateOfBirth),
      phone,
      countryOfResidence,
      primaryLanguage,
      ...(isSelfEnrolling ? { parentName, parentPhone, parentEmail } : {}),
    });
    setIsSaving(false);
    if (err || !res?.data) {
      setError(err || "Could not confirm this enrollment");
      return;
    }

    const { payment } = res.data;
    if (!payment) {
      router.push(dashboardPath);
      return;
    }

    // A full registration where the admin required payment - same checkout
    // flow as finishing the self-service wizard (enrollment-flow.tsx).
    const { default: PaystackPop } = await import("@paystack/inline-js");
    const popup = new PaystackPop();
    popup.resumeTransaction(payment.access_code, {
      onSuccess: async () => {
        await VerifyPaymentAction(payment.reference);
        ToastSuccess("Payment successful - enrollment complete");
        router.push(dashboardPath);
      },
      onCancel: () => {
        ToastError("Payment was not completed. You can finish it anytime from Payment History.");
        router.push(dashboardPath);
      },
      onError: (paystackError: { message?: string }) => {
        ToastError(paystackError?.message || "Payment failed. Please try again.");
      },
    });
  };

  const handleReject = async () => {
    if (!confirm("This will cancel the record an admin added for you. Continue?")) return;
    setIsSaving(true);
    await RejectEnrollmentAction(studentId, "Rejected by owner during profile completion");
    setIsSaving(false);
    router.push(dashboardPath);
  };

  if (isLoading) return <p className="text-sm text-gray-500">Loading...</p>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold">Confirm your details</h1>
        <p className="text-sm text-gray-600 mt-1">
          An admin started this enrollment for you. Please review and complete the remaining details.
        </p>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {serviceDetails?.serviceType && (
        <Card>
          <CardHeader>
            <CardTitle>Service &amp; Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p><span className="font-medium">Service:</span> {serviceDetails.serviceType}</p>
            {serviceDetails.selectedSubjects && serviceDetails.selectedSubjects.length > 0 && (
              <p><span className="font-medium">Subjects:</span> {serviceDetails.selectedSubjects.join(", ")}</p>
            )}
            {requiresPayment && !!serviceDetails.totalCost && (
              <p><span className="font-medium">Cost:</span> {serviceDetails.totalCost.toLocaleString()}</p>
            )}
            {schedule && schedule.length > 0 && (
              <div>
                <span className="font-medium">Schedule:</span>
                <ul className="list-disc list-inside mt-1">
                  {schedule.map((s, i) => (
                    <li key={i}>{s.subject}: {s.days.join(", ")} at {s.time} ({s.duration} min)</li>
                  ))}
                </ul>
              </div>
            )}
            <p className="pt-2 border-t">
              {requiresPayment ? (
                <>Confirming will take you to payment to complete this registration.</>
              ) : (
                <>This registration has been waived - confirming activates it immediately, no payment needed.</>
              )}
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{isSelfEnrolling ? "Your Information" : "Child Information"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth *</Label>
              <Input id="dateOfBirth" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="countryOfResidence">Country of Residence *</Label>
              <SearchableCombobox
                options={countries.map((c) => ({ value: c.value, label: c.label }))}
                value={countryOfResidence}
                onChange={setCountryOfResidence}
                placeholder={isLoadingCountries ? "Loading countries..." : "Select country"}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="primaryLanguage">Primary Teaching Language *</Label>
              <Select value={primaryLanguage} onValueChange={setPrimaryLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="English">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {isSelfEnrolling && (
        <Card>
          <CardHeader>
            <CardTitle>Parent/Guardian Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="parentName">Parent/Guardian Name *</Label>
                <Input id="parentName" value={parentName} onChange={(e) => setParentName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parentPhone">Parent/Guardian Phone *</Label>
                <Input id="parentPhone" value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="parentEmail">Parent/Guardian Email *</Label>
                <Input id="parentEmail" type="email" value={parentEmail} onChange={(e) => setParentEmail(e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        <Button onClick={handleConfirm} disabled={isSaving}>
          {isSaving ? "Saving..." : requiresPayment ? "Confirm & Pay" : "Confirm"}
        </Button>
        <Button variant="outline" onClick={handleReject} disabled={isSaving}>
          Reject
        </Button>
      </div>
    </div>
  );
}
