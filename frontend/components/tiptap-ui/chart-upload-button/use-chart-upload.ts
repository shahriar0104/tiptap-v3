"use client"

import * as React from "react"
import { useHotkeys } from "react-hotkeys-hook"
import { type Editor } from "@tiptap/react"

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"
import { useIsMobile } from "@/hooks/use-mobile"

// --- Lib ---
import {
  isExtensionAvailable,
  isNodeTypeSelected,
} from "@/lib/tiptap-utils"

// --- Icons ---
import { BiBarChart } from "react-icons/bi"

export const CHART_UPLOAD_SHORTCUT_KEY = "mod+shift+c"

/**
 * Configuration for the chart upload functionality
 */
export interface UseChartUploadConfig {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null
  /**
   * Whether the button should hide when insertion is not available.
   * @default false
   */
  hideWhenUnavailable?: boolean
  /**
   * Callback function called after a successful chart insertion.
   */
  onInserted?: () => void
}

/**
 * Checks if the chart can be inserted in the current editor state
 */
export function canInsertChart(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false
  if (
    !isExtensionAvailable(editor, "chartUpload") ||
    isNodeTypeSelected(editor, ["chartUpload"])
  )
    return false

  return editor.can().insertContent({ type: "chartUpload" })
}

/**
 * Checks if the chart is currently active
 */
export function isChartActive(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false
  return editor.isActive("chartUpload")
}

/**
 * Inserts a chart upload node in the editor
 */
export function insertChart(editor: Editor | null): boolean {
  console.log('inside insertChart')

  if (!editor || !editor.isEditable) return false
  if (!canInsertChart(editor)) return false

  try {
    return editor
      .chain()
      .focus()
      .insertContent({
        type: "chartUpload",
      })
      .run()
  } catch {
    return false
  }
}

/**
 * Determines if the chart button should be shown
 */
export function shouldShowButton(props: {
  editor: Editor | null
  hideWhenUnavailable: boolean
}): boolean {
  const { editor, hideWhenUnavailable } = props

  if (!editor || !editor.isEditable) return false
  if (!isExtensionAvailable(editor, "chartUpload")) return false

  if (hideWhenUnavailable && !editor.isActive("code")) {
    return canInsertChart(editor)
  }

  return true
}

/**
 * Custom hook that provides chart upload functionality for the Tiptap editor
 */
export function useChartUpload(config?: UseChartUploadConfig) {
  const {
    editor: providedEditor,
    hideWhenUnavailable = false,
    onInserted,
  } = config || {}

  const { editor } = useTiptapEditor(providedEditor)
  const isMobile = useIsMobile()
  const [isVisible, setIsVisible] = React.useState<boolean>(true)
  const canInsert = canInsertChart(editor)
  const isActive = isChartActive(editor)

  React.useEffect(() => {
    if (!editor) return

    const handleSelectionUpdate = () => {
      setIsVisible(shouldShowButton({ editor, hideWhenUnavailable }))
    }

    handleSelectionUpdate()

    editor.on("selectionUpdate", handleSelectionUpdate)

    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate)
    }
  }, [editor, hideWhenUnavailable])

  const handleChart = React.useCallback(() => {
    if (!editor) return false

    const success = insertChart(editor)
    if (success) {
      onInserted?.()
    }
    return success
  }, [editor, onInserted])

  useHotkeys(
    CHART_UPLOAD_SHORTCUT_KEY,
    (event) => {
      event.preventDefault()
      handleChart()
    },
    {
      enabled: isVisible && canInsert,
      enableOnContentEditable: !isMobile,
      enableOnFormTags: true,
    }
  )

  return {
    isVisible,
    isActive,
    handleChart,
    canInsert,
    label: "Add chart",
    shortcutKeys: CHART_UPLOAD_SHORTCUT_KEY,
    Icon: BiBarChart,
  }
} 