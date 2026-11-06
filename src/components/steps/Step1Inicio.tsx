import React from 'react';
import {
  ArrowRight,
  Database,
  BarChart2,
  Users,
  Target,
  Sparkles,
  Layers,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface Props {
  onStart: () => void;
  onLoadDemo: () => void;
}

export const Step1Inicio: React.FC<Props> = ({ onStart, onLoadDemo }) => {
  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      {/* Hero Header */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-900/60 border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Machine Learning No Supervisado & Marketing Estratégico</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
            SEGMENTAI – Inteligencia Artificial para la Segmentación Estratégica de Mercados
          </h1>

          {/* Quoted Definition Required by Prompt */}
          <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-6 text-slate-300 space-y-3 leading-relaxed">
            <p className="text-base text-slate-200 font-medium">
              "El clustering es una técnica de aprendizaje automático no supervisado que agrupa datos en conjuntos o clusters. Estos grupos se forman de tal manera que los elementos dentro de un mismo cluster son muy similares entre sí, mientras que son diferentes de los elementos de otros clusters."
            </p>
            <p className="text-sm text-slate-400">
              "En las empresas, el clustering se utiliza para segmentar clientes, identificar patrones en el comportamiento de los usuarios, mejorar la detección de anomalías y optimizar procesos y productos al agrupar elementos similares."
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={onStart}
              className="flex items-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-sm shadow-xl shadow-cyan-500/20 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <span>COMENZAR ANÁLISIS</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onLoadDemo}
              className="flex items-center gap-2 px-5 py-3.5 bg-slate-800/80 hover:bg-slate-800 text-cyan-300 hover:text-cyan-200 border border-slate-700 rounded-xl text-sm font-semibold transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>Cargar Caso Demo: cellsegmentation2.xlsx</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Pillars of the Platform */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-2.5">
          <div className="w-9 h-9 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
            <Database className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-semibold text-white">01. Ingesta Real de Datos</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Carga y diagnóstico automático de archivos CSV, TXT y Excel con detección de tipos, valores faltantes y duplicados.
          </p>
        </div>

        <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-2.5">
          <div className="w-9 h-9 rounded-lg bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400">
            <BarChart2 className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-semibold text-white">02. Rigor Estadístico</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Análisis multivariado, matriz de correlación Pearson, asimetría, curtosis y método del codo (Elbow & Silhouette).
          </p>
        </div>

        <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-2.5">
          <div className="w-9 h-9 rounded-lg bg-violet-950 border border-violet-800 flex items-center justify-center text-violet-400">
            <Layers className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-semibold text-white">03. K-Means & PCA 2D</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Algoritmos no supervisados reales con StandardScaler, K-Means++ e iteraciones múltiples para máxima compacidad.
          </p>
        </div>

        <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-2.5">
          <div className="w-9 h-9 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400">
            <Target className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-semibold text-white">04. Estrategia & Personas</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            13 pilares comerciales por cluster, planes de comunicación multicanal y personificación publicitaria con IA.
          </p>
        </div>
      </div>

      {/* Trust & Scientific Method Strip */}
      <div className="p-5 bg-slate-950/60 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Procesamiento 100% sobre tus datos reales. Cero datos inventados o simulados.</span>
        </div>
        <div className="flex items-center gap-4 font-mono text-[11px]">
          <span>• Scikit-Learn Standards</span>
          <span>• Davies-Bouldin Index</span>
          <span>• Calinski-Harabasz</span>
          <span>• Gemini 3.8 Flash</span>
        </div>
      </div>
    </div>
  );
};
