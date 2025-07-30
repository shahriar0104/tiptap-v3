// extensions/ChartNode.ts
import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import ChartNodeView from "@/components/tiptap-node/chart-node/chart-node-view";

export interface ChartOptions {
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    chartNode: {
      insertChart: () => ReturnType
    }
  }
}

export const ChartNode = Node.create<ChartOptions>({
  name: 'chartNode',

  group: 'block',
  atom: true,
  draggable: true,

  addOptions() {
    return { HTMLAttributes: {} }
  },

  addAttributes() {
    return {
      // store the full ApexCharts config as JSON
      config: {
        default: null,
        parseHTML: (el) => JSON.parse(el.getAttribute('data-config') || '{}'),
        renderHTML: (attrs) => ({ 'data-config': JSON.stringify(attrs.config) }),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="chartNode"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'chartNode',
      }),
      0,
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ChartNodeView, { as: 'div' })
  },

  onUpdate(props) {
    return !props.node.sameMarkup(props.oldNode) // recreate if data changed
  },

  addCommands() {
    return {
      insertChart:
        () =>
          ({ commands }) => {
            const defaultConfig = {
              series: [44, 55, 13, 43, 22],
              options: {
                chart: { type: 'donut' },
                labels: ['Team A', 'Team B', 'Team C', 'Team D', 'Team E'],
              },
            }
            return commands.insertContent({
              type: this.name,
              attrs: { config: defaultConfig },
            })
          },
    }
  },
})