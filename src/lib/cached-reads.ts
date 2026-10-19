"use client";

import { fetchCached } from "@/lib/client-cache";
import type { ApiResponse } from "@/lib/fetch";
import { GetEnrollmentsAction, GetLinkedStudentsAction } from "@/server/enrollment";
import { GetStudentCoursesAction } from "@/server/course-enrollment";
import { GetCourseLessonsAction } from "@/server/lesson";
import type { Student } from "@/types/student";
import type { CourseEnrollment } from "@/types/course-enrollment";
import type { Lesson } from "@/types/lesson";

// Drop-in replacements (same [response, error] shape) for the four reads that every dashboard widget repeats.
//
// Why: a dashboard is built from many independent widgets, and each one fetched the children, enrolments, courses and lessons
// on its own. Next runs Server Actions one at a time per client, so the parent dashboard queued ~23 of them back to back
// (see client-cache.ts). Going through fetchCached collapses identical concurrent reads into one request and re-uses the
// result for a short window; the backend's `data:invalidate` events (tags below) refresh it the moment anything changes.
//
// Only use these for READ-ONLY views. A screen that edits the data and then reloads it should keep calling the action
// directly so it always sees its own change at once.

type Tuple<T> = [ApiResponse<T> | null, string | null];

const TTL_MS = 20_000;

async function cachedRead<T>(key: string, tags: string[], action: () => Promise<Tuple<T>>): Promise<Tuple<T>> {
  try {
    const res = await fetchCached<ApiResponse<T> | null>(
      key,
      async () => {
        const [data, error] = await action();
        // Throwing keeps a failed read out of the cache, so the next caller retries instead of replaying the error.
        if (error) throw new Error(error);
        return data;
      },
      { ttl: TTL_MS, tags }
    );
    return [res, null];
  } catch (error) {
    return [null, error instanceof Error ? error.message : "Something went wrong"];
  }
}

export const GetLinkedStudentsCached = (): Promise<Tuple<Student[]>> =>
  cachedRead("read:linked-students", ["enrollments"], GetLinkedStudentsAction);

export const GetEnrollmentsCached = (): Promise<Tuple<Student[]>> => cachedRead("read:enrollments", ["enrollments"], GetEnrollmentsAction);

export const GetStudentCoursesCached = (studentId: string): Promise<Tuple<CourseEnrollment[]>> =>
  cachedRead(`read:student-courses:${studentId}`, ["enrollments"], () => GetStudentCoursesAction(studentId));

export const GetCourseLessonsCached = (courseId: string): Promise<Tuple<Lesson[]>> =>
  cachedRead(`read:course-lessons:${courseId}`, ["lessons", "enrollments"], () => GetCourseLessonsAction(courseId));
