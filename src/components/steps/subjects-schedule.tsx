// "use client"
// import { useState, useEffect } from "react"
// import { useEnrollment, type Schedule } from "@/contexts/enrollment-context"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Label } from "@/components/ui/label"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Textarea } from "@/components/ui/textarea"
// import { Checkbox } from "@/components/ui/checkbox"
// import { Badge } from "@/components/ui/badge"

// interface StepProps {
//   onNext: (errors: Record<string, string>) => void
//   errors: Record<string, string>
// }

// const techTracks = {
//   "Ages 6-8": ["Scratch Programming", "Digital Art", "Basic Robotics"],
//   "Ages 9-12": ["Python Basics", "Web Design", "Game Development", "3D Modeling"],
//   "Ages 13-16": ["Advanced Python", "JavaScript", "Mobile App Development", "AI/ML Basics"],
// }

// const academicSubjects = [
//   "Mathematics",
//   "English",
//   "Science",
//   "Physics",
//   "Chemistry",
//   "Biology",
//   "History",
//   "Geography",
//   "Economics",
//   "Literature",
// ]

// const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
// const timeOptions = [
//   "8:00am",
//   "9:00am",
//   "10:00am",
//   "11:00am",
//   "12:00pm",
//   "1:00pm",
//   "2:00pm",
//   "3:00pm",
//   "4:00pm",
//   "5:00pm",
//   "6:00pm",
//   "7:00pm",
// ]
// const durationOptions = [
//   { value: 30, label: "30 minutes" },
//   { value: 60, label: "1 hour" },
//   { value: 90, label: "1 hr 30 mins" },
//   { value: 120, label: "2 hours" },
// ]

// export default function SubjectsSchedule({ onNext, errors }: StepProps) {
//   const { enrollmentData, updateServiceDetails, updateSchedule, calculateCost } = useEnrollment()
//   const [totalCost, setTotalCost] = useState(enrollmentData.totalCost || 0);
  
//   const [serviceData, setServiceData] = useState({
//     ageLevel: enrollmentData.serviceDetails?.ageLevel || "",
//     selectedSubjects: enrollmentData.serviceDetails?.selectedSubjects || [],
//     learningGoals: enrollmentData.serviceDetails?.learningGoals || "",
//     tutorGender: enrollmentData.serviceDetails?.tutorGender || "",
//   })

//   const [schedule, setSchedule] = useState<Schedule[]>(enrollmentData.schedule || [])

//   const serviceType = enrollmentData.serviceDetails?.serviceType
//   const isTechService = serviceType === "tech-bootcamp"

//   useEffect(() => {
//     setSchedule(enrollmentData.schedule || [])
//   }, [enrollmentData.schedule])

//   useEffect(() => {
//   setSchedule((prev) => {
//     const newSubjects = serviceData.selectedSubjects;

//     const updatedSchedule = newSubjects.map((subject) => {
//       const existing = prev.find((s) => s.subject === subject);
//       if (existing) return existing;

//       return {
//         subject,
//         days: isTechService ? ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] : [],
//         time: isTechService ? "4:00pm" : "8:00am",
//         duration: 60,
//       };
//     });

//     updateSchedule(updatedSchedule)
//     return updatedSchedule;
//   });
// }, [serviceData.selectedSubjects, isTechService]);

//   useEffect(() => {
//   const newCost = calculateCost();
//   // console.log("Calculated cost:", newCost);
//   setTotalCost(newCost);
// }, [schedule, serviceData.selectedSubjects, calculateCost]);


//   useEffect(() => {
//     const handleValidation = () => {
//       const stepErrors: Record<string, string> = {}

//       if (serviceData.selectedSubjects.length === 0) {
//         stepErrors.subjects = "Please select at least one subject/track"
//       }

//       if (!serviceData.tutorGender) {
//         stepErrors.tutorGender = "Please select preferred tutor gender"
//       }

