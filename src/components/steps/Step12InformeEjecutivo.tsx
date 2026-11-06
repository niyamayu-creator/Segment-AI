import React from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Presentation,
  CheckCircle2,
  Table,
  Target,
  Sparkles,
  BarChart3,
  Layers,
  Award,
} from 'lucide-react';
import {
  ClusteringModelOutput,
  DatasetSummary,
  EconomicSector,
} from '../../types/segmentai';
import {
  downloadPresentationDeck,
  exportClusteringToCsv,
  exportClusteringToExcel,
} from '../../services/exportService';

interface Props {
  dataset: DatasetSummary;
  modelOutput: ClusteringModelOutput;
  sector: EconomicSector | string;
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

export const Step12InformeEjecutivo: React.FC<Props> = ({
  dataset,
  modelOutput,
  sector,
}) => {
  const clusters = modelOutput.clusters;
  const strategies = modelOutput.strategies;
  const comms = modelOutput.communications;
  const personas = modelOutput.personas;
  const evalMetrics = modelOutput.globalEvaluation;

  const handlePrintPdf = () => {
    window.print();
  };

  const handleExcelExport = () => {
    exportClusteringToExcel(dataset, modelOutput, sector);
  };

  const handleCsvExport = () => {
    exportClusteringToCsv(modelOutput);
  };

  const handlePptExport = () => {
    downloadPresentationDeck(modelOutput, sector);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-2">
      {/* Action Bar for Exports */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-4 sticky top-2 z-20 shadow-xl backdrop-blur">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">
            Informe Ejecutivo de Segmentación Estratégica
          </h2>
          <p className="text-[11px] text-slate-400">
            Documento integral con los 17 capítulos y opciones de exportación multiformato.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExcelExport}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors cursor-pointer"
            title="Libro Excel con 6 hojas de cálculo completas"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Excel (6 Hojas)</span>
          </button>

          <button
            onClick={handleCsvExport}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar CSV</span>
          </button>

          <button
            onClick={handlePptExport}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors cursor-pointer"
            title="Presentación ejecutiva estructurada"
          >
            <Presentation className="w-3.5 h-3.5" />
            <span>Presentación PPT/Slides</span>
          </button>

          <button
            onClick={handlePrintPdf}
            className="flex items-center gap-1.5 px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 rounded-lg text-xs font-bold shadow-md transition-colors cursor-pointer"
            title="Imprimir informe en formato PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Body */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 space-y-8 print:bg-white print:text-black print:p-0 print:border-none">
        {/* 1. PORTADA */}
        <div className="border-b border-slate-800 pb-8 text-center space-y-3">
          <div className="inline-block px-3 py-1 bg-cyan-950 border border-cyan-800 rounded-full text-cyan-300 font-mono text-[11px]">
            SEGMENTAI · INFORME EJECUTIVO FINAL
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Segmentación Estratégica de Clientes y Plan de Activación Comercial
          </h1>
          <p className="text-sm text-slate-400">
            Sector Analizado: <strong className="text-cyan-400">{sector}</strong> · Fecha:{' '}
            <span className="font-mono">{new Date().toLocaleDateString('es-ES', { dateStyle: 'long' })}</span>
          </p>
        </div>

        {/* 2, 3, 4. DESCRIPCIÓN BASE, DIAGNÓSTICO Y SECTOR */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-200 border-b border-slate-800 pb-2">
            01. Marco General y Diagnóstico de Calidad
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
              <span className="text-slate-500 block text-[10px] uppercase">Archivo Fuente</span>
              <span className="font-bold text-white mt-1 block truncate">{dataset.fileName}</span>
            </div>
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
              <span className="text-slate-500 block text-[10px] uppercase">Total Registros</span>
              <span className="font-bold text-cyan-400 mt-1 block font-mono">
                {dataset.totalRows} clientes
              </span>
            </div>
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
              <span className="text-slate-500 block text-[10px] uppercase">Variables Usadas</span>
              <span className="font-bold text-slate-200 mt-1 block font-mono">
                {modelOutput.config.selectedColumns.length} numéricas
              </span>
            </div>
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
              <span className="text-slate-500 block text-[10px] uppercase">Sector Económico</span>
              <span className="font-bold text-slate-200 mt-1 block">{sector}</span>
            </div>
          </div>
        </div>

        {/* 6, 7, 8, 9. METODOLOGÍA, ALGORITMO Y EVALUACIÓN */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-200 border-b border-slate-800 pb-2">
            02. Metodología de Machine Learning y Validación Estadística
          </h2>
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3 text-xs leading-relaxed text-slate-300">
            <p>
              Se aplicó estandarización <strong className="text-cyan-300">StandardScaler</strong> sobre las variables de comportamiento para eliminar distorsiones por escalas dispares. El algoritmo principal fue{' '}
              <strong className="text-cyan-300">K-Means</strong> con inicialización K-Means++, evaluando {modelOutput.config.nInit} corridas aleatorias y un límite de {modelOutput.config.maxIterations} iteraciones bajo semilla controlada (RandomState = {modelOutput.config.randomState}).
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 font-mono text-[11px] tabular-nums">
              <div>
                Silhouette Score: <strong className="text-emerald-400">{evalMetrics.silhouetteScore}</strong>
              </div>
              <div>
                Davies-Bouldin: <strong className="text-cyan-400">{evalMetrics.daviesBouldinIndex}</strong>
              </div>
              <div>
                Calinski-Harabasz: <strong className="text-slate-200">{evalMetrics.calinskiHarabaszIndex}</strong>
              </div>
              <div>
                Inercia WCSS: <strong className="text-slate-400">{evalMetrics.inertia}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* 10 & 11. RESULTADOS DE CENTROIDES Y CARACTERIZACIÓN */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-200 border-b border-slate-800 pb-2">
            03. Resumen de Segmentos y Centroides Promedio
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs select-none">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] text-slate-400">
                  <th className="p-2.5 font-semibold">Cluster</th>
                  <th className="p-2.5 font-semibold">Nombre Comercial</th>
                  <th className="p-2.5 font-semibold text-right">Clientes</th>
                  <th className="p-2.5 font-semibold text-right">Cuota (%)</th>
                  <th className="p-2.5 font-semibold">Variables Sobresalientes</th>
                  <th className="p-2.5 font-semibold">Propuesta de Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                {clusters.map((cl) => {
                  const s = strategies[cl.clusterIndex];
                  const topStr = cl.topDifferentiatingFeatures
                    .slice(0, 2)
                    .map((f) => `${f.feature} (${f.direction === 'above' ? '+' : ''}${f.differencePercent}%)`)
                    .join(', ');

                  return (
                    <tr key={cl.clusterIndex} className="hover:bg-slate-800/40">
                      <td className="p-2.5 font-bold text-cyan-400">#{cl.clusterIndex + 1}</td>
                      <td className="p-2.5 font-sans font-bold text-white whitespace-nowrap">
                        {s?.commercialName || cl.label}
                      </td>
                      <td className="p-2.5 text-right tabular-nums">{cl.count}</td>
                      <td className="p-2.5 text-right tabular-nums font-bold text-emerald-400">
                        {cl.percentage}%
                      </td>
                      <td className="p-2.5 text-slate-300 text-[11px] font-sans">{topStr}</td>
                      <td className="p-2.5 text-slate-400 text-[11px] font-sans truncate max-w-xs">
                        {s?.valueProposition}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 13 & 14. ESTRATEGIAS COMERCIALES Y PLAN DE COMUNICACIÓN */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-200 border-b border-slate-800 pb-2">
            04. Matriz de Activación Comercial y Plan de Canales
          </h2>
          <div className="space-y-3">
            {clusters.map((cl) => {
              const s = strategies[cl.clusterIndex];
              const c = comms[cl.clusterIndex];
              const color = CLUSTER_COLORS[cl.clusterIndex % CLUSTER_COLORS.length];

              return (
                <div
                  key={cl.clusterIndex}
                  className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                      <span className="font-bold text-white text-sm">
                        {s?.commercialName || cl.label} ({cl.percentage}% cuota)
                      </span>
                    </div>
                    <span className="text-slate-400 font-mono text-[11px]">
                      {cl.count} clientes
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-slate-300 pt-1">
                    <div>
                      <span className="text-cyan-400 text-[11px] font-semibold block">Estrategia Comercial:</span>
                      <p className="mt-0.5 leading-snug">{s?.pricingStrategy}</p>
                    </div>
                    <div>
                      <span className="text-cyan-400 text-[11px] font-semibold block">Mensaje & Tono:</span>
                      <p className="mt-0.5 leading-snug">"{c?.mainMessage}" ({c?.toneOfVoice})</p>
                    </div>
                    <div>
                      <span className="text-cyan-400 text-[11px] font-semibold block">Canales & Tácticas:</span>
                      <p className="mt-0.5 leading-snug">{(c?.recommendedChannels || []).join(', ')}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 15. PERSONIFICACIÓN DE CLUSTERS */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-200 border-b border-slate-800 pb-2">
            05. Personificación Visual de Clientes (Arquetipos Publicitarios)
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {clusters.map((cl) => {
              const p = personas[cl.clusterIndex];
              const s = strategies[cl.clusterIndex];
              return (
                <div
                  key={cl.clusterIndex}
                  className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex flex-col"
                >
                  <div className="h-28 overflow-hidden relative">
                    {p?.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.clusterName}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-900" />
                    )}
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-slate-950/90 text-[9px] font-mono text-cyan-400">
                      {cl.percentage}%
                    </span>
                  </div>
                  <div className="p-2.5 space-y-1">
                    <span className="text-xs font-bold text-white block truncate">
                      {s?.commercialName || cl.label}
                    </span>
                    <span className="text-[10px] text-slate-400 block line-clamp-2">
                      {p?.demographicHint}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 16 & 17. CONCLUSIONES Y RECOMENDACIONES GERENCIALES */}
        <div className="space-y-4 border-t border-slate-800 pt-6">
          <h2 className="text-base font-bold text-slate-200">
            06. Conclusiones y Recomendaciones Gerenciales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed text-slate-300">
            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
              <h3 className="font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Conclusiones Estratégicas</span>
              </h3>
              <ul className="list-disc list-inside space-y-1.5 text-slate-300 pl-1">
                <li>
                  El clustering no supervisado reveló {clusters.length} segmentos con alta homogeneidad interna y marcada diferenciación estadística en variables clave del sector {sector}.
                </li>
                <li>
                  La cartera no es homogénea: tratar a los clientes de forma indiferenciada genera ineficiencias de gasto publicitario y fugas de clientes de alto valor.
                </li>
                <li>
                  Los segmentos de mayor volumen proporcionan predictibilidad de ingresos, mientras que los clusters premium concentran el margen y oportunidad de venta cruzada.
                </li>
              </ul>
            </div>

            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-cyan-400" />
                <span>Recomendaciones para el Comité Directivo</span>
              </h3>
              <ul className="list-disc list-inside space-y-1.5 text-slate-300 pl-1">
                <li>
                  <strong>Integración CRM:</strong> Exportar el archivo Excel con las etiquetas de cluster y cargarlas en la base transaccional de mercadeo para automatizar disparadores de email y WhatsApp.
                </li>
                <li>
                  <strong>Re-entrenamiento Periódico:</strong> Ejecutar la segmentación de manera trimestral para detectar migraciones de usuarios entre clusters y validar la efectividad de las campañas.
                </li>
                <li>
                  <strong>Personalización de Mensajes:</strong> Prohibir el uso de copys genéricos; cada campaña debe respetar el tono y canal definido en el Plan de Comunicación.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
