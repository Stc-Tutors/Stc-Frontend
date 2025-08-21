import React from "react";

interface MessageListProps {
  messages: { id: number; sender: string; subject: string; preview: string }[];
  onSelect: (id: number) => void;
}

export default function MessageList({ messages, onSelect }: MessageListProps) {
  return (
    <ul>
      {messages.map((msg) => (
        <li
          key={msg.id}
          onClick={() => onSelect(msg.id)}
          className="p-4 border-b hover:bg-gray-100 cursor-pointer"
        >
          <div className="font-semibold">{msg.sender}</div>
          <div className="text-sm text-gray-600">{msg.subject}</div>
          <div className="text-xs text-gray-400">{msg.preview}</div>
        </li>
      ))}
    </ul>
  );
}
