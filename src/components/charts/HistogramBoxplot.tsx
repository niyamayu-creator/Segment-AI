import React, { useState } from 'react';
import { NumericStats } from '../../types/segmentai';

interface Props {
  stats: NumericStats;
  rawData: Record<string, any>[];
}

export const HistogramBoxplot: React.FC<Props> = ({ stats, rawData }) => {
  const [activeTab, setActiveTab] = useState<'histogram' | 'boxplot'>('histogram');

  // Extract valid numbers
  const nums = rawData
    .map((r) => Number(r[stats.column]))
    .filter((v) => !isNaN(v))
    .sort((a, b) => a - b);

  if (nums.length === 0) return null;

  // Build histogram bins (10 bins)
  const numBins = 10;
  const min = stats.min;
  const max = stats.max;
  const binWidth = (max - min) / numBins || 1;
  const bins = Array.from({ length: numBins }, (_, i) => ({
    start: min + i * binWidth,
    end: min + (i + 1) * binWidth,
    count: 0,
  }));

  nums.forEach((val) => {
    let binIdx = Math.floor((val - min) / binWidth);
    if (binIdx >= numBins) binIdx = numBins - 1;
    if (binIdx < 0) binIdx = 0;
    bins[binIdx].count++;
  });

  const maxBinCount = Math.max(...bins.map((b) => b.count), 1);

  // Boxplot coordinates
  const range = max - min || 1;
  const getBoxPct = (val: number) => Math.max(0, Math.min(100, ((val - min) / range) * 100));

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <span className="font-semibold text-slate-200 text-sm">{stats.column}</span>
          <span className="text-xs text-slate-400 ml-2">
            (Media: <strong className="text-cyan-400 tabular-nums">{stats.mean}</strong>, Mediana: <strong className="text-cyan-400 tabular-nums">{stats.median}</strong>)
          </span>
        </div>
        <div className="flex items-center gap-1 p-0.5 bg-slate-950 border border-slate-800 rounded-lg text-xs">
          <button
            onClick={() => setActiveTab('histogram')}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              activeTab === 'histogram'
                ? 'bg-cyan-500/20 text-cyan-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Histograma
          </button>
          <button
            onClick={() => setActiveTab('boxplot')}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              activeTab === 'boxplot'
                ? 'bg-cyan-500/20 text-cyan-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Diagrama de Caja (Boxplot)
          </button>
        </div>
      </div>

      {activeTab === 'histogram' ? (
        <div className="flex flex-col gap-1.5 pt-2">
          {/* Histogram Bars */}
          <div className="h-36 flex items-end gap-1.5 border-b border-slate-800 pb-1">
            {bins.map((b, i) => {
              const heightPct = (b.count / maxBinCount) * 100;
              return (
                <div key={i} className="flex-1 h-full flex flex-col justify-end items-center group relative">
                  <div
                    className="w-full bg-cyan-500/70 hover:bg-cyan-400 transition-all rounded-t"
                    style={{ height: `${Math.max(4, heightPct)}%` }}
                  />
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-1 bg-slate-950 border border-slate-700 px-2 py-1 rounded text-[10px] text-cyan-300 pointer-events-none whitespace-nowrap z-20 tabular-nums">
                    [{b.start.toFixed(1)} - {b.end.toFixed(1)}]: {b.count} ({((b.count / nums.length) * 100).toFixed(1)}%)
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-[11px] font-mono text-slate-500 tabular-nums">
            <span>Mín: {stats.min}</span>
            <span>Centro: {((stats.min + stats.max) / 2).toFixed(1)}</span>
            <span>Máx: {stats.max}</span>
          </div>
        </div>
      ) : (
        /* Boxplot View */
        <div className="py-6 px-2 flex flex-col gap-3">
          <div className="relative h-14 flex items-center">
            {/* Whiskers line */}
            <div
              className="absolute h-0.5 bg-slate-600 top-1/2 transform -translate-y-1/2"
              style={{
                left: `${getBoxPct(stats.min)}%`,
                right: `${100 - getBoxPct(stats.max)}%`,
              }}
            />
            {/* Min tick */}
            <div
              className="absolute w-0.5 h-6 bg-slate-500 top-1/2 transform -translate-y-1/2"
              style={{ left: `${getBoxPct(stats.min)}%` }}
            />
            {/* Max tick */}
            <div
              className="absolute w-0.5 h-6 bg-slate-500 top-1/2 transform -translate-y-1/2"
              style={{ left: `${getBoxPct(stats.max)}%` }}
            />

            {/* IQR Box (P25 to P75) */}
            <div
              className="absolute h-9 bg-cyan-950/70 border-2 border-cyan-400/80 rounded top-1/2 transform -translate-y-1/2"
              style={{
                left: `${getBoxPct(stats.p25)}%`,
                width: `${Math.max(2, getBoxPct(stats.p75) - getBoxPct(stats.p25))}%`,
              }}
            >
              {/* Median Line (P50) */}
              <div
                className="absolute w-1 h-full bg-cyan-300 top-0 transform -translate-x-1/2"
                style={{
                  left: `${((stats.median - stats.p25) / (stats.p75 - stats.p25 || 1)) * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="flex justify-between text-[11px] font-mono text-slate-400 tabular-nums border-t border-slate-800/80 pt-2">
            <span>Q1 (25%): <strong className="text-slate-200">{stats.p25}</strong></span>
            <span>Mediana: <strong className="text-cyan-300">{stats.median}</strong></span>
            <span>Q3 (75%): <strong className="text-slate-200">{stats.p75}</strong></span>
            <span>IQR: <strong className="text-slate-200">{stats.iqr}</strong></span>
            <span>Atípicos: <strong className={stats.outlierCount > 0 ? 'text-amber-400' : 'text-slate-400'}>{stats.outlierCount}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
};
