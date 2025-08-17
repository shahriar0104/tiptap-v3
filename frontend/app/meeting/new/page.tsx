"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import DatePicker from "@/components/ui-helper/DatePicker";
import {api} from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function NewMeetingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const router = useRouter();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    
    if (!user?.organizationId) {
      setIsLoading(false);
      setError('No organization found. Please complete organization setup.');
      return;
    }

    // Structure data according to backend validation requirements
    const title = (formData.get('title') as string) || '';
    const descriptionRaw = (formData.get('description') as string) || '';
    type CreateMeetingPayload = {
      title: string;
      organizationId: string;
      description?: string;
      meetingDate?: string;
    };
    const payload: CreateMeetingPayload = {
      title,
      organizationId: user.organizationId,
    };
    if (descriptionRaw.trim().length > 0) payload.description = descriptionRaw;
    if (selectedDate) payload.meetingDate = selectedDate.toISOString();

    try {
      type CreatedMeeting = { id: string; title: string };
      const result = await api.post<CreatedMeeting>(
        '/board-meetings',
        payload
      );
      
      if (!result.success) {
        throw new Error(result.error || result.message || 'Failed to create meeting');
      }

      // Navigate to the created meeting
      // API returns the created meeting object
      const created = result.data as { id?: string } | undefined;
      if (created && created.id) {
        router.push(`/meeting/${created.id}`);
      } else {
        router.push('/dashboard'); // Fallback to dashboard if no ID
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Create New Board Meeting
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Set up a new board meeting with essential details.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Title Field */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-semibold text-gray-900 dark:text-white mb-2"
            >
              Meeting Title *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              placeholder="e.g., March 2025 Board Meeting"
              className="
                w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700
                bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                placeholder-gray-500 dark:placeholder-gray-400
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                transition-colors duration-200
              "
            />
          </div>

          {/* Description Field */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-semibold text-gray-900 dark:text-white mb-2"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder="Optional description of the meeting purpose and key topics"
              className="
                w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700
                bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                placeholder-gray-500 dark:placeholder-gray-400
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                transition-colors duration-200 resize-vertical
              "
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Optional: Provide context about the meeting&apos;s purpose and agenda
            </p>
          </div>

          {/* Date Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Meeting Date
            </label>
            <DatePicker
              selected={selectedDate}
              onSelect={setSelectedDate}
              placeholder="Select meeting date"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Optional: Select the date for this board meeting
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="
                px-6 py-3 rounded-lg font-semibold text-sm
                bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400
                text-white transition-colors duration-200
                disabled:cursor-not-allowed
                focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                dark:focus:ring-offset-gray-900
              "
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </div>
              ) : (
                'Create Meeting'
              )}
            </button>

            <button
              type="button"
              onClick={() => router.back()}
              className="
                px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-700
                bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300
                font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-700
                transition-colors duration-200
                focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
                dark:focus:ring-offset-gray-900
              "
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
      </div>
  );
}