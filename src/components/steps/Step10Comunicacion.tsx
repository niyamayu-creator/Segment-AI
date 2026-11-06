import React, { useState } from 'react';
import {
  Megaphone,
  MessageSquare,
  Mail,
  Smartphone,
  Share2,
  Tv,
  Calendar,
  CheckCircle,
  Copy,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import {
  ClusteringModelOutput,
  CommunicationPlan,
  EconomicSector,
} from '../../types/segmentai';

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

export const Step10Comunicacion: React.FC<Props> = ({
  modelOutput,
  sector,
  onProceed,
}) => {
  const [selectedClusterIdx, setSelectedClusterIdx] = useState<number>(0);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const clusters = modelOutput.clusters;
  const activeCluster = clusters.find((c) => c.clusterIndex === selectedClusterIdx) || clusters[0];
  const commPlan: CommunicationPlan = modelOutput.communications[selectedClusterIdx] || {
    objective: 'Fidelización y crecimiento',
    mainMessage: 'La mejor experiencia a tu alcance',
    toneOfVoice: 'Profesional y empático',
    recommendedChannels: ['WhatsApp', 'Email'],
    campaignType: 'Fidelización',
    contactFrequency: 'Quincenal',
    callToAction: 'Conoce más',
    kpis: ['Open Rate > 30%'],
    schedule: [],
    copyExamples: {
      whatsapp: '',
      emailSubject: '',
      emailBody: '',
      sms: '',
      socialMedia: '',
      digitalAd: '',
    },
  };

  const strategy = modelOutput.strategies[selectedClusterIdx];
  const clusterName = strategy?.commercialName || activeCluster.label;
  const color = CLUSTER_COLORS[selectedClusterIdx % CLUSTER_COLORS.length];

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-2">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          Plan de Comunicación y Mensajes Publicitarios por Segmento
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Estrategia omnicanal, frecuencia, KPIs, cronograma y copys publicitarios listos para usar en <strong className="text-cyan-300">{sector}</strong>.
        </p>
      </div>

      {/* Cluster Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto text-xs">
        {clusters.map((cl) => {
          const isSelected = selectedClusterIdx === cl.clusterIndex;
          const s = modelOutput.strategies[cl.clusterIndex];
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
              <span>{s?.commercialName || cl.label}</span>
              <span className="text-[10px] text-slate-500 font-mono tabular-nums">
                ({cl.percentage}%)
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Communication Matrix */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
        {/* Top Overview Banner */}
        <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-cyan-400 font-bold uppercase tracking-wider">
              {clusterName}
            </span>
            <span className="text-slate-400">
              Tipo: <strong className="text-slate-200">{commPlan.campaignType}</strong>
            </span>
          </div>
          <div className="text-lg font-bold text-white tracking-tight leading-snug">
            "{commPlan.mainMessage}"
          </div>
          <p className="text-xs text-slate-300">
            <strong>Objetivo:</strong> {commPlan.objective}
          </p>
        </div>

        {/* 6 Key Operational Parameters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
              Tono de Comunicación
            </span>
            <span className="text-xs font-semibold text-slate-200 mt-1 block">
              {commPlan.toneOfVoice}
            </span>
          </div>

          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
              Frecuencia de Contacto
            </span>
            <span className="text-xs font-semibold text-slate-200 mt-1 block">
              {commPlan.contactFrequency}
            </span>
          </div>

          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
              Llamado a la Acción (CTA)
            </span>
            <span className="text-xs font-semibold text-cyan-300 mt-1 block">
              {commPlan.callToAction}
            </span>
          </div>

          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
              Canales Prioritarios
            </span>
            <span className="text-xs font-semibold text-slate-200 mt-1 block truncate">
              {commPlan.recommendedChannels.join(', ')}
            </span>
          </div>
        </div>

        {/* Timeline & KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Cronograma Tentativo */}
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span>Cronograma Tentativo de Despliegue (4 Semanas)</span>
            </div>
            <div className="space-y-2">
              {commPlan.schedule.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs">
                  <span className="font-mono text-[11px] text-cyan-400 font-bold w-18 shrink-0">
                    {item.week}:
                  </span>
                  <span className="text-slate-300">{item.action}</span>
                </div>
              ))}
            </div>
          </div>

          {/* KPIs de Medición */}
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Indicadores Clave de Desempeño (KPIs)</span>
            </div>
            <ul className="space-y-2 text-xs">
              {commPlan.kpis.map((kpi, idx) => (
                <li key={idx} className="flex items-center gap-2 text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>{kpi}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Ready-to-Use Publicitary Copy Examples */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-cyan-400" />
              <span>Ejemplos de Mensajes Publicitarios por Canal</span>
            </h3>
            <span className="text-[11px] text-slate-500">
              Haz clic en copiar para usar en campañas
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* WhatsApp */}
            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp Business</span>
                </span>
                <button
                  onClick={() => copyToClipboard(commPlan.copyExamples.whatsapp, 'wa')}
                  className="p-1 text-slate-400 hover:text-slate-200 cursor-pointer"
                  title="Copiar mensaje"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="p-3 bg-slate-900 rounded-lg text-xs text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
                {commPlan.copyExamples.whatsapp}
              </div>
              {copiedKey === 'wa' && (
                <span className="text-[10px] text-emerald-400 block text-right">¡Copiado!</span>
              )}
            </div>

            {/* Email */}
            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  <span>Correo Electrónico (Email Marketing)</span>
                </span>
                <button
                  onClick={() =>
                    copyToClipboard(
                      `${commPlan.copyExamples.emailSubject}\n\n${commPlan.copyExamples.emailBody}`,
                      'email'
                    )
                  }
                  className="p-1 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="p-3 bg-slate-900 rounded-lg text-xs space-y-1.5 leading-relaxed">
                <div className="font-semibold text-slate-200">
                  Asunto: {commPlan.copyExamples.emailSubject}
                </div>
                <div className="text-slate-400 whitespace-pre-wrap text-[11px]">
                  {commPlan.copyExamples.emailBody}
                </div>
              </div>
              {copiedKey === 'email' && (
                <span className="text-[10px] text-emerald-400 block text-right">¡Copiado!</span>
              )}
            </div>

            {/* SMS (<=160 chars) */}
            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-violet-400 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mensaje de Texto SMS (Máx 160 caracteres)</span>
                </span>
                <button
                  onClick={() => copyToClipboard(commPlan.copyExamples.sms, 'sms')}
                  className="p-1 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="p-3 bg-slate-900 rounded-lg text-xs text-slate-300 font-mono">
                {commPlan.copyExamples.sms}
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Longitud: {commPlan.copyExamples.sms.length} caracteres</span>
                {copiedKey === 'sms' && <span className="text-emerald-400">¡Copiado!</span>}
              </div>
            </div>

            {/* Social Media & Digital Ads */}
            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-pink-400 flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Redes Sociales & Pauta Digital</span>
                </span>
                <button
                  onClick={() => copyToClipboard(commPlan.copyExamples.socialMedia, 'social')}
                  className="p-1 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="p-3 bg-slate-900 rounded-lg text-xs space-y-1.5">
                <p className="text-slate-300">{commPlan.copyExamples.socialMedia}</p>
                <div className="pt-1.5 border-t border-slate-800 text-[11px] text-cyan-300">
                  <strong>Banner display:</strong> {commPlan.copyExamples.digitalAd}
                </div>
              </div>
              {copiedKey === 'social' && (
                <span className="text-[10px] text-emerald-400 block text-right">¡Copiado!</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation & Next Button */}
      <div className="flex items-center justify-between p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
        <div className="text-xs text-slate-300">
          Plan de comunicación individualizado para los {clusters.length} segmentos.
        </div>
        <button
          onClick={onProceed}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
        >
          <span>CONTINUAR: PERSONIFICACIÓN VISUAL</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