//       if (!isTechService) {
//         const hasValidSchedule = schedule.some((item) => item.days.length > 0)
//         if (!hasValidSchedule) {
//           stepErrors.schedule = "Please select at least one day for at least one subject"
//         }
//       }

//       if (Object.keys(stepErrors).length === 0) {
//         updateServiceDetails(serviceData)
//         updateSchedule(schedule)
//       }

//       onNext(stepErrors)
//     }

//     window.addEventListener("validateStep", handleValidation)
//     return () => window.removeEventListener("validateStep", handleValidation)
//   }, [serviceData, schedule, isTechService, onNext, updateServiceDetails, updateSchedule])


//   const handleSubjectChange = (subject: string, checked: boolean) => {
//     setServiceData((prev) => ({
//       ...prev,
//       selectedSubjects: checked
//         ? [...prev.selectedSubjects, subject]
//         : prev.selectedSubjects.filter((s) => s !== subject),
//     }))
//   }

//   const handleScheduleChange = (index: number, field: keyof Schedule, value: any) => {
//     setSchedule((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)))
//   }

//   const handleDayToggle = (scheduleIndex: number, day: string) => {
//     setSchedule((prev) =>
//       prev.map((item, i) => {
//         if (i === scheduleIndex) {
//           const newDays = item.days.includes(day) ? item.days.filter((d) => d !== day) : [...item.days, day]
//           return { ...item, days: newDays }
//         }
//         return item
//       }),
//     )
//   }


//   const availableSubjects =
//     isTechService && serviceData.ageLevel
//       ? techTracks[serviceData.ageLevel as keyof typeof techTracks] || []
//       : academicSubjects



//   return (
//     <div className="space-y-6">
//       {/* Subject Selection */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Select Subjects/Tracks</CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           {isTechService && (
//             <div className="space-y-2">
//               <Label>Age Level *</Label>
//               <Select
//                 value={serviceData.ageLevel}
//                 onValueChange={(value) =>
//                   setServiceData((prev) => ({
//                     ...prev,
//                     ageLevel: value,
//                     selectedSubjects: [],
//                   }))
//                 }
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select age level" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {Object.keys(techTracks).map((age) => (
//                     <SelectItem key={age} value={age}>
//                       {age}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//           )}

//           <div className="space-y-2">
//             <Label>Available {isTechService ? "Tech Tracks" : "Subjects"} *</Label>
//             <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
//               {availableSubjects.map((subject) => (
//                 <div key={subject} className="flex items-center space-x-2">
//                   <Checkbox
//                   className="h-5 w-5"
//                     id={subject}
//                     checked={serviceData.selectedSubjects.includes(subject)}
//                     onCheckedChange={(checked) => handleSubjectChange(subject, checked as boolean)}
//                   />
//                   <Label htmlFor={subject} className="text-sm">
//                     {subject}
//                   </Label>
//                 </div>
//               ))}
//             </div>
//             {errors.subjects && <p className="text-red-600 text-sm">{errors.subjects}</p>}
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="learningGoals">Learning Goals</Label>
//             <Textarea
//               id="learningGoals"
//               value={serviceData.learningGoals}
//               onChange={(e) => setServiceData((prev) => ({ ...prev, learningGoals: e.target.value }))}
//               placeholder="Describe what you hope your child will achieve..."
//               rows={3}
//             />
//           </div>

//           <div className="space-y-2">
//             <Label>Preferred Tutor Gender *</Label>
//             <Select
//               value={serviceData.tutorGender}
//               onValueChange={(value) => setServiceData((prev) => ({ ...prev, tutorGender: value }))}
//             >
//               <SelectTrigger className={errors.tutorGender ? "border-red-500" : ""}>
//                 <SelectValue placeholder="Select preference" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="Male">Male</SelectItem>
//                 <SelectItem value="Female">Female</SelectItem>
//                 <SelectItem value="No preference">No preference</SelectItem>
//               </SelectContent>
//             </Select>
//             {errors.tutorGender && <p className="text-red-600 text-sm">{errors.tutorGender}</p>}
//           </div>
//         </CardContent>
//       </Card>

