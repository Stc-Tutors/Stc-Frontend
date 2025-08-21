"use client";

import Image from "next/image";
import { Star, UserRound, ChevronLeft, ChevronRight, MoreVertical } from "lucide-react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { useState } from "react";
import Link from "next/link";

const formatSubject = (subject: string) =>
  subject.toLowerCase().replace(/\s+/g, "-");

import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from "@/components/ui/dropdown-menu";
import { 
  AlertDialog, 
  AlertDialogTrigger, 
  AlertDialogContent, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogCancel, 
  AlertDialogAction 
} from "@/components/ui/alert-dialog";

const lectures = [
  { 
    title: "Mathematics full Course with Tables", 
    rating: 4.9, students: "982,941 students", 
    price: "$29.0", 
    image: "/image/tutor4.jpg", 
    subject: "Mathematics" 
  },

  { 
    title: "English full Course with Verbs", 
    rating: 4.9, 
    students: "982,941 students", 
    price: "$29.0", 
    image: "/image/tutor4.jpg", 
    subject: "English" 
  },

  { 
    title: "Biology Intro Course", 
    rating: 4.7, 
    students: "741,200 students", 
    price: "$19.0", 
    image: "/image/tutor4.jpg", 
    subject: "Biology" 
  },

  { 
    title: "Computer Science Intro Course", 
    rating: 4.7, 
    students: "741,200 students", 
    price: "$19.0", 
    image: "/image/tutor4.jpg", 
    subject: "Computer Science" 
  },

  { 
    title: "Civic Education Intro Course", 
    rating: 4.7, 
    students: "741,200 students", 
    price: "$19.0", 
    image: "/image/tutor4.jpg", 
    subject: "Civic Education" 
  },
];

