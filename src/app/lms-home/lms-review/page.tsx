"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

// dummy data for backend integration
const courses = [
  {
    id: "math-101",
    title: "Mathematics - Grade 10",
    nextClass: "Monday, 10:00 AM",
    resources: ["Algebra Basics PDF", "Lesson Video: Quadratic Equations", "Practice Worksheet"],
  },
];

const assessments = [
  {
    id: "math-algebra-test",
    title: "Math Test - Algebra",
    due: "Friday, 5:00 PM",
    resources: ["Sample Problems", "Formula Sheet"],
  },
];

export default function CourseAndAssessmentPage() {
  return (
    <div className="space-y-8 p-6">
      {/* ======== COURSES SECTION ======== */}
      <section>
        <h1 className="text-2xl font-bold mb-4">My Courses</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <Card key={course.id}>
              <CardHeader>
                <CardTitle>{course.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Upcoming Class: {course.nextClass}</p>
                <div className="flex gap-2 flex-wrap">
                  <Link href={`/lms-home/student/courses/${course.id}`}>
                    <Button size="sm" variant="outline">View Class</Button>
                  </Link>
                  <Link href={`/lms-home/student/courses/${course.id}/reschedule`}>
                    <Button size="sm" variant="outline">Reschedule</Button>
                  </Link>
                  <Link href={`/lms-home/student/courses/${course.id}/cancel`}>
                    <Button size="sm" variant="destructive">Cancel Class</Button>
                  </Link>
                </div>
                <div className="border-t pt-3">
                  <h4 className="font-semibold mb-2">Resources & Materials</h4>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {course.resources.map((res, idx) => (
                      <li key={idx}>{res}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ======== ASSESSMENT SECTION ======== */}
      <section>
        <h1 className="text-2xl font-bold mb-4">Assessments</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assessments.map((assessment) => (
            <Card key={assessment.id}>
              <CardHeader>
                <CardTitle>{assessment.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Due: {assessment.due}</p>
                <div className="flex gap-2 flex-wrap">
                  <Link href={`/lms-home/student/assessments/${assessment.id}/attempt`}>
                    <Button size="sm">Attempt Assessment</Button>
                  </Link>
                  <Link href={`/lms-home/student/assessments/${assessment.id}/submit`}>
                    <Button size="sm" variant="secondary">Submit</Button>
                  </Link>
                </div>
                <div className="border-t pt-3">
                  <h4 className="font-semibold mb-2">Additional Resources</h4>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {assessment.resources.map((res, idx) => (
                      <li key={idx}>{res}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
