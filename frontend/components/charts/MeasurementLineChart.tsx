"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatDate } from "@/lib/format";

// Espelham os tokens de cor de app/globals.css (tema único, sem modo claro).
const COLOR_ACCENT = "#22c55e";
const COLOR_GRID = "#262e2a";
const COLOR_TEXT_MUTED = "#97a39c";
const COLOR_SURFACE_ALT = "#1b211e";
const COLOR_BORDER = "#262e2a";

export interface MeasurementDatum {
  inspectionDate: string;
  value: number | null;
}

export function MeasurementLineChart({
  title,
  unit,
  data,
}: {
  title: string;
  unit: string;
  data: MeasurementDatum[];
}) {
  const hasValues = data.some((d) => d.value != null);

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-fg">{title}</p>
      {!hasValues ? (
        <p className="text-sm text-fg-muted">Sem medições registradas para este ponto.</p>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke={COLOR_GRID} strokeWidth={1} />
            <XAxis
              dataKey="inspectionDate"
              tickFormatter={(value: string) => formatDate(value)}
              tick={{ fill: COLOR_TEXT_MUTED, fontSize: 11 }}
              axisLine={{ stroke: COLOR_GRID }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: COLOR_TEXT_MUTED, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={36}
              unit={unit}
            />
            <Tooltip
              labelFormatter={(value) => (typeof value === "string" ? formatDate(value) : value)}
              formatter={(value) => [`${value} ${unit}`, title]}
              contentStyle={{
                background: COLOR_SURFACE_ALT,
                border: `1px solid ${COLOR_BORDER}`,
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: "#edf2ef" }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={COLOR_ACCENT}
              strokeWidth={2}
              dot={{ r: 4, fill: COLOR_ACCENT, stroke: COLOR_SURFACE_ALT, strokeWidth: 2 }}
              activeDot={{ r: 5 }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
