"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";
import { GetVideoCourseToWatchAction } from "@/server/video-course";
import { WatchableVideoCourse } from "@/types/video-course";
import { useUser } from "@/contexts/user-context";
import SecureVideoPlayer from "@/components/classroom/SecureVideoPlayer";
import { formatDate } from "@/lib/datetime";

// YouTube's watch/share links can't play in a <video> tag - embed them.
function youTubeEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    let id: string | null = null;
    if (host === "youtu.be") id = u.pathname.slice(1);
    else if (host === "youtube.com" || host === "m.youtube.com") id = u.searchParams.get("v") ?? (u.pathname.startsWith("/embed/") ? u.pathname.split("/")[2] : null);
    return id ? `https://www.youtube.com/embed/${encodeURIComponent(id)}` : null;
  } catch {
    return null;
  }
}

function isHttpUrl(url: string): boolean {
  try {
    const p = new URL(url).protocol;
    return p === "https:" || p === "http:";
  } catch {
    return false;
  }
}

function VideoFrame({ url }: { url: string }) {
  if (!isHttpUrl(url)) return <p className="text-sm text-red-600">This video link is not valid.</p>;
  const embed = youTubeEmbedUrl(url);
  if (embed) {
    return (
      <div className="aspect-video bg-black">
        <iframe
          src={embed}
          title="Video"
          className="w-full h-full border-0"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }
  return <SecureVideoPlayer url={url} />;
}

// Plays a video course the caller's family has unlocked (or a free one).
// The backend withholds the link with a 403 otherwise, so a locked course
// simply shows the error it returns.
export default function VideoCourseWatchView({ id }: { id: string }) {
  const { user } = useUser();
  const [course, setCourse] = useState<WatchableVideoCourse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const [res, err] = await GetVideoCourseToWatchAction(id);
      if (err || !res?.data) setError(err || "Could not load this video course");
      else {
        setCourse(res.data);
        const first = res.data.lessons.find((l) => !l.locked && l.videoUrl);
        setActiveLessonId(first?.id ?? null);
      }
      setIsLoading(false);
    })();
  }, [id]);

  const backHref = `/lms-home/${(user?.role ?? "student").toLowerCase()}/video-courses`;
  const activeLesson = course?.lessons.find((l) => l.id === activeLessonId);
  // A course with no lessons plays its own single video.
  const currentUrl = course?.lessons.length ? activeLesson?.videoUrl : course?.videoUrl;

  return (
    <div className="space-y-4">
      <Link href={backHref} className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline">
        <ArrowLeft className="w-4 h-4" /> Video courses
      </Link>

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : error || !course ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : (
        <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
          <div>
            <h1 className="text-lg font-semibold text-gray-800">{course.title}</h1>
            <p className="text-xs text-gray-500">By {course.instructor}</p>
          </div>

          {currentUrl ? (
            <VideoFrame url={currentUrl} />
          ) : (
            <p className="text-sm text-gray-500">No episode is available to watch yet.</p>
          )}

          {activeLesson && <p className="text-sm font-medium">{activeLesson.title}</p>}
          {course.description && <p className="text-sm text-gray-600">{course.description}</p>}

          {course.lessons.length > 0 && (
            <ul className="divide-y border rounded-lg">
              {course.lessons.map((lesson) => (
                <li key={lesson.id}>
                  <button
                    type="button"
                    disabled={lesson.locked}
                    onClick={() => setActiveLessonId(lesson.id)}
                    className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-left text-sm ${
                      lesson.id === activeLessonId ? "bg-blue-50" : "hover:bg-gray-50"
                    } disabled:opacity-60 disabled:cursor-not-allowed`}
                  >
                    <span className="truncate">
                      {lesson.order + 1}. {lesson.title}
                    </span>
                    {lesson.locked ? (
                      <span className="flex items-center gap-1 text-xs text-gray-500 shrink-0">
                        <Lock className="w-3 h-3" />
                        {lesson.releaseDate ? `Available ${formatDate(lesson.releaseDate)}` : "Locked"}
                      </span>
                    ) : lesson.durationMinutes ? (
                      <span className="text-xs text-gray-500 shrink-0">{lesson.durationMinutes} min</span>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