export default function TodayLectures() {
  const [sliderRef, instanceRef] = useKeenSlider({
    slides: { perView: 1, spacing: 16 },
    breakpoints: {
      "(min-width: 640px)": { slides: { perView: 2, spacing: 16 } },
      "(min-width: 1024px)": { slides: { perView: 2.5, spacing: 16 } },
    },
  });

  const handleCancelClass = (title: string) => {
    console.log(`Class canceled: ${title}`);
    // A backend thing
  };

  return (
    <div className="relative space-y-4">
      <h3 className="font-semibold text-gray-800">Today's Lecture</h3>

      <div ref={sliderRef} className="keen-slider">
        {lectures.map((lecture, i) => (
          <div key={i} className="keen-slider__slide bg-white rounded-lg shadow-sm p-4 relative">
            
            {/* More Options Menu */}
            <div className="absolute top-2 right-2 z-10">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1 rounded-full hover:bg-gray-100">
                    <MoreVertical size={18} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  
                  <DropdownMenuItem asChild>
                    <Link
                    href={`/lms-home/student/classes/${formatSubject(lecture.subject)}/details`}>
                      <DropdownMenuItem className="text-blue-500 cursor-pointer">
                            View Details
                      </DropdownMenuItem>
                      </Link>
                      </DropdownMenuItem>
                      
                      {/* Cancel Class with Confirmation
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem className="text-red-500 cursor-pointer">
                            Cancel class
                            </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Cancel Class</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to cancel <strong>{lecture.title}</strong>? 
                                  This action cannot be undone.
                                  </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Go Back</AlertDialogCancel>
                                    <AlertDialogAction
                                    className="bg-red-500 hover:bg-red-600"
                                    onClick={() => handleCancelClass(lecture.title)}>
                                      Yes, Cancel
                                      </AlertDialogAction>
                                      </AlertDialogFooter>
                                      </AlertDialogContent>
                                      </AlertDialog> */}
                                      
                                      <DropdownMenuItem asChild>
                                        <Link
                    href={`/lms-home/student/classes/${formatSubject(lecture.subject)}/cancel`}>
                      <DropdownMenuItem className="text-red-500 cursor-pointer">
                            Cancel class
                      </DropdownMenuItem>
                      </Link>
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem asChild>
                        <Link
                        href={`/lms-home/student/classes/${formatSubject(lecture.subject)}/reschedule`}>
                          <DropdownMenuItem className="cursor-pointer">
                            Reschedule class
                      </DropdownMenuItem>
                          </Link>
                          </DropdownMenuItem>
                          </DropdownMenuContent>
                          </DropdownMenu>
            </div>

            {/* Lecture Thumbnail */}
            <Image
              src={lecture.image}
              alt={lecture.title}
              width={400}
              height={200}
              className="rounded-md w-full object-cover"
            />

            {/* Lecture Info */}
            <span className="text-xs font-medium text-blue-600 mt-2 inline-block">
              {lecture.subject.toUpperCase()}
            </span>
            <h4 className="font-semibold text-md mt-1">{lecture.title}</h4>

            <div className="flex items-center text-sm text-gray-500 mt-2 space-x-4">
              <div className="flex items-center gap-1">
                <Star size={14} className="text-yellow-500" />
                <span>{lecture.rating}</span>
              </div>
              <div className="flex items-center gap-1">
                <UserRound size={14} className="text-blue-500" />
                <span>{lecture.students}</span>
              </div>
            </div>

            <div className="mt-2 text-sm flex justify-between items-center">
              <span className="text-green-600 font-medium">Paid</span>
              <span className="line-through text-gray-400">{lecture.price}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <div className="absolute -top-2 right-0 flex space-x-2">
        <button
          onClick={() => instanceRef.current?.prev()}
          className="bg-gray-200 p-2 rounded hover:bg-gray-300"
        >
          <ChevronLeft />
        </button>
        <button
          onClick={() => instanceRef.current?.next()}
          className="bg-gray-200 p-2 rounded hover:bg-gray-300"
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  );
}





// "use client";

// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";

// interface Lecture {
//   id: string;
//   subject: string;
//   time: string;
//   tutor: string;
// }

// const TodaysLecture = () => {
//   // Sample data - in real app, fetch from backend
//   const lectures: Lecture[] = [
//     { id: "1", subject: "Mathematics - Algebra", time: "10:00 AM - 11:30 AM", tutor: "Mr. Johnson" },
//     { id: "2", subject: "English Literature", time: "12:00 PM - 1:30 PM", tutor: "Mrs. Smith" },
//     { id: "3", subject: "Physics - Mechanics", time: "2:00 PM - 3:30 PM", tutor: "Dr. Brown" },
//   ];

//   const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);
//   const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
//   const [isCancelOpen, setIsCancelOpen] = useState(false);

//   const openRescheduleModal = (lecture: Lecture) => {
//     setSelectedLecture(lecture);
//     setIsRescheduleOpen(true);
//   };

//   const openCancelModal = (lecture: Lecture) => {
//     setSelectedLecture(lecture);
//     setIsCancelOpen(true);
//   };

//   const handleReschedule = () => {
//     console.log(`Rescheduling Lecture: ${selectedLecture?.subject}`);
//     setIsRescheduleOpen(false);
//   };

//   const handleCancel = () => {
//     console.log(`Cancelling Lecture: ${selectedLecture?.subject}`);
//     setIsCancelOpen(false);
//   };

//   return (
//     <div className="bg-white p-4 rounded-xl shadow">
//       <h2 className="text-lg font-bold mb-4">Today's Lecture</h2>

//       <div className="space-y-4">
//         {lectures.map((lecture) => (
//           <div
//             key={lecture.id}
//             className="flex items-center justify-between border p-3 rounded-lg shadow-sm"
//           >
//             <div>
//               <h3 className="font-semibold">{lecture.subject}</h3>
//               <p className="text-sm text-gray-500">{lecture.time}</p>
//               <p className="text-sm text-gray-400">Tutor: {lecture.tutor}</p>
//             </div>
//             <div className="flex gap-2">
//               <Button
//                 variant="outline"
//                 onClick={() => openRescheduleModal(lecture)}
//               >
//                 Reschedule
//               </Button>
//               <Button
//                 variant="destructive"
//                 onClick={() => openCancelModal(lecture)}
//               >
//                 Cancel
//               </Button>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Reschedule Modal */}
//       <Dialog open={isRescheduleOpen} onOpenChange={setIsRescheduleOpen}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Reschedule Lecture</DialogTitle>
//           </DialogHeader>
//           <div className="space-y-3">
//             <p>
//               Rescheduling: <strong>{selectedLecture?.subject}</strong>
//             </p>
//             <Input type="datetime-local" />
//             <Textarea placeholder="Add a note (optional)" />
//           </div>
//           <DialogFooter>
//             <Button variant="outline" onClick={() => setIsRescheduleOpen(false)}>
//               Close
//             </Button>
//             <Button onClick={handleReschedule}>Confirm</Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Cancel Modal */}
//       <Dialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Cancel Lecture</DialogTitle>
//           </DialogHeader>
//           <div className="space-y-3">
//             <p>
//               Are you sure you want to cancel{" "}
//               <strong>{selectedLecture?.subject}</strong>?
//             </p>
//             <Textarea placeholder="Reason for cancellation (optional)" />
//           </div>
//           <DialogFooter>
//             <Button variant="outline" onClick={() => setIsCancelOpen(false)}>
//               No
//             </Button>
//             <Button variant="destructive" onClick={handleCancel}>
//               Yes, Cancel
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// };

// export default TodaysLecture;
