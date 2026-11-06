import React, { useState } from 'react';
import {
  Table,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Sparkles,
  Edit2,
  Check,
  Users,
} from 'lucide-react';
import {
  ClusteringModelOutput,
  ClusterMetrics,
  EconomicSector,
} from '../../types/segmentai';

interface Props {
  modelOutput: ClusteringModelOutput;
  sector: EconomicSector | string;
  onUpdateClusterName: (clusterIndex: number, newName: string) => void;
  onProceed: () => void;
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

export const Step7ResultadosCentroides: React.FC<Props> = ({
  modelOutput,
  sector,
  onUpdateClusterName,
  onProceed,
}) => {
  const [viewMode, setViewMode] = useState<'original' | 'standardized'>('original');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingName, setEditingName] = useState<string>('');

  const clusters = modelOutput.clusters;
  const features = modelOutput.config.selectedColumns;

  const startEditing = (idx: number, currentName: string) => {
    setEditingIndex(idx);
    setEditingName(currentName);
  };

  const saveEditing = (idx: number) => {
    if (editingName.trim()) {
      onUpdateClusterName(idx, editingName.trim());
    }
    setEditingIndex(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-2">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Interpretación de Clusters y Centroides
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Análisis de centroides en unidades reales y estandarizadas con denominación comercial para <strong className="text-cyan-300">{sector}</strong>.
          </p>
        </div>

        {/* View Mode Switch */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs">
          <button
            onClick={() => setViewMode('original')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              viewMode === 'original'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Unidades Originales (Promedios)
          </button>
          <button
            onClick={() => setViewMode('standardized')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              viewMode === 'standardized'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Centroides Estandarizados (Z-Scores)
          </button>
        </div>
      </div>

      {/* Comparative Centroids Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-3.5 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-semibold text-slate-200">
            <Table className="w-4 h-4 text-cyan-400" />
            <span>Matriz Comparativa de Variables por Cluster ({viewMode === 'original' ? 'Valores promedio' : 'Z-Scores'})</span>
          </div>
          <span className="text-slate-400 font-mono text-[11px]">
            {clusters.length} segmentos analizados
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs select-none">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] text-slate-400">
                <th className="p-3 font-semibold text-slate-200">Variable</th>
                {clusters.map((cl) => {
                  const name = modelOutput.strategies[cl.clusterIndex]?.commercialName || cl.label;
                  return (
                    <th key={cl.clusterIndex} className="p-3 text-right font-semibold">
                      <div className="flex flex-col items-end">
                        <span className="text-slate-200 truncate max-w-[140px]">{name}</span>
                        <span className="text-[10px] text-slate-500 font-mono font-normal">
                          {cl.count} clientes ({cl.percentage}%)
                        </span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono tabular-nums text-slate-300">
              {features.map((feat) => (
                <tr key={feat} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 font-sans font-medium text-slate-100 whitespace-nowrap">
                    {feat}
                  </td>
                  {clusters.map((cl) => {
                    const val =
                      viewMode === 'original'
                        ? cl.originalCentroid[feat]
                        : cl.standardizedCentroid[feat];
                    const zScore = cl.standardizedCentroid[feat] || 0;

                    const isHigh = zScore > 0.5;
                    const isLow = zScore < -0.5;

                    return (
                      <td key={cl.clusterIndex} className="p-3 text-right">
                        <span
                          className={`font-semibold ${
                            isHigh
                              ? 'text-cyan-400'
                              : isLow
                              ? 'text-amber-400/90'
                              : 'text-slate-200'
                          }`}
                        >
                          {viewMode === 'standardized'
                            ? (val >= 0 ? `+${val.toFixed(2)}` : val.toFixed(2)) + 'σ'
                            : Number(val.toFixed(1)).toLocaleString()}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Individual Cluster Profile Cards */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-200">
          Fichas Individuales de Segmentación Estratégica
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {clusters.map((cl) => {
            const strategy = modelOutput.strategies[cl.clusterIndex];
            const currentName = strategy?.commercialName || cl.label;
            const color = CLUSTER_COLORS[cl.clusterIndex % CLUSTER_COLORS.length];
            const isEditing = editingIndex === cl.clusterIndex;

            const aboveAvg = cl.topDifferentiatingFeatures.filter((f) => f.direction === 'above');
            const belowAvg = cl.topDifferentiatingFeatures.filter((f) => f.direction === 'below');

            return (
              <div
                key={cl.clusterIndex}
                className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-4 flex flex-col justify-between"
              >
                {/* Header & Commercial Name */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                        Segmento {cl.clusterIndex + 1}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {cl.isLowSizeWarning && (
                        <span className="text-[10px] text-amber-400 bg-amber-950/80 border border-amber-800 px-2 py-0.5 rounded flex items-center gap-1 font-sans">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Alerta de tamaño &lt;5%</span>
                        </span>
                      )}
                      <span className="text-xs font-mono tabular-nums text-slate-300 font-bold">
                        {cl.count} clientes ({cl.percentage}%)
                      </span>
                    </div>
                  </div>

                  {/* Commercial Name with inline edit */}
                  {isEditing ? (
                    <div className="flex items-center gap-1.5 pt-1">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="flex-1 bg-slate-950 border border-cyan-500 rounded px-2.5 py-1 text-xs text-white focus:outline-none"
                      />
                      <button
                        onClick={() => saveEditing(cl.clusterIndex)}
                        className="p-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 rounded cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between group pt-1">
                      <h4 className="text-base font-bold text-white tracking-tight leading-snug">
                        {currentName}
                      </h4>
                      <button
                        onClick={() => startEditing(cl.clusterIndex, currentName)}
                        title="Personalizar nombre comercial"
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-cyan-300 transition-opacity cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <p className="text-xs text-slate-300 leading-relaxed pt-1">
                    {strategy?.profileDescription}
                  </p>
                </div>

                {/* Behavioral signature tags */}
                <div className="space-y-2 border-t border-slate-800/80 pt-3">
                  <div className="text-[11px] font-semibold text-slate-400">
                    Variables Superiores al Promedio General (Z &gt; 0):
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {aboveAvg.length > 0 ? (
                      aboveAvg.map((f) => (
                        <span
                          key={f.feature}
                          className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-800/60 text-cyan-300 font-mono"
                        >
                          <TrendingUp className="w-3 h-3 text-cyan-400" />
                          <span>{f.feature} (+{f.differencePercent}%)</span>
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500 italic">Ninguna superior al promedio</span>
                    )}
                  </div>

                  {belowAvg.length > 0 && (
                    <>
                      <div className="text-[11px] font-semibold text-slate-400 pt-1">
                        Variables Inferiores al Promedio (Z &lt; 0):
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {belowAvg.map((f) => (
                          <span
                            key={f.feature}
                            className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400 font-mono"
                          >
                            <TrendingDown className="w-3 h-3 text-slate-500" />
                            <span>{f.feature} ({f.differencePercent}%)</span>
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Value proposition pill */}
                <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800 text-xs text-slate-300">
                  <span className="text-cyan-400 font-semibold block mb-0.5 text-[11px]">
                    Propuesta de Valor Clave:
                  </span>
                  <span>{strategy?.valueProposition}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirmation & Next Button */}
      <div className="flex items-center justify-between p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
        <div className="text-xs text-slate-300">
          Centroides calculados rigurosamente para los {clusters.length} segmentos. Nombres comerciales contextualizados en {sector}.
        </div>
        <button
          onClick={onProceed}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
        >
          <span>CONTINUAR: VISUALIZACIÓN DE SEGMENTOS</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
