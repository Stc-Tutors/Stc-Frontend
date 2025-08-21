"use client";

import React, { useState } from "react";
import { Search, Star, StarOff } from "lucide-react";
import MessageList from "@/components/studentDashboard/messages/MessageList";
import MessageView from "@/components/studentDashboard/messages/MessageView";
import ComposeMessage from "@/components/studentDashboard/messages/ComposeMessage";

export default function MessagesPage() {
  const [selectedMessage, setSelectedMessage] = useState<number | null>(null);
  const [composing, setComposing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("All");
  const [starredMessages, setStarredMessages] = useState<number[]>([]);
  const [readMessages, setReadMessages] = useState<number[]>([]);

  const messages = [
    { id: 1, sender: "Admin", subject: "Welcome!", preview: "Welcome to the LMS platform.", content: "We are glad to have you here!", sent: false },
    { id: 2, sender: "John Doe", subject: "Schedule Update", preview: "Your class schedule has been updated.", content: "Please check your new schedule for changes.", sent: false },
    { id: 3, sender: "You", subject: "Assignment Submission", preview: "I have submitted my assignment.", content: "Please review my latest assignment submission.", sent: true },
  ];

  // Filtering logic
  const filteredMessages = messages
    .filter((msg) => {
      if (filter === "Unread") return !readMessages.includes(msg.id);
      if (filter === "Starred") return starredMessages.includes(msg.id);
      if (filter === "Sent") return msg.sent;
      return true; // All
    })
    .filter(
      (msg) =>
        msg.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.preview.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const toggleStar = (id: number) => {
    setStarredMessages((prev) =>
      prev.includes(id) ? prev.filter((msgId) => msgId !== id) : [...prev, id]
    );
  };

  const markAsRead = (id: number) => {
    if (!readMessages.includes(id)) {
      setReadMessages((prev) => [...prev, id]);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar List */}
      <div className="w-1/4 border-r bg-white flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-bold text-lg">Messages</h2>
          <button
            onClick={() => {
              setSelectedMessage(null);
              setComposing(true);
            }}
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
          >
            New
          </button>
        </div>

        {/* Search & Filter */}
        <div className="p-3 border-b space-y-2">
          {/* Search bar */}
          <div className="flex items-center bg-gray-100 px-2 rounded">
            <Search size={18} className="text-gray-500" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent px-2 py-1 w-full outline-none text-sm"
            />
          </div>

          {/* Filter dropdown */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full border rounded px-2 py-1 text-sm"
          >
            <option>All</option>
            <option>Unread</option>
            <option>Starred</option>
            <option>Sent</option>
          </select>
        </div>

        {/* Message List */}
        <div className="flex-1 overflow-y-auto">
          {filteredMessages.map((msg) => (
            <div
              key={msg.id}
              onClick={() => {
                setSelectedMessage(msg.id);
                setComposing(false);
                markAsRead(msg.id);
              }}
              className={`flex items-center justify-between p-3 cursor-pointer hover:bg-blue-50 ${
                selectedMessage === msg.id ? "bg-blue-100" : ""
              }`}
            >
              <div className="flex items-center space-x-3">
                {/* Unread dot */}
                {!readMessages.includes(msg.id) && (
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                )}
                <div>
                  <p className="font-medium text-sm">{msg.sender}</p>
                  <p className="text-xs text-gray-500 truncate w-36">
                    {msg.subject}
                  </p>
                </div>
              </div>

              {/* Star icon */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  toggleStar(msg.id);
                }}
                className="text-gray-400 hover:text-yellow-500"
              >
                {starredMessages.includes(msg.id) ? (
                  <Star size={18} fill="gold" />
                ) : (
                  <StarOff size={18} />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main View */}
      <div className="flex-1 p-4">
        {composing ? (
          <ComposeMessage onCancel={() => setComposing(false)} />
        ) : selectedMessage ? (
          <MessageView
            message={messages.find((msg) => msg.id === selectedMessage)!}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            Select a message or compose a new one
          </div>
        )}
      </div>
    </div>
  );
}
