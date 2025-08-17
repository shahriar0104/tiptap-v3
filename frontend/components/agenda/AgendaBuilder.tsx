"use client";
import {useRef, useState} from "react";
import type { DragEvent } from "react";
import Link from "next/link";
import {MdAdd, MdDelete, MdDragIndicator, MdAttachFile} from "react-icons/md";
import {api} from "@/lib/api";
import { useToast } from "@/contexts/ToastProvider";

type Action = "Action" | "Approve" | "Noting";
export type AgendaItem = { id: string; time: string; title: string; action: Action };
type GroupStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";
export type AgendaGroup = { id: string; items: AgendaItem[]; title?: string; time?: string; status?: GroupStatus };

// Local API typings for bulk create
type BulkCreateGroupRequest = {
  title: string;
  startTime?: string;
  status?: GroupStatus;
  order: number;
  boardMeetingId: string;
  items: Array<{
    title: string;
    startTime?: string;
    type: string;
    order: number;
  }>;
};

type BulkCreateGroupResponse = {
  id: string;
  agendaItems: Array<{ id: string }>;
};

type CreateItemPayload = {
  title: string;
  startTime?: string;
  type: string;
  order: number;
  agendaGroupId: string;
};

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
  meetingDate,
  meetingStatus,
}: {
  paperId: string;
  initialGroups: AgendaGroup[];
  meetingDate?: string;
  meetingStatus?: string;
}) {
  const [groups, setGroups] = useState<AgendaGroup[]>(
    initialGroups.length > 0 
      ? initialGroups 
      : [{ id: `local-${crypto.randomUUID()}`, items: [], title: "Main Agenda", status: "PENDING" }]
  );
  const draggingGroupIndex = useRef<number | null>(null);
  const draggingItem = useRef<{ groupId: string; itemId: string } | null>(null);
  const { successAlert, errorAlert } = useToast();
  const [saving, setSaving] = useState(false);
  
  const timeOptions = generateTimeOptions();

  function toBackendType(action: Action): string {
    // Align UI labels with backend enums
    // "Action" => STANDARD, "Approve" => DECISION, "Noting" => INFO
    if (action === "Approve") return "DECISION";
    if (action === "Noting") return "INFO";
    return "STANDARD";
  }

  function addItem(groupId: string) {
    setGroups((g) =>
      g.map((grp) =>
        grp.id === groupId
          ? {
              ...grp,
              items: [
                ...grp.items,
                { id: `local-${crypto.randomUUID()}`, time: "", title: "", action: "Action" },
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
      { id: `local-${crypto.randomUUID()}`, items: [], title: `Section ${g.length + 1}`, time: "", status: "PENDING" },
    ]);
  }

  function removeGroup(groupId: string) {
    if (groups.length > 1) {
      setGroups((g) => g.filter((grp) => grp.id !== groupId));
    }
  }

  // Convert HH:MM to ISO string using meetingDate if provided (fallback to today)
  function toISO(time?: string): string | undefined {
    if (!time) return undefined;
    const parsed = meetingDate ? new Date(meetingDate) : new Date();
    const base = isNaN(parsed.getTime()) ? new Date() : parsed;
    const [hh, mm] = time.split(":").map((s) => parseInt(s, 10));
    if (!Number.isFinite(hh) || !Number.isFinite(mm)) return undefined;
    const d = new Date(base);
    d.setHours(hh, mm, 0, 0);
    return d.toISOString();
  }

  async function saveAll() {
    if (saving) return;
    setSaving(true);
    try {
      // Validate required fields for new entities (backend validators require startTime and order on create)
      for (const g of groups) {
        if (g.id.startsWith("local-")) {
          if (!g.title || !g.title.trim()) {
            errorAlert("Please enter a title for all new agenda groups.");
            return;
          }
          if (!g.time) {
            errorAlert("Please select a start time for all new agenda groups.");
            return;
          }
        }
        for (const it of g.items) {
          if (it.id.startsWith("local-")) {
            if (!it.title || !it.title.trim()) {
              errorAlert("Please enter a title for all new agenda items.");
              return;
            }
            if (!it.time) {
              errorAlert("Please select a start time for all new agenda items.");
              return;
            }
          }
        }
      }

      // 1) Upsert groups (use bulk create for new groups with items)
      const idMap: Record<string, string> = {};
      const itemIdMap: Record<string, string> = {};
      const bulkCreatedLocalGroups = new Set<string>();
      for (let i = 0; i < groups.length; i++) {
        const grp = groups[i];
        const basePayload: Omit<BulkCreateGroupRequest, "items"> = {
          title: (grp.title || "").trim(),
          startTime: toISO(grp.time),
          status: grp.status,
          order: i,
          boardMeetingId: paperId,
        };
        if (grp.id.startsWith("local-")) {
          // Bulk create group with its items in one request
          const bulkPayload: BulkCreateGroupRequest = {
            ...basePayload,
            items: grp.items.map((it, ji) => ({
              title: (it.title || "").trim(),
              startTime: toISO(it.time),
              type: toBackendType(it.action),
              order: ji,
            })),
          };
          const res = await api.post<BulkCreateGroupResponse>(`/agenda/groups/with-items`, bulkPayload);
          const created = res.data;
          if (!res.success || !created?.id) {
            errorAlert(res.message || res.error || "Failed to create agenda group with items.");
            return;
          }
          idMap[grp.id] = created.id;
          bulkCreatedLocalGroups.add(grp.id);
          // Map back item IDs by order
          const createdItems: Array<{ id: string }> = Array.isArray(created?.agendaItems) ? created.agendaItems : [];
          for (let ji = 0; ji < grp.items.length; ji++) {
            const localItem = grp.items[ji];
            const serverItem = createdItems[ji];
            if (serverItem?.id) {
              itemIdMap[localItem.id] = serverItem.id;
            }
          }
        } else {
          const res = await api.put(`/agenda/groups/${grp.id}`, { title: basePayload.title, startTime: basePayload.startTime, status: basePayload.status });
          if (!res.success) {
            errorAlert(res.message || res.error || "Failed to update agenda group.");
            return;
          }
        }
      }

      // 2) Replace local group IDs in state if any created
      if (Object.keys(idMap).length > 0) {
        setGroups((prev) =>
          prev.map((g) => (idMap[g.id] ? { ...g, id: idMap[g.id] } : g))
        );
      }

      // 3) Upsert items (skip items for groups created via bulk)
      for (let gi = 0; gi < groups.length; gi++) {
        const grp = groups[gi];
        const groupId = idMap[grp.id] || grp.id;
        if (bulkCreatedLocalGroups.has(grp.id)) {
          // Items already created via bulk; continue to next group
          continue;
        }
        for (let ji = 0; ji < grp.items.length; ji++) {
          const it = grp.items[ji];
          const itemPayload: CreateItemPayload = {
            title: (it.title || "").trim(),
            startTime: toISO(it.time),
            type: toBackendType(it.action),
            order: ji,
            agendaGroupId: groupId,
          };
          if (it.id.startsWith("local-")) {
            const res = await api.post<{ id: string }>(`/agenda/items`, itemPayload);
            if (!res.success || !res.data?.id) {
              errorAlert(res.message || res.error || "Failed to create agenda item.");
              return;
            }
            itemIdMap[it.id] = res.data.id;
          } else {
            const res = await api.put(`/agenda/items/${it.id}`, {
              title: itemPayload.title,
              startTime: itemPayload.startTime,
              type: itemPayload.type,
            });
            if (!res.success) {
              errorAlert(res.message || res.error || "Failed to update agenda item.");
              return;
            }
          }
        }
      }

      // 3.5) Replace local item IDs in state
      if (Object.keys(itemIdMap).length > 0) {
        setGroups((prev) =>
          prev.map((g) => ({
            ...g,
            items: g.items.map((it) => (itemIdMap[it.id] ? { ...it, id: itemIdMap[it.id] } : it)),
          }))
        );
      }

      // 4) Reorder groups
      {
        const res = await api.post(`/agenda/board-meetings/${paperId}/groups/reorder`, {
          groupOrders: groups.map((g, idx) => ({ id: idMap[g.id] || g.id, order: idx })),
        });
        if (!res.success) {
          errorAlert(res.message || res.error || "Failed to reorder agenda groups.");
          return;
        }
      }

      // 5) Reorder items within each group
      for (const grp of groups) {
        const groupId = idMap[grp.id] || grp.id;
        const res = await api.post(`/agenda/groups/${groupId}/items/reorder`, {
          itemOrders: grp.items.map((it, idx) => ({ id: itemIdMap[it.id] || it.id, order: idx })),
        });
        if (!res.success) {
          errorAlert(res.message || res.error || "Failed to reorder agenda items.");
          return;
        }
      }

      successAlert("Agenda saved successfully!");
    } catch {
      errorAlert("Failed to save agenda. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  // DnD helpers: Groups
  function onGroupDragStart(e: DragEvent<HTMLDivElement>, index: number) {
    draggingGroupIndex.current = index;
    try {
      if (e?.dataTransfer && e?.currentTarget) {
        const card = e.currentTarget?.parentElement || e.currentTarget;
        e.dataTransfer.setDragImage(card, 0, 0);
      }
    } catch {}
  }
  async function onGroupDrop(targetIndex: number) {
    if (saving) return;
    const src = draggingGroupIndex.current;
    draggingGroupIndex.current = null;
    if (src === null || src === targetIndex) return;
    const newArr = [...groups];
    const [moved] = newArr.splice(src, 1);
    newArr.splice(targetIndex, 0, moved);
    setGroups(newArr);
    // Optionally fire reorder immediately
    try {
      // Skip immediate reorder if any group has a local ID
      if (newArr.some((g) => g.id.startsWith("local-"))) return;
      await api.post(`/agenda/board-meetings/${paperId}/groups/reorder`, {
        groupOrders: newArr.map((g, idx) => ({ id: g.id, order: idx })),
      });
    } catch {}
  }

  // DnD helpers: Items (intra-group only)
  function onItemDragStart(groupId: string, itemId: string) {
    draggingItem.current = { groupId, itemId };
  }
  async function onItemDrop(targetGroupId: string, targetItemId?: string) {
    if (saving) return;
    const src = draggingItem.current;
    draggingItem.current = null;
    if (!src || src.groupId !== targetGroupId) return; // only within same group
    const arr = groups.map((g) => ({ ...g, items: [...g.items] }));
    const gIdx = arr.findIndex((g) => g.id === targetGroupId);
    if (gIdx === -1) return;
    const items = arr[gIdx].items;
    const fromIdx = items.findIndex((i) => i.id === src.itemId);
    if (fromIdx === -1) return;
    const [moved] = items.splice(fromIdx, 1);
    const toIdx = targetItemId ? items.findIndex((i) => i.id === targetItemId) : items.length;
    items.splice(toIdx, 0, moved);
    setGroups(arr);
    try {
      // Skip immediate reorder if unsaved local IDs exist
      if (arr[gIdx].items.some((it) => it.id.startsWith("local-"))) return;
      await api.post(`/agenda/groups/${targetGroupId}/items/reorder`, {
        itemOrders: arr[gIdx].items.map((it, idx) => ({ id: it.id, order: idx })),
      });
    } catch {}
  }

  return (
    <div className="space-y-4 max-w-6xl mx-auto" aria-busy={saving}>
      {groups.map((group, groupIndex) => (
        <div
          key={group.id}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          {/* Group Header */}
          <div
            className="bg-white dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-600"
            draggable={!saving}
            onDragStart={(e) => onGroupDragStart(e, groupIndex)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onGroupDrop(groupIndex)}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <MdDragIndicator className="text-gray-400 cursor-move" size={18} />
                <input
                  value={group.title || ""}
                  onChange={(e) => updateGroup(group.id, { title: e.target.value })}
                  draggable={false}
                  onMouseDown={(e) => e.stopPropagation()}
                  onDragStart={(e) => e.preventDefault()}
                  disabled={saving}
                  className="text-base font-semibold bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-500 disabled:opacity-60"
                  placeholder={`Section ${groupIndex + 1}`}
                />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-24">
                  <select
                    value={group.time || ""}
                    onChange={(e) => updateGroup(group.id, { time: e.target.value })}
                    disabled={saving}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-500 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-60"
                  >
                    <option value="">Time</option>
                    {timeOptions.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-36">
                  <select
                    value={group.status || "PENDING"}
                    onChange={(e) => updateGroup(group.id, { status: e.target.value as GroupStatus })}
                    disabled={saving}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-500 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-60"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
                {(meetingStatus === 'DRAFT' || meetingStatus === 'PUBLISHED') && !group.id.startsWith('local-') && (
                  <Link
                    href={`/agenda/groups/${group.id}/documents?meetingId=${paperId}`}
                    title="Manage group documents"
                    draggable={false}
                    className="inline-flex items-center justify-center p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  >
                    <MdAttachFile size={18} />
                  </Link>
                )}
                {groups.length > 1 && (
                  <button
                    onClick={() => removeGroup(group.id)}
                    disabled={saving}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    title="Delete section"
                  >
                    <MdDelete size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Group Items */}
          <div className="p-4">
            <div className="space-y-2">
              {group.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30"
                  draggable={!saving}
                  onDragStart={() => onItemDragStart(group.id, item.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => onItemDrop(group.id, item.id)}
                >
                  {/* Drag Handle */}
                  <div className="flex-shrink-0">
                    <MdDragIndicator className="text-gray-400 cursor-move" size={18} />
                  </div>

                  {/* Time Dropdown */}
                  <div className="flex-shrink-0 w-24">
                    <select
                      value={item.time}
                      onChange={(e) => updateItem(group.id, item.id, { time: e.target.value })}
                      disabled={saving}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-500 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-60"
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
                      disabled={saving}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-500 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-60"
                    />
                  </div>

                  {/* Action Dropdown */}
                  <div className="flex-shrink-0 w-28">
                    <select
                      value={item.action}
                      onChange={(e) => updateItem(group.id, item.id, { action: e.target.value as Action })}
                      disabled={saving}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-500 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-60"
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
                      disabled={saving}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                      title="Delete item"
                    >
                      <MdDelete size={18} />
                    </button>
                  </div>
                </div>
              ))}

              {/* Removed explicit drop zone for moving to end */}

              {/* Add Item Button */}
              <button
                onClick={() => addItem(group.id)}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
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
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <MdAdd size={20} />
          Add Agenda Group
        </button>
        
        <button
          onClick={saveAll}
          disabled={saving}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
              Saving...
            </span>
          ) : (
            'Save Agenda'
          )}
        </button>
      </div>
    </div>
  );
}