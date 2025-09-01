"use client";
export default function AnnouncementCard() {
  const announcements = [
    {
      subject: "Mathematics",
      date: "Wed 12",
      content:
        "A new worksheet on Algebraic Expressions has been uploaded. Please complete it before Friday. Don’t forget to revise if you need a refresher.",
    },
    {
      subject: "English",
      date: "Wed 12",
      content:
        "This week’s focus on persuasive writing is available in your course section. You’ll present your short essay by Sunday night.",
    },
    {
      subject: "Physics",
      date: "Wed 12",
      content:
        "Your Forces and Motion quiz is scheduled for Thursday. A hint: all practice problems are available in the class board.",
    },
  ];

  return (
    <div className="bg-white rounded-lg p-4 shadow row-span-2">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Announcement</h3>
        <a href="#" className="text-sm text-blue-500">
          View all
        </a>
      </div>

      <div className="space-y-4 text-sm">
        {announcements.map((item, index) => (
          <div key={index} className="border-l-4 pl-4 border-blue-100">
            <div className="text-xs text-gray-500 font-medium mb-1">{item.date}</div>
            <div className="font-semibold text-gray-700">{item.subject}</div>
            <p className="text-gray-600">{item.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
