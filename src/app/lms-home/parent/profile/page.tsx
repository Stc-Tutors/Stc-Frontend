"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ChevronRight } from "lucide-react";
import ProfileForm from "@/components/profile/ProfileForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { GetLinkedStudentsAction } from "@/server/enrollment";
import { groupStudentsByChild, type ChildGroup } from "@/contexts/selected-student-context";

function getInitials(fullName: string) {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n.charAt(0))
    .join("");
}

// One row per real child (see groupStudentsByChild) linking into the Child
// Profile page (app/lms-home/parent/children/[id]) - the only place a
// parent can view/edit their child's identity/health fields directly (see
// stcbe's Child entity), previously only reachable via an admin-only dialog.
function ChildrenTab() {
  const router = useRouter();
  const [children, setChildren] = useState<ChildGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    GetLinkedStudentsAction().then(([res]) => {
      setChildren(groupStudentsByChild(res?.data ?? []));
      setIsLoading(false);
    });
  }, []);

  if (isLoading) return <p className="text-sm text-gray-500 mt-4">Loading...</p>;

  if (children.length === 0) {
    return <p className="text-sm text-gray-500 mt-4">No children linked to your account yet.</p>;
  }

  return (
    <div className="space-y-3 mt-4">
      {children.map((child) => {
        // Only real Child records (post-backfill-children) have a profile
        // to view - a pre-split legacy enrollment's group key falls back to
        // its own Student id, which isn't a Child id.
        const hasProfile = child.enrollments.some((e) => e.childId);
        return (
          <Card
            key={child.key}
            className={hasProfile ? "cursor-pointer hover:shadow-md transition-shadow" : "opacity-60"}
            onClick={() => hasProfile && router.push(`/lms-home/parent/children/${child.key}`)}
          >
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={child.photoUrl || "/placeholder.svg"} alt={child.fullName} />
                  <AvatarFallback className="bg-blue-100 text-blue-600">{getInitials(child.fullName)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-gray-900">{child.fullName}</p>
                  <p className="text-xs text-gray-500">
                    {child.enrollments.length} enrollment{child.enrollments.length === 1 ? "" : "s"}
                    {!hasProfile && " · profile not available yet"}
                  </p>
                </div>
              </div>
              {hasProfile && <ChevronRight className="w-4 h-4 text-gray-400" />}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default function ParentProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") === "children" ? "children" : "profile";

  return (
    <section className="bg-gray-100 min-h-screen p-6">
      <button
        onClick={() => router.push("/lms-home/parent/dashboard")}
        className="flex items-center text-gray-700 mb-4 hover:text-blue-500"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        <span className="text-sm font-bold">BACK</span>
      </button>

      <Tabs value={tab} onValueChange={(v) => router.push(`/lms-home/parent/profile?tab=${v}`)}>
        <TabsList>
          <TabsTrigger value="profile">My Profile</TabsTrigger>
          <TabsTrigger value="children">My Children</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <ProfileForm />
        </TabsContent>
        <TabsContent value="children">
          <ChildrenTab />
        </TabsContent>
      </Tabs>
    </section>
  );
}
