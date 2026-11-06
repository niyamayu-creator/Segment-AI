import React, { useState } from 'react';
import {
  PieChart as PieIcon,
  ScatterChart,
  Radar,
  BarChart2,
  Table,
  ArrowRight,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  ClusteringModelOutput,
  EconomicSector,
} from '../../types/segmentai';
import { PcaScatterPlot } from '../charts/PcaScatterPlot';
import { RadarChart } from '../charts/RadarChart';
import { CentroidsBarChart } from '../charts/CentroidsBarChart';

interface Props {
  modelOutput: ClusteringModelOutput;
  sector: EconomicSector | string;
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

export const Step8Visualizacion: React.FC<Props> = ({
  modelOutput,
  sector,
  onProceed,
}) => {
  const [selectedCluster, setSelectedCluster] = useState<number | null>(null);
  const [activeViz, setActiveViz] = useState<'pca' | 'radar' | 'centroids' | 'distribution' | 'heatmap'>('pca');

  const clusters = modelOutput.clusters;
  const features = modelOutput.config.selectedColumns;
  const totalRows = modelOutput.globalEvaluation.totalRowsUsed;

  // Build cluster label dictionary
  const clusterLabels: Record<number, string> = {};
  clusters.forEach((cl) => {
    clusterLabels[cl.clusterIndex] =
      modelOutput.strategies[cl.clusterIndex]?.commercialName || cl.label;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-2">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Visualización Multidimensional de Segmentos
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Exploración visual mediante PCA 2D, radar de perfiles, centroides comparativos y distribución porcentual.
          </p>
        </div>

        {/* Viz Navigation Pills */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs flex-wrap">
          <button
            onClick={() => setActiveViz('pca')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeViz === 'pca'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Proyección PCA 2D
          </button>
          <button
            onClick={() => setActiveViz('radar')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeViz === 'radar'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Radar Multivariable
          </button>
          <button
            onClick={() => setActiveViz('centroids')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeViz === 'centroids'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Comparación de Centroides
          </button>
          <button
            onClick={() => setActiveViz('distribution')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeViz === 'distribution'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Distribución & Cuota
          </button>
          <button
            onClick={() => setActiveViz('heatmap')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeViz === 'heatmap'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Heatmap Z-Scores
          </button>
        </div>
      </div>

      {/* Selected Cluster Filter Pill Bar */}
      <div className="flex items-center gap-2 p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs overflow-x-auto">
        <span className="text-slate-400 font-medium px-1">Foco de análisis:</span>
        <button
          onClick={() => setSelectedCluster(null)}
          className={`px-3 py-1 rounded-md font-medium whitespace-nowrap transition-colors ${
            selectedCluster === null
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          Vista Global ({clusters.length} clusters)
        </button>
        {clusters.map((cl) => {
          const isSelected = selectedCluster === cl.clusterIndex;
          const color = CLUSTER_COLORS[cl.clusterIndex % CLUSTER_COLORS.length];
          return (
            <button
              key={cl.clusterIndex}
              onClick={() => setSelectedCluster(isSelected ? null : cl.clusterIndex)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium whitespace-nowrap transition-colors ${
                isSelected
                  ? 'bg-slate-800 text-white border border-slate-600 shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              <span>{clusterLabels[cl.clusterIndex] || cl.label}</span>
            </button>
          );
        })}
      </div>

      {/* VIEW 1: PCA 2D Scatter Plot */}
      {activeViz === 'pca' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between text-xs">
            <div>
              <h3 className="font-semibold text-slate-200 text-sm">
                Proyección en Dos Dimensiones mediante Análisis de Componentes Principales (PCA)
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">
                Cada punto representa un cliente real proyectado sobre los dos ejes que capturan la mayor variabilidad.
              </p>
            </div>
          </div>
          <PcaScatterPlot
            points={modelOutput.pcaPoints}
            varianceExplained={modelOutput.pcaVarianceExplained}
            k={clusters.length}
            clusterLabels={clusterLabels}
            selectedCluster={selectedCluster}
            onSelectCluster={setSelectedCluster}
          />
        </div>
      )}

      {/* VIEW 2: Radar Spider Chart */}
      {activeViz === 'radar' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between text-xs">
            <div>
              <h3 className="font-semibold text-slate-200 text-sm">
                Radar Multivariable de Características Estandarizadas
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">
                Comparación del perfil de huella digital de cada cluster frente al promedio global.
              </p>
            </div>
          </div>
          <RadarChart
            clusters={clusters}
            selectedCluster={selectedCluster}
            features={features}
            clusterLabels={clusterLabels}
          />
        </div>
      )}

      {/* VIEW 3: Centroids Comparison Bars */}
      {activeViz === 'centroids' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between text-xs">
            <div>
              <h3 className="font-semibold text-slate-200 text-sm">
                Comparación Detallada de Centroides por Variable
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">
                Valores promedio en unidades reales y magnitudes estandarizadas Z-scores.
              </p>
            </div>
          </div>
          <CentroidsBarChart
            clusters={clusters}
            features={features}
            clusterLabels={clusterLabels}
            selectedCluster={selectedCluster}
            onSelectCluster={setSelectedCluster}
          />
        </div>
      )}

      {/* VIEW 4: Distribution & Customer Share */}
      {activeViz === 'distribution' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Visual breakdown bar */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="font-semibold text-slate-200 text-sm">
                Cuota de Participación de Clientes por Segmento
              </h3>

              {/* Stacked bar representation */}
              <div className="h-8 w-full bg-slate-950 rounded-lg overflow-hidden flex border border-slate-800">
                {clusters.map((cl) => {
                  const color = CLUSTER_COLORS[cl.clusterIndex % CLUSTER_COLORS.length];
                  return (
                    <div
                      key={cl.clusterIndex}
                      title={`${clusterLabels[cl.clusterIndex]}: ${cl.percentage}%`}
                      className="h-full transition-all hover:opacity-90 relative group"
                      style={{
                        width: `${cl.percentage}%`,
                        backgroundColor: color,
                      }}
                    />
                  );
                })}
              </div>

              {/* Segment rows */}
              <div className="space-y-2.5 pt-2">
                {clusters.map((cl) => {
                  const color = CLUSTER_COLORS[cl.clusterIndex % CLUSTER_COLORS.length];
                  const name = clusterLabels[cl.clusterIndex] || cl.label;
                  return (
                    <div
                      key={cl.clusterIndex}
                      className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-lg flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <span className="font-medium text-slate-200">{name}</span>
                      </div>
                      <div className="flex items-center gap-3 font-mono tabular-nums">
                        <span className="text-slate-400">{cl.count} clientes</span>
                        <span className="text-cyan-400 font-bold">{cl.percentage}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Segment Key Differentiators */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="font-semibold text-slate-200 text-sm">
                Variables Más Diferenciadoras por Segmento
              </h3>
              <div className="space-y-3">
                {clusters.map((cl) => {
                  const color = CLUSTER_COLORS[cl.clusterIndex % CLUSTER_COLORS.length];
                  const top = cl.topDifferentiatingFeatures[0];
                  const second = cl.topDifferentiatingFeatures[1];
                  return (
                    <div
                      key={cl.clusterIndex}
                      className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-lg space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                          <span className="font-bold text-white">
                            {clusterLabels[cl.clusterIndex] || cl.label}
                          </span>
                        </div>
                        <span className="font-mono text-cyan-400 font-semibold">{cl.percentage}%</span>
                      </div>
                      <p className="text-slate-300 text-[11px] leading-relaxed">
                        Destaca principalmente en <strong>{top?.feature}</strong> (
                        <span className={top?.zScore > 0 ? 'text-cyan-400' : 'text-amber-400'}>
                          {top?.direction === 'above' ? '+' : ''}{top?.differencePercent}% vs media
                        </span>
                        ){second && (
                          <>
                            {' '}y <strong>{second?.feature}</strong> (
                            <span className={second?.zScore > 0 ? 'text-cyan-400' : 'text-amber-400'}>
                              {second?.direction === 'above' ? '+' : ''}{second?.differencePercent}%
                            </span>
                            )
                          </>
                        )}.
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 5: Heatmap of Standardized Centroids */}
      {activeViz === 'heatmap' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="text-xs">
            <h3 className="font-semibold text-slate-200 text-sm">
              Heatmap de Centroides Estandarizados (Matriz Z-Score)
            </h3>
            <p className="text-slate-400 text-xs mt-0.5">
              Valores normalizados centrados en cero. Azul/Cian representa valores marcadamente superiores; Rosa/Rojo representa valores inferiores.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs select-none">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] text-slate-400">
                  <th className="p-3 font-semibold text-slate-200">Segmento</th>
                  {features.map((feat) => (
                    <th key={feat} className="p-3 text-center font-semibold text-slate-300">
                      {feat}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono tabular-nums">
                {clusters.map((cl) => {
                  const name = clusterLabels[cl.clusterIndex] || cl.label;
                  return (
                    <tr key={cl.clusterIndex}>
                      <td className="p-3 font-sans font-bold text-slate-200 whitespace-nowrap">
                        {name}
                      </td>
                      {features.map((feat) => {
                        const z = cl.standardizedCentroid[feat] || 0;
                        // Color styling
                        const isPositive = z >= 0;
                        const alpha = Math.min(0.85, Math.max(0.1, Math.abs(z) / 2));
                        const bg = isPositive
                          ? `rgba(6, 182, 212, ${alpha})`
                          : `rgba(244, 63, 94, ${alpha})`;

                        return (
                          <td
                            key={feat}
                            className="p-3 text-center border border-slate-800/80"
                            style={{ backgroundColor: bg }}
                          >
                            <span
                              className={`font-semibold text-xs ${
                                Math.abs(z) > 0.6 ? 'text-slate-950 font-bold' : 'text-slate-200'
                              }`}
                            >
                              {z >= 0 ? `+${z.toFixed(2)}` : z.toFixed(2)}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation & Next Button */}
      <div className="flex items-center justify-between p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
        <div className="text-xs text-slate-300">
          Visualizaciones completas para los {clusters.length} segmentos.
        </div>
        <button
          onClick={onProceed}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
        >
          <span>CONTINUAR: ESTRATEGIAS DE MERCADEO</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
