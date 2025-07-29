"use client";

import { BubbleMenu } from "@tiptap/react/menus";   // ← fixed import
import { Editor } from "@tiptap/react";
import { useState } from "react";

interface Props { editor: Editor }

export default function AITooltip({ editor }: Props) {
    const [loading, setLoading] = useState(false);

    const ask = async (instruction: string) => {
        const { from, to } = editor.state.selection;
        const text = editor.state.doc.textBetween(from, to);
        if (!text) return;

        setLoading(true);
        const res = await fetch("/api/ai", {
            method: "POST",
            body: JSON.stringify({ context: text, instruction }),
        });
        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let newText = "";
        for (;;) {
            const { value, done } = await reader.read();
            if (done) break;
            newText += decoder.decode(value, { stream: true });
        }
        editor.commands.insertContentAt({ from, to }, newText);
        setLoading(false);
    };

    return (
        <BubbleMenu
            editor={editor}
            options={{ placement: "top", offset: 6 }}   // Floating UI options [^22^]
        >
            <div className="flex gap-1 rounded-md border bg-white dark:bg-gray-900 p-1 shadow">
                {["Rewrite", "Shorten", "Friendly", "Summarize"].map((l) => (
                    <button
                        key={l}
                        disabled={loading}
                        onClick={() => ask(l)}
                        className="rounded px-2 py-1 text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
                    >
                        {l}
                    </button>
                ))}
            </div>
        </BubbleMenu>
    );
}