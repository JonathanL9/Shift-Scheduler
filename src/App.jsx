import React, { useState } from "react";
import ShiftScheduler from "./components/ShiftScheduler";
import EditWorkFlow from "./components/Edit";

export default function App() {
  const [shiftCount, setShiftCount] = useState(0);
  const [schedules, setSchedules] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAddShiftDisabled, setIsAddShiftDisabled] = useState(false);

  const toggleSection = () => {
    setIsExpanded(prev => !prev);
  };

  const addShift = () => {
  if (isAddShiftDisabled) return; // Prevent execution if already clicked
  const id = shiftCount + 1;
  setShiftCount(id);
  setSchedules([...schedules, { id }]);
  setIsAddShiftDisabled(true); // Disable button after clicking
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
  disabled={isAddShiftDisabled}
  className={`px-8 py-3 border border-black rounded-lg font-semibold shadow transition-all ${
    isAddShiftDisabled
      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
      : "hover:bg-black hover:text-white"
  }`}
>
  Activate Work Shift
</button>
        </div>

        <div className="space-y-6">
          {schedules.map((schedule) => (
            <ShiftScheduler key={schedule.id} id={schedule.id} />
          ))}
        </div>
      </main>
<div className="">
    <button
  className="w-full px-6 py-4 text-lg font-semibold text-white bg-black rounded-lg shadow-md hover:bg-gray-800 transition duration-300 ease-in-out"
  onClick={toggleSection}
>
  <span className="text-white">
 {isExpanded ? '▲ Collapse WorkFlow' : '▼ Expand WorkFlow'}
  </span>
</button>


      {isExpanded && (
        <div className="content">
         <EditWorkFlow></EditWorkFlow>
        </div>
      )}
    </div>
      
    </div>
  );
}
