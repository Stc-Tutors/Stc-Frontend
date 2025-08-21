import React from "react";

interface Message {
  id: number;
  sender: string;
  subject: string;
  content: string;
}

export default function MessageView({ message }: { message: Message }) {
  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-2">{message.subject}</h2>
      <p className="text-gray-500 mb-4">From: {message.sender}</p>
      <div className="text-gray-700">{message.content}</div>
    </div>
  );
}
