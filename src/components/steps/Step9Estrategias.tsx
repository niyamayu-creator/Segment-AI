import React, { useState } from 'react';
import {
  Target,
  Sparkles,
  ArrowRight,
  ChevronRight,
  DollarSign,
  Heart,
  UserPlus,
  RefreshCw,
  TrendingUp,
  PackageCheck,
  CheckCircle2,
} from 'lucide-react';
import {
  ClusteringModelOutput,
  EconomicSector,
  StrategicMarketingPlan,
} from '../../types/segmentai';
import { enhanceClustersWithAi } from '../../services/marketingEngine';

interface Props {
  modelOutput: ClusteringModelOutput;
  sector: EconomicSector | string;
  onUpdateStrategies: (strategies: Record<number, StrategicMarketingPlan>) => void;
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

export const Step9Estrategias: React.FC<Props> = ({
  modelOutput,
  sector,
  onUpdateStrategies,
  onProceed,
}) => {
  const [selectedClusterIdx, setSelectedClusterIdx] = useState<number>(0);
  const [isEnhancing, setIsEnhancing] = useState(false);

  const clusters = modelOutput.clusters;
  const strategies = modelOutput.strategies;
  const activeCluster = clusters.find((c) => c.clusterIndex === selectedClusterIdx) || clusters[0];
  const activePlan = strategies[selectedClusterIdx] || {
    commercialName: `Segmento ${selectedClusterIdx + 1}`,
    profileDescription: '',
    needs: [],
    motivations: [],
    buyingBehavior: '',
    businessOpportunities: [],
    valueProposition: '',
    recommendedProducts: [],
    pricingStrategy: '',
    retentionStrategy: '',
    acquisitionStrategy: '',
    crossSellingStrategy: '',
    upSellingStrategy: '',
  };

  const color = CLUSTER_COLORS[selectedClusterIdx % CLUSTER_COLORS.length];

  // AI Re-generation
  const handleAiRegenerate = async () => {
    setIsEnhancing(true);
    try {
      const res = await enhanceClustersWithAi(clusters, sector);
      if (res.strategies) {
        onUpdateStrategies(res.strategies);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-2">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Estrategias de Mercadeo y Comercialización
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            13 dimensiones estratégicas de alto nivel formuladas para cada segmento en el sector <strong className="text-cyan-300">{sector}</strong>.
          </p>
        </div>

        <button
          onClick={handleAiRegenerate}
          disabled={isEnhancing}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-xl text-xs font-semibold border border-slate-700 transition-colors cursor-pointer disabled:opacity-50"
        >
          {isEnhancing ? (
            <div className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          )}
          <span>Optimizar con Gemini AI</span>
        </button>
      </div>

      {/* Cluster Tab Switcher */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto text-xs">
        {clusters.map((cl) => {
          const isSelected = selectedClusterIdx === cl.clusterIndex;
          const plan = strategies[cl.clusterIndex];
          const clColor = CLUSTER_COLORS[cl.clusterIndex % CLUSTER_COLORS.length];

          return (
            <button
              key={cl.clusterIndex}
              onClick={() => setSelectedClusterIdx(cl.clusterIndex)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: clColor }} />
              <span>{plan?.commercialName || cl.label}</span>
              <span className="text-[10px] text-slate-500 font-mono tabular-nums">
                ({cl.percentage}%)
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Strategy Document View for the Active Segment */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
        {/* Title & Profile Overview */}
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs font-mono uppercase text-slate-400 tracking-wider">
                Segmento {activeCluster.clusterIndex + 1} · {activeCluster.count} Clientes ({activeCluster.percentage}%)
              </span>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              {activePlan.commercialName}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed pt-1">
              {activePlan.profileDescription}
            </p>
          </div>

          {/* Quick value proposition banner */}
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl max-w-sm">
            <span className="text-[10px] font-mono uppercase text-cyan-400 block mb-1">
              Propuesta de Valor Central
            </span>
            <p className="text-xs font-medium text-slate-200 leading-snug">
              "{activePlan.valueProposition}"
            </p>
          </div>
        </div>

        {/* 13 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pillar 3 & 4: Needs & Motivations */}
          <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <Target className="w-4 h-4 text-cyan-400" />
              <span>03 & 04. Necesidades y Motivaciones Clave</span>
            </h4>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-400 text-[11px] block font-medium">Necesidades Críticas:</span>
                <ul className="list-disc list-inside text-slate-300 space-y-1 mt-1 pl-1">
                  {activePlan.needs.map((need, idx) => (
                    <li key={idx}>{need}</li>
                  ))}
                </ul>
              </div>
              <div className="pt-2 border-t border-slate-800/60">
                <span className="text-slate-400 text-[11px] block font-medium">Motivaciones de Compra:</span>
                <ul className="list-disc list-inside text-slate-300 space-y-1 mt-1 pl-1">
                  {activePlan.motivations.map((mot, idx) => (
                    <li key={idx}>{mot}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Pillar 5 & 6: Buying Behavior & Opportunities */}
          <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>05 & 06. Comportamiento y Oportunidades</span>
            </h4>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-400 text-[11px] block font-medium">Comportamiento de Compra:</span>
                <p className="text-slate-300 mt-1 leading-relaxed">{activePlan.buyingBehavior}</p>
              </div>
              <div className="pt-2 border-t border-slate-800/60">
                <span className="text-slate-400 text-[11px] block font-medium">Oportunidades de Negocio:</span>
                <ul className="list-disc list-inside text-slate-300 space-y-1 mt-1 pl-1">
                  {activePlan.businessOpportunities.map((opp, idx) => (
                    <li key={idx}>{opp}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Pillar 8 & 9: Recommended Products & Pricing Strategy */}
          <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <PackageCheck className="w-4 h-4 text-violet-400" />
              <span>08 & 09. Portafolio de Productos y Precios</span>
            </h4>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-400 text-[11px] block font-medium">Productos Recomendados ({sector}):</span>
                <ul className="list-disc list-inside text-slate-300 space-y-1 mt-1 pl-1">
                  {activePlan.recommendedProducts.map((prod, idx) => (
                    <li key={idx} className="font-medium text-cyan-300">{prod}</li>
                  ))}
                </ul>
              </div>
              <div className="pt-2 border-t border-slate-800/60">
                <span className="text-slate-400 text-[11px] block font-medium">Estrategia de Precios:</span>
                <p className="text-slate-300 mt-1 leading-relaxed">{activePlan.pricingStrategy}</p>
              </div>
            </div>
          </div>

          {/* Pillar 10, 11, 12, 13: Retention, Acquisition, Cross-selling, Up-selling */}
          <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-400" />
              <span>10 – 13. Tácticas de Crecimiento y Fidelización</span>
            </h4>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-400 text-[11px] block font-medium">Estrategia de Fidelización (Retención):</span>
                <p className="text-slate-300 leading-snug">{activePlan.retentionStrategy}</p>
              </div>
              <div className="pt-1.5 border-t border-slate-800/60">
                <span className="text-slate-400 text-[11px] block font-medium">Estrategia de Adquisición:</span>
                <p className="text-slate-300 leading-snug">{activePlan.acquisitionStrategy}</p>
              </div>
              <div className="pt-1.5 border-t border-slate-800/60">
                <span className="text-slate-400 text-[11px] block font-medium">Venta Cruzada (Cross-Selling) & Superior (Up-Selling):</span>
                <p className="text-slate-300 leading-snug">
                  <strong>Cross:</strong> {activePlan.crossSellingStrategy}
                </p>
                <p className="text-slate-300 leading-snug mt-1">
                  <strong>Up:</strong> {activePlan.upSellingStrategy}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation & Next Button */}
      <div className="flex items-center justify-between p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
        <div className="text-xs text-slate-300">
          Estrategias completas y fundamentadas en las características reales de cada segmento.
        </div>
        <button
          onClick={onProceed}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
        >
          <span>CONTINUAR: PLAN DE COMUNICACIÓN</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
