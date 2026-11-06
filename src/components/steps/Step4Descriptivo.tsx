import React, { useState } from 'react';
import {
  BarChart3,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Table,
  Sliders,
  Sparkles,
  PieChart as PieIcon,
} from 'lucide-react';
import { DatasetSummary, DescriptiveReport, EconomicSector } from '../../types/segmentai';
import { calculateDescriptiveReport } from '../../services/statistics';
import { CorrelationHeatmap } from '../charts/CorrelationHeatmap';
import { HistogramBoxplot } from '../charts/HistogramBoxplot';

interface Props {
  dataset: DatasetSummary;
  sector: EconomicSector | string;
  onProceed: () => void;
}

export const Step4Descriptivo: React.FC<Props> = ({ dataset, sector, onProceed }) => {
  // Compute descriptive report dynamically from real dataset
  const [report] = useState<DescriptiveReport>(() =>
    calculateDescriptiveReport(dataset.rawData, dataset.columns, sector)
  );

  const [activeTab, setActiveTab] = useState<'numericas' | 'categoricas' | 'correlacion' | 'distribuciones' | 'diagnostico'>('numericas');
  const [selectedVarForChart, setSelectedVarForChart] = useState<string>(
    report.numericStats[0]?.column || ''
  );

  const activeNumericStat = report.numericStats.find((s) => s.column === selectedVarForChart) || report.numericStats[0];

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-2">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Análisis Estadístico Descriptivo y Diagnóstico
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Exploración multivariada completa contextualizada para el sector <strong className="text-cyan-300">{sector}</strong>.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs">
          <button
            onClick={() => setActiveTab('numericas')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'numericas'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Variables Numéricas ({report.numericStats.length})
          </button>
          <button
            onClick={() => setActiveTab('correlacion')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'correlacion'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Matriz de Correlación
          </button>
          <button
            onClick={() => setActiveTab('distribuciones')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'distribuciones'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Histogramas & Boxplots
          </button>
          {report.categoricalStats.length > 0 && (
            <button
              onClick={() => setActiveTab('categoricas')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'categoricas'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Categóricas ({report.categoricalStats.length})
            </button>
          )}
          <button
            onClick={() => setActiveTab('diagnostico')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'diagnostico'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Diagnóstico ({report.qualityIssues.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Numeric Statistics Table */}
      {activeTab === 'numericas' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-3.5 border-b border-slate-800 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-200 flex items-center gap-2">
              <Table className="w-4 h-4 text-cyan-400" />
              <span>Estadísticos de Tendencia Central, Dispersión y Forma</span>
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              N = {dataset.totalRows} observaciones
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs select-none">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] text-slate-400">
                  <th className="p-3 font-semibold text-slate-200">Variable</th>
                  <th className="p-3 font-semibold text-right">Media</th>
                  <th className="p-3 font-semibold text-right">Mediana</th>
                  <th className="p-3 font-semibold text-right">Moda</th>
                  <th className="p-3 font-semibold text-right">Desv. Est. (σ)</th>
                  <th className="p-3 font-semibold text-right">Varianza (σ²)</th>
                  <th className="p-3 font-semibold text-right">Mín - Máx</th>
                  <th className="p-3 font-semibold text-right">Percentiles (25 - 75 - 90)</th>
                  <th className="p-3 font-semibold text-right">CV (%)</th>
                  <th className="p-3 font-semibold text-right">Asimetría</th>
                  <th className="p-3 font-semibold text-right">Curtosis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono tabular-nums text-slate-300">
                {report.numericStats.map((st) => (
                  <tr key={st.column} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-sans font-medium text-slate-100 whitespace-nowrap">
                      {st.column}
                    </td>
                    <td className="p-3 text-right font-semibold text-cyan-400">{st.mean}</td>
                    <td className="p-3 text-right text-slate-200">{st.median}</td>
                    <td className="p-3 text-right text-slate-400">{st.mode}</td>
                    <td className="p-3 text-right text-slate-300">{st.stdDev}</td>
                    <td className="p-3 text-right text-slate-400">{st.variance}</td>
                    <td className="p-3 text-right text-slate-300 whitespace-nowrap">
                      [{st.min} — {st.max}]
                    </td>
                    <td className="p-3 text-right text-slate-400 whitespace-nowrap text-[11px]">
                      P25:{st.p25} · P75:{st.p75} · P90:{st.p90}
                    </td>
                    <td className="p-3 text-right">
                      <span className={st.cv > 50 ? 'text-amber-400 font-semibold' : 'text-slate-300'}>
                        {st.cv}%
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <span className={Math.abs(st.skewness) > 1 ? 'text-amber-400' : 'text-slate-400'}>
                        {st.skewness}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <span className={Math.abs(st.kurtosis) > 1 ? 'text-amber-400' : 'text-slate-400'}>
                        {st.kurtosis}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Correlation Matrix */}
      {activeTab === 'correlacion' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between text-xs">
            <div>
              <h3 className="font-semibold text-slate-200 text-sm">
                Matriz de Correlación Lineal de Pearson
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">
                Coeficientes r entre variables cuantitativas candidatas a clustering.
              </p>
            </div>
          </div>
          <CorrelationHeatmap
            columns={report.correlations.columns}
            matrix={report.correlations.matrix}
          />
        </div>
      )}

      {/* TAB 3: Histograms & Boxplots */}
      {activeTab === 'distribuciones' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-2 bg-slate-900/60 border border-slate-800 rounded-xl overflow-x-auto text-xs">
            <span className="text-slate-400 font-medium px-2">Seleccionar variable:</span>
            {report.numericStats.map((s) => (
              <button
                key={s.column}
                onClick={() => setSelectedVarForChart(s.column)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  selectedVarForChart === s.column
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {s.column}
              </button>
            ))}
          </div>

          {activeNumericStat && (
            <HistogramBoxplot
              stats={activeNumericStat}
              rawData={dataset.rawData}
            />
          )}
        </div>
      )}

      {/* TAB 4: Categorical Stats */}
      {activeTab === 'categoricas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report.categoricalStats.map((cat) => (
            <div key={cat.column} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200 text-sm">{cat.column}</span>
                <span className="text-slate-400">Moda: <strong className="text-cyan-400">{cat.mode}</strong></span>
              </div>
              <div className="space-y-1.5">
                {cat.frequencies.map((freq) => (
                  <div key={freq.value} className="space-y-1 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>{freq.value || '(Vacío)'}</span>
                      <span className="font-mono tabular-nums text-slate-400">
                        {freq.count} ({freq.percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-violet-500/80 rounded-full"
                        style={{ width: `${freq.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 5: Data Quality Diagnosis */}
      {activeTab === 'diagnostico' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
              Informe Ejecutivo de Calidad y Gobernanza de Datos
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {report.executiveSummary}
            </p>
          </div>

          <div className="space-y-2.5">
            {report.qualityIssues.map((issue, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-slate-900/70 border border-slate-800 rounded-xl flex items-start gap-3 text-xs"
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    issue.severity === 'high'
                      ? 'bg-rose-950 text-rose-400 border border-rose-800'
                      : 'bg-amber-950 text-amber-400 border border-amber-800'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-200">{issue.column}</span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      {issue.type}
                    </span>
                  </div>
                  <p className="text-slate-300">{issue.message}</p>
                  <p className="text-cyan-400/90 text-[11px]">
                    <strong>Recomendación técnica:</strong> {issue.recommendation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action to proceed */}
      <div className="flex items-center justify-between p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
        <div className="text-xs text-slate-400">
          Diagnóstico completado · {report.numericStats.length} variables cuantitativas listas para optimización de K.
        </div>
        <button
          onClick={onProceed}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
        >
          <span>CONTINUAR: DEFINIR NÚMERO DE SEGMENTOS</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
