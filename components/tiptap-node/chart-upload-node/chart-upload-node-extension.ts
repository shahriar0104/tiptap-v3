import { mergeAttributes, Node } from "@tiptap/react"
import { ReactNodeViewRenderer } from "@tiptap/react"
import { ChartUploadNode as ChartUploadNodeComponent } from "@/components/tiptap-node/chart-upload-node/chart-upload-node"

export type ChartUploadFunction = (
  file: File,
  onProgress?: (event: { progress: number }) => void,
  abortSignal?: AbortSignal
) => Promise<any>

export interface ChartUploadNodeOptions {
  /**
   * Acceptable file types for upload.
   * @default '.csv,.xlsx,.xls'
   */
  accept?: string
  /**
   * Maximum number of files that can be uploaded.
   * @default 1
   */
  limit?: number
  /**
   * Maximum file size in bytes (0 for unlimited).
   * @default 0
   */
  maxSize?: number
  /**
   * Function to handle the chart data processing.
   */
  upload?: ChartUploadFunction
  /**
   * Callback for upload errors.
   */
  onError?: (error: Error) => void
  /**
   * Callback for successful uploads.
   */
  onSuccess?: (config: any) => void
}

declare module "@tiptap/react" {
  interface Commands<ReturnType> {
    chartUpload: {
      setChartUploadNode: (options?: ChartUploadNodeOptions) => ReturnType
    }
  }
}

/**
 * A Tiptap node extension that creates a chart upload component.
 */
export const ChartUploadNode = Node.create<ChartUploadNodeOptions>({
  name: "chartUpload",

  group: "block",

  draggable: true,

  atom: true,

  addOptions() {
    return {
      accept: ".csv,.xlsx,.xls",
      limit: 1,
      maxSize: 0,
      upload: undefined,
      onError: undefined,
      onSuccess: undefined,
    }
  },

  addAttributes() {
    return {
      accept: {
        default: this.options.accept,
      },
      limit: {
        default: this.options.limit,
      },
      maxSize: {
        default: this.options.maxSize,
      },
      config: {
        default: null,
        parseHTML: (element) => {
          const config = element.getAttribute("data-config")
          return config ? JSON.parse(config) : null
        },
        renderHTML: (attributes) => {
          if (!attributes.config) return {}
          return {
            "data-config": JSON.stringify(attributes.config),
          }
        },
      },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="chart-upload"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes({ "data-type": "chart-upload" }, HTMLAttributes),
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ChartUploadNodeComponent)
  },

  addCommands() {
    return {
      setChartUploadNode:
        (options = {}) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          })
        },
    }
  },

  /**
   * Adds Enter key handler to trigger the upload component when it's selected.
   */
  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        const { selection } = editor.state
        const { nodeAfter } = selection.$from

        if (
          nodeAfter &&
          nodeAfter.type.name === "chartUpload" &&
          editor.isActive("chartUpload")
        ) {
          const nodeEl = editor.view.nodeDOM(selection.$from.pos)
          if (nodeEl && nodeEl instanceof HTMLElement) {
            const firstChild = nodeEl.firstChild
            if (firstChild && firstChild instanceof HTMLElement) {
              firstChild.click()
              return true
            }
          }
        }
        return false
      },
    }
  },
})

export default ChartUploadNode 