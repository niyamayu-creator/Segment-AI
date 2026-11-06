import React, { useState } from 'react';

interface PcaPoint {
  x: number;
  y: number;
  cluster: number;
  id: string | number;
}

interface Props {
  points: PcaPoint[];
  varianceExplained: [number, number];
  k: number;
  clusterLabels: Record<number, string>;
  selectedCluster: number | null;
  onSelectCluster: (c: number | null) => void;
}

const CLUSTER_COLORS = [
  '#06b6d4', // cyan-500
  '#3b82f6', // blue-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#6366f1', // indigo-500
  '#14b8a6', // teal-500
  '#f43f5e', // rose-500
  '#a855f7', // purple-500
];

export const PcaScatterPlot: React.FC<Props> = ({
  points,
  varianceExplained,
  k,
  clusterLabels,
  selectedCluster,
  onSelectCluster,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<PcaPoint | null>(null);

  if (!points || points.length === 0) return null;

  // Calculate bounding box for SVG
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  points.forEach((p) => {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  });

  const padX = (maxX - minX) * 0.12 || 1;
  const padY = (maxY - minY) * 0.12 || 1;

  const viewBoxMinX = minX - padX;
  const viewBoxMaxX = maxX + padX;
  const viewBoxMinY = minY - padY;
  const viewBoxMaxY = maxY + padY;

  const width = 640;
  const height = 400;

  // Coordinate mapper
  const scaleX = (val: number) =>
    ((val - viewBoxMinX) / (viewBoxMaxX - viewBoxMinX || 1)) * (width - 80) + 40;
  const scaleY = (val: number) =>
    height - 40 - ((val - viewBoxMinY) / (viewBoxMaxY - viewBoxMinY || 1)) * (height - 80);

  // Calculate cluster center of mass in 2D
  const clusterCenters = Array.from({ length: k }, (_, c) => {
    const pts = points.filter((p) => p.cluster === c);
    if (pts.length === 0) return { x: 0, y: 0, count: 0 };
    const avgX = pts.reduce((s, p) => s + p.x, 0) / pts.length;
    const avgY = pts.reduce((s, p) => s + p.y, 0) / pts.length;
    return { x: avgX, y: avgY, count: pts.length };
  });

  return (
    <div className="flex flex-col gap-3">
      {/* Cluster Legend / Filter */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <button
          onClick={() => onSelectCluster(null)}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
            selectedCluster === null
              ? 'bg-slate-800 text-cyan-300 border border-cyan-500/30'
              : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          Todos los segmentos ({points.length} clientes)
        </button>
        {Array.from({ length: k }, (_, i) => {
          const color = CLUSTER_COLORS[i % CLUSTER_COLORS.length];
          const isSelected = selectedCluster === i;
          return (
            <button
              key={i}
              onClick={() => onSelectCluster(isSelected ? null : i)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                isSelected
                  ? 'bg-slate-800 text-slate-100 border border-slate-600 shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
              <span className="truncate max-w-[150px]">
                {clusterLabels[i] || `Segmento ${i + 1}`} ({clusterCenters[i]?.count || 0})
              </span>
            </button>
          );
        })}
      </div>

      {/* SVG Canvas */}
      <div className="relative border border-slate-800 bg-slate-950/80 rounded-xl overflow-hidden p-2">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none">
          {/* Grid lines */}
          <line
            x1="40"
            y1={scaleY(0)}
            x2={width - 40}
            y2={scaleY(0)}
            stroke="#1e293b"
            strokeDasharray="4 4"
            strokeWidth="1"
          />
          <line
            x1={scaleX(0)}
            y1="20"
            x2={scaleX(0)}
            y2={height - 40}
            stroke="#1e293b"
            strokeDasharray="4 4"
            strokeWidth="1"
          />

          {/* Points */}
          {points.map((pt, idx) => {
            const isDimmed = selectedCluster !== null && pt.cluster !== selectedCluster;
            const isSelected = selectedCluster === pt.cluster;
            const color = CLUSTER_COLORS[pt.cluster % CLUSTER_COLORS.length];
            const cx = scaleX(pt.x);
            const cy = scaleY(pt.y);

            return (
              <circle
                key={idx}
                cx={cx}
                cy={cy}
                r={isSelected ? 4.5 : isDimmed ? 2.5 : 3.5}
                fill={color}
                opacity={isDimmed ? 0.2 : isSelected ? 0.95 : 0.75}
                className="transition-all duration-200 cursor-pointer hover:r-6 hover:opacity-100"
                onMouseEnter={() => setHoveredPoint(pt)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            );
          })}

          {/* Centroid markers */}
          {clusterCenters.map((center, c) => {
            if (center.count === 0) return null;
            const isDimmed = selectedCluster !== null && selectedCluster !== c;
            const color = CLUSTER_COLORS[c % CLUSTER_COLORS.length];
            const cx = scaleX(center.x);
            const cy = scaleY(center.y);

            return (
              <g key={`center-${c}`} opacity={isDimmed ? 0.25 : 1}>
                <circle cx={cx} cy={cy} r="10" fill={color} opacity="0.3" />
                <circle cx={cx} cy={cy} r="6" fill={color} stroke="#0f172a" strokeWidth="2" />
                <text
                  x={cx}
                  y={cy - 12}
                  textAnchor="middle"
                  fill="#f8fafc"
                  fontSize="10"
                  fontWeight="bold"
                  className="pointer-events-none drop-shadow"
                >
                  C{c + 1}
                </text>
              </g>
            );
          })}

          {/* Axes labels */}
          <text
            x={width / 2}
            y={height - 10}
            textAnchor="middle"
            fill="#64748b"
            fontSize="11"
            className="tabular-nums"
          >
            Componente Principal 1 (PC1: {varianceExplained[0]}% de varianza explicada)
          </text>
          <text
            x="14"
            y={height / 2}
            textAnchor="middle"
            fill="#64748b"
            fontSize="11"
            transform={`rotate(-90 14 ${height / 2})`}
            className="tabular-nums"
          >
            PC2 ({varianceExplained[1]}% varianza)
          </text>
        </svg>

        {/* Tooltip */}
        {hoveredPoint && (
          <div
            className="absolute z-20 pointer-events-none bg-slate-900 border border-slate-700 text-slate-200 p-2 rounded-lg text-xs shadow-xl tabular-nums"
            style={{
              left: `${(scaleX(hoveredPoint.x) / width) * 100}%`,
              top: `${(scaleY(hoveredPoint.y) / height) * 100}%`,
              transform: 'translate(-50%, -120%)',
            }}
          >
            <div className="font-semibold text-cyan-300">
              Cliente #{hoveredPoint.id}
            </div>
            <div className="text-slate-400">
              {clusterLabels[hoveredPoint.cluster] || `Segmento ${hoveredPoint.cluster + 1}`}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              PC1: {hoveredPoint.x} · PC2: {hoveredPoint.y}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>Total clientes proyectados: <strong className="text-slate-200 tabular-nums">{points.length}</strong></span>
        <span>Varianza acumulada 2D: <strong className="text-cyan-400 tabular-nums">{Number((varianceExplained[0] + varianceExplained[1]).toFixed(1))}%</strong></span>
      </div>
    </div>
  );
};
