"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Star } from "lucide-react";
import { GetUserByIdAction, UpdateUserRoleAction, UpdateUserStatusAction } from "@/server/admin";
import { GetTutorProfileAction } from "@/server/tutor-profile";
import { GetTutorRatingSummaryAction } from "@/server/session-feedback";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, UserRole, UserStatus } from "@/types/user";
import { ROLE_LABELS } from "@/lib/roles";
import { TutorProfile } from "@/types/tutor-profile";
import { TutorRatingSummary } from "@/types/session-feedback";

export default function AdminUserDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [tutorProfile, setTutorProfile] = useState<TutorProfile | null>(null);
  const [ratingSummary, setRatingSummary] = useState<TutorRatingSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const load = async () => {
    const [res] = await GetUserByIdAction(id as string);
    const fetchedUser = res?.data ?? null;
    setUser(fetchedUser);

    if (fetchedUser?.role === UserRole.TUTOR) {
      const [profileRes] = await GetTutorProfileAction(id as string);
      setTutorProfile(profileRes?.data ?? null);
      const [summaryRes] = await GetTutorRatingSummaryAction(id as string);
      setRatingSummary(summaryRes?.data ?? null);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleStatusChange = async (status: UserStatus) => {
    const [, error] = await UpdateUserStatusAction(id as string, status);
    setMessage(error || `Status updated to ${status}`);
    load();
  };

  const handleRoleChange = async (role: UserRole) => {
    const [, error] = await UpdateUserRoleAction(id as string, role);
    setMessage(error || `Role updated to ${role}`);
    load();
  };

  if (isLoading) return <p className="p-6">Loading...</p>;
  if (!user) return <p className="p-6">User not found</p>;

  return (
    <div className="bg-white shadow rounded-2xl p-6 max-w-2xl">
      <button
        onClick={() => router.push("/lms-home/admin/users")}
        className="flex items-center text-gray-700 mb-4 hover:text-blue-500"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        <span className="text-sm font-bold">BACK</span>
      </button>

      <div className="flex items-center gap-4 mb-6">
        <Avatar className="h-14 w-14">
          <AvatarImage src={user.avatarUrl || user.profilePicture} alt={user.firstName} />
          <AvatarFallback>{user.firstName?.[0]}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">
            {user.firstName} {user.lastName}
          </h1>
          <p className="text-gray-500">{user.email || "Hidden"}</p>
          {user.joinedDate && (
            <p className="text-xs text-gray-400">Joined {new Date(user.joinedDate).toLocaleDateString()}</p>
          )}
        </div>
      </div>

      {message && <p className="text-sm text-blue-600 mb-4">{message}</p>}

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-sm font-medium text-gray-700 mb-1">Role</p>
          <select
            value={user.role}
            onChange={(e) => handleRoleChange(e.target.value as UserRole)}
            className="border rounded-md px-3 py-2 text-sm w-full"
          >
            {Object.values(UserRole).map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-1">Status</p>
          <select
            value={user.status ?? UserStatus.ACTIVE}
            onChange={(e) => handleStatusChange(e.target.value as UserStatus)}
            className="border rounded-md px-3 py-2 text-sm w-full"
          >
            {Object.values(UserStatus).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
        <div>
          <p className="font-medium text-gray-700">Phone</p>
          <p>{user.phone || "—"}</p>
        </div>
      </div>

      {user.role === UserRole.TUTOR && (tutorProfile || ratingSummary) && (
        <div className="mt-6 pt-6 border-t space-y-3">
          <h2 className="font-semibold text-gray-800">Tutor Profile</h2>
          {ratingSummary && ratingSummary.totalRatings > 0 && (
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm text-gray-700">
                {ratingSummary.averageRating.toFixed(1)} average ({ratingSummary.totalRatings} rating
                {ratingSummary.totalRatings === 1 ? "" : "s"})
              </span>
            </div>
          )}
          {tutorProfile?.bio && <p className="text-sm text-gray-700">{tutorProfile.bio}</p>}
          <div className="grid grid-cols-2 gap-4 text-sm">
            {tutorProfile && tutorProfile.teachingCombinations.length > 0 && (
              <div>
                <p className="font-medium text-gray-700">Subjects</p>
                <p className="text-gray-600">
                  {tutorProfile.teachingCombinations.map((c, i) => (
                    <span key={i}>
                      {i > 0 && "; "}
                      {c.country} · {c.curriculum} · {c.gradeLevel}: {c.subjectsTaught.join(", ")}
                    </span>
                  ))}
                </p>
              </div>
            )}
            {tutorProfile?.yearsOfExperience != null && (
              <div>
                <p className="font-medium text-gray-700">Experience</p>
                <p className="text-gray-600">{tutorProfile.yearsOfExperience} years</p>
              </div>
            )}
          </div>
          <button
            onClick={() => router.push(`/lms-home/profile/${id}`)}
            className="text-sm text-blue-600 hover:underline"
          >
            View full public profile
          </button>
        </div>
      )}
    </div>
  );
}
