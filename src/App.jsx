import React, { useState } from "react";
import ShiftScheduler from "./components/ShiftScheduler";

export default function App() {
  const [shiftCount, setShiftCount] = useState(0);
  const [schedules, setSchedules] = useState([]);

  const addShift = () => {
    const id = shiftCount + 1;
    setShiftCount(id);
    setSchedules([...schedules, { id }]);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-black font-sans p-8 space-y-8">
      <header className="max-w-5xl mx-auto text-center">
        <h1 className="text-5xl font-bold mb-2 text-gray-900">Shift Scheduler</h1>
        <p className="text-gray-600 text-lg">
          Organize volunteers efficiently with clean scheduling.
        </p>
      </header>

      <main className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-center">
          <button
            onClick={addShift}
            className="px-8 py-3 border border-black rounded-lg hover:bg-black hover:text-white font-semibold shadow transition-all"
          >
            Add Work Shift
          </button>
        </div>

        <div className="space-y-6">
          {schedules.map((schedule) => (
            <ShiftScheduler key={schedule.id} id={schedule.id} />
          ))}
        </div>
      </main>
    </div>
  );
}
