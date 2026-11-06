import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  HelpCircle,
  TrendingDown,
  CheckCircle2,
  LineChart,
} from 'lucide-react';
import { DatasetSummary, KOptimization } from '../../types/segmentai';
import { evaluateRangeOfK, preprocessData } from '../../services/clustering';

interface Props {
  dataset: DatasetSummary;
  selectedK: number;
  isAutomatic: boolean;
  onSelectK: (k: number, isAuto: boolean) => void;
  onProceed: () => void;
}

export const Step5NumeroSegmentos: React.FC<Props> = ({
  dataset,
  selectedK,
  isAutomatic,
  onSelectK,
  onProceed,
}) => {
  const [optimization, setOptimization] = useState<KOptimization | null>(null);
  const [evaluating, setEvaluating] = useState(false);

  // Get active numeric features (excluding ID)
  const numericFeatures = dataset.columns
    .filter((c) => c.type === 'numeric' && !c.isLikelyId)
    .map((c) => c.name);

  // Run multi-metric evaluation
  useEffect(() => {
    try {
      setEvaluating(true);
      const prep = preprocessData(dataset.rawData, numericFeatures, 'median', 'standard');
      const opt = evaluateRangeOfK(prep.matrix, 2, Math.min(8, Math.max(4, Math.floor(prep.matrix.length / 5))));
      setOptimization(opt);

      // If automatic, default to recommended K
      if (isAutomatic && opt) {
        onSelectK(opt.recommendedK, true);
      }
    } catch (err) {
      console.error('Error evaluating K:', err);
    } finally {
      setEvaluating(false);
    }
  }, [dataset]);

  const results = optimization?.results || [];

  // Find max/min for SVG scaling of graphs
  const maxInertia = Math.max(...results.map((r) => r.inertia), 1);
  const maxSilhouette = Math.max(...results.map((r) => r.silhouette), 0.01);
  const maxCH = Math.max(...results.map((r) => r.calinskiHarabasz), 1);
  const minDB = Math.min(...results.map((r) => r.daviesBouldin), 0.01);
  const maxDB = Math.max(...results.map((r) => r.daviesBouldin), 1);

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-2">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          ¿Cuántos segmentos de clientes deseas identificar?
        </h2>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          Selecciona un valor manual entre 2 y 10 clusters o activa el modo{' '}
          <strong className="text-cyan-400">AUTOMÁTICO</strong> para que el motor
          estadístico evalúe el Método del Codo, Silhouette, Calinski-Harabasz y
          Davies-Bouldin.
        </p>
      </div>

      {/* Selector Control */}
      <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {/* Automatic Option */}
          <button
            onClick={() => {
              const recK = optimization?.recommendedK || 4;
              onSelectK(recK, true);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isAutomatic
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-lg shadow-cyan-500/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>AUTOMÁTICO (Recomendado por IA)</span>
          </button>
        </div>

        {/* Manual Buttons 2 to 10 */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-slate-400 mr-1">O manual:</span>
          {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((k) => (
            <button
              key={k}
              onClick={() => onSelectK(k, false)}
              className={`w-9 h-9 rounded-lg font-mono text-xs font-bold transition-colors cursor-pointer ${
                selectedK === k && !isAutomatic
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      {/* Comparative Evaluation Section */}
      {optimization && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Chart 1: Inertia (Elbow Method) */}
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">
                  Método del Codo (Elbow - Inercia WCSS)
                </span>
                <span className="text-[11px] text-slate-400">Menor es más compacto</span>
              </div>

              {/* Simple Responsive SVG Line Chart */}
              <div className="h-44 relative bg-slate-950/60 rounded-lg p-2 border border-slate-800/80">
                <svg viewBox="0 0 400 140" className="w-full h-full select-none">
                  {/* Grid */}
                  <line x1="30" y1="20" x2="380" y2="20" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="30" y1="70" x2="380" y2="70" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="30" y1="120" x2="380" y2="120" stroke="#1e293b" strokeWidth="1" />

                  {/* Line */}
                  <polyline
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="2.5"
                    points={results
                      .map((r, i) => {
                        const x = 40 + (i / (results.length - 1 || 1)) * 330;
                        const y = 120 - (r.inertia / maxInertia) * 100;
                        return `${x},${y}`;
                      })
                      .join(' ')}
                  />

                  {/* Points */}
                  {results.map((r, i) => {
                    const x = 40 + (i / (results.length - 1 || 1)) * 330;
                    const y = 120 - (r.inertia / maxInertia) * 100;
                    const isRec = r.k === optimization.recommendedK;

                    return (
                      <g key={r.k}>
                        <circle
                          cx={x}
                          cy={y}
                          r={isRec ? 5.5 : 3.5}
                          fill={isRec ? '#38bdf8' : '#06b6d4'}
                          stroke="#0b1329"
                          strokeWidth="2"
                        />
                        <text
                          x={x}
                          y="135"
                          textAnchor="middle"
                          fill="#94a3b8"
                          fontSize="10"
                          fontFamily="monospace"
                        >
                          K={r.k}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Chart 2: Silhouette Score */}
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">
                  Coeficiente Silhouette Score
                </span>
                <span className="text-[11px] text-emerald-400">Mayor es mejor separación</span>
              </div>

              <div className="h-44 relative bg-slate-950/60 rounded-lg p-2 border border-slate-800/80">
                <svg viewBox="0 0 400 140" className="w-full h-full select-none">
                  {/* Grid */}
                  <line x1="30" y1="20" x2="380" y2="20" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="30" y1="70" x2="380" y2="70" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="30" y1="120" x2="380" y2="120" stroke="#1e293b" strokeWidth="1" />

                  {/* Line */}
                  <polyline
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    points={results
                      .map((r, i) => {
                        const x = 40 + (i / (results.length - 1 || 1)) * 330;
                        const y = 120 - (r.silhouette / (maxSilhouette || 1)) * 95;
                        return `${x},${y}`;
                      })
                      .join(' ')}
                  />

                  {/* Points */}
                  {results.map((r, i) => {
                    const x = 40 + (i / (results.length - 1 || 1)) * 330;
                    const y = 120 - (r.silhouette / (maxSilhouette || 1)) * 95;
                    const isRec = r.k === optimization.recommendedK;

                    return (
                      <g key={r.k}>
                        <circle
                          cx={x}
                          cy={y}
                          r={isRec ? 5.5 : 3.5}
                          fill={isRec ? '#34d399' : '#10b981'}
                          stroke="#0b1329"
                          strokeWidth="2"
                        />
                        <text
                          x={x}
                          y="135"
                          textAnchor="middle"
                          fill="#94a3b8"
                          fontSize="10"
                          fontFamily="monospace"
                        >
                          K={r.k}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
          </div>

          {/* Table comparing all metrics across K */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-3 border-b border-slate-800 text-xs font-semibold text-slate-200">
              Tabla Comparativa de Métricas de Validación por Número de Clusters (K)
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs select-none">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] text-slate-400">
                    <th className="p-2.5 font-semibold">Clusters (K)</th>
                    <th className="p-2.5 font-semibold text-right">Inercia WCSS</th>
                    <th className="p-2.5 font-semibold text-right">Silhouette Score</th>
                    <th className="p-2.5 font-semibold text-right">Calinski-Harabasz</th>
                    <th className="p-2.5 font-semibold text-right">Davies-Bouldin</th>
                    <th className="p-2.5 font-semibold text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono tabular-nums text-slate-300">
                  {results.map((r) => {
                    const isSelected = selectedK === r.k;
                    const isOptimal = r.k === optimization.recommendedK;

                    return (
                      <tr
                        key={r.k}
                        className={`transition-colors ${
                          isSelected ? 'bg-cyan-950/40' : 'hover:bg-slate-800/40'
                        }`}
                      >
                        <td className="p-2.5 font-sans font-bold flex items-center gap-2">
                          <span className="text-white">K = {r.k}</span>
                          {isOptimal && (
                            <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-800 font-sans">
                              Óptimo sugerido
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 text-right text-slate-400">{r.inertia}</td>
                        <td className="p-2.5 text-right font-bold text-emerald-400">
                          {r.silhouette}
                        </td>
                        <td className="p-2.5 text-right text-slate-300">{r.calinskiHarabasz}</td>
                        <td className="p-2.5 text-right text-cyan-400">{r.daviesBouldin}</td>
                        <td className="p-2.5 text-center font-sans">
                          <button
                            onClick={() => onSelectK(r.k, false)}
                            className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${
                              isSelected
                                ? 'bg-cyan-500 text-slate-950'
                                : 'bg-slate-800 text-slate-300 hover:text-white'
                            }`}
                          >
                            {isSelected ? 'Seleccionado' : 'Elegir'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recommendation Box */}
          <div className="p-5 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-900 border border-cyan-800/50 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold tracking-wider uppercase">
              <Sparkles className="w-4 h-4" />
              <span>Diagnóstico de Recomendación de Segmentos: K = {optimization.recommendedK}</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              <strong>Criterio Estadístico:</strong> {optimization.statisticalRationale}
            </p>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>Viabilidad Comercial:</strong> {optimization.businessRationale}
            </p>
          </div>
        </div>
      )}

      {/* Confirmation & Next Button */}
      <div className="flex items-center justify-between p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
        <div className="text-xs text-slate-300">
          Segmentos fijados: <strong className="text-cyan-400 text-sm font-mono">{selectedK} clusters</strong>{' '}
          {isAutomatic && <span className="text-slate-400">(Modo Automático activo)</span>}
        </div>
        <button
          onClick={onProceed}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
        >
          <span>CONTINUAR: PREPARACIÓN Y ML</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
