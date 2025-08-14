"use client";
import {useState} from "react";
import {MdAdd, MdDelete, MdDragIndicator} from "react-icons/md";
import {api} from "@/lib/api";

type Action = "Action" | "Approve" | "Noting";
export type AgendaItem = { id: string; time: string; title: string; action: Action };
export type AgendaGroup = { id: string; items: AgendaItem[]; title?: string };

// Generate time options for dropdown (every 15 minutes from 8:00 to 18:00)
const generateTimeOptions = () => {
  const times = [];
  for (let hour = 8; hour <= 18; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      times.push(time);
    }
  }
  return times;
};

export default function AgendaBuilder({
  paperId,
  initialGroups,
}: {
  paperId: string;
  initialGroups: AgendaGroup[];
}) {
  const [groups, setGroups] = useState<AgendaGroup[]>(
    initialGroups.length > 0 
      ? initialGroups 
      : [{ id: crypto.randomUUID(), items: [], title: "Main Agenda" }]
  );
  
  const timeOptions = generateTimeOptions();

  function addItem(groupId: string) {
    setGroups((g) =>
      g.map((grp) =>
        grp.id === groupId
          ? {
              ...grp,
              items: [
                ...grp.items,
                { id: crypto.randomUUID(), time: "", title: "", action: "Action" },
              ],
            }
          : grp
      )
    );
  }

  function removeItem(groupId: string, itemId: string) {
    setGroups((g) =>
      g.map((grp) =>
        grp.id === groupId
          ? { ...grp, items: grp.items.filter((i) => i.id !== itemId) }
          : grp
      )
    );
  }

  function updateItem(groupId: string, itemId: string, patch: Partial<AgendaItem>) {
    setGroups((g) =>
      g.map((grp) =>
        grp.id === groupId
          ? { ...grp, items: grp.items.map((it) => (it.id === itemId ? { ...it, ...patch } : it)) }
          : grp
      )
    );
  }

  function updateGroup(groupId: string, patch: Partial<AgendaGroup>) {
    setGroups((g) =>
      g.map((grp) => (grp.id === groupId ? { ...grp, ...patch } : grp))
    );
  }

  function addGroup() {
    setGroups((g) => [
      ...g,
      { id: crypto.randomUUID(), items: [], title: `Section ${g.length + 1}` },
    ]);
  }

  function removeGroup(groupId: string) {
    if (groups.length > 1) {
      setGroups((g) => g.filter((grp) => grp.id !== groupId));
    }
  }

  async function saveAll() {
    try {
      await api.post(`/board-meetings/${paperId}/agenda-groups`, { groups });
      alert("Agenda saved successfully!");
    } catch (error) {
      alert("Failed to save agenda. Please try again.");
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {groups.map((group, groupIndex) => (
        <div
          key={group.id}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          {/* Group Header */}
          <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MdDragIndicator className="text-gray-400 cursor-move" size={20} />
                <input
                  value={group.title || `Section ${groupIndex + 1}`}
                  onChange={(e) => updateGroup(group.id, { title: e.target.value })}
                  className="text-lg font-semibold bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-500"
                  placeholder="Section title"
                />
              </div>
              {groups.length > 1 && (
                <button
                  onClick={() => removeGroup(group.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Delete section"
                >
                  <MdDelete size={18} />
                </button>
              )}
            </div>
          </div>

          {/* Group Items */}
          <div className="p-6">
            <div className="space-y-3">
              {group.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-600"
                >
                  {/* Drag Handle */}
                  <div className="flex-shrink-0">
                    <MdDragIndicator className="text-gray-400 cursor-move" size={20} />
                  </div>

                  {/* Time Dropdown */}
                  <div className="flex-shrink-0 w-24">
                    <select
                      value={item.time}
                      onChange={(e) => updateItem(group.id, item.id, { time: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-500 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Time</option>
                      {timeOptions.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Title Input */}
                  <div className="flex-1">
                    <input
                      placeholder="Agenda item title"
                      value={item.title}
                      onChange={(e) => updateItem(group.id, item.id, { title: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-500 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Action Dropdown */}
                  <div className="flex-shrink-0 w-28">
                    <select
                      value={item.action}
                      onChange={(e) => updateItem(group.id, item.id, { action: e.target.value as Action })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-500 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Action">Action</option>
                      <option value="Approve">Approve</option>
                      <option value="Noting">Noting</option>
                    </select>
                  </div>

                  {/* Delete Button */}
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => removeItem(group.id, item.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete item"
                    >
                      <MdDelete size={18} />
                    </button>
                  </div>
                </div>
              ))}

              {/* Add Item Button */}
              <button
                onClick={() => addItem(group.id)}
                className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <MdAdd size={20} />
                <span className="font-medium">Add Agenda Item</span>
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6">
        <button
          onClick={addGroup}
          className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors shadow-sm"
        >
          <MdAdd size={20} />
          Add Agenda Group
        </button>
        
        <button
          onClick={saveAll}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-sm transition-colors"
        >
          Save Agenda
        </button>
      </div>
    </div>
  );
}