import React, { useState } from 'react';
import {
  Sparkles,
  RefreshCw,
  Camera,
  ArrowRight,
  Info,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import {
  ClusteringModelOutput,
  EconomicSector,
  VisualPersona,
} from '../../types/segmentai';

interface Props {
  modelOutput: ClusteringModelOutput;
  sector: EconomicSector | string;
  onUpdatePersona: (clusterIndex: number, updated: VisualPersona) => void;
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

export const Step11Personificacion: React.FC<Props> = ({
  modelOutput,
  sector,
  onUpdatePersona,
  onProceed,
}) => {
  const [selectedClusterIdx, setSelectedClusterIdx] = useState<number>(0);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [customPrompt, setCustomPrompt] = useState<string>('');

  const clusters = modelOutput.clusters;
  const personas = modelOutput.personas;
  const strategies = modelOutput.strategies;

  const activeCluster = clusters.find((c) => c.clusterIndex === selectedClusterIdx) || clusters[0];
  const activePersona: VisualPersona = personas[selectedClusterIdx] || {
    clusterIndex: selectedClusterIdx,
    clusterName: `Segmento ${selectedClusterIdx + 1}`,
    imageUrl: '',
    imagePrompt: '',
    archetypeTitle: 'Cliente Estratégico',
    demographicHint: 'Perfil basado en datos',
    keyMotto: 'Eficiencia y calidad',
    isAiGenerated: true,
  };

  const activeStrategy = strategies[selectedClusterIdx];
  const color = CLUSTER_COLORS[selectedClusterIdx % CLUSTER_COLORS.length];

  // Handle regeneration
  const handleRegenerate = () => {
    setIsRegenerating(true);
    setTimeout(() => {
      // Simulate regeneration update with fresh prompt
      const updated: VisualPersona = {
        ...activePersona,
        imagePrompt: customPrompt || activePersona.imagePrompt,
        keyMotto: activeStrategy?.valueProposition?.slice(0, 70) || activePersona.keyMotto,
      };
      onUpdatePersona(selectedClusterIdx, updated);
      setIsRegenerating(false);
    }, 600);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-2">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          Personificación Visual de los Clusters con Inteligencia Artificial
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Representación fotográfica publicitaria de alta fidelidad que sintetiza el arquetipo de cliente para el sector <strong className="text-cyan-300">{sector}</strong>.
        </p>
      </div>

      {/* Mandatory Executive Disclaimer */}
      <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center gap-3 text-xs text-slate-400">
        <Info className="w-4 h-4 text-cyan-400 shrink-0" />
        <span>
          <strong>Nota Metodológica:</strong> La personificación es una representación ilustrativa del perfil estadístico promedio, no una descripción literal de todos los integrantes del segmento.
        </span>
      </div>

      {/* Cluster Navigation Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {clusters.map((cl) => {
          const isSelected = selectedClusterIdx === cl.clusterIndex;
          const persona = personas[cl.clusterIndex];
          const strat = strategies[cl.clusterIndex];
          const clColor = CLUSTER_COLORS[cl.clusterIndex % CLUSTER_COLORS.length];

          return (
            <button
              key={cl.clusterIndex}
              onClick={() => {
                setSelectedClusterIdx(cl.clusterIndex);
                setCustomPrompt(persona?.imagePrompt || '');
              }}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-2 cursor-pointer ${
                isSelected
                  ? 'bg-slate-800/90 border-cyan-400/80 shadow-lg shadow-cyan-950/40'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: clColor }} />
                <span className="font-mono text-[11px] text-cyan-400 font-bold tabular-nums">
                  {cl.percentage}%
                </span>
              </div>
              <div className="truncate text-xs font-bold text-white">
                {strat?.commercialName || cl.label}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {cl.count} clientes registrados
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Persona Showcase Frame */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-2">
        {/* Left: Commercial Advertising Photography Asset */}
        <div className="relative min-h-[360px] bg-slate-950 flex items-center justify-center overflow-hidden group">
          {activePersona.imageUrl ? (
            <img
              src={activePersona.imageUrl}
              alt={activePersona.clusterName}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-tr from-slate-900 to-slate-950">
              <Camera className="w-12 h-12 text-cyan-400/50 mb-3" />
              <span className="text-sm font-semibold text-slate-300">
                {activePersona.clusterName}
              </span>
              <span className="text-xs text-slate-500 mt-1">
                Arquetipo publicitario generado por IA
              </span>
            </div>
          )}

          {/* Scrim Overlay & Badges */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent pointer-events-none" />

          {/* Top Banner on Photo */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
            <span className="px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur border border-slate-700/80 text-[11px] font-semibold text-cyan-300 flex items-center gap-1.5 shadow-md">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Personificación Publicitaria IA</span>
            </span>

            <span className="px-2.5 py-0.5 rounded-md bg-slate-900/90 text-[11px] font-mono text-slate-300 border border-slate-700">
              {activeCluster.percentage}% cuota
            </span>
          </div>

          {/* Bottom Title on Photo */}
          <div className="absolute bottom-4 left-4 right-4 z-10 space-y-1">
            <div className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
              {activePersona.archetypeTitle}
            </div>
            <h3 className="text-xl font-extrabold text-white tracking-tight drop-shadow-md">
              {activeStrategy?.commercialName || activeCluster.label}
            </h3>
            <p className="text-xs text-slate-300 italic line-clamp-2 drop-shadow">
              "{activePersona.keyMotto}"
            </p>
          </div>
        </div>

        {/* Right: Demographic & Statistical Archetype Insights */}
        <div className="p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 block">
                Ficha de Caracterización del Arquetipo
              </span>
              <h4 className="text-lg font-bold text-white mt-0.5">
                {activeStrategy?.commercialName}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed mt-1">
                {activePersona.demographicHint}
              </p>
            </div>

            {/* Statistical Fingerprint */}
            <div className="space-y-2 border-t border-slate-800/80 pt-3">
              <span className="text-[11px] font-semibold text-slate-400 block">
                Rasgos Estadísticos Predominantes:
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {activeCluster.topDifferentiatingFeatures.slice(0, 4).map((f) => (
                  <div key={f.feature} className="p-2 bg-slate-950/70 border border-slate-800 rounded-lg">
                    <span className="text-[10px] text-slate-400 block truncate">{f.feature}</span>
                    <span className="font-mono text-xs font-bold text-cyan-300">
                      {f.direction === 'above' ? '+' : ''}{f.differencePercent}% vs media
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Prompt inspector */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] text-slate-400 font-semibold block">
                Prompt de Generación Fotográfica:
              </label>
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-[11px] text-slate-400 font-mono leading-relaxed max-h-24 overflow-y-auto">
                {activePersona.imagePrompt}
              </div>
            </div>
          </div>

          {/* Regenerate Action */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              Formato adecuado para comités ejecutivos y presentaciones
            </span>
            <button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg text-xs font-semibold border border-slate-700 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
              <span>Regenerar Arquetipo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation & Next Button */}
      <div className="flex items-center justify-between p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
        <div className="text-xs text-slate-300">
          Personificaciones visuales generadas para los {clusters.length} segmentos.
        </div>
        <button
          onClick={onProceed}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
        >
          <span>CONTINUAR: INFORME EJECUTIVO COMPLETO</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
