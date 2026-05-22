"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

export function AdminActivityChart({
  data
}: {
  data: Array<{ date: string; downloads: number; apps: number }>;
}) {
  if (!data.length) {
    return (
      <div className="grid min-h-72 place-items-center rounded-md border border-dashed border-neutral-200 bg-neutral-50 text-sm text-neutral-500">
        Analytics will appear after apps and downloads exist.
      </div>
    );
  }

  return (
    <div className="h-72 min-h-72 min-w-0">
      <ResponsiveContainer width="100%" height={288}>
        <AreaChart data={data} margin={{ left: -20, right: 8, top: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="downloadsFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#0070f3" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#0070f3" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="appsFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#7928ca" stopOpacity={0.22} />
              <stop offset="95%" stopColor="#7928ca" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#e5e5e5" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: "#737373", fontSize: 12 }} />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: "#737373", fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: "1px solid #e5e5e5",
              boxShadow: "0 8px 24px rgba(0,0,0,0.08)"
            }}
          />
          <Area type="monotone" dataKey="downloads" stroke="#0070f3" fill="url(#downloadsFill)" strokeWidth={2} />
          <Area type="monotone" dataKey="apps" stroke="#7928ca" fill="url(#appsFill)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