//       {/* Schedule */}
//       {serviceData.selectedSubjects.length > 0 && (
//         <Card>
//           <CardHeader>
//             <CardTitle>Schedule</CardTitle>
//           </CardHeader>
//           <CardContent>
//             {isTechService ? (
//               <div className="bg-blue-50 p-4 rounded-lg">
//                 <h4 className="font-semibold mb-2">Tech Bootcamp Schedule</h4>
//                 <p className="text-sm text-gray-600 mb-3">All tech bootcamps run Monday to Friday, 4:00pm - 5:00pm</p>
//                 <div className="space-y-2">
//                   {serviceData.selectedSubjects.map((track) => (
//                     <Badge key={track} variant="secondary">
//                       {track}
//                     </Badge>
//                   ))}
//                 </div>
//               </div>
//             ) : (
//               <div className="space-y-4">
//                 {schedule.map((item, index) => (
//                   <Card key={index} className="p-4">
//                     <h4 className="font-semibold mb-3">{item.subject}</h4>

//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                       <div>
//                         <Label className="text-sm">Days *</Label>
//                         <div className="grid grid-cols-2 gap-2 mt-1">
//                           {daysOfWeek.map((day) => (
//                             <div key={day} className="flex items-center space-x-2">
//                               <Checkbox
//                                 id={`${index}-${day}`}
//                                 checked={item.days.includes(day)}
//                                 onCheckedChange={() => handleDayToggle(index, day)}
//                               />
//                               <Label htmlFor={`${index}-${day}`} className="text-xs">
//                                 {day.slice(0, 3)}
//                               </Label>
//                             </div>
//                           ))}
//                         </div>
//                       </div>

//                       <div>
//                         <Label className="text-sm">Time</Label>
//                         <Select value={item.time} onValueChange={(value) => handleScheduleChange(index, "time", value)}>
//                           <SelectTrigger>
//                             <SelectValue />
//                           </SelectTrigger>
//                           <SelectContent>
//                             {timeOptions.map((time) => (
//                               <SelectItem key={time} value={time}>
//                                 {time}
//                               </SelectItem>
//                             ))}
//                           </SelectContent>
//                         </Select>
//                       </div>

//                       <div>
//                         <Label className="text-sm">Duration</Label>
//                         <Select
//                           value={item.duration.toString()}
//                           onValueChange={(value) => handleScheduleChange(index, "duration", Number.parseInt(value))}
//                         >
//                           <SelectTrigger>
//                             <SelectValue />
//                           </SelectTrigger>
//                           <SelectContent>
//                             {durationOptions.map((option) => (
//                               <SelectItem key={option.value} value={option.value.toString()}>
//                                 {option.label}
//                               </SelectItem>
//                             ))}
//                           </SelectContent>
//                         </Select>
//                       </div>
//                     </div>
//                   </Card>
//                 ))}
//                 {errors.schedule && <p className="text-red-600 text-sm">{errors.schedule}</p>}
//               </div>
//             )}

//             {/* Cost Summary */}
//             <div className="mt-6 p-4 bg-gray-50 rounded-lg">
//               <h4 className="font-semibold mb-2">Cost Summary</h4>
//               <p className="text-2xl font-bold text-green-600">₦{totalCost.toLocaleString()}/month</p>
//               <p className="text-sm text-gray-600">Based on selected subjects and schedule</p>
//             </div>
//           </CardContent>
//         </Card>
//       )}
//     </div>
//   )
// }


// Adjusted version of SubjectsSchedule.tsx with:
// - Tech track as radio buttons
// - Tech for Kids pricing logic (25k for Nigerian, 50k for others)

"use client";
import { useState, useEffect } from "react";
import { useEnrollment, type Schedule } from "@/contexts/enrollment-context";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

