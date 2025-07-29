import { useTiptapEditor } from "@/hooks/use-tiptap-editor";
import { useIsMobile } from "@/hooks/use-mobile";
import { mockCopilotChart } from "@/lib/ai-copilot";

export const CHART_SHORTCUT = "mod+shift+c";

export function canInsertChart(editor: any): boolean {
  if (!editor || !editor.isEditable) return false;
  // Optionally add more logic for chart node availability
  return !!editor.can().insertContent;
}

export function useChartFAB(config: { editor?: any; onInserted?: () => void }) {
  const { editor: providedEditor, onInserted } = config;
  const { editor } = useTiptapEditor(providedEditor);
  const isMobile = useIsMobile();
  const canInsert = canInsertChart(editor);

  const handleChart = async (prompt: string) => {
    const chartConfig = await mockCopilotChart({ prompt });
    editor?.commands.insertContent({
      type: "chart",
      attrs: { chartType: "bar", data: chartConfig },
    });
    onInserted?.();
  };

  return {
    editor,
    isMobile,
    canInsert,
    handleChart,
    shortcutKeys: CHART_SHORTCUT,
    label: "Insert chart",
  };
}
