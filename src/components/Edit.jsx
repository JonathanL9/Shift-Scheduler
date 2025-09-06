import React, { useState } from "react";

export default function EditWorkFlow() {
  const [locationZoneRoleMap, setLocationZoneRoleMap] = useState({});
  const [zoneCaptainMap, setZoneCaptainMap] = useState({});
  const [newLocation, setNewLocation] = useState("");
  const [currentLocation, setCurrentLocation] = useState(null); // Track location being edited
  const [newZones, setNewZones] = useState([]); // Array of {zoneName, captain, roles}
  const [editingLocation, setEditingLocation] = useState(null); // For editing existing location

  const parseItems = (text) =>
    text
      .split(/[\n,]+/)
      .map((item) => item.trim())
      .filter((item) => item);

  const clearAllData = () => {
    const confirmed = window.confirm("Are you sure you want to clear all data? This action cannot be undone.");
    if (confirmed) {
      setLocationZoneRoleMap({});
      setZoneCaptainMap({});
      setNewLocation("");
      setNewZones([]);
      setCurrentLocation(null);
      setEditingLocation(null);
    }
  };

  const addZoneInput = () => {
    setNewZones([...newZones, { zoneName: "", captain: "", roles: "" }]);
  };

  const updateZoneInput = (index, field, value) => {
    const updatedZones = [...newZones];
    updatedZones[index][field] = value;
    setNewZones(updatedZones);
  };

  const removeZoneInput = (index) => {
    setNewZones(newZones.filter((_, i) => i !== index));
  };

  const confirmLocation = () => {
    if (!newLocation || newZones.length === 0) return;

    const validZones = newZones.filter((z) => z.zoneName && z.captain && z.roles);
    if (validZones.length === 0) return;

    const newLocationData = {
      zones: validZones.map((z) => z.zoneName),
      roles: validZones.reduce((acc, z) => {
        acc[z.zoneName] = parseItems(z.roles);
        return acc;
      }, {}),
    };

    setLocationZoneRoleMap((prev) => ({
      ...prev,
      [newLocation]: newLocationData,
    }));

    setZoneCaptainMap((prev) => {
      const updated = { ...prev };
      validZones.forEach((z) => {
        updated[z.zoneName] = parseItems(z.captain);
      });
      return updated;
    });

    // Reset inputs
    setNewLocation("");
    setNewZones([]);
    setCurrentLocation(null);
    setEditingLocation(null);
  };

  const editLocation = (loc) => {
    const locData = locationZoneRoleMap[loc];
    const zonesData = locData.zones.map((zone) => ({
      zoneName: zone,
      captain: (zoneCaptainMap[zone] || []).join(", "),
      roles: (locData.roles[zone] || []).join(", "),
    }));
    setNewLocation(loc);
    setNewZones(zonesData);
    setCurrentLocation(loc);
    setEditingLocation(loc);
  };

  const saveEditedLocation = () => {
    if (!editingLocation || newZones.length === 0) return;

    const validZones = newZones.filter((z) => z.zoneName && z.captain && z.roles);
    if (validZones.length === 0) return;

    // Remove old location data
    setLocationZoneRoleMap((prev) => {
      const updated = { ...prev };
      delete updated[editingLocation];
      return updated;
    });
    setZoneCaptainMap((prev) => {
      const updated = { ...prev };
      validZones.forEach((z) => {
        delete updated[z.zoneName];
      });
      return updated;
    });

    // Add updated location data
    const newLocationData = {
      zones: validZones.map((z) => z.zoneName),
      roles: validZones.reduce((acc, z) => {
        acc[z.zoneName] = parseItems(z.roles);
        return acc;
      }, {}),
    };

    setLocationZoneRoleMap((prev) => ({
      ...prev,
      [newLocation]: newLocationData,
    }));

    setZoneCaptainMap((prev) => {
      const updated = { ...prev };
      validZones.forEach((z) => {
        updated[z.zoneName] = parseItems(z.captain);
      });
      return updated;
    });

    // Reset inputs
    setNewLocation("");
    setNewZones([]);
    setCurrentLocation(null);
    setEditingLocation(null);
  };

  const cancelEdit = () => {
    setNewLocation("");
    setNewZones([]);
    setCurrentLocation(null);
    setEditingLocation(null);
  };

  const deleteLocation = (loc) => {
    const confirmed = window.confirm(`Are you sure you want to delete ${loc}?`);
    if (confirmed) {
      setLocationZoneRoleMap((prev) => {
        const updated = { ...prev };
        delete updated[loc];
        return updated;
      });
      setZoneCaptainMap((prev) => {
        const updated = { ...prev };
        locationZoneRoleMap[loc].zones.forEach((z) => delete updated[z]);
        return updated;
      });
    }
  };

  const importWorkflow = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = JSON.parse(event.target.result);
      setLocationZoneRoleMap(data.locationZoneRoleMap || {});
      setZoneCaptainMap(data.zoneCaptainMap || {});
    };
    reader.readAsText(file);
  };

  const exportWorkflow = () => {
    const data = {
      locationZoneRoleMap,
      zoneCaptainMap,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `workflow.json`;
    link.click();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Edit Work Flow</h2>

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
          onClick={exportWorkflow}
          className="bg-gray-200 hover:bg-gray-300 text-black font-semibold px-5 py-2 rounded-lg shadow transition-all"
        >
          Save to JSON
        </button>
      </div>

      {/* Add Location */}
      <div>
        <label className="block font-medium text-gray-700 mb-1">Add Location</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newLocation}
            onChange={(e) => setNewLocation(e.target.value)}
            className="border rounded px-3 py-2 w-full"
            placeholder="Enter location name"
            disabled={currentLocation !== null && !editingLocation}
          />
          <button
            onClick={() => setCurrentLocation(newLocation)}
            className="bg-black text-white px-4 py-2 rounded"
            disabled={!newLocation || (currentLocation !== null && !editingLocation)}
          >
            Add Location
          </button>
        </div>
      </div>

      {/* Add Zones for Current Location */}
      {currentLocation && (
        <div className="border p-4 rounded mt-4">
          <h3 className="text-lg font-bold">{editingLocation ? `Editing ${newLocation}` : newLocation}</h3>
          <button
            onClick={addZoneInput}
            className="bg-black text-white px-4 py-2 rounded mt-2"
          >
            Add Zone
          </button>

          {newZones.map((zone, index) => (
            <div key={index} className="border p-4 rounded mt-4">
              <div className="flex justify-between">
                <h4 className="font-semibold">Zone {index + 1}</h4>
                <button
                  onClick={() => removeZoneInput(index)}
                  className="text-red-500"
                >
                  Remove Zone
                </button>
              </div>
              <div className="mt-2">
                <label className="block font-medium text-gray-700 mb-1">Zone Name</label>
                <input
                  type="text"
                  value={zone.zoneName}
                  onChange={(e) => updateZoneInput(index, "zoneName", e.target.value)}
                  className="border rounded px-3 py-2 w-full"
                  placeholder="Enter zone name"
                />
              </div>
              <div className="mt-2">
                <label className="block font-medium text-gray-700 mb-1">Zone Captains (comma or line separated)</label>
                <textarea
                  value={zone.captain}
                  onChange={(e) => updateZoneInput(index, "captain", e.target.value)}
                  className="border rounded px-3 py-2 w-full"
                  rows="4"
                  placeholder="Enter zone captains, e.g., Captain1, Captain2"
                />
              </div>
              <div className="mt-2">
                <label className="block font-medium text-gray-700 mb-1">Roles (comma or line separated)</label>
                <textarea
                  value={zone.roles}
                  onChange={(e) => updateZoneInput(index, "roles", e.target.value)}
                  className="border rounded px-3 py-2 w-full"
                  rows="4"
                  placeholder="Enter roles, e.g., Role1, Role2"
                />
              </div>
            </div>
          ))}

          <div className="flex gap-4 mt-4">
            <button
              onClick={editingLocation ? saveEditedLocation : confirmLocation}
              className="bg-green-500 text-white px-4 py-2 rounded"
              disabled={newZones.length === 0}
            >
              {editingLocation ? "Save Changes" : "Confirm Location"}
            </button>
            {editingLocation && (
              <button
                onClick={cancelEdit}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </div>
      )}

      {/* Display Locations */}
      <div className="mt-6">
        <h3 className="text-xl font-bold">Locations</h3>
        {Object.keys(locationZoneRoleMap).map((loc) => (
          <div key={loc} className="border p-4 rounded mt-4">
            <div className="flex justify-between">
              <h4 className="text-lg font-bold">{loc}</h4>
              <div className="flex gap-20">
                <button
                  onClick={() => editLocation(loc)}
                  className="text-blue-500"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteLocation(loc)}
                  className="text-red-500"
                >
                  Delete Location
                </button>
              </div>
            </div>
            {locationZoneRoleMap[loc].zones.map((z) => (
              <div key={z} className="ml-4 mt-2">
                <h5 className="font-semibold">{z}</h5>
                <p><strong>Zone Captains:</strong> {(zoneCaptainMap[z] || []).join(", ") || "None"}</p>
                <p><strong>Roles:</strong> {(locationZoneRoleMap[loc].roles[z] || []).join(", ")}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
       <button
          onClick={clearAllData}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold px-5 py-2 rounded-lg shadow transition-all"
        >
          Clear All
        </button>
    </div>
  );
}