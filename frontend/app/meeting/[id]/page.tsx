"use client";

import {useEffect, useState} from "react";
import {useRouter, useParams} from "next/navigation";
import AgendaBuilder from "@/components/agenda/AgendaBuilder";
import {api} from "@/lib/api";
import { useBreadcrumbs } from "@/components/layout/breadcrumbsStore";

interface BoardMeeting {
  id: string;
  title: string;
  description?: string;
  status: string;
  meetingDate?: string;
  agendaGroups?: Array<{
    id: string;
    title: string;
    order: number;
    startTime?: string; // ISO or HH:MM depending on backend
    status?: string;
    agendaItems: Array<{
      id: string;
      title: string;
      order: number;
      startTime?: string;
      type?: string;
      status?: string;
    }>;
  }>;
}

export default function AgendaPage() {
  const [boardMeeting, setBoardMeeting] = useState<BoardMeeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params?.id[0] : undefined;

  // Manual breadcrumbs: Dashboard > Upcoming Meetings > {Meeting Title}
  useBreadcrumbs([
    { label: 'Upcoming Meetings', href: '/meeting/upcoming' },
    { label: boardMeeting?.title || 'Meeting' },
  ]);

  useEffect(() => {
    const fetchBoardMeeting = async () => {
      try {
        setLoading(true);
        if (!id) return;
        const result = await api.get<BoardMeeting>(`/board-meetings/${id}`);
        
        if (result.success && result.data) {
          setBoardMeeting(result.data);
        } else {
          setError(result.error || 'Failed to load board meeting');
        }
      } catch (err) {
        console.error('Error fetching board meeting:', err);
        setError('Failed to load board meeting');
      } finally {
        setLoading(false);
      }
    };

    fetchBoardMeeting();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Error</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!boardMeeting) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Board Meeting Not Found</h1>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Transform backend agendaGroups to AgendaBuilder format
  const toTime = (isoOrTime?: string) => {
    if (!isoOrTime) return "";
    try {
      // If it's a full ISO string, format to HH:MM
      const d = new Date(isoOrTime);
      if (!isNaN(d.getTime())) {
        const hh = String(d.getHours()).padStart(2, '0');
        const mm = String(d.getMinutes()).padStart(2, '0');
        return `${hh}:${mm}`;
      }
      // Otherwise assume already HH:MM or acceptable string
      return isoOrTime;
    } catch {
      return "";
    }
  };
  const toAction = (type?: string) => {
    if (!type) return "Action" as const;
    const t = type.toUpperCase();
    // New enums
    if (t === 'DECISION') return "Approve" as const;
    if (t === 'INFO') return "Noting" as const;
    if (t === 'STANDARD') return "Action" as const;
    // Legacy support
    if (t === 'APPROVE') return "Approve" as const;
    if (t === 'NOTING') return "Noting" as const;
    if (t === 'ACTION') return "Action" as const;
    return "Action" as const;
  };

  const initialGroups = (boardMeeting.agendaGroups || []).map(group => ({
    id: group.id,
    title: group.title,
    time: toTime(group.startTime),
    status: (group.status || 'PENDING') as any,
    items: (group.agendaItems || []).map(item => ({
      id: item.id,
      time: toTime(item.startTime),
      title: item.title,
      action: toAction(item.type),
    })),
  }));

  return (
    <div className="space-y-8">
        {/* Header Section */}
        <div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              {boardMeeting.title}
            </h1>
            {boardMeeting.description && (
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
                {boardMeeting.description}
              </p>
            )}
            <div className="flex items-center gap-4 text-sm">
              {boardMeeting.meetingDate && (
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{new Date(boardMeeting.meetingDate).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>{(boardMeeting.agendaGroups || []).reduce((acc, g) => acc + (g.agendaItems?.length || 0), 0)} agenda items</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  boardMeeting.status === 'DRAFT' 
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                    : boardMeeting.status === 'PUBLISHED'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {boardMeeting.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Agenda Builder Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Board Meeting Agenda
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Organize and manage your meeting agenda items with drag-and-drop functionality.
            </p>
          </div>
          <AgendaBuilder
            paperId={boardMeeting.id}
            initialGroups={initialGroups}
            meetingDate={boardMeeting.meetingDate}
            meetingStatus={boardMeeting.status}
          />
        </div>
    </div>
  );
}