"use client";

import { useEffect, useState } from "react";
import { FolderOpen } from "lucide-react";
import { GetResourcesForMeAction, InitiateResourceUnlockAction } from "@/server/resource";
import { VerifyPaymentAction } from "@/server/payment";
import { CourseResource } from "@/types/resource";
import ResourcesTabs from "@/components/resources/ResourcesTabs";
import { ToastError, ToastSuccess } from "@/components/ui/custom/toast";

// Every resource visible to the current student/parent across all three
// target modes (course/subject/students) at once - see stcbe's
// ResourceService.getForLearner. Complements the per-course "Resources"
// section on the Classroom page (still the right place for a course's own
// materials); this is the one place a subject-wide or directly-targeted
// resource with no course of its own actually shows up. Shared between the
// student and parent areas - the backend already scopes /resources/for-me
// to whichever Students the logged-in account owns.
export default function MyResourcesView() {
  const [resources, setResources] = useState<CourseResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = async () => {
    setIsLoading(true);
    const [res, error] = await GetResourcesForMeAction();
    if (error) ToastError(error);
    setResources(res?.data ?? []);
    setIsLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleUnlockResource = async (resource: CourseResource) => {
    const [res, error] = await InitiateResourceUnlockAction(resource.id);
    if (error || !res?.data) {
      ToastError(error || "Could not start payment");
      return;
    }
    const { default: PaystackPop } = await import("@paystack/inline-js");
    const popup = new PaystackPop();
    popup.resumeTransaction(res.data.access_code, {
      onSuccess: async () => {
        await VerifyPaymentAction(res.data!.reference);
        ToastSuccess("Unlocked - reloading...");
        await load();
      },
      onCancel: () => {
        ToastError("Payment was not completed.");
      },
      onError: (error: any) => {
        ToastError(error?.message || "Payment failed. Please try again.");
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FolderOpen className="text-blue-500" />
        <h1 className="text-lg font-semibold text-gray-800">Resources</h1>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm">
        {isLoading ? (
          <p className="text-sm text-gray-500 py-4">Loading...</p>
        ) : (
          <ResourcesTabs resources={resources} onUnlock={handleUnlockResource} emptyMessage="No resources yet." />
        )}
      </div>
    </div>
  );
}
