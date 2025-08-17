"use client";

import React, { useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { useToast } from "@/contexts/ToastProvider";
import { useBreadcrumbs } from "@/components/layout/breadcrumbsStore";

export default function AgendaItemUploadPage() {
  const router = useRouter();
  const params = useParams<{ itemId: string }>();
  const search = useSearchParams();
  const { successAlert, errorAlert } = useToast();
  useBreadcrumbs([
    { label: 'Upcoming Meetings', href: '/meeting/upcoming' },
    { label: 'Upload Document' },
  ]);

  const agendaItemId = typeof params?.itemId === "string" ? params.itemId : Array.isArray(params?.itemId) ? params.itemId[0] : "";
  const meetingId = search?.get("meetingId") || "";

  const [file, setFile] = useState<File | null>(null);
  const [role, setRole] = useState<"CONTEXT" | "FIGURE" | "APPENDIX">("CONTEXT");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      errorAlert("Please choose a file.");
      return;
    }
    if (!agendaItemId) {
      errorAlert("Missing agenda item ID.");
      return;
    }
    try {
      setSubmitting(true);

      // 1) Upload the file
      const form = new FormData();
      form.append("file", file);
      if (meetingId) form.append("boardMeetingId", meetingId);
      form.append("agendaItemId", agendaItemId);

      const uploadRes = await api.postForm<{ id: string }>(`/uploads/file`, form);
      if (!uploadRes.success || !uploadRes.data?.id) {
        throw new Error(uploadRes.message || uploadRes.error || "Upload failed");
      }

      // 2) Link the upload to the agenda item as a document
      const linkRes = await api.post(`/agenda/documents`, {
        agendaItemId,
        uploadId: uploadRes.data.id,
        role,
      });
      if (!linkRes.success) {
        throw new Error(linkRes.message || linkRes.error || "Failed to create agenda document");
      }

      successAlert("Document uploaded and linked successfully.");
      if (meetingId) {
        router.push(`/meeting/${meetingId}`);
      }
    } catch (err) {
      console.error(err);
      errorAlert("Failed to upload document. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Upload Document</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Choose a file to upload and link it to this agenda item.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">File</label>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-900 dark:text-gray-100 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/20 dark:file:text-blue-300"
                disabled={submitting}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                disabled={submitting}
              >
                <option value="CONTEXT">Context</option>
                <option value="FIGURE">Figure</option>
                <option value="APPENDIX">Appendix</option>
              </select>
            </div>

            <div className="flex items-center">
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-60"
              >
                {submitting ? "Uploading..." : "Upload & Link"}
              </button>
            </div>
          </form>
        </div>
    </div>
  );
}