interface StepProps {
  onNext: (errors: Record<string, string>) => void;
  errors: Record<string, string>;
}

const techTracks = {
  "5–8 years": [
    "Game Design with Scratch",
    "Basic computer literacy",
    "Creative expression with graphics",
  ],
  "9–12 years": [
    "Intermediate Block Coding (Scratch 3.0)",
    "Beginner Animation",
    "Practical AI with No Code",
    "Graphics design",
    "STEM Robotics",
  ],
  "13–16 years": [
    "Video editing",
    "Introduction to AI and Chatbots",
    "Web development (No Code with Wix/Wordpress)",
    "Presentation Mastery",
    "Text-lite Coding (Python or JavaScript for Beginners)",
    "Web Development (HTML, CSS & Simple JS)",
    "Graphics DESIGN",
    "Smart Robotics and Embedded Tech",
  ],
  "17-20 years": [
    "Build with AI (Vision/NLP)",
    "Full-Stack Web Dev Bootcamp",
    "Robotics & Embedded Systems",
    "Web Development (HTML, CSS & Simple JS)",
    "Graphics DESIGN",
    "NO CODE App Development",
    "Data analysis",
    "Portfolio and presentation",
    "Machine Learning with Python",
    "Data Science"
  ],
};

const academicSubjects = [
  "Mathematics", "English", "Science", "Physics", "Chemistry", "Biology",
  "History", "Geography", "Economics", "Literature",
];

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const timeOptions = [
  "8:00am", "9:00am", "10:00am", "11:00am", "12:00pm",
  "1:00pm", "2:00pm", "3:00pm", "4:00pm", "5:00pm", "6:00pm", "7:00pm",
];

const durationOptions = [
  { value: 30, label: "30 minutes" },
  { value: 60, label: "1 hour" },
  { value: 90, label: "1 hr 30 mins" },
  { value: 120, label: "2 hours" },
];

export default function SubjectsSchedule({ onNext, errors }: StepProps) {
  const { enrollmentData, updateServiceDetails, updateSchedule, calculateCost } = useEnrollment();
  const [totalCost, setTotalCost] = useState(enrollmentData.totalCost || 0);

  const [serviceData, setServiceData] = useState({
    ageLevel: enrollmentData.serviceDetails?.ageLevel || "",
    selectedSubjects: enrollmentData.serviceDetails?.selectedSubjects || [],
    learningGoals: enrollmentData.serviceDetails?.learningGoals || "",
    tutorGender: enrollmentData.serviceDetails?.tutorGender || "",
    curriculum: enrollmentData.serviceDetails?.curriculum || "",
  });

  const [schedule, setSchedule] = useState<Schedule[]>(enrollmentData.schedule || []);
  const serviceType = enrollmentData.serviceDetails?.serviceType;
  const isTechService = serviceType === "tech-bootcamp";
  console.log("Service Type:", serviceType);


  const techBootcampCost = isTechService && serviceData.curriculum === "Nigerian" ? 25000 : 50000;

  // useEffect(() => {
  //   setSchedule((prev) => {
  //     const updatedSchedule = serviceData.selectedSubjects.map((subject) => {
  //       const existing = prev.find((s) => s.subject === subject);
  //       return (
  //         existing || {
  //           subject,
  //           days: isTechService ? ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] : [],
  //           time: isTechService ? "4:00pm" : "8:00am",
  //           duration: 60,
  //         }
  //       );
  //     });
  //     updateSchedule(updatedSchedule);
  //     return updatedSchedule;
  //   });
  // }, [serviceData.selectedSubjects, isTechService]);
  
  {/*updated*/}
  useEffect(() => {
  setSchedule((prev) => {
    const updated = serviceData.selectedSubjects.map((subject) => {
      const existing = prev.find((s) => s.subject === subject);
      return (
        existing || {
          subject,
          days: isTechService ? ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] : [],
          time: isTechService ? "4:00pm" : "8:00am",
          duration: 60,
        }
      );
    });

    return updated;
  });
}, [serviceData.selectedSubjects, isTechService]);

