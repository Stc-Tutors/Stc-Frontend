// CourseRegistrationData.ts
export const courseRegistrationData = {
  courseInfo: {
    courseId: "MATH101",
    courseName: "Mathematics for Beginners",
    tutor: "Dr. Jane Doe",
    startDate: "2025-09-01",
    endDate: "2025-12-15",
  },
  schedule: [
    {
      day: "Monday",
      time: "10:00 AM - 11:00 AM",
      actions: ["reschedule", "cancel", "view"],
    },
    {
      day: "Wednesday",
      time: "1:00 PM - 2:00 PM",
      actions: ["reschedule", "cancel", "view"],
    },
  ],
  assessments: [
    {
      title: "Algebra Quiz",
      type: "multiple-choice",
      dueDate: "2025-09-15",
      actions: ["attempt", "submit"],
    },
    {
      title: "Geometry Assignment",
      type: "essay",
      dueDate: "2025-09-30",
      actions: ["attempt", "submit"],
    },
  ],
  resources: {
    Mathematics: {
      audio: ["math_intro.mp3", "algebra_basics.mp3"],
      video: ["math_intro.mp4", "geometry_tutorial.mp4"],
      pdf: ["math_notes.pdf", "geometry_formulas.pdf"],
    },
    Biology: {
      audio: ["cell_structure.mp3"],
      video: ["photosynthesis.mp4"],
      pdf: ["biology_chapter1.pdf", "plant_cells.pdf"],
    },
  },
};
