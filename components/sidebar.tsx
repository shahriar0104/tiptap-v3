"use client";
import { Editor } from "@tiptap/react";
import { Issue } from "@/lib/hemingway";

interface Props {
    issues: Issue[];
    editor: Editor;
}

export default function Sidebar({ issues, editor }: Props) {
    const jump = (from: number, to: number) => {
        editor.commands.setTextSelection({ from, to });
        editor.commands.scrollIntoView();
    };

    return (
        <aside className="w-72 shrink-0 border-l p-4 flex flex-col gap-2 overflow-y-auto bg-gray-50 dark:bg-gray-900">
            <h2 className="font-bold text-sm uppercase tracking-wide">Suggestions</h2>
            {!issues.length && <p className="text-xs text-gray-500">All clear!</p>}
            {issues.map((i, idx) => (
                <button
                    key={idx}
                    onClick={() => jump(i.from, i.to)}
                    className="text-left rounded-md border bg-white dark:bg-gray-800 p-2 text-xs hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                    <span className="font-semibold">{i.type}</span> – {i.tip}
                </button>
            ))}
        </aside>
    );
}