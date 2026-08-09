"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GetUserProfileAction } from "@/server/user";
import { GetTutorProfileAction } from "@/server/tutor-profile";
import { GetTutorRatingSummaryAction, GetTutorReviewsAction } from "@/server/session-feedback";
import { User, UserRole } from "@/types/user";
import { TutorProfile } from "@/types/tutor-profile";
import { SessionFeedback, TutorRatingSummary } from "@/types/session-feedback";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`w-4 h-4 ${i <= Math.round(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
      ))}
    </div>
  );
}

export default function ViewProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [tutorProfile, setTutorProfile] = useState<TutorProfile | null>(null);
  const [ratingSummary, setRatingSummary] = useState<TutorRatingSummary | null>(null);
  const [reviews, setReviews] = useState<SessionFeedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isForbidden, setIsForbidden] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [res, error] = await GetUserProfileAction(userId);
      if (res?.data) {
        setUser(res.data);
        if (res.data.role === UserRole.TUTOR) {
          const [tutorRes] = await GetTutorProfileAction(userId);
          setTutorProfile(tutorRes?.data ?? null);
          const [summaryRes] = await GetTutorRatingSummaryAction(userId);
          setRatingSummary(summaryRes?.data ?? null);
          const [reviewsRes] = await GetTutorReviewsAction(userId);
          setReviews(reviewsRes?.data ?? []);
        }
      } else if (error) {
        setIsForbidden(true);
      }
      setIsLoading(false);
    };
    load();
  }, [userId]);

  if (isLoading) return <p className="p-6">Loading profile...</p>;

  if (isForbidden || !user) {
    return (
      <section className="bg-white rounded-2xl shadow p-6 max-w-2xl">
        <p className="text-sm text-gray-600">You don&apos;t have permission to view this profile.</p>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-2xl shadow p-6 max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Avatar className="h-14 w-14">
          <AvatarImage src={user.avatarUrl} alt={user.firstName} />
          <AvatarFallback>{user.firstName?.[0]}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="font-bold text-xl">
            {user.firstName} {user.lastName}
          </h1>
          <p className="text-gray-500 text-sm">{user.role}</p>
          {ratingSummary && ratingSummary.totalRatings > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <StarRating rating={ratingSummary.averageRating} />
              <span className="text-sm text-gray-600">
                {ratingSummary.averageRating.toFixed(1)} ({ratingSummary.totalRatings} rating
                {ratingSummary.totalRatings === 1 ? "" : "s"})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Contact details are only present in the API response for the profile
          owner or platform staff - the backend omits them otherwise, so
          there's nothing to conditionally hide here. */}
      {(user.email || user.phone) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {user.email && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Email</p>
              <p className="text-sm text-gray-900">{user.email}</p>
            </div>
          )}
          {user.phone && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Phone</p>
              <p className="text-sm text-gray-900">{user.phone}</p>
            </div>
          )}
        </div>
      )}

      {tutorProfile && (
        <div className="space-y-4 border-t pt-4">
          {tutorProfile.bio && <p className="text-sm text-gray-700">{tutorProfile.bio}</p>}
          {tutorProfile.teachingCombinations.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">What I teach</p>
              <ul className="text-sm text-gray-900 space-y-1">
                {tutorProfile.teachingCombinations.map((c, i) => (
                  <li key={i}>
                    {c.country} · {c.curriculum} · {c.gradeLevel}: {c.subjectsTaught.join(", ")}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {tutorProfile.yearsOfExperience != null && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Experience</p>
              <p className="text-sm text-gray-900">{tutorProfile.yearsOfExperience} years</p>
            </div>
          )}
          {tutorProfile.availability.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Availability</p>
              <ul className="text-sm text-gray-900 space-y-1">
                {tutorProfile.availability.map((a, i) => (
                  <li key={i}>
                    {a.subject}: {a.days.join(", ")} at {a.time}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tutorProfile.education.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Educational Background</p>
              <ul className="text-sm text-gray-900 space-y-1">
                {tutorProfile.education.map((entry, i) => (
                  <li key={i}>
                    {entry.degree}
                    {entry.institution ? ` — ${entry.institution}` : ""}
                    {entry.year ? ` (${entry.year})` : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {reviews.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Reviews</p>
              <ul className="space-y-3">
                {reviews.map((review) => {
                  const reviewer = typeof review.student === "string" ? "A student" : review.student.fullName;
                  return (
                    <li key={review.id} className="border rounded-md p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-800">{reviewer}</span>
                        <StarRating rating={review.rating} />
                      </div>
                      {review.comment && <p className="text-sm text-gray-600 mt-1">{review.comment}</p>}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
