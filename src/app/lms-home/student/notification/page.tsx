"use client";
import { ArrowLeft, Bell, UserCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

const notifications = [
  {
    id: 1,
    time: "1hr ago",
    date: "Today",
    message: "Your mathematics Result is ready and we have uploaded them to your Dashboard",
  },
  {
    id: 2,
    time: "1hr ago",
    date: "Today",
    message: "Your mathematics Result is ready and we have uploaded them to your Dashboard",
  },
  {
    id: 3,
    time: "1hr ago",
    date: "Today",
    message: "Your mathematics Result is ready and we have uploaded them to your Dashboard",
  },
  {
    id: 4,
    time: "Yesterday",
    date: "Yesterday",
    message: "Your mathematics Result is ready and we have uploaded them to your Dashboard",
  },
  {
    id: 5,
    time: "Yesterday",
    date: "Yesterday",
    message: "Your mathematics Result is ready and we have uploaded them to your Dashboard",
  },
];

export default function NotificationPage() {

  const router = useRouter();
  
    const handleBack = () => {
      router.push(`/lms-home/student/dashboard`);
    };
    
  return (
    <div className="min-h-screen bg-gray-100 relative">
       {/* Back Button */}
      <button
        onClick={handleBack}
        className="flex items-center text-gray-700 mb-4 hover:text-blue-500"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        <span className="text-sm font-bold">BACK</span>
      </button>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Notification</h2>
          <button className="text-sm text-blue-600 hover:underline">Mark all as read</button>
        </div>

        <p className="text-gray-500 mb-6">You have 6 new Notification to read</p>

        {/* Grouped notifications */}
        {["Today", "Yesterday"].map(dateGroup => (
          <div key={dateGroup} className="mb-8">
            <h3 className="text-gray-600 font-semibold mb-3">{dateGroup}</h3>
            {notifications
              .filter(n => n.date === dateGroup)
              .map(n => (
                <div
                  key={n.id}
                  className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center mb-3"
                >
                  <div className="flex items-start gap-4">
                    <UserCircle className="text-blue-500" />
                    <div>
                      <p className="font-semibold text-gray-800">
                        Result of mathematics Test{" "}
                        <span className="text-gray-400 text-sm">({n.time})</span>
                      </p>
                      <p className="text-sm text-gray-600">{n.message}</p>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:underline text-sm">View</button>
                </div>
              ))}
          </div>
        ))}
      </main>
    </div>
  );
}