useEffect(() => {
  updateSchedule(schedule);
}, [schedule]);

  // useEffect(() => {
  //   const newCost = isTechService ? techBootcampCost : calculateCost();
  //   setTotalCost(newCost);
  // }, [schedule, serviceData.selectedSubjects, serviceData.curriculum]);

useEffect(() => {
  const newCost = isTechService ? techBootcampCost : calculateCost();

  setTotalCost(newCost);

  // ✅ Save to enrollmentData context so it reflects in Review step
  updateServiceDetails({ ...serviceData });
  updateSchedule(schedule);
  enrollmentData.totalCost = newCost;
}, [schedule, serviceData.selectedSubjects, serviceData.curriculum]);

  useEffect(() => {
    const validate = () => {
      const stepErrors: Record<string, string> = {};
      if (serviceData.selectedSubjects.length === 0) stepErrors.subjects = "Please select at least one subject/track";
      if (!serviceData.tutorGender) stepErrors.tutorGender = "Please select preferred tutor gender";
      if (!isTechService && !schedule.some((s) => s.days.length > 0)) {
        stepErrors.schedule = "Please select at least one day for at least one subject";
      }

      if (Object.keys(stepErrors).length === 0) {
        updateServiceDetails(serviceData);
        // updateSchedule(schedule);
      }

      onNext(stepErrors);
    };

    window.addEventListener("validateStep", validate);
    return () => window.removeEventListener("validateStep", validate);
  }, [serviceData, schedule, isTechService]);

  const handleScheduleChange = (index: number, field: keyof Schedule, value: any) => {
    setSchedule((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const availableSubjects =
    isTechService && serviceData.ageLevel
      ? techTracks[serviceData.ageLevel as keyof typeof techTracks] || []
      : academicSubjects;

  return (
    <div className="space-y-6">
      {/* Subject Selection */}
      <Card>
        <CardHeader><CardTitle>Select Subjects/Tracks</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {isTechService && (
            <>
              <div className="space-y-2">
                <Label>Age Level *</Label>
                <Select
                  value={serviceData.ageLevel}
                  onValueChange={(value) =>
                    setServiceData((prev) => ({
                      ...prev,
                      ageLevel: value,
                      selectedSubjects: [],
                    }))
                  }
                >
                  <SelectTrigger><SelectValue placeholder="Select age level" /></SelectTrigger>
                  <SelectContent>
                    {Object.keys(techTracks).map((age) => (
                      <SelectItem key={age} value={age}>{age}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Country *</Label>
                <Select
                  value={serviceData.curriculum}
                  onValueChange={(value) => setServiceData((prev) => ({ ...prev, curriculum: value }))}
                >
                  <SelectTrigger><SelectValue placeholder="Select Country" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Nigerian">Nigeria</SelectItem>
                    <SelectItem value="British">UK</SelectItem>
                    <SelectItem value="American">USA</SelectItem>
                    <SelectItem value="Canada">Canada</SelectItem>
                    <SelectItem value="Ghanaian">Ghana</SelectItem>
                    <SelectItem value="SouthAfrican">South Africa</SelectItem>
                    <SelectItem value="Kenyan">Kenya</SelectItem>
                    <SelectItem value="Zambian">Zambia</SelectItem>
                    <SelectItem value="Irish">Ireland</SelectItem>
                    <SelectItem value="Swiss">Switzerland</SelectItem>
                    <SelectItem value="Chinese">China</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label>Available {isTechService ? "Tech Tracks" : "Subjects"} *</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {availableSubjects.map((subject) => (
                <label key={subject} className="flex items-center space-x-2">
                  {isTechService ? (
                    <>
                      <input
                        type="radio"
                        name="techTrack"
                        value={subject}
                        checked={serviceData.selectedSubjects.includes(subject)}
                        onChange={() =>
                          setServiceData((prev) => ({ ...prev, selectedSubjects: [subject] }))
                        }
                        className="h-4 w-4"
                      />
                      <span className="text-sm">{subject}</span>
                    </>
                  ) : (
                    <>
                      <Checkbox
                        id={subject}
                        className="h-5 w-5"
                        checked={serviceData.selectedSubjects.includes(subject)}
                        onCheckedChange={(checked) =>
                          setServiceData((prev) => ({
                            ...prev,
                            selectedSubjects: checked
                              ? [...prev.selectedSubjects, subject]
                              : prev.selectedSubjects.filter((s) => s !== subject),
                          }))
                        }
                      />
                      <Label htmlFor={subject} className="text-sm">{subject}</Label>
                    </>
                  )}
                </label>
              ))}
            </div>
            {errors.subjects && <p className="text-red-600 text-sm">{errors.subjects}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="learningGoals">Learning Goals</Label>
            <Textarea
              id="learningGoals"
              value={serviceData.learningGoals}
              onChange={(e) => setServiceData((prev) => ({ ...prev, learningGoals: e.target.value }))}
              placeholder="Describe what you hope your child will achieve..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Preferred Tutor Gender *</Label>
            <Select
              value={serviceData.tutorGender}
              onValueChange={(value) => setServiceData((prev) => ({ ...prev, tutorGender: value }))}
            >
              <SelectTrigger className={errors.tutorGender ? "border-red-500" : ""}>
                <SelectValue placeholder="Select preference" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="No preference">No preference</SelectItem>
              </SelectContent>
            </Select>
            {errors.tutorGender && <p className="text-red-600 text-sm">{errors.tutorGender}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Schedule Section */}
      {serviceData.selectedSubjects.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Schedule</CardTitle></CardHeader>
          <CardContent>
            {isTechService ? (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Tech Bootcamp Schedule</h4>
                <p className="text-sm text-gray-600 mb-3">
                  All tech bootcamps run Monday to Friday, 4:00pm - 5:00pm
                </p>
                <div className="space-y-2">
                  {serviceData.selectedSubjects.map((track) => (
                    <Badge key={track} variant="secondary">{track}</Badge>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {schedule.map((item, index) => (
                  <Card key={index} className="p-4">
                    <h4 className="font-semibold mb-3">{item.subject}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm">Days *</Label>
                        <div className="grid grid-cols-2 gap-2 mt-1">
                          {daysOfWeek.map((day) => (
                            <div key={day} className="flex items-center space-x-2">
                              <Checkbox
                                id={`${index}-${day}`}
                                checked={item.days.includes(day)}
                                onCheckedChange={() => {
                                  const newDays = item.days.includes(day)
                                    ? item.days.filter((d) => d !== day)
                                    : [...item.days, day];
                                  handleScheduleChange(index, "days", newDays);
                                }}
                              />
                              <Label htmlFor={`${index}-${day}`} className="text-xs">
                                {day.slice(0, 3)}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm">Time</Label>
                        <Select
                          value={item.time}
                          onValueChange={(value) => handleScheduleChange(index, "time", value)}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {timeOptions.map((time) => (
                              <SelectItem key={time} value={time}>{time}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-sm">Duration</Label>
                        <Select
                          value={item.duration.toString()}
                          onValueChange={(value) => handleScheduleChange(index, "duration", Number(value))}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {durationOptions.map((d) => (
                              <SelectItem key={d.value} value={d.value.toString()}>{d.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </Card>
                ))}
                {errors.schedule && <p className="text-red-600 text-sm">{errors.schedule}</p>}
              </div>
            )}

            {/* Cost Summary */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">Cost Summary</h4>
              <p className="text-2xl font-bold text-green-600">₦{totalCost.toLocaleString()}/month</p>
              <p className="text-sm text-gray-600">
                {isTechService
                  ? `Tech bootcamp pricing based on curriculum (${serviceData.curriculum})`
                  : "Based on selected subjects and schedule"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
