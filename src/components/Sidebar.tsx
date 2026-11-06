import React from 'react';
import {
  Home,
  Upload,
  Building2,
  BarChart3,
  ListOrdered,
  Cpu,
  TableProperties,
  PieChart,
  Target,
  Megaphone,
  UserCheck,
  FileSpreadsheet,
  CheckCircle2,
  Lock,
} from 'lucide-react';

interface SidebarProps {
  currentStep: number;
  onSelectStep: (step: number) => void;
  maxCompletedStep: number;
  datasetLoaded: boolean;
  modelTrained: boolean;
}

export const STEP_ITEMS = [
  { step: 1, label: 'Inicio', subtitle: 'Introducción al Clustering', icon: Home },
  { step: 2, label: 'Cargar Base de Datos', subtitle: 'Archivos CSV, XLS, XLSX', icon: Upload },
  { step: 3, label: 'Sector Económico', subtitle: 'Contexto de Negocio', icon: Building2 },
  { step: 4, label: 'Análisis Descriptivo', subtitle: 'Estadística y Calidad', icon: BarChart3 },
  { step: 5, label: 'Número de Segmentos', subtitle: 'Método del Codo & Silhouette', icon: ListOrdered },
  { step: 6, label: 'Modelo de Clustering', subtitle: 'K-Means & Normalización', icon: Cpu },
  { step: 7, label: 'Resultados y Centroides', subtitle: 'Nombres Comerciales', icon: TableProperties },
  { step: 8, label: 'Visualización de Segmentos', subtitle: 'PCA 2D, Radar & Heatmap', icon: PieChart },
  { step: 9, label: 'Estrategias de Mercadeo', subtitle: '13 Pilares Comerciales', icon: Target },
  { step: 10, label: 'Plan de Comunicación', subtitle: 'Mensajes Multicanal & KPIs', icon: Megaphone },
  { step: 11, label: 'Personificación Visual', subtitle: 'Personas de Cliente con IA', icon: UserCheck },
  { step: 12, label: 'Informe Ejecutivo', subtitle: 'Exportación Excel, PDF, PPT', icon: FileSpreadsheet },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentStep,
  onSelectStep,
  maxCompletedStep,
  datasetLoaded,
  modelTrained,
}) => {
  // Calculate completion percentage
  const progressPercent = Math.round((Math.max(1, maxCompletedStep) / 12) * 100);

  const isStepAccessible = (step: number) => {
    if (step === 1 || step === 2) return true;
    if (step >= 3 && step <= 5) return datasetLoaded;
    if (step >= 6) return datasetLoaded;
    if (step >= 7) return modelTrained;
    return false;
  };

  return (
    <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex flex-col gap-1">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
              SEGMENT<span className="text-cyan-400">AI</span>
            </h1>
          </div>
        </div>
        <p className="text-[11px] text-slate-400 leading-tight mt-1">
          Inteligencia Artificial para la Segmentación Estratégica de Mercados
        </p>
      </div>

      {/* Progress Bar */}
      <div className="px-5 py-3 border-b border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-slate-400">Progreso del Proceso</span>
          <span className="font-mono text-cyan-400 font-semibold tabular-nums">
            {progressPercent}%
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Steps Navigation List */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {STEP_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentStep === item.step;
          const isCompleted = maxCompletedStep > item.step;
          const accessible = isStepAccessible(item.step);

          return (
            <button
              key={item.step}
              disabled={!accessible}
              onClick={() => accessible && onSelectStep(item.step)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all group ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-200 border border-cyan-500/30 shadow-sm'
                  : accessible
                  ? 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  : 'text-slate-600 cursor-not-allowed opacity-60'
              }`}
            >
              <div
                className={`w-6 h-6 rounded flex items-center justify-center shrink-0 text-xs font-mono tabular-nums ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : isCompleted
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : accessible
                    ? 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
                    : 'bg-slate-950 text-slate-700'
                }`}
              >
                {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : item.step}
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium truncate leading-tight flex items-center justify-between">
                  <span>{item.label}</span>
                  {!accessible && <Lock className="w-3 h-3 text-slate-700 shrink-0 ml-1" />}
                </div>
                <div className="text-[10px] text-slate-400 truncate leading-tight mt-0.5">
                  {item.subtitle}
                </div>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800 text-[11px] text-slate-400 bg-slate-950/60 flex items-center justify-between">
        <span>K-Means · PCA 2D · Gemini</span>
        <span className="font-mono text-cyan-400/90 text-[10px]">v2.5 Pro</span>
      </div>
    </aside>
  );
};
