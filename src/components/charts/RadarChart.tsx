import React from 'react';
import { ClusterMetrics } from '../../types/segmentai';

interface Props {
  clusters: ClusterMetrics[];
  selectedCluster: number | null;
  features: string[];
  clusterLabels: Record<number, string>;
}

const CLUSTER_COLORS = [
  '#06b6d4',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#10b981',
  '#f59e0b',
  '#6366f1',
];

export const RadarChart: React.FC<Props> = ({
  clusters,
  selectedCluster,
  features,
  clusterLabels,
}) => {
  if (!clusters || clusters.length === 0 || !features || features.length === 0) return null;

  const size = 440;
  const center = size / 2;
  const radius = size * 0.38;
  const numAxes = features.length;

  // Compute min and max Z-score across all clusters for radial scaling
  let minZ = -2.0;
  let maxZ = 2.0;

  clusters.forEach((cl) => {
    features.forEach((f) => {
      const v = cl.standardizedCentroid[f] || 0;
      if (v < minZ) minZ = v;
      if (v > maxZ) maxZ = v;
    });
  });

  const rangeZ = maxZ - minZ || 1;

  // Convert Z-score to radius
  const getRadius = (z: number) => {
    const clamped = Math.max(minZ, Math.min(maxZ, z));
    const normalized = (clamped - minZ) / rangeZ;
    return normalized * radius;
  };

  // Concentric circle levels
  const levels = [-1.5, -1.0, 0, 1.0, 1.5];

  // Helper for polygon points
  const getPointsString = (centroid: Record<string, number>) => {
    return features
      .map((f, i) => {
        const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
        const r = getRadius(centroid[f] || 0);
        const x = center + r * Math.cos(angle);
        const y = center + r * Math.sin(angle);
        return `${x},${y}`;
      })
      .join(' ');
  };

  return (
    <div className="flex flex-col items-center">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[440px] h-auto select-none">
        {/* Background Grid Circles */}
        {levels.map((lvl, idx) => {
          const r = getRadius(lvl);
          return (
            <g key={idx}>
              <circle
                cx={center}
                cy={center}
                r={r}
                fill="none"
                stroke={lvl === 0 ? '#38bdf8' : '#334155'}
                strokeWidth={lvl === 0 ? '1.5' : '1'}
                strokeDasharray={lvl === 0 ? undefined : '3 3'}
                opacity={lvl === 0 ? 0.7 : 0.35}
              />
              <text
                x={center + 4}
                y={center - r + 10}
                fill="#64748b"
                fontSize="9"
                className="font-mono tabular-nums"
              >
                {lvl > 0 ? `+${lvl}` : lvl}σ
              </text>
            </g>
          );
        })}

        {/* Axes lines & labels */}
        {features.map((feat, i) => {
          const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
          const x2 = center + radius * Math.cos(angle);
          const y2 = center + radius * Math.sin(angle);

          // Label placement slightly beyond radius
          const labelDist = radius + 22;
          const lx = center + labelDist * Math.cos(angle);
          const ly = center + labelDist * Math.sin(angle);

          return (
            <g key={i}>
              <line
                x1={center}
                y1={center}
                x2={x2}
                y2={y2}
                stroke="#334155"
                strokeWidth="1"
              />
              <text
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#94a3b8"
                fontSize="10"
                fontWeight="500"
                className="max-w-[80px]"
              >
                {feat.length > 14 ? feat.slice(0, 12) + '…' : feat}
              </text>
            </g>
          );
        })}

        {/* Cluster Radar Polygons */}
        {clusters.map((cl) => {
          const isSelected = selectedCluster === cl.clusterIndex;
          const isDimmed = selectedCluster !== null && !isSelected;
          const color = CLUSTER_COLORS[cl.clusterIndex % CLUSTER_COLORS.length];
          const pts = getPointsString(cl.standardizedCentroid);

          return (
            <g key={cl.clusterIndex} opacity={isDimmed ? 0.15 : 1} className="transition-opacity duration-200">
              <polygon
                points={pts}
                fill={color}
                fillOpacity={isSelected ? 0.45 : 0.2}
                stroke={color}
                strokeWidth={isSelected ? 2.5 : 1.5}
              />
              {/* Vertices */}
              {features.map((f, i) => {
                const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
                const r = getRadius(cl.standardizedCentroid[f] || 0);
                const x = center + r * Math.cos(angle);
                const y = center + r * Math.sin(angle);
                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r={isSelected ? 4 : 2.5}
                    fill={color}
                    stroke="#0b1329"
                    strokeWidth="1"
                  />
                );
              })}
            </g>
          );
        })}
      </svg>

      <div className="text-center text-[11px] text-slate-500 mt-1">
        Escala centrada en promedio global (0σ). Valores exteriores representan Z-scores positivos superiores a la media.
      </div>
    </div>
  );
};
