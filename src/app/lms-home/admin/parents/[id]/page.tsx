"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GetUserByIdAction, GetLinkedStudentsForAdminAction, GetParentEnrollmentSummaryAction } from "@/server/admin";
import { User } from "@/types/user";
import { ParentEnrollmentSummary, Student, studentAvatarUrl } from "@/types/student";

export default function AdminParentDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [parent, setParent] = useState<User | null>(null);
  const [children, setChildren] = useState<Student[]>([]);
  const [summary, setSummary] = useState<ParentEnrollmentSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [parentRes] = await GetUserByIdAction(id as string);
      setParent(parentRes?.data ?? null);

      const [childrenRes] = await GetLinkedStudentsForAdminAction(id as string);
      setChildren(childrenRes?.data ?? []);

      const [summaryRes] = await GetParentEnrollmentSummaryAction(id as string);
      setSummary(summaryRes?.data ?? null);

      setIsLoading(false);
    };
    load();
  }, [id]);

  if (isLoading) return <p className="p-6">Loading...</p>;
  if (!parent) return <p className="p-6">Parent not found</p>;

  const first = parent.firstName?.split(" ")[0] ?? parent.firstName;

  return (
    <div className="bg-white shadow rounded-2xl p-6">
      <button
        onClick={() => router.push("/lms-home/admin/parents")}
        className="flex items-center text-gray-700 mb-4 hover:text-blue-500"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        <span className="text-sm font-bold">BACK</span>
      </button>

      <div className="flex items-center gap-4 mb-6">
        <Avatar className="h-16 w-16">
          <AvatarImage src={parent.avatarUrl || parent.profilePicture} alt={parent.firstName} />
          <AvatarFallback>{parent.firstName?.[0]}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-xl font-bold">{parent.firstName} {parent.lastName}</h1>
          <p className="text-sm text-gray-500">{parent.email || "Hidden"}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-3">Basic Details</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-500 text-xs">First Name</p>
              <p className="text-gray-800">{first || "—"}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Last Name</p>
              <p className="text-gray-800">{parent.lastName || "—"}</p>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-3">Personal Details</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-500 text-xs">Email</p>
              <p className="text-gray-800">{parent.email || "Hidden"}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Phone</p>
              <p className="text-gray-800">{parent.phone || "—"}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Address</p>
              <p className="text-gray-800">{parent.address || "—"}</p>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-3">Enrollment</h3>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-gray-500 text-xs">Number of children</p>
              <p className="text-gray-800">{summary?.numberOfChildren ?? children.length}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Payment</p>
              <p className="text-gray-800">{summary?.paymentStatus ?? "—"}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Occupation</p>
              <p className="text-gray-800">{summary?.occupation ?? "—"}</p>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-3">Children</h3>
          {children.length === 0 ? (
            <p className="text-sm text-gray-400">No linked students yet.</p>
          ) : (
            <ul className="divide-y">
              {children.map((child) => (
                <li key={child.id} className="py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={child.photoUrl || studentAvatarUrl(child.user)} alt={child.fullName} />
                      <AvatarFallback>{child.fullName?.[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{child.fullName}</span>
                  </div>
                  <button
                    onClick={() => router.push(`/lms-home/admin/students/${child.id}`)}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    View student
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          onClick={() => router.push("/lms-home/admin/messages")}
          className="text-sm text-blue-600 hover:underline"
        >
          Send Message
        </button>
      </div>
    </div>
  );
}
