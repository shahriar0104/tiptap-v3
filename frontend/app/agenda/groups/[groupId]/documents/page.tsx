"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useToast } from "@/contexts/ToastProvider";
import { MdAttachFile, MdArrowBack } from "react-icons/md";

interface GroupDto {
  id: string;
  title?: string;
  startTime?: string;
  boardMeetingId?: string;
}

interface ItemDto {
  id: string;
  title: string;
  startTime?: string;
  type?: string;
}

export default function AgendaGroupDocumentsPage() {
  const params = useParams<{ groupId: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const { errorAlert } = useToast();

  const groupId = typeof params?.groupId === "string" ? params.groupId : Array.isArray(params?.groupId) ? params.groupId[0] : "";
  const meetingId = search?.get("meetingId") || "";

  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState<GroupDto | null>(null);
  const [items, setItems] = useState<ItemDto[]>([]);
  const [meetingStatus, setMeetingStatus] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!groupId) return;
      setLoading(true);
      try {
        const [gRes, iRes] = await Promise.all([
          api.get<GroupDto>(`/agenda/groups/${groupId}`),
          api.get<ItemDto[]>(`/agenda/groups/${groupId}/items`),
        ]);
        if (active) {
          if (!gRes.success || !gRes.data) throw new Error(gRes.message || gRes.error || "Failed to fetch group");
          if (!iRes.success || !Array.isArray(iRes.data)) throw new Error(iRes.message || iRes.error || "Failed to fetch items");
          setGroup(gRes.data);
          setItems(iRes.data);
          // Fetch meeting status when possible
          const mId = meetingId || gRes.data.boardMeetingId;
          if (mId) {
            try {
              const mRes = await api.get<{ status: string }>(`/board-meetings/${mId}`);
              if (mRes.success && mRes.data?.status) {
                setMeetingStatus(mRes.data.status);
              }
            } catch (err) {
              // ignore, keep meetingStatus null
            }
          }
        }
      } catch (e) {
        console.error(e);
        errorAlert("Failed to load agenda group details.");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [groupId, errorAlert]);

  const groupTitle = group?.title || "Agenda Group";
  const canUpload = meetingStatus === 'DRAFT' || meetingStatus === 'PUBLISHED';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-4">
          {meetingId ? (
            <button
              type="button"
              onClick={() => router.push(`/meeting/${meetingId}`)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <MdArrowBack /> Back to Meeting
            </button>
          ) : (
            <span />
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">{groupTitle}</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage documents for items in this group.</p>
          </div>

          {loading ? (
            <div className="text-gray-600 dark:text-gray-300">Loading...</div>
          ) : (
            <div className="space-y-3">
              {items.length === 0 && (
                <div className="text-gray-600 dark:text-gray-300">No agenda items in this group.</div>
              )}
              {items.map((it) => (
                <div key={it.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{it.title || "Untitled item"}</div>
                    {it.startTime && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">Starts at: {new Date(it.startTime).toLocaleTimeString()}</div>
                    )}
                  </div>
                  {canUpload ? (
                    <Link
                      href={`/agenda/items/${it.id}/documents/upload${meetingId ? `?meetingId=${meetingId}` : ""}`}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
                    >
                      <MdAttachFile size={16} /> Upload Document
                    </Link>
                  ) : (
                    <span className="text-xs text-gray-500 dark:text-gray-400">Uploads disabled</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
