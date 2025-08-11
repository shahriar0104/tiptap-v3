"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { 
  MdCalendarToday, 
  MdAccessTime, 
  MdDescription,
  MdArrowBack,
  MdRefresh
} from "react-icons/md";

type BoardMeetingsResponse = {
  success: boolean;
  data: BoardMeeting[];
};

interface BoardMeeting {
  id: string;
  title: string;
  description?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'APPROVED' | 'REJECTED';
  meetingDate?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    agendaItems: number;
  };
}

export default function PastMeetingsPage() {
  const [meetings, setMeetings] = useState<BoardMeeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchMeetings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get<BoardMeetingsResponse>('/board-meetings');
      
      if (response && response?.success) {
        setMeetings(response?.data || []);
      } else {
        setMeetings([]);
      }
    } catch (err) {
      setError('Failed to fetch meetings');
      console.error('Error fetching meetings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'PUBLISHED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'ARCHIVED':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <MdArrowBack className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Past Meetings
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Browse previous board meetings and their records
            </p>
          </div>
        </div>
        
        <button
          onClick={fetchMeetings}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
        >
          <MdRefresh className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
            Loading meetings...
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Meetings List */}
      {!isLoading && !error && (
        <div className="space-y-4">
          {meetings.length === 0 ? (
            <div className="text-center py-12">
              <MdCalendarToday className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No meetings found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Create your first board meeting to get started.
              </p>
              <button
                onClick={() => router.push('/meeting/new')}
                className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Create New Meeting
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {meetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => router.push(`/meeting/${meeting.id}`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {meeting.title}
                      </h3>
                      {meeting.description && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                          {meeting.description}
                        </p>
                      )}
                    </div>
                    
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(meeting.status)}`}>
                      {meeting.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                    {meeting.meetingDate && (
                      <div className="flex items-center gap-2">
                        <MdCalendarToday className="w-4 h-4" />
                        <span>{formatDate(meeting.meetingDate)}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <MdAccessTime className="w-4 h-4" />
                      <span>Created {formatDate(meeting.createdAt)}</span>
                    </div>
                    
                    {meeting._count?.agendaItems && (
                      <div className="flex items-center gap-2">
                        <MdDescription className="w-4 h-4" />
                        <span>{meeting._count.agendaItems} agenda items</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
