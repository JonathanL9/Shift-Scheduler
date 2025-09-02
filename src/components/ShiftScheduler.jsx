import React, { useState } from "react";
import ExportPDFButton from "./ExportPdfButton";

const roles = ["Registers", "Networking Room Assistants", "Plenary", "DSA Room", "Visa"];

export default function ShiftScheduler({ id }) {
  const [morningNames, setMorningNames] = useState("");
  const [afternoonNames, setAfternoonNames] = useState("");
  const [role, setRole] = useState(roles[0]);

  const [breakTime, setBreakTime] = useState(""); // hours after shift start
  const [breakDuration, setBreakDuration] = useState(""); // minutes

  const [tables, setTables] = useState([]);

  const parseNames = (text) =>
    text
      .split(/[\n,]+/)
      .map((name) => name.trim())
      .filter((name) => name);

  const formatTime = (hourDecimal) => {
    const hours = Math.floor(hourDecimal);
    const minutes = Math.round((hourDecimal - hours) * 60);
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  };

  const assignBreaks = (names, shiftStartHour) => {
    if (!breakTime || !breakDuration) {
      return [{ names, breakStart: "", breakEnd: "" }];
    }

    const total = names.length;
    const half = Math.ceil(total / 2);
    const firstHalf = names.slice(0, half);
    const secondHalf = names.slice(half);

    const breakStart1 = parseFloat(shiftStartHour) + parseFloat(breakTime);
    const breakEnd1 = breakStart1 + parseFloat(breakDuration) / 60;

    const breakStart2 = breakEnd1;
    const breakEnd2 = breakStart2 + parseFloat(breakDuration) / 60;

    const result = [];
    if (firstHalf.length > 0)
      result.push({
        names: firstHalf,
        breakStart: formatTime(breakStart1),
        breakEnd: formatTime(breakEnd1),
      });
    if (secondHalf.length > 0)
      result.push({
        names: secondHalf,
        breakStart: formatTime(breakStart2),
        breakEnd: formatTime(breakEnd2),
      });

    return result;
  };

  const addUsers = () => {
    const morningList = parseNames(morningNames);
    const afternoonList = parseNames(afternoonNames);

    const morningSchedule = assignBreaks(morningList, 7);
    const afternoonSchedule = assignBreaks(afternoonList, 13);

    const newTable = {
      morning: morningSchedule,
      afternoon: afternoonSchedule,
      role,
    };

    setTables([newTable, ...tables]);
    setMorningNames("");
    setAfternoonNames("");
    setBreakTime("");
    setBreakDuration("");
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">#{id}</h2>

      {/* Role Selector */}
      <div className="flex items-center gap-4 flex-wrap">
        <label className="font-medium text-gray-700">Role:</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="border rounded px-3 py-2 focus:ring-2 focus:ring-gray-400"
        >
          {roles.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {/* Names Input */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-medium text-gray-700 mb-1">
            Morning Shift Names
          </label>
          <textarea
            value={morningNames}
            onChange={(e) => setMorningNames(e.target.value)}
            placeholder="Enter names separated by commas or line breaks"
            rows="4"
            className="w-full border rounded p-2 focus:ring-2 focus:ring-gray-300"
          />
        </div>
        <div>
          <label className="block font-medium text-gray-700 mb-1">
            Afternoon Shift Names
          </label>
          <textarea
            value={afternoonNames}
            onChange={(e) => setAfternoonNames(e.target.value)}
            placeholder="Enter names separated by commas or line breaks"
            rows="4"
            className="w-full border rounded p-2 focus:ring-2 focus:ring-gray-300"
          />
        </div>
      </div>

      {/* Break Inputs */}
      <div className="flex gap-4 flex-wrap">
        <div>
          <label className="block font-medium text-gray-700 mb-1">
            Break Start (hours after shift start)
          </label>
          <input
            type="number"
            step="0.1"
            value={breakTime}
            onChange={(e) => setBreakTime(e.target.value)}
            className="border rounded px-3 py-2 focus:ring-2 focus:ring-gray-300 w-40"
          />
        </div>
        <div>
          <label className="block font-medium text-gray-700 mb-1">
            Break Duration (minutes)
          </label>
          <input
            type="number"
            value={breakDuration}
            onChange={(e) => setBreakDuration(e.target.value)}
            className="border rounded px-3 py-2 focus:ring-2 focus:ring-gray-300 w-40"
          />
        </div>
      </div>

      {/* Add Users Button */}
      <button
        onClick={addUsers}
        className="bg-black hover:bg-gray-900 text-white font-semibold px-5 py-2 rounded-lg shadow transition-all"
      >
        Add Users
      </button>

      {/* Generated Tables */}
      {tables.map((table, idx) => (
        <div id="scheduleSection"> 
        <div
          key={idx}
          className="overflow-x-auto bg-gray-50 border border-gray-200 rounded-xl shadow-inner p-4"
        >
          <h3 className="text-xl font-semibold mb-3 text-gray-900">
            #{tables.length - idx} - Role: {table.role}
          </h3>
          <table className="min-w-full border-collapse border text-left">
            <thead>
              <tr className="bg-gray-200 text-gray-800">
                <th className="border px-3 py-2">Shift</th>
                <th className="border px-3 py-2">Time</th>
                <th className="border px-3 py-2">Break</th>
                <th className="border px-3 py-2">Names</th>
              </tr>
            </thead>
            <tbody className="text-gray-800">
              {table.morning.map((group, i) => (
                <tr key={`m-${i}`} className="hover:bg-gray-100">
                  <td className="border px-3 py-2">Morning</td>
                  <td className="border px-3 py-2">7:00 - 12:00</td>
                  <td className="border px-3 py-2">
                    {group.breakStart && group.breakEnd
                      ? `${group.breakStart} - ${group.breakEnd}`
                      : "-"}
                  </td>
                  <td className="border px-3 py-2 space-y-1">
                    {group.names.map((n, idx) => (
                      <div
                        key={idx}
                        className="inline-block bg-gray-200 rounded px-2 py-1 text-sm px-2"
                      >
                        {n}
                      </div>
                    ))}
                  </td>
                </tr>
              ))}
              {table.afternoon.map((group, i) => (
                <tr key={`a-${i}`} className="hover:bg-gray-100">
                  <td className="border px-3 py-2">Afternoon</td>
                  <td className="border px-3 py-2">13:00 - 18:00</td>
                  <td className="border px-3 py-2">
                    {group.breakStart && group.breakEnd
                      ? `${group.breakStart} - ${group.breakEnd}`
                      : "-"}
                  </td>
                  <td className="border px-3 py-2 space-y-1">
                    {group.names.map((n, idx) => (
                      <div
                        key={idx}
                        className="inline-block bg-gray-200 rounded px-2 py-1 text-sm"
                      >
                        {n}
                      </div>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>))}
      <ExportPDFButton sectionId="scheduleSection" />

    </div>
  );
}
