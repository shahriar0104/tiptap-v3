import React from "react";
import dynamic from "next/dynamic";
import { NodeViewWrapper, NodeViewContent } from "@tiptap/react";

// Dynamically import ApexCharts to avoid SSR issues
// @ts-ignore
const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export interface ChartNodeViewProps {
  node: any;
  updateAttributes: (attrs: any) => void;
  deleteNode: () => void;
}

export const ChartNodeView: React.FC<ChartNodeViewProps> = ({ node, updateAttributes, deleteNode }) => {
  const { chartType, data } = node.attrs;

  return (
    <NodeViewWrapper className="my-4 border rounded bg-white dark:bg-gray-900 p-4 relative">
      <div className="flex justify-between items-center mb-2">
        <span className="font-semibold text-sm text-gray-700 dark:text-gray-200">Chart: {chartType}</span>
        <button
          className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          onClick={deleteNode}
        >
          Delete
        </button>
      </div>
      <div className="overflow-x-auto">
        {typeof window !== "undefined" && data && data.options && data.series ? (
          // @ts-ignore: dynamic import may not infer props correctly
          React.createElement(ApexChart, {
            type: chartType,
            options: data.options,
            series: data.series,
            height: 280,
          })
        ) : (
          <div className="text-gray-400 text-center">No chart data</div>
        )}
      </div>
      <NodeViewContent />
    </NodeViewWrapper>
  );
};
