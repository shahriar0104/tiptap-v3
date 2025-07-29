import { Node, mergeAttributes } from "@tiptap/react";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { ChartNodeView } from "./chart-node-view";

export interface ChartNodeAttrs {
  chartType: string;
  data: any;
}

export const ChartNode = Node.create({
  name: "chart",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      chartType: { default: "bar" },
      data: { default: {} },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="chart-node"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes({ "data-type": "chart-node" }, HTMLAttributes),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ChartNodeView);
  },

  addCommands() {
    return {
      insertChartNode:
        (attrs: ChartNodeAttrs) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs,
          });
        },
    };
  },
});

export default ChartNode;
