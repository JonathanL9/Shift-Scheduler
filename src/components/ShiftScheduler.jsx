import React, { useState, useRef, useEffect } from "react";
import ExportPDFButton from "./ExportPdfButton";

// Predefined associations for Location, Zone, and Role
const defaultLocationZoneRoleMap = {
  "Main Hall": {
    zones: ["Zone A", "Zone B"],
    roles: {
      "Zone A": ["Registration", "Plenary Room Assistant"],
      "Zone B": ["Catering Assistant", "Floater and Lift Helpers"],
    },
  },
  "Conference Room": {
    zones: ["Zone C"],
    roles: {
      "Zone C": ["Floor Supervisor", "Visa Room Attendant"],
    },
  },
  "Lobby": {
    zones: ["Zone D"],
    roles: {
      "Zone D": ["Networking Room Assistant (Up and Down)"],
    },
  },
  "Outdoor": {
    zones: ["Zone A", "Zone D"],
    roles: {
      "Zone A": ["Registration"],
      "Zone D": ["Catering Assistant"],
    },
  },
};

// Predefined Zone Captains for each zone
const defaultZoneCaptainMap = {
  "Zone A": ["Alice Smith", "Bob Johnson", "Carol Williams"],
  "Zone B": ["David Brown", "Emma Davis"],
  "Zone C": ["Frank Wilson", "Grace Lee"],
  "Zone D": ["Henry Clark", "Isabella Martinez"],
};

export default function ShiftScheduler({ id }) {
  const [morningNames, setMorningNames] = useState("");
  const [afternoonNames, setAfternoonNames] = useState("");
  const [fullDayNames, setFullDayNames] = useState("");
  const [role, setRole] = useState("");
  const [zone, setZone] = useState("");
  const [location, setLocation] = useState("");
  const [zoneCaptain, setZoneCaptain] = useState("");
  const [isFullDay, setIsFullDay] = useState(false);
  const [breakTime, setBreakTime] = useState("");
  const [breakDuration, setBreakDuration] = useState("");
  const [tables, setTables] = useState([]);
  const [locationZoneRoleMap, setLocationZoneRoleMap] = useState(() => {
    const stored = localStorage.getItem('locationZoneRoleMap');
    return stored ? JSON.parse(stored) : defaultLocationZoneRoleMap;
  });
  const [zoneCaptainMap, setZoneCaptainMap] = useState(() => {
    const stored = localStorage.getItem('zoneCaptainMap');
    return stored ? JSON.parse(stored) : defaultZoneCaptainMap;
  });
  const [locations, setLocations] = useState(Object.keys(
    localStorage.getItem('locationZoneRoleMap')
      ? JSON.parse(localStorage.getItem('locationZoneRoleMap'))
      : defaultLocationZoneRoleMap
  ));
  const [availableZones, setAvailableZones] = useState([]);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [availableCaptains, setAvailableCaptains] = useState([]);
  const editingIndex = useRef(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setLocations(Object.keys(locationZoneRoleMap));
  }, [locationZoneRoleMap]);

  useEffect(() => {
    if (locations.length > 0) {
      setLocation(locations[0]);
    }
  }, [locations]);

  useEffect(() => {
    if (location) {
      const selectedMap = locationZoneRoleMap[location];
      const newZones = selectedMap ? selectedMap.zones : [];
      setAvailableZones(newZones);
      setZone(newZones[0] || "");
    }
  }, [location, locationZoneRoleMap]);

  useEffect(() => {
    if (location && zone) {
      const selectedMap = locationZoneRoleMap[location];
      const newRoles = selectedMap ? selectedMap.roles[zone] || [] : [];
      setAvailableRoles(newRoles);
      setRole(newRoles[0] || "");
    }
    const newCaptains = zoneCaptainMap[zone] || [];
    setAvailableCaptains(newCaptains);
    setZoneCaptain(newCaptains[0] || "");
  }, [zone, location, locationZoneRoleMap, zoneCaptainMap]);

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

  const clearAllTables = () => {
    const confirmed = window.confirm(
      "Are you sure you want to remove ALL tables? This action cannot be undone."
    );
    if (confirmed) {
      setTables([]);
    }
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

  const resetInputs = () => {
    setMorningNames("");
    setAfternoonNames("");
    setFullDayNames("");
    setBreakTime("");
    setBreakDuration("");
    setLocation(locations[0] || "");
    editingIndex.current = null;
    setIsEditing(false);
  };

  const addOrUpdateUsers = () => {
    let morningSchedule = [];
    let afternoonSchedule = [];
    let fullDaySchedule = [];

    if (isFullDay) {
      const fullList = parseNames(fullDayNames);
      fullDaySchedule = assignBreaks(fullList, 8);
    } else {
      const morningList = parseNames(morningNames);
      const afternoonList = parseNames(afternoonNames);
      morningSchedule = assignBreaks(morningList, 7);
      afternoonSchedule = assignBreaks(afternoonList, 13);
    }

    const newTable = {
      role,
      zone,
      location,
      zoneCaptain,
      isFullDay,
      morning: morningSchedule,
      afternoon: afternoonSchedule,
      fullDay: fullDaySchedule,
      morningRaw: morningNames,
      afternoonRaw: afternoonNames,
      fullDayRaw: fullDayNames,
      breakTime,
      breakDuration,
    };

    if (editingIndex.current !== null) {
      const updated = [...tables];
      updated[editingIndex.current] = newTable;
      setTables(updated);
    } else {
      setTables([newTable, ...tables]);
    }

    resetInputs();
  };

  const editTable = (index) => {
    const t = tables[index];
  
    // Validate location, zone, role, and zone captain
    let isValid = true;
    let warningMessage = "The following data from the table is not available in the current workflow. Please reselect:\n";

    // Check if location exists
    if (!locationZoneRoleMap[t.location]) {
      isValid = false;
      warningMessage += `- Location: ${t.location}\n`;
    }

    // Check if zone exists for the location
    if (isValid && t.zone && (!locationZoneRoleMap[t.location] || !locationZoneRoleMap[t.location].zones.includes(t.zone))) {
      isValid = false;
      warningMessage += `- Zone: ${t.zone}\n`;
    }

    // Check if role exists for the zone
    if (isValid && t.role && (!locationZoneRoleMap[t.location] || !locationZoneRoleMap[t.location].roles[t.zone]?.includes(t.role))) {
      isValid = false;
      warningMessage += `- Role: ${t.role}\n`;
    }

    // Check if zone captain exists
    if (isValid && t.zoneCaptain && (!zoneCaptainMap[t.zone] || !zoneCaptainMap[t.zone].includes(t.zoneCaptain))) {
      isValid = false;
      warningMessage += `- Zone Captain: ${t.zoneCaptain}\n`;
    }

    // Show warning if validation fails
    if (!isValid) {
      alert(warningMessage + "\nPlease update the selections for this table.");
      // Reset invalid fields to prompt reselection
      setLocation(t.location && locationZoneRoleMap[t.location] ? t.location : locations[0] || "");
      setZone(t.zone && locationZoneRoleMap[t.location]?.zones.includes(t.zone) ? t.zone : "");
      setRole(t.role && locationZoneRoleMap[t.location]?.roles[t.zone]?.includes(t.role) ? t.role : "");
      setZoneCaptain(t.zoneCaptain && zoneCaptainMap[t.zone]?.includes(t.zoneCaptain) ? t.zoneCaptain : "");
    } else {
      // Set all fields if valid
      setLocation(t.location);
      setZone(t.zone);
      setRole(t.role);
      setZoneCaptain(t.zoneCaptain || "");
    }

    // Set remaining fields
    setIsFullDay(t.isFullDay);
    setMorningNames(t.morningRaw);
    setAfternoonNames(t.afternoonRaw);
    setFullDayNames(t.fullDayRaw);
    setBreakTime(t.breakTime);
    setBreakDuration(t.breakDuration);
    editingIndex.current = index;
    setIsEditing(true);
  };

  const deleteTable = (index) => {
    const confirmed = window.confirm("Are you sure you want to delete this item?");
    if (confirmed) setTables((prev) => prev.filter((_, i) => i !== index));
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(tables, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `shift-schedules.json`;
    link.click();
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = JSON.parse(event.target.result);
      setTables(data);
    };
    reader.readAsText(file);
  };

  const importWorkflow = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = JSON.parse(event.target.result);
      const newLocationZoneRoleMap = data.locationZoneRoleMap || defaultLocationZoneRoleMap;
      const newZoneCaptainMap = data.zoneCaptainMap || defaultZoneCaptainMap;
      setLocationZoneRoleMap(newLocationZoneRoleMap);
      setZoneCaptainMap(newZoneCaptainMap);
      // Save to localStorage
      localStorage.setItem('locationZoneRoleMap', JSON.stringify(newLocationZoneRoleMap));
      localStorage.setItem('zoneCaptainMap', JSON.stringify(newZoneCaptainMap));
    };
    reader.readAsText(file);
  };

  const clearWorkflow = () => {
    const confirmed = window.confirm(
      "Are you sure you want to clear the current workflow JSON and revert to default data?"
    );
    if (confirmed) {
      localStorage.removeItem('locationZoneRoleMap');
      localStorage.removeItem('zoneCaptainMap');
      setLocationZoneRoleMap(defaultLocationZoneRoleMap);
      setZoneCaptainMap(defaultZoneCaptainMap);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 space-y-6">
      <div className="flex gap-4">
        <label className="bg-gray-200 hover:bg-gray-300 text-black font-semibold px-5 py-2 rounded-lg shadow transition-all cursor-pointer">
          Import Workflow JSON
          <input
            type="file"
            accept="application/json"
            onChange={importWorkflow}
            className="hidden"
          />
        </label>
        <button
          onClick={clearWorkflow}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold px-5 py-2 rounded-lg shadow transition-all"
        >
          Clear Current Workflow JSON
        </button>
      </div>
      <h2 className="text-2xl font-bold text-gray-900">#{id}</h2>

      {/* Dropdowns */}
      <div className="flex items-center gap-4 flex-wrap">
        <label className="font-medium text-gray-700">Location:</label>
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="border rounded px-3 py-2 focus:ring-2 focus:ring-gray-400"
        >
          {locations.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>

        <label className="font-medium text-gray-700">Zone:</label>
        <select
          value={zone}
          onChange={(e) => setZone(e.target.value)}
          className="border rounded px-3 py-2 focus:ring-2 focus:ring-gray-400"
        >
          {availableZones.map((z) => (
            <option key={z} value={z}>
              {z}
            </option>
          ))}
        </select>

        <label className="font-medium text-gray-700">Role:</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="border rounded px-3 py-2 focus:ring-2 focus:ring-gray-400"
        >
          {availableRoles.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        <label className="font-medium text-gray-700">Zone Captain:</label>
        <select
          value={zoneCaptain}
          onChange={(e) => setZoneCaptain(e.target.value)}
          className="border rounded px-3 py-2 focus:ring-2 focus:ring-gray-400"
        >
          {availableCaptains.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Toggle */}
      <div className="flex items-center gap-2">
        <span className="font-medium text-gray-700">
          {isFullDay ? "Full Day Mode" : "Half Day Mode"}
        </span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isFullDay}
            onChange={() => setIsFullDay(!isFullDay)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:bg-black transition"></div>
          <span className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition peer-checked:translate-x-5"></span>
        </label>
      </div>

      {/* Names Input */}
      {!isFullDay ? (
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
      ) : (
        <div>
          <label className="block font-medium text-gray-700 mb-1">
            Full Day Shift Names
          </label>
          <textarea
            value={fullDayNames}
            onChange={(e) => setFullDayNames(e.target.value)}
            placeholder="Enter names separated by commas or line breaks"
            rows="4"
            className="w-full border rounded p-2 focus:ring-2 focus:ring-gray-300"
          />
        </div>
      )}

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

      {/* Buttons */}
      <div className="flex gap-4">
        <button
          onClick={addOrUpdateUsers}
          className="bg-black hover:bg-gray-900 text-white font-semibold px-5 py-2 rounded-lg shadow transition-all"
        >
          {editingIndex.current !== null ? "Update Schedule" : "Add Schedule"}
        </button>
        {isEditing && (
          <button
            onClick={resetInputs}
            className="bg-red-200 hover:bg-red-300 text-black font-semibold px-5 py-2 rounded-lg shadow transition-all"
          >
            Cancel Edit
          </button>
        )}
        <button
          onClick={exportData}
          className="bg-gray-200 hover:bg-gray-300 text-black font-semibold px-5 py-2 rounded-lg shadow transition-all"
        >
          Export JSON Table
        </button>
        <label className="bg-gray-200 hover:bg-gray-300 text-black font-semibold px-5 py-2 rounded-lg shadow transition-all cursor-pointer">
          Import JSON Table
          <input
            type="file"
            accept="application/json"
            onChange={importData}
            className="hidden"
          />
        </label>
      </div>

      {/* Generated Tables */}
      <div id="scheduleSection">
        {tables.map((table, idx) => (
          <div key={idx}>
            <div className="overflow-x-auto bg-gray-50 border border-gray-200 rounded-xl shadow-inner p-4 mt-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xl font-semibold text-gray-900">
                  #{tables.length - idx} - Location: {table.location} &nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp; Role: {table.role} <br></br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Zone: {table.zone} &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp; Zone Captain: {table.zoneCaptain || "None"}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => deleteTable(idx)}
                    className="text-sm px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => editTable(idx)}
                    className="text-sm px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Edit
                  </button>
                </div>
              </div>
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
                  {!table.isFullDay &&
                    table.morning.map((group, i) => (
                      <tr key={`m-${i}`} className="hover:bg-gray-100">
                        {i === 0 && (
                          <>
                            <td
                              className="border px-3 py-2"
                              rowSpan={table.morning.length}
                            >
                              Morning
                            </td>
                            <td
                              className="border px-3 py-2"
                              rowSpan={table.morning.length}
                            >
                              7:00 - 12:00
                            </td>
                          </>
                        )}
                        <td className="border px-3 py-2">
                          {group.breakStart && group.breakEnd
                            ? `${group.breakStart} - ${group.breakEnd}`
                            : "-"}
                        </td>
                        <td className="border px-3 py-2 space-y-1">
                          {group.names.map((n, idx) => (
                            <div
                              key={idx}
                              className="bg-gray-200 rounded px-2 py-1 text-sm"
                            >
                              {n}
                            </div>
                          ))}
                        </td>
                      </tr>
                    ))}
                  {!table.isFullDay &&
                    table.afternoon.map((group, i) => (
                      <tr key={`a-${i}`} className="hover:bg-gray-100">
                        {i === 0 && (
                          <>
                            <td
                              className="border px-3 py-2"
                              rowSpan={table.afternoon.length}
                            >
                              Afternoon
                            </td>
                            <td
                              className="border px-3 py-2"
                              rowSpan={table.afternoon.length}
                            >
                              13:00 - 18:00
                            </td>
                          </>
                        )}
                        <td className="border px-3 py-2">
                          {group.breakStart && group.breakEnd
                            ? `${group.breakStart} - ${group.breakEnd}`
                            : "-"}
                        </td>
                        <td className="border px-3 py-2 space-y-1">
                          {group.names.map((n, idx) => (
                            <div
                              key={idx}
                              className="bg-gray-200 rounded px-2 py-1 text-sm"
                            >
                              {n}
                            </div>
                          ))}
                        </td>
                      </tr>
                    ))}
                  {table.isFullDay &&
                    table.fullDay.map((group, i) => (
                      <tr key={`f-${i}`} className="hover:bg-gray-100">
                        {i === 0 && (
                          <>
                            <td
                              className="border px-3 py-2"
                              rowSpan={table.fullDay.length}
                            >
                              Full Day
                            </td>
                            <td
                              className="border px-3 py-2"
                              rowSpan={table.fullDay.length}
                            >
                              08:00 - 18:00
                            </td>
                          </>
                        )}
                        <td className="border px-3 py-2">
                          {group.breakStart && group.breakEnd
                            ? `${group.breakStart} - ${group.breakEnd}`
                            : "-"}
                        </td>
                        <td className="border px-3 py-2 space-y-1">
                          {group.names.map((n, idx) => (
                            <div
                              key={idx}
                              className="bg-gray-200 rounded px-2 py-1 text-sm"
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
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center w-full mt-4">
        <ExportPDFButton sectionId="scheduleSection" />
        <button
          onClick={clearAllTables}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold px-5 py-2 rounded-lg shadow transition-all"
        >
          Clear All Tables
        </button>
      </div>
    </div>
  );
}