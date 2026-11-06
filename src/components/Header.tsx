import React from 'react';
import { Download, Sparkles, RefreshCw } from 'lucide-react';
import { DatasetSummary, EconomicSector } from '../types/segmentai';

interface HeaderProps {
  currentStep: number;
  dataset: DatasetSummary | null;
  sector: EconomicSector | string;
  clustersCount: number;
  isModelTrained: boolean;
  onExportExcel: () => void;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentStep,
  dataset,
  sector,
  clustersCount,
  isModelTrained,
  onExportExcel,
  onReset,
}) => {
  return (
    <header className="h-16 px-6 bg-slate-900/90 backdrop-blur border-b border-slate-800 flex items-center justify-between gap-8 shrink-0 select-none z-10">
      {/* Zone 1: Single text element wordmark / Breadcrumb */}
      <div className="flex items-center gap-3 whitespace-nowrap shrink-0">
        <span className="text-sm font-semibold text-white tracking-tight">
          SEGMENTAI
        </span>
        <span className="text-slate-600 text-xs">/</span>
        <span className="text-xs text-cyan-400 font-medium">
          Paso {currentStep} de 12
        </span>
      </div>

      {/* Zone 2: 4-5 clean single-line status markers */}
      <nav className="hidden md:flex items-center gap-5 text-xs text-slate-400 whitespace-nowrap shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500">Datos:</span>
          <span className="text-slate-200 font-medium truncate max-w-[140px]">
            {dataset ? dataset.fileName : 'Sin cargar'}
          </span>
          {dataset && (
            <span className="text-slate-500 font-mono tabular-nums">
              ({dataset.totalRows} filas)
            </span>
          )}
        </div>

        <span className="text-slate-700">·</span>

        <div className="flex items-center gap-1.5">
          <span className="text-slate-500">Sector:</span>
          <span className="text-slate-200 font-medium">{sector}</span>
        </div>

        <span className="text-slate-700">·</span>

        <div className="flex items-center gap-1.5">
          <span className="text-slate-500">Segmentos:</span>
          <span className="text-slate-200 font-medium tabular-nums">
            {clustersCount} clusters
          </span>
        </div>

        <span className="text-slate-700">·</span>

        <div className="flex items-center gap-1.5">
          <span className="text-slate-500">Modelo:</span>
          <span
            className={`font-medium ${
              isModelTrained ? 'text-emerald-400' : 'text-slate-400'
            }`}
          >
            {isModelTrained ? 'K-Means Entrenado' : 'Pendiente'}
          </span>
        </div>
      </nav>

      {/* Zone 3: 1 Primary Action + Utility */}
      <div className="flex items-center gap-3 shrink-0 whitespace-nowrap">
        <button
          onClick={onReset}
          title="Reiniciar análisis y volver al inicio"
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {isModelTrained ? (
          <button
            onClick={onExportExcel}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-cyan-900/30 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar Excel</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI Ready</span>
          </div>
        )}
      </div>
    </header>
  );
};
