import React, { useState, useMemo } from "react";
import { Button } from "@/components/tiptap-ui-primitive/button";
import { Badge } from "@/components/tiptap-ui-primitive/badge";
import { useChartFAB, CHART_SHORTCUT } from "@/components/tiptap-ui/chart-fab/use-chart-fab";
import { Dialog, DialogContent, DialogTitle, DialogClose, DialogHeader, DialogFooter } from "@/components/tiptap-ui-primitive/dialog";
import Papa, { ParseResult } from "papaparse";
import * as XLSX from "xlsx";

// TEMP: Use emoji as icon, replace with a real icon if available
const ChartIcon = (props: React.HTMLAttributes<HTMLSpanElement>) => (
  <span role="img" aria-label="Chart" className="tiptap-button-icon" {...props}>📊</span>
);

export interface ChartFABProps {
  editor?: any;
  toolbar?: boolean;
  showShortcut?: boolean;
  onInserted?: () => void;
}


export const ChartFAB = React.forwardRef<HTMLButtonElement, ChartFABProps>(
  ({ editor: providedEditor, toolbar, showShortcut = false, onInserted, ...buttonProps }, ref) => {
    const { editor, canInsert, handleChart, shortcutKeys, label } = useChartFAB({ editor: providedEditor, onInserted });
    const [open, setOpen] = useState(false);
    const [agenda, setAgenda] = useState<string>("");
    const [file, setFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState<string>("");
    const [parsedData, setParsedData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    // Extract all headings from the editor for agenda dropdown
    const agendaOptions = useMemo(() => {
      if (!editor) return [];
      const headings: { text: string; pos: number }[] = [];
      editor.state.doc.descendants((node, pos) => {
        if (node.type.name === "heading") {
          const text = node.textContent;
          if (text) headings.push({ text, pos });
        }
      });
      return headings;
    }, [editor]);

    // Only show if editor is available and can insert chart
    if (!canInsert) return null;

    // File upload and parse logic
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFileError("");
      const f = e.target.files?.[0] || null;
      setFile(f);
      setParsedData(null);
      if (!f) return;
      const ext = f.name.split(".").pop()?.toLowerCase();
      if (ext === "csv") {
        Papa.parse(f, {
          header: true,
          complete: (results: ParseResult<any>) => setParsedData(results.data),
          error: (err: any) => setFileError(err.message),
        });
      } else if (ext === "xlsx") {
        const reader = new FileReader();
        reader.onload = (evt) => {
          try {
            const data = new Uint8Array(evt.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: "array" });
            const wsname = workbook.SheetNames[0];
            const ws = workbook.Sheets[wsname];
            const json = XLSX.utils.sheet_to_json(ws, { header: 1 });
            setParsedData(json);
          } catch (err: any) {
            setFileError((err as Error).message || "Failed to parse XLSX");
          }
        };
        reader.readAsArrayBuffer(f);
      } else {
        setFileError("Only .csv or .xlsx files are supported");
      }
    };

    // Insert chart at the bottom of the selected agenda
    const handleInsert = async () => {
      if (!agenda || !parsedData) return;
      setLoading(true);
      // Find the agenda node position
      const agendaNode = agendaOptions.find(a => a.text === agenda);
      if (!agendaNode) return setLoading(false);
      // Find the end position of the agenda section
      let insertPos = agendaNode.pos + 1;
      let foundNext = false;
      editor?.state.doc.descendants((node, pos) => {
        if (pos > agendaNode.pos && node.type.name === "heading") {
          insertPos = pos;
          foundNext = true;
          return false;
        }
        return true;
      });
      if (!foundNext && editor) insertPos = editor.state.doc.content.size - 1;
      // Insert chart node at insertPos
      editor?.chain().focus().insertContentAt(insertPos, {
        type: "chart",
        attrs: { chartType: "bar", data: parsedData },
      }).run();
      setLoading(false);
      setOpen(false);
      setFile(null);
      setParsedData(null);
      setAgenda("");
      setFileError("");
      onInserted?.();
    };

    // Toolbar button style
    return (
      <>
        <Button
          type="button"
          data-style="ghost"
          aria-label={label}
          tooltip={label}
          onClick={() => setOpen(true)}
          ref={ref}
          {...buttonProps}
        >
          <ChartIcon />
          <span className="tiptap-button-text">Chart</span>
          {showShortcut && <Badge>{shortcutKeys}</Badge>}
        </Button>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogClose onClick={() => setOpen(false)} />

            <DialogHeader>
              <DialogTitle>Insert Chart</DialogTitle>
            </DialogHeader>

            <form className="flex flex-col gap-4" onSubmit={e => { e.preventDefault(); handleInsert(); }}>
              <div>
                <label className="block font-medium text-sm mb-2 text-gray-700 dark:text-gray-300">
                  Agenda Section
                </label>
                <select
                  className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={agenda}
                  onChange={e => setAgenda(e.target.value)}
                  disabled={loading}
                  required
                >
                  <option value="">Select agenda...</option>
                  {agendaOptions.map(a => (
                    <option key={a.pos} value={a.text}>{a.text}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-sm mb-2 text-gray-700 dark:text-gray-300">
                  Upload Data (.csv, .xlsx)
                </label>
                <label className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow cursor-pointer transition-colors text-sm font-medium">
                  <span>{file ? file.name : "Choose file"}</span>
                  <input
                    type="file"
                    accept=".csv,.xlsx"
                    onChange={handleFileChange}
                    disabled={loading}
                    className="hidden"
                    required
                  />
                </label>
                {fileError && (
                  <div className="text-sm text-red-500 mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-md">
                    {fileError}
                  </div>
                )}
                {parsedData && (
                  <div className="text-sm text-green-600 dark:text-green-400 mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-md">
                    ✓ File loaded: {file?.name}
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  data-style="ghost"
                  disabled={loading}
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  data-style="solid"
                  disabled={loading || !agenda || !parsedData}
                  className="min-w-[120px]"
                >
                  {loading ? "Inserting..." : "Insert Chart"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </>
    );
  }
);
ChartFAB.displayName = "ChartFAB";