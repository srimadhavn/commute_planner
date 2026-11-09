import React, { useState } from 'react';
import { SavedTripItem } from '../../types/api';
import { formatCo2 } from '../../utils/formatters';

interface SavingsChartProps {
  trips: SavedTripItem[];
}

export const SavingsChart: React.FC<SavingsChartProps> = ({ trips }) => {
  const [hoveredPoint, setHoveredPoint] = useState<{
    date: string;
    co2: number;
    cumulative: number;
    x: number;
    y: number;
  } | null>(null);

  if (!trips || trips.length === 0) {
    return null;
  }

  // Sort trips chronologically ascending for cumulative calculations
  const sorted = [...trips].sort(
    (a, b) => new Date(a.trip_ts).getTime() - new Date(b.trip_ts).getTime()
  );

  let runningTotal = 0;
  const points = sorted.map((trip) => {
    runningTotal += trip.co2_saved_g || 0;
    return {
      date: new Date(trip.trip_ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      co2: trip.co2_saved_g || 0,
      cumulative: runningTotal,
    };
  });

  const maxVal = Math.max(...points.map((p) => p.cumulative), 1000);
  const minVal = 0;

  const width = 600;
  const height = 220;
  const padding = { top: 20, right: 25, bottom: 35, left: 55 };

  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  // Calculate coordinates
  const coords = points.map((p, idx) => {
    const x =
      points.length > 1
        ? padding.left + (idx / (points.length - 1)) * graphWidth
        : padding.left + graphWidth / 2;
    const y = padding.top + graphHeight - ((p.cumulative - minVal) / (maxVal - minVal)) * graphHeight;
    return { ...p, x, y };
  });

  // Construct SVG Path
  const linePath = coords.reduce(
    (acc, curr, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${curr.x} ${curr.y}`,
    ''
  );

  // Construct Area Path
  const areaPath = `${linePath} L ${coords[coords.length - 1].x} ${
    padding.top + graphHeight
  } L ${coords[0].x} ${padding.top + graphHeight} Z`;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs">
        <h4 className="font-bold text-slate-800 dark:text-slate-200">
          Cumulative CO₂ Emissions Avoided Over Time
        </h4>
        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
          Total: {formatCo2(runningTotal)}
        </span>
      </div>

      <div className="relative w-full overflow-hidden bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto text-emerald-600 focus:outline-none"
          role="img"
          aria-label={`Cumulative CO2 saved line chart showing progression up to ${formatCo2(runningTotal)}`}
        >
          <desc>Interactive line chart displaying avoided carbon emissions over time.</desc>

          {/* Horizontal Grid lines */}
          {[0, 0.33, 0.66, 1].map((pct, i) => {
            const yPos = padding.top + graphHeight * (1 - pct);
            const val = minVal + (maxVal - minVal) * pct;
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={yPos}
                  x2={width - padding.right}
                  y2={yPos}
                  stroke="currentColor"
                  strokeOpacity="0.1"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 8}
                  y={yPos + 3}
                  textAnchor="end"
                  className="text-[10px] fill-slate-400"
                >
                  {formatCo2(val)}
                </text>
              </g>
            );
          })}

          {/* Area Gradient */}
          <defs>
            <linearGradient id="co2AreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Area Fill */}
          <path d={areaPath} fill="url(#co2AreaGradient)" />

          {/* Main Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {coords.map((pt, index) => (
            <g key={index}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r="4.5"
                className="fill-white dark:fill-slate-900 stroke-emerald-600 hover:scale-125 transition-transform cursor-pointer"
                strokeWidth="2.5"
                tabIndex={0}
                onMouseEnter={() => setHoveredPoint(pt)}
                onFocus={() => setHoveredPoint(pt)}
                aria-label={`${pt.date}: ${formatCo2(pt.cumulative)} cumulative CO2 saved`}
              />
              {/* X Axis Date Labels */}
              {(index === 0 || index === coords.length - 1 || index === Math.floor(coords.length / 2)) && (
                <text
                  x={pt.x}
                  y={height - 10}
                  textAnchor="middle"
                  className="text-[10px] fill-slate-500 font-medium"
                >
                  {pt.date}
                </text>
              )}
            </g>
          ))}
        </svg>

        {/* Floating Tooltip */}
        {hoveredPoint && (
          <div
            className="absolute z-20 pointer-events-none p-2 rounded-lg bg-slate-900 text-white text-xs shadow-lg transform -translate-x-1/2 -translate-y-full"
            style={{
              left: `${(hoveredPoint.x / width) * 100}%`,
              top: `${(hoveredPoint.y / height) * 100}%`,
            }}
          >
            <span className="font-bold">{hoveredPoint.date}</span>
            <div className="text-emerald-300">
              +{formatCo2(hoveredPoint.co2)} saved
            </div>
            <div className="text-[10px] text-slate-300">
              Total: {formatCo2(hoveredPoint.cumulative)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
