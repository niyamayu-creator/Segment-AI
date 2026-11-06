import React, { useState } from 'react';
import { ClusterMetrics } from '../../types/segmentai';

interface Props {
  clusters: ClusterMetrics[];
  features: string[];
  clusterLabels: Record<number, string>;
  selectedCluster: number | null;
  onSelectCluster: (c: number | null) => void;
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

export const CentroidsBarChart: React.FC<Props> = ({
  clusters,
  features,
  clusterLabels,
  selectedCluster,
  onSelectCluster,
}) => {
  const [viewMode, setViewMode] = useState<'standardized' | 'original'>('standardized');

  if (!clusters || clusters.length === 0 || !features || features.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      {/* Switch between standardized Z-Scores and Original Units */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs">
          <button
            onClick={() => setViewMode('standardized')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              viewMode === 'standardized'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Z-Scores Estandarizados (Comparación Relativa)
          </button>
          <button
            onClick={() => setViewMode('original')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              viewMode === 'original'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Unidades Reales / Promedios Originales
          </button>
        </div>

        <div className="text-xs text-slate-400">
          {viewMode === 'standardized'
            ? '0.0 = Promedio General | +1.0 = 1 Desviación estándar arriba'
            : 'Valores en escala original del negocio'}
        </div>
      </div>

      {/* Grid of feature comparison bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((feat) => {
          // Values across clusters
          const vals = clusters.map((cl) =>
            viewMode === 'standardized'
              ? cl.standardizedCentroid[feat] ?? 0
              : cl.originalCentroid[feat] ?? 0
          );

          const maxVal = Math.max(...vals, 0.01);
          const minVal = Math.min(...vals, 0);

          return (
            <div
              key={feat}
              className="p-3.5 bg-slate-900/60 border border-slate-800/80 rounded-xl flex flex-col gap-2.5"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                <span>{feat}</span>
                <span className="text-[11px] text-slate-400 font-normal">
                  {viewMode === 'standardized' ? 'Z-score' : 'Promedio'}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {clusters.map((cl) => {
                  const val =
                    viewMode === 'standardized'
                      ? cl.standardizedCentroid[feat] ?? 0
                      : cl.originalCentroid[feat] ?? 0;
                  const color = CLUSTER_COLORS[cl.clusterIndex % CLUSTER_COLORS.length];
                  const isSelected = selectedCluster === cl.clusterIndex;
                  const isDimmed = selectedCluster !== null && !isSelected;

                  // Bar percentage
                  let barWidthPercent = 0;
                  if (viewMode === 'standardized') {
                    // Normalize -2.5 to +2.5
                    barWidthPercent = Math.min(100, Math.max(5, (Math.abs(val) / 2.5) * 100));
                  } else {
                    barWidthPercent = maxVal > 0 ? Math.min(100, Math.max(5, (val / maxVal) * 100)) : 10;
                  }

                  return (
                    <div
                      key={cl.clusterIndex}
                      onClick={() => onSelectCluster(isSelected ? null : cl.clusterIndex)}
                      className={`flex items-center gap-2 cursor-pointer transition-opacity ${
                        isDimmed ? 'opacity-30' : 'opacity-100'
                      }`}
                    >
                      <div className="w-24 text-[11px] truncate text-slate-400 font-medium">
                        {clusterLabels[cl.clusterIndex] || cl.label}
                      </div>

                      <div className="flex-1 h-5 bg-slate-950/80 rounded overflow-hidden relative border border-slate-800/60">
                        {viewMode === 'standardized' && (
                          <div className="absolute top-0 bottom-0 left-1/2 w-px bg-slate-700/80 z-10" />
                        )}
                        <div
                          className="h-full rounded transition-all duration-300"
                          style={{
                            width: `${barWidthPercent}%`,
                            backgroundColor: color,
                            opacity: isSelected ? 1 : 0.8,
                          }}
                        />
                      </div>

                      <div className="w-16 text-right font-mono text-xs tabular-nums text-slate-200 font-semibold">
                        {viewMode === 'standardized'
                          ? (val >= 0 ? `+${val.toFixed(2)}` : val.toFixed(2)) + 'σ'
                          : Number(val.toFixed(1)).toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
