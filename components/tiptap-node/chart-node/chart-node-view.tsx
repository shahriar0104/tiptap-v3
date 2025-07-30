// components/tiptap-node/chart-node/chart-node-view.tsx
'use client'

import { NodeViewWrapper } from '@tiptap/react'
import { useMemo } from 'react'
import dynamic from 'next/dynamic'

// lazy-load only once, but we will re-mount via key
const ApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
})

export default function ChartNodeView({ node }: any) {
  const { config } = node.attrs

  // If config is missing or invalid – render nothing (safe)
  const chartProps = useMemo(() => {
    if (!config?.options || !config?.series) return null
    return { options: config.options, series: config.series }
  }, [config])

  if (!chartProps) return null

  // Force ApexCharts to unmount/mount on every new node
  const key = node.pos + JSON.stringify(chartProps)

  return (
    <NodeViewWrapper className="my-4">
      <div className="w-full max-w-full overflow-x-auto">
        <ApexChart
          key={key}
          options={chartProps.options}
          series={chartProps.series}
          type="bar"
          height={320}
        />
      </div>
    </NodeViewWrapper>
  )
}