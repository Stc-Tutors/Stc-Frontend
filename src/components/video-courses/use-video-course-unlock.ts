"use client";

import { useCallback, useEffect, useState } from "react";
import { GetMyUnlockedVideoCourseIdsAction, InitiateVideoCourseUnlockAction } from "@/server/video-course";
import { VerifyPaymentAction } from "@/server/payment";
import { ToastError, ToastSuccess } from "@/components/ui/custom/toast";
import { useUser } from "@/contexts/user-context";
import { UserRole } from "@/types/user";

// Shared by the recommended-cards panel and the "My Video Courses" page: which
// courses this family has unlocked, and the Paystack popup to unlock another.
// Only STUDENT/PARENT accounts can hold an unlock - anyone else (or nobody
// signed in) just sees no unlocked ids and no unlock button.
export function useVideoCourseUnlock() {
  const { user } = useUser();
  const canLearn = user?.role === UserRole.STUDENT || user?.role === UserRole.PARENT;
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());
  const [busyId, setBusyId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!canLearn) return;
    const [res] = await GetMyUnlockedVideoCourseIdsAction();
    setUnlockedIds(new Set(res?.data ?? []));
  }, [canLearn]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const unlock = useCallback(
    async (courseId: string, onDone?: () => void) => {
      setBusyId(courseId);
      const [res, error] = await InitiateVideoCourseUnlockAction(courseId);
      if (error || !res?.data) {
        ToastError(error || "Could not start payment");
        setBusyId(null);
        return;
      }
      const { default: PaystackPop } = await import("@paystack/inline-js");
      const popup = new PaystackPop();
      popup.resumeTransaction(res.data.access_code, {
        onSuccess: async () => {
          await VerifyPaymentAction(res.data!.reference);
          ToastSuccess("Unlocked - you can watch it now.");
          await refresh();
          setBusyId(null);
          onDone?.();
        },
        onCancel: () => {
          ToastError("Payment was not completed.");
          setBusyId(null);
        },
        onError: (err: any) => {
          ToastError(err?.message || "Payment failed. Please try again.");
          setBusyId(null);
        },
      });
    },
    [refresh]
  );

  return { canLearn, role: user?.role, unlockedIds, busyId, unlock };
}
