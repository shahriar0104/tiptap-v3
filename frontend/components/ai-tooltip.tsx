"use client";

import { BubbleMenu } from "@tiptap/react/menus";   // ← fixed import
import { Editor } from "@tiptap/react";
import { useState } from "react";
import { mockCopilotText } from "@/lib/ai-copilot";

interface Props { editor: Editor }

export default function AITooltip({ editor }: Props) {
    const [loading, setLoading] = useState(false);

    const ask = async (instruction: string) => {
        const { from, to } = editor.state.selection;
        const text = editor.state.doc.textBetween(from, to);
        if (!text) return;
        setLoading(true);
        const res = await mockCopilotText({ prompt: instruction, context: text });
        if (res.rewritten) {
            editor.commands.insertContentAt({ from, to }, res.rewritten);
        }
        setLoading(false);
    };

    return (
        <BubbleMenu
            editor={editor}
            options={{ placement: "top", offset: 6 }}   // Floating UI options [^22^]
        >
            <div className="flex gap-1 rounded-md border bg-white dark:bg-gray-900 p-1 shadow">
                {["Rewrite", "Summarize", "Make clearer", "Custom prompt"].map((l) => (
                    l === "Custom prompt" ? (
                        <button
                            key={l}
                            disabled={loading}
                            onClick={() => {
                                const custom = prompt("Enter your prompt:");
                                if (custom) ask(custom);
                            }}
                            className="rounded px-2 py-1 text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
                        >
                            {l}
                        </button>
                    ) : (
                        <button
                            key={l}
                            disabled={loading}
                            onClick={() => ask(l)}
                            className="rounded px-2 py-1 text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
                        >
                            {l}
                        </button>
                    )
                ))}
            </div>
        </BubbleMenu>
    );
}