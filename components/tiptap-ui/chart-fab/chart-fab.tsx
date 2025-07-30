// components/MenuBar.tsx
'use client'

import { useState } from 'react'
import { Editor } from '@tiptap/react'
import Portal from "@/components/tiptap-ui-primitive/dialog/portal";
import Dialog from "@/components/tiptap-ui-primitive/dialog/dialog";
import {BiBarChart} from "react-icons/bi";

interface Props {
  editor: Editor | null
}

export default function ChartFAB({ editor }: Props) {
  const [open, setOpen] = useState(false)

  if (!editor) return null

  /* When user submits dialog */
  const handleInsert = (config: any, pos: number) => {
    editor
      .chain()
      .focus(pos)
      .insertContent({ type: 'chartNode', attrs: { config } })
      .run()
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1 rounded hover:bg-gray-200"
        >
          <BiBarChart size={16} />
          Chart
        </button>
      </div>

      {open && (
        <Portal>
          <Dialog
            editor={editor}
            onClose={() => setOpen(false)}
            onInsert={handleInsert}
          />
        </Portal>
      )}
    </>
  )
}