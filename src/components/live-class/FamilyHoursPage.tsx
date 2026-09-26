"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@/contexts/user-context";
import HoursPanel from "@/components/live-class/HoursPanel";
import ClassReportsPanel from "@/components/live-class/ClassReportsPanel";
import RecordingConsentPanel from "@/components/live-class/RecordingConsentPanel";

// One home for everything a family wants to know after class: how many hours
// they've used, what the tutor said about each class (and a way to rate it),
// and the recording consent they control. A child's own login sees hours and
// reports but not the consent screen - consent is a parent's to give.
export default function FamilyHoursPage() {
  const { user } = useUser();
  const isChildLogin = user?.role === "STUDENT";

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Hours &amp; class reports</h1>
        <p className="text-sm text-gray-500">
          {isChildLogin
            ? "See how much class time you've used and what your tutor said about each class."
            : "See how much class time has been used, read your tutor's report after each class, and share feedback."}
        </p>
      </div>

      <Tabs defaultValue="hours">
        <TabsList>
          <TabsTrigger value="hours">Hours</TabsTrigger>
          <TabsTrigger value="reports">Class reports</TabsTrigger>
          {!isChildLogin && <TabsTrigger value="recording">Recording consent</TabsTrigger>}
        </TabsList>
        <TabsContent value="hours" className="mt-4">
          <HoursPanel />
        </TabsContent>
        <TabsContent value="reports" className="mt-4">
          <ClassReportsPanel />
        </TabsContent>
        {!isChildLogin && (
          <TabsContent value="recording" className="mt-4">
            <RecordingConsentPanel />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
