import React, { useState } from "react";

const roles = ["Registers", "Networking Room Assistants", "Security", "Support"];

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
    return `${hours}:${minutes.toString().padStart(2, "0")}`;
  };

  const assignBreaks = (names, shiftStartHour) => {
    if (!breakTime || !breakDuration) {
      return names.map((n) => ({ name: n, breakStart: "", breakEnd: "" }));
    }

    const total = names.length;
    const half = Math.ceil(total / 2);
    const firstHalf = names.slice(0, half);
    const secondHalf = names.slice(half);

    const breakStart1 = parseFloat(shiftStartHour) + parseFloat(breakTime);
    const breakEnd1 = breakStart1 + parseFloat(breakDuration) / 60;

    const breakStart2 = breakEnd1;
    const breakEnd2 = breakStart2 + parseFloat(breakDuration) / 60;

    const firstHalfSchedule = firstHalf.map((n) => ({
      name: n,
      breakStart: formatTime(breakStart1),
      breakEnd: formatTime(breakEnd1),
    }));

    const secondHalfSchedule = secondHalf.map((n) => ({
      name: n,
      breakStart: formatTime(breakStart2),
      breakEnd: formatTime(breakEnd2),
    }));

    return [...firstHalfSchedule, ...secondHalfSchedule];
  };

  const addUsers = () => {
    const morningList = parseNames(morningNames);
    const afternoonList = parseNames(afternoonNames);

    const morningSchedule = assignBreaks(morningList, 7); // Morning shift starts at 7
    const afternoonSchedule = assignBreaks(afternoonList, 13); // Afternoon starts at 13:00

    const newTable = {
      morning: morningSchedule,
      afternoon: afternoonSchedule,
      role,
    };

    setTables([newTable, ...tables]); // stack new schedule on top
    setMorningNames("");
    setAfternoonNames("");
  };

  return (
    <div className="border p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Shift #{id}</h2>

      {/* Role Selector */}
      <label className="block mb-2">
        Role:
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="border p-2 rounded ml-2"
        >
          {roles.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </label>

      {/* Names Input */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block mb-2">Morning Shift Names</label>
          <textarea
            value={morningNames}
            onChange={(e) => setMorningNames(e.target.value)}
            placeholder="Enter names separated by commas or line breaks"
            className="border p-2 w-full rounded"
            rows="4"
          />
        </div>
        <div>
          <label className="block mb-2">Afternoon Shift Names</label>
          <textarea
            value={afternoonNames}
            onChange={(e) => setAfternoonNames(e.target.value)}
            placeholder="Enter names separated by commas or line breaks"
            className="border p-2 w-full rounded"
            rows="4"
          />
        </div>
      </div>

      {/* Break Inputs */}
      <div className="flex gap-4 mb-4">
        <div>
          <label>Break Start (hours after shift start)</label>
          <input
            type="number"
            step="0.1"
            value={breakTime}
            onChange={(e) => setBreakTime(e.target.value)}
            className="border p-2 rounded w-32"
          />
        </div>
        <div>
          <label>Break Duration (minutes)</label>
          <input
            type="number"
            value={breakDuration}
            onChange={(e) => setBreakDuration(e.target.value)}
            className="border p-2 rounded w-32"
          />
        </div>
      </div>

      {/* Add Users Button */}
      <button
        onClick={addUsers}
        className="bg-green-600 text-white px-4 py-2 rounded mb-6"
      >
        Add Users
      </button>

      {/* Generated Tables */}
      {tables.map((table, idx) => (
        <div key={idx} className="mb-6 overflow-x-auto">
          <h3 className="text-lg font-bold mb-2">Schedule #{tables.length - idx}</h3>
          <p className="italic mb-2">Role: {table.role}</p>
          <table className="table-auto w-full border-collapse border text-left">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Shift</th>
                <th className="border p-2">Name</th>
                <th className="border p-2">Role</th>
                <th className="border p-2">Start</th>
                <th className="border p-2">End</th>
                <th className="border p-2">Break Start</th>
                <th className="border p-2">Break End</th>
              </tr>
            </thead>
            <tbody>
              {table.morning.map((p, i) => (
                <tr key={`m-${i}`}>
                  <td className="border p-2">Morning</td>
                  <td className="border p-2">{p.name}</td>
                  <td className="border p-2">{table.role}</td>
                  <td className="border p-2">7:00</td>
                  <td className="border p-2">12:00</td>
                  <td className="border p-2">{p.breakStart}</td>
                  <td className="border p-2">{p.breakEnd}</td>
                </tr>
              ))}
              {table.afternoon.map((p, i) => (
                <tr key={`a-${i}`}>
                  <td className="border p-2">Afternoon</td>
                  <td className="border p-2">{p.name}</td>
                  <td className="border p-2">{table.role}</td>
                  <td className="border p-2">13:00</td>
                  <td className="border p-2">18:00</td>
                  <td className="border p-2">{p.breakStart}</td>
                  <td className="border p-2">{p.breakEnd}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
