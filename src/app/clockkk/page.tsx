"use client";

import { useState } from 'react';

export default function ClockOutPage() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [dailyNote, setDailyNote] = useState('');
  const [hasClockedOut, setHasClockedOut] = useState(false);

  const handleClockOut = () => {
    setShowPrompt(true);
  };

  const confirmClockOut = () => {
    // Here you would typically send data to your backend including the dailyNote
    console.log('User clocked out with note:', dailyNote);
    setHasClockedOut(true);
    setShowPrompt(false);
  };

  const cancelClockOut = () => {
    setShowPrompt(false);
  };

  return (
    <>
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto mt-20 bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Clock Out</h1>
        
        {/* Time Tracking Table */}
       <div className="flex mt-12 mb-12 justify-around">
          <div>
              <p className="text-sm mb-2">Clock In</p>
              <h4 className="font-bold">09.02 AM</h4>
          </div>
          <div>
              <p className="text-sm mb-2">Clock Out Time</p>
              <h4 className="font-bold">04:00 PM</h4>
          </div>
          <div>
              <p className="text-sm mb-2">Total Time</p>
              <h4 className="font-bold">6 hrs 15 min </h4>
          </div>
        </div>

        <div className="border-t pt-6">
          {hasClockedOut ? (
            <div className="text-center py-4">
              <p className="text-green-600 mb-4 text-lg font-medium">You have successfully clocked out!</p>
              <p>Have a great day!</p>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold mb-4">Are you sure you want to clock out?</h2>
              
              {/* Daily Note Field */}
              <div className="mb-6">
                <label htmlFor="dailyNote" className="block text-sm font-medium text-gray-700 mb-1">
                  Daily Note <span className="text-gray-500">(optional)</span>
                </label>
                <input
                  type="text"
                  id="dailyNote"
                  value={dailyNote}
                  onChange={(e) => setDailyNote(e.target.value)}
                  placeholder="E.g Firsthand Classwork_7363536778"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Clock Out Buttons */}
              <div className="flex space-x-4">
                <button onClick={handleClockOut} className="flex-1 bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition duration-200 font-medium">Clock Out Now</button>
                <button onClick={handleClockOut} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition duration-200 font-medium">Go Back</button>
              </div>
            </>
          )}

          {/* Prompt Modal */}
          {showPrompt && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white p-6 rounded-lg max-w-sm w-full">
                <h2 className="text-xl font-bold mb-4">Confirm Clock Out</h2>
                <p className="mb-6">Are you sure you want to clock out now?</p>
                {dailyNote && (
                  <p className="mb-4 p-2 bg-gray-100 rounded">
                    <span className="font-medium">Your note:</span> {dailyNote}
                  </p>
                )}
                <div className="flex space-x-4">
                  <button
                    onClick={cancelClockOut}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded transition duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmClockOut}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition duration-200"
                  >
                    Yes, Clock Out
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}