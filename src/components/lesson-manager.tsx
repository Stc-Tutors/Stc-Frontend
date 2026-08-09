"use client";

import { useEffect, useState } from "react";
import { CreateLessonAction, GetCourseLessonsAction, UpdateLessonAction } from "@/server/lesson";
import { Lesson } from "@/types/lesson";
import GoogleDriveEmbed from "./google-drive-embed";

// The canonical lesson-authoring surface - moved out of AdminCourseDetailPage's
// old "Lessons" section (video-lecture authoring is a fully separate concern
// from course analytics/enrollment data). Fetches and manages this course's
// Lesson records (recordingUrl/meetingUrl included) directly, independent of
// the course-creation/detail flow. Mirrors Stc-SuperAdmin's component of the
// same name, adding the recordingUrl field that this repo's old inline
// Lessons section never had.
export default function LessonManager({ courseId }: { courseId: string }) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonDate, setLessonDate] = useState("");
  const [lessonDuration, setLessonDuration] = useState("60");
  const [lessonRecordingUrl, setLessonRecordingUrl] = useState("");
  const [lessonMeetingUrl, setLessonMeetingUrl] = useState("");

  const load = async () => {
    setIsLoading(true);
    const [res, error] = await GetCourseLessonsAction(courseId);
    setIsLoading(false);
    if (error) {
      setMessage(error);
      return;
    }
    setLessons(res?.data ?? []);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const addLesson = async () => {
    if (!lessonTitle || !lessonDate) {
      setMessage("Give the lesson a title and date.");
      return;
    }
    setIsSaving(true);
    const [res, error] = await CreateLessonAction({
      course: courseId,
      title: lessonTitle,
      order: lessons.length,
      scheduledDate: new Date(lessonDate).toISOString(),
      durationMinutes: Number(lessonDuration) || 60,
      recordingUrl: lessonRecordingUrl || undefined,
      meetingUrl: lessonMeetingUrl || undefined,
    });
    setIsSaving(false);
    if (error || !res?.data) {
      setMessage(error || "Could not add lesson");
      return;
    }
    setLessons((prev) => [...prev, res.data as Lesson]);
    setLessonTitle("");
    setLessonDate("");
    setLessonDuration("60");
    setLessonRecordingUrl("");
    setLessonMeetingUrl("");
    setMessage(null);
  };

  const updateLessonRecording = async (lessonId: string, url: string) => {
    const [, error] = await UpdateLessonAction(lessonId, { recordingUrl: url });
    if (error) {
      setMessage(error);
      return;
    }
    setLessons((prev) => prev.map((l) => (l.id === lessonId ? { ...l, recordingUrl: url } : l)));
  };

  const updateLessonMeetingUrl = async (lessonId: string, url: string) => {
    const [, error] = await UpdateLessonAction(lessonId, { meetingUrl: url });
    if (error) {
      setMessage(error);
      return;
    }
    setLessons((prev) => prev.map((l) => (l.id === lessonId ? { ...l, meetingUrl: url } : l)));
  };

  return (
    <div className="space-y-4">
      {message && <p className="text-sm text-blue-600">{message}</p>}

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-3">
        <h2 className="font-semibold text-gray-900">Lessons</h2>
        {isLoading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : lessons.length === 0 ? (
          <p className="text-sm text-gray-500">No lessons scheduled yet.</p>
        ) : (
          <div className="space-y-4">
            {lessons.map((l) => (
              <div key={l.id} className="border border-gray-200 rounded-md p-3 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-gray-900">{l.title}</p>
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    <span className="text-xs text-gray-500">
                      {new Date(l.scheduledDate).toLocaleString()} · {l.durationMinutes}m
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        l.recordingUrl ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {l.recordingUrl ? "Recorded" : "No recording"}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{l.status}</span>
                  </div>
                </div>
                <GoogleDriveEmbed
                  value={l.recordingUrl ?? ""}
                  onChange={(v) => updateLessonRecording(l.id, v)}
                  label="Lesson recording (Google Drive link)"
                />
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Live class link (Google Meet)</label>
                  <input
                    placeholder="Paste a Google Meet link"
                    defaultValue={l.meetingUrl ?? ""}
                    onBlur={(e) => e.target.value !== (l.meetingUrl ?? "") && updateLessonMeetingUrl(l.id, e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-3">
        <h2 className="font-semibold text-gray-900">Add a lesson</h2>
        <input
          placeholder="Lesson title"
          value={lessonTitle}
          onChange={(e) => setLessonTitle(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full"
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            type="datetime-local"
            value={lessonDate}
            onChange={(e) => setLessonDate(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
          <input
            type="number"
            min="1"
            placeholder="Duration (minutes)"
            value={lessonDuration}
            onChange={(e) => setLessonDuration(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
        <GoogleDriveEmbed value={lessonRecordingUrl} onChange={setLessonRecordingUrl} label="Lesson recording (Google Drive link)" />
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Live class link (Google Meet)</label>
          <input
            placeholder="Paste a Google Meet link"
            value={lessonMeetingUrl}
            onChange={(e) => setLessonMeetingUrl(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full"
          />
        </div>
        <button
          onClick={addLesson}
          disabled={isSaving}
          className="border border-gray-300 rounded-md px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Add lesson"}
        </button>
      </div>
    </div>
  );
}
