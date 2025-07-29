// src/components/tiptap-templates/simple/sidebar.tsx
"use client";
import { Editor } from "@tiptap/react";
import { Issue } from "@/lib/hemingway";

// Optionally, add a callback to replace text in the editor
interface Props {
    issues: Issue[];
    editor: Editor;
    onSuggestionClick?: (issue: Issue) => void;
}

interface Props {
    issues: Issue[];
    editor: Editor;
}


export default function Sidebar({ issues, editor, onSuggestionClick }: Props) {
    const jump = (issue: Issue) => {
        editor.commands.setTextSelection({ from: issue.from, to: issue.to });
        editor.commands.scrollIntoView();
        if (onSuggestionClick) onSuggestionClick(issue);
    };

    return (
      <aside className="w-72 shrink-0 border-l border-gray-200 dark:border-gray-700 p-4 flex flex-col gap-3 overflow-y-auto bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <h2 className="font-bold text-sm uppercase tracking-wide">Suggestions</h2>

          {issues.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">All clear!</p>
          ) : (
            <ul className="space-y-2">
                {issues.map((i, idx) => (
                  <li
                    key={idx}
                    onClick={() => jump(i)}
                    className="cursor-pointer rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-2 text-xs hover:bg-gray-100 dark:hover:bg-gray-700/70 transition-colors"
                  >
              <span
                className={`font-semibold ${
                  i.type === "passive"
                    ? "text-amber-500"
                    : i.type === "adverb"
                      ? "text-yellow-500"
                      : "text-red-500"
                }`}
              >
                {i.type}
              </span>{" "}
                      – {i.tip}
                  </li>
                ))}
            </ul>
          )}
      </aside>
    );
}