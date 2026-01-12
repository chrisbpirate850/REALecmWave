"use client"

import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

type AnalyticsChartProps = {
  data: Array<{
    date: string
    scans: number
  }>
}

export function AnalyticsChart({ data }: AnalyticsChartProps) {
  return (
    <ChartContainer
      config={{
        scans: {
          label: "Scans",
          color: "hsl(var(--chart-1))",
        },
      }}
      className="h-[300px] w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" fontSize={12} />
          <YAxis fontSize={12} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line type="monotone" dataKey="scans" stroke="var(--color-scans)" strokeWidth={2} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
