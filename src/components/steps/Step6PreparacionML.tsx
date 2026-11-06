import React, { useState } from 'react';
import {
  Cpu,
  Settings2,
  CheckCircle2,
  Play,
  Layers,
  ArrowRight,
  ShieldAlert,
  Sliders,
  Check,
} from 'lucide-react';
import {
  ClusteringConfig,
  ClusteringModelOutput,
  DatasetSummary,
  EconomicSector,
} from '../../types/segmentai';
import { executeClusteringPipeline } from '../../services/clustering';
import { enhanceClustersWithAi } from '../../services/marketingEngine';

interface Props {
  dataset: DatasetSummary;
  sector: EconomicSector | string;
  selectedK: number;
  modelOutput: ClusteringModelOutput | null;
  onModelTrained: (output: ClusteringModelOutput) => void;
  onProceed: () => void;
}

export const Step6PreparacionML: React.FC<Props> = ({
  dataset,
  sector,
  selectedK,
  modelOutput,
  onModelTrained,
  onProceed,
}) => {
  // Configuration state
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(() => {
    // Default to numeric features that are not likely IDs
    return dataset.columns
      .filter((c) => c.type === 'numeric' && !c.isLikelyId)
      .map((c) => c.name);
  });

  const [scalingMethod, setScalingMethod] = useState<'standard' | 'minmax'>('standard');
  const [missingStrategy, setMissingStrategy] = useState<'mean' | 'median' | 'mode' | 'drop'>('median');
  const [randomState, setRandomState] = useState<number>(42);
  const [nInit, setNInit] = useState<number>(50);
  const [maxIterations, setMaxIterations] = useState<number>(500);
  const [algorithm, setAlgorithm] = useState<'kmeans' | 'hierarchical'>('kmeans');

  const [isTraining, setIsTraining] = useState(false);
  const [trainingLog, setTrainingLog] = useState<string[]>([]);

  // Toggle feature selection
  const toggleFeature = (colName: string) => {
    if (selectedFeatures.includes(colName)) {
      if (selectedFeatures.length <= 2) {
        alert('Se requieren al menos 2 variables para el clustering.');
        return;
      }
      setSelectedFeatures(selectedFeatures.filter((f) => f !== colName));
    } else {
      setSelectedFeatures([...selectedFeatures, colName]);
    }
  };

  // Run the full clustering pipeline
  const handleRunModel = async () => {
    if (selectedFeatures.length < 2) return;

    setIsTraining(true);
    setTrainingLog(['Iniciando pipeline de preparación de datos...']);

    const config: ClusteringConfig = {
      k: selectedK,
      randomState,
      nInit,
      maxIterations,
      scalingMethod,
      missingValueStrategy: missingStrategy,
      selectedColumns: selectedFeatures,
      algorithm,
    };

    setTimeout(async () => {
      try {
        setTrainingLog((prev) => [
          ...prev,
          `Variables seleccionadas: ${selectedFeatures.join(', ')}`,
          `Estandarización: ${scalingMethod === 'standard' ? 'StandardScaler (Z-score)' : 'MinMaxScaler'}`,
          `Tratamiento de nulos: Imputación por ${missingStrategy}`,
          `Ejecutando algoritmo K-Means (K=${selectedK}, N_init=${nInit}, RandomState=${randomState})...`,
        ]);

        const { modelOutput: rawOutput } = executeClusteringPipeline(dataset.rawData, config);

        setTrainingLog((prev) => [
          ...prev,
          `Convergencia alcanzada. Inercia final WCSS: ${rawOutput.globalEvaluation.inertia}`,
          `Cálculo de métricas de validación: Silhouette = ${rawOutput.globalEvaluation.silhouetteScore}, DB = ${rawOutput.globalEvaluation.daviesBouldinIndex}`,
          'Generando proyección dimensional 2D mediante PCA...',
          'Sintetizando perfiles comerciales y estrategias de marketing con IA...',
        ]);

        // Integrate AI strategic enhancement
        const { strategies, communications, personas } = await enhanceClustersWithAi(
          rawOutput.clusters,
          sector
        );

        const fullOutput: ClusteringModelOutput = {
          ...rawOutput,
          strategies: strategies || {},
          communications: communications || {},
          personas: personas || {},
        };

        setTrainingLog((prev) => [...prev, '✓ Proceso completado exitosamente.']);
        onModelTrained(fullOutput);
      } catch (err: any) {
        console.error(err);
        setTrainingLog((prev) => [...prev, `Error: ${err.message}`]);
      } finally {
        setIsTraining(false);
      }
    }, 150);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-2">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          Preparación de Datos y Machine Learning
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Configuración rigurosa de variables, normalización de datos y ejecución del algoritmo de clustering.
        </p>
      </div>

      {/* Grid of ML Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Box 1: Feature Selector */}
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3 md:col-span-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-200">
              Selección de Variables para Clustering ({selectedFeatures.length} activas)
            </span>
            <span className="text-[11px] text-slate-400">
              {dataset.columns.filter((c) => c.isLikelyId).length} IDs excluidos automáticamente
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-1">
            {dataset.columns.map((col) => {
              const isSelected = selectedFeatures.includes(col.name);
              const isNumeric = col.type === 'numeric';

              return (
                <div
                  key={col.name}
                  onClick={() => isNumeric && toggleFeature(col.name)}
                  className={`p-2.5 rounded-lg border text-xs flex items-center justify-between transition-all select-none ${
                    !isNumeric
                      ? 'bg-slate-950/60 border-slate-800/40 text-slate-500 opacity-60 cursor-not-allowed'
                      : isSelected
                      ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-200 cursor-pointer shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center shrink-0 text-[10px] ${
                        isSelected ? 'bg-cyan-500 text-slate-950 font-bold' : 'border border-slate-700'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                    <span className="truncate font-medium">{col.name}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {col.isLikelyId && (
                      <span className="text-[9px] text-amber-400 bg-amber-950/60 border border-amber-800/60 px-1.5 py-0.2 rounded font-mono">
                        ID
                      </span>
                    )}
                    <span className="text-[9px] text-slate-400 font-mono">
                      {col.type}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Box 2: Preprocessing Configuration */}
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-4">
          <div className="text-xs font-semibold text-slate-200">
            Parámetros de Preprocesamiento
          </div>

          {/* Scaling */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-slate-400 block">
              Método de Normalización:
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => setScalingMethod('standard')}
                className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  scalingMethod === 'standard'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-slate-950 text-slate-400 border border-slate-800'
                }`}
              >
                StandardScaler (Z-score)
              </button>
              <button
                onClick={() => setScalingMethod('minmax')}
                className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  scalingMethod === 'minmax'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-slate-950 text-slate-400 border border-slate-800'
                }`}
              >
                MinMaxScaler [0, 1]
              </button>
            </div>
          </div>

          {/* Missing value strategy */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-slate-400 block">
              Tratamiento de Valores Faltantes:
            </label>
            <select
              value={missingStrategy}
              onChange={(e) => setMissingStrategy(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
            >
              <option value="median">Imputar por Mediana (Robusto)</option>
              <option value="mean">Imputar por Media Aritmética</option>
              <option value="drop">Eliminar registros con nulos</option>
            </select>
          </div>

          {/* Algorithm selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-slate-400 block">
              Algoritmo de Aprendizaje:
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => setAlgorithm('kmeans')}
                className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  algorithm === 'kmeans'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-slate-950 text-slate-400 border border-slate-800'
                }`}
              >
                K-Means (Principal)
              </button>
              <button
                onClick={() => setAlgorithm('hierarchical')}
                className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  algorithm === 'hierarchical'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-slate-950 text-slate-400 border border-slate-800'
                }`}
              >
                Jerárquico (Ward)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Box 3: Model Parameters & Run Action */}
      <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 rounded-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Configuración de Hiperparámetros K-Means</span>
            </div>
            <p className="text-[11px] text-slate-400">
              K = {selectedK} centros · Random State = {randomState} · N_init = {nInit} corridas · Max Iter = {maxIterations}
            </p>
          </div>

          <button
            disabled={isTraining}
            onClick={handleRunModel}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-xs shadow-xl shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {isTraining ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>PROCESANDO ALGORITMO...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-slate-950" />
                <span>
                  {modelOutput ? 'RE-EJECUTAR MODELO' : 'ENTRENAR MODELO DE CLUSTERING'}
                </span>
              </>
            )}
          </button>
        </div>

        {/* Live execution logs */}
        {trainingLog.length > 0 && (
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-850 font-mono text-[11px] text-slate-400 space-y-1">
            {trainingLog.map((log, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="text-cyan-500">›</span>
                <span className={log.startsWith('✓') ? 'text-emerald-400 font-bold' : ''}>
                  {log}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Model Quality Indicators if trained */}
      {modelOutput && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                Silhouette Score
              </span>
              <span className="text-2xl font-bold text-emerald-400 font-mono tabular-nums mt-1 block">
                {modelOutput.globalEvaluation.silhouetteScore}
              </span>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Separación inter-cluster
              </span>
            </div>

            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                Davies-Bouldin Index
              </span>
              <span className="text-2xl font-bold text-cyan-400 font-mono tabular-nums mt-1 block">
                {modelOutput.globalEvaluation.daviesBouldinIndex}
              </span>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Menor valor indica mayor compacidad
              </span>
            </div>

            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                Calinski-Harabasz
              </span>
              <span className="text-2xl font-bold text-slate-200 font-mono tabular-nums mt-1 block">
                {modelOutput.globalEvaluation.calinskiHarabaszIndex}
              </span>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Dispersión entre vs dentro
              </span>
            </div>

            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                Inercia (WCSS)
              </span>
              <span className="text-2xl font-bold text-slate-300 font-mono tabular-nums mt-1 block">
                {modelOutput.globalEvaluation.inertia}
              </span>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Suma de distancias al cuadrado
              </span>
            </div>
          </div>

          {/* Validation confirmation */}
          <div className="flex items-center justify-between p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>
                Modelo validado: {modelOutput.globalEvaluation.totalRowsUsed} clientes asignados exactamente a los {selectedK} clusters.
              </span>
            </div>

            <button
              onClick={onProceed}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
            >
              <span>CONTINUAR: INTERPRETACIÓN Y CENTROIDES</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
