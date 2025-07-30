// components/ChartDialog.tsx
'use client'

import React, {useRef, useMemo} from 'react'
import * as XLSX from 'xlsx'
import {BiCross} from "react-icons/bi";

interface Props {
  editor: any
  onClose: () => void
  onInsert: (config: any, pos: number) => void
}

export default function Dialog({ editor, onClose, onInsert }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)

  /* 1️⃣  Grab every heading in the doc */
  const agendaOptions = useMemo(() => {
    if (!editor) return []
    const headings: { text: string; pos: number }[] = []
    editor.state.doc.descendants((node: any, pos: number) => {
      if (node.type.name === 'heading' && node.textContent.trim()) {
        headings.push({ text: node.textContent.trim(), pos })
      }
    })
    return headings
  }, [editor])

  /* 2️⃣  Parse file -> chart config */
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const buf = await file.arrayBuffer()
    const wb = XLSX.read(buf, { type: 'array' })
    const json = XLSX.utils.sheet_to_json<any>(wb.Sheets[wb.SheetNames[0]])

    if (!json.length) return alert('Empty sheet')

    // Grab first key as the x-axis label
    const [xKey, ...yKeys] = Object.keys(json[0])

    const categories = json.map((row) => String(row[xKey]))
    const series = yKeys.map((k) => ({
      name: k,
      data: json.map((row) => Number(String(row[k]).replace(/,/g, ''))),
    }))

    const config = {
      series,
      options: {
        chart: { type: 'bar', height: 320 },
        xaxis: { categories },
        dataLabels: { enabled: false },
      },
    }

    const select = document.getElementById('agendaSelect') as HTMLSelectElement
    const pos = Number(select.value) + 1 // 👈 +1 = after the heading
    onInsert(config, pos)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded shadow-lg w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Insert Chart</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <BiCross size={20} />
          </button>
        </div>

        {/* Dropdown */}
        <label className="block mb-2 font-medium text-sm">Attach to heading</label>
        <select
          id="agendaSelect"
          className="w-full border px-3 py-2 rounded mb-4"
          defaultValue=""
        >
          <option value="" disabled>
            Choose a heading…
          </option>
          {agendaOptions.map((h) => (
            <option key={h.pos} value={h.pos}>
              {h.text}
            </option>
          ))}
        </select>

        {/* File picker */}
        <label className="block mb-2 font-medium text-sm">Upload data</label>
        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.csv"
          onChange={handleFile}
          className="w-full text-sm file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>
    </div>
  )
}