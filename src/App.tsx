import React, { useState } from 'react';
import {
  ClusteringModelOutput,
  DatasetSummary,
  EconomicSector,
  StrategicMarketingPlan,
  VisualPersona,
} from './types/segmentai';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Step1Inicio } from './components/steps/Step1Inicio';
import { Step2CargaDatos } from './components/steps/Step2CargaDatos';
import { Step3Sector } from './components/steps/Step3Sector';
import { Step4Descriptivo } from './components/steps/Step4Descriptivo';
import { Step5NumeroSegmentos } from './components/steps/Step5NumeroSegmentos';
import { Step6PreparacionML } from './components/steps/Step6PreparacionML';
import { Step7ResultadosCentroides } from './components/steps/Step7ResultadosCentroides';
import { Step8Visualizacion } from './components/steps/Step8Visualizacion';
import { Step9Estrategias } from './components/steps/Step9Estrategias';
import { Step10Comunicacion } from './components/steps/Step10Comunicacion';
import { Step11Personificacion } from './components/steps/Step11Personificacion';
import { Step12InformeEjecutivo } from './components/steps/Step12InformeEjecutivo';
import { generateDemoTelecomRecords } from './services/demoDataset';
import { analyzeDatasetColumns } from './services/statistics';
import { exportClusteringToExcel } from './services/exportService';

export default function App() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [maxCompletedStep, setMaxCompletedStep] = useState<number>(1);

  // Global State
  const [dataset, setDataset] = useState<DatasetSummary | null>(null);
  const [sector, setSector] = useState<EconomicSector | string>('Telecomunicaciones');
  const [selectedK, setSelectedK] = useState<number>(4);
  const [isAutomaticK, setIsAutomaticK] = useState<boolean>(true);
  const [modelOutput, setModelOutput] = useState<ClusteringModelOutput | null>(null);

  // Proceed to next step
  const handleProceed = () => {
    if (currentStep < 12) {
      const next = currentStep + 1;
      setCurrentStep(next);
      if (next > maxCompletedStep) {
        setMaxCompletedStep(next);
      }
    }
  };

  // Direct step navigation
  const handleSelectStep = (step: number) => {
    setCurrentStep(step);
    if (step > maxCompletedStep) {
      setMaxCompletedStep(step);
    }
  };

  // Load demo telecom dataset
  const handleLoadDemo = () => {
    const records = generateDemoTelecomRecords();
    const columns = analyzeDatasetColumns(records);
    const summary: DatasetSummary = {
      fileName: 'cellsegmentation2.xlsx',
      fileSize: 18450,
      totalRows: records.length,
      totalColumns: columns.length,
      numericCount: columns.filter((c) => c.type === 'numeric').length,
      categoricalCount: columns.filter((c) => c.type === 'categorical').length,
      totalMissingValues: 0,
      duplicateRows: 0,
      sheetNames: ['Datos_Clientes'],
      activeSheet: 'Datos_Clientes',
      columns,
      previewRows: records.slice(0, 10),
      rawData: records,
    };

    setDataset(summary);
    setSector('Telecomunicaciones');
    setSelectedK(4);
    setIsAutomaticK(true);
    setCurrentStep(2);
    setMaxCompletedStep(Math.max(maxCompletedStep, 2));
  };

  // Dataset loaded handler
  const handleDatasetLoaded = (summary: DatasetSummary) => {
    setDataset(summary);
    setMaxCompletedStep(Math.max(maxCompletedStep, 2));
  };

  // Update cluster commercial name
  const handleUpdateClusterName = (clusterIdx: number, newName: string) => {
    if (!modelOutput) return;
    const updatedStrategies = { ...modelOutput.strategies };
    if (updatedStrategies[clusterIdx]) {
      updatedStrategies[clusterIdx] = {
        ...updatedStrategies[clusterIdx],
        commercialName: newName,
      };
    }
    const updatedPersonas = { ...modelOutput.personas };
    if (updatedPersonas[clusterIdx]) {
      updatedPersonas[clusterIdx] = {
        ...updatedPersonas[clusterIdx],
        clusterName: newName,
      };
    }
    setModelOutput({
      ...modelOutput,
      strategies: updatedStrategies,
      personas: updatedPersonas,
    });
  };

  // Update strategies
  const handleUpdateStrategies = (strategies: Record<number, StrategicMarketingPlan>) => {
    if (!modelOutput) return;
    setModelOutput({
      ...modelOutput,
      strategies,
    });
  };

  // Update persona
  const handleUpdatePersona = (clusterIdx: number, updated: VisualPersona) => {
    if (!modelOutput) return;
    setModelOutput({
      ...modelOutput,
      personas: {
        ...modelOutput.personas,
        [clusterIdx]: updated,
      },
    });
  };

  // Reset entire application
  const handleReset = () => {
    if (window.confirm('¿Deseas reiniciar el análisis? Los datos cargados se restablecerán.')) {
      setDataset(null);
      setSector('Telecomunicaciones');
      setSelectedK(4);
      setIsAutomaticK(true);
      setModelOutput(null);
      setCurrentStep(1);
      setMaxCompletedStep(1);
    }
  };

  // Trigger Excel download
  const handleExportExcel = () => {
    if (dataset && modelOutput) {
      exportClusteringToExcel(dataset, modelOutput, sector);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        currentStep={currentStep}
        onSelectStep={handleSelectStep}
        maxCompletedStep={maxCompletedStep}
        datasetLoaded={Boolean(dataset)}
        modelTrained={Boolean(modelOutput)}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Bar Header */}
        <Header
          currentStep={currentStep}
          dataset={dataset}
          sector={sector}
          clustersCount={selectedK}
          isModelTrained={Boolean(modelOutput)}
          onExportExcel={handleExportExcel}
          onReset={handleReset}
        />

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto px-6 py-5">
          {currentStep === 1 && (
            <Step1Inicio
              onStart={() => {
                setCurrentStep(2);
                setMaxCompletedStep(Math.max(maxCompletedStep, 2));
              }}
              onLoadDemo={handleLoadDemo}
            />
          )}

          {currentStep === 2 && (
            <Step2CargaDatos
              dataset={dataset}
              onDatasetLoaded={handleDatasetLoaded}
              onProceed={() => {
                setCurrentStep(3);
                setMaxCompletedStep(Math.max(maxCompletedStep, 3));
              }}
            />
          )}

          {currentStep === 3 && (
            <Step3Sector
              selectedSector={sector}
              onSelectSector={(s) => setSector(s)}
              onProceed={() => {
                setCurrentStep(4);
                setMaxCompletedStep(Math.max(maxCompletedStep, 4));
              }}
            />
          )}

          {currentStep === 4 && dataset && (
            <Step4Descriptivo
              dataset={dataset}
              sector={sector}
              onProceed={() => {
                setCurrentStep(5);
                setMaxCompletedStep(Math.max(maxCompletedStep, 5));
              }}
            />
          )}

          {currentStep === 5 && dataset && (
            <Step5NumeroSegmentos
              dataset={dataset}
              selectedK={selectedK}
              isAutomatic={isAutomaticK}
              onSelectK={(k, isAuto) => {
                setSelectedK(k);
                setIsAutomaticK(isAuto);
              }}
              onProceed={() => {
                setCurrentStep(6);
                setMaxCompletedStep(Math.max(maxCompletedStep, 6));
              }}
            />
          )}

          {currentStep === 6 && dataset && (
            <Step6PreparacionML
              dataset={dataset}
              sector={sector}
              selectedK={selectedK}
              modelOutput={modelOutput}
              onModelTrained={(output) => {
                setModelOutput(output);
                setMaxCompletedStep(Math.max(maxCompletedStep, 7));
              }}
              onProceed={() => {
                setCurrentStep(7);
                setMaxCompletedStep(Math.max(maxCompletedStep, 7));
              }}
            />
          )}

          {currentStep === 7 && modelOutput && (
            <Step7ResultadosCentroides
              modelOutput={modelOutput}
              sector={sector}
              onUpdateClusterName={handleUpdateClusterName}
              onProceed={() => {
                setCurrentStep(8);
                setMaxCompletedStep(Math.max(maxCompletedStep, 8));
              }}
            />
          )}

          {currentStep === 8 && modelOutput && (
            <Step8Visualizacion
              modelOutput={modelOutput}
              sector={sector}
              onProceed={() => {
                setCurrentStep(9);
                setMaxCompletedStep(Math.max(maxCompletedStep, 9));
              }}
            />
          )}

          {currentStep === 9 && modelOutput && (
            <Step9Estrategias
              modelOutput={modelOutput}
              sector={sector}
              onUpdateStrategies={handleUpdateStrategies}
              onProceed={() => {
                setCurrentStep(10);
                setMaxCompletedStep(Math.max(maxCompletedStep, 10));
              }}
            />
          )}

          {currentStep === 10 && modelOutput && (
            <Step10Comunicacion
              modelOutput={modelOutput}
              sector={sector}
              onProceed={() => {
                setCurrentStep(11);
                setMaxCompletedStep(Math.max(maxCompletedStep, 11));
              }}
            />
          )}

          {currentStep === 11 && modelOutput && (
            <Step11Personificacion
              modelOutput={modelOutput}
              sector={sector}
              onUpdatePersona={handleUpdatePersona}
              onProceed={() => {
                setCurrentStep(12);
                setMaxCompletedStep(Math.max(maxCompletedStep, 12));
              }}
            />
          )}

          {currentStep === 12 && dataset && modelOutput && (
            <Step12InformeEjecutivo
              dataset={dataset}
              modelOutput={modelOutput}
              sector={sector}
            />
          )}
        </main>
      </div>
    </div>
  );
}
