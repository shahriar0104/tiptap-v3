"use client";
import { useState } from "react";
import { api } from "@/lib/api";

type Action = "Action" | "Approve" | "Noting";
export type AgendaItem = { id: string; time: string; title: string; action: Action };
export type AgendaGroup = { id: string; items: AgendaItem[] };

export default function AgendaBuilder({
                                        paperId,
                                        initialGroups,
                                      }: {
  paperId: string;
  initialGroups: AgendaGroup[];
}) {
  const [groups, setGroups] = useState<AgendaGroup[]>(initialGroups || []);

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
    setGroups((g) => g.map((grp) => (grp.id === groupId ? { ...grp, items: grp.items.filter((i) => i.id !== itemId) } : grp)));
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

  function addGroup() {
    setGroups((g) => [...g, { id: crypto.randomUUID(), items: [] }]);
  }

  async function saveAll() {
    // Hook up to your API
    await api.post(`/papers/${paperId}/agenda-groups`, { groups });
    alert("Saved agenda.");
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <div key={group.id} className="card p-4 sm:p-5">
          <div className="space-y-3">
            {group.items.map((item) => (
              <div key={item.id} className="grid grid-cols-12 gap-3 items-center">
                <div className="col-span-1 flex justify-center"><span className="handle" aria-hidden /></div>
                <div className="col-span-2 sm:col-span-2">
                  <input
                    placeholder="Time"
                    value={item.time}
                    onChange={(e) => updateItem(group.id, item.id, { time: e.target.value })}
                    className="input text-sm"
                  />
                </div>
                <div className="col-span-7 sm:col-span-7">
                  <input
                    placeholder="Agenda title"
                    value={item.title}
                    onChange={(e) => updateItem(group.id, item.id, { title: e.target.value })}
                    className="input text-sm"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <select
                    value={item.action}
                    onChange={(e) => updateItem(group.id, item.id, { action: e.target.value as Action })}
                    className="input text-sm"
                  >
                    {(["Action", "Approve", "Noting"] as Action[]).map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-1 flex justify-end">
                  <button
                    onClick={() => removeItem(group.id, item.id)}
                    className="icon-btn"
                    aria-label="Delete item"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}

            <div>
              <button onClick={() => addItem(group.id)} className="pill border border-black/10 dark:border-white/10">
                <span>＋</span> Add Agenda Item
              </button>
            </div>
          </div>
        </div>
      ))}

      <div className="flex items-center gap-3">
        <button onClick={addGroup} className="pill border border-black/10 dark:border-white/10">＋ Add Agenda Group</button>
        <button onClick={saveAll} className="pill bg-brand-600 text-white">Save Agenda</button>
      </div>
    </div>
  );
}