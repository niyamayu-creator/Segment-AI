import React, { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import {
  Upload,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle,
  Download,
  Zap,
  ArrowRight,
  Eye,
} from 'lucide-react';
import { ColumnMetadata, DatasetSummary } from '../../types/segmentai';
import { analyzeDatasetColumns } from '../../services/statistics';
import { downloadDemoTelecomExcel, generateDemoTelecomRecords } from '../../services/demoDataset';

interface Props {
  dataset: DatasetSummary | null;
  onDatasetLoaded: (summary: DatasetSummary) => void;
  onProceed: () => void;
}

export const Step2CargaDatos: React.FC<Props> = ({
  dataset,
  onDatasetLoaded,
  onProceed,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Raw workbook instance for multi-sheet Excel switching
  const [rawWorkbook, setRawWorkbook] = useState<XLSX.WorkBook | null>(null);

  // Process raw tabular rows into DatasetSummary
  const processRowsIntoSummary = (
    rows: Record<string, any>[],
    fileName: string,
    fileSize: number,
    sheetNames?: string[],
    activeSheet?: string
  ) => {
    if (!rows || rows.length === 0) {
      setErrorMessage('El archivo no contiene filas o está vacío.');
      return;
    }

    // 1. Identify columns and types
    const columns = analyzeDatasetColumns(rows);

    // 2. Identify missing values
    const totalMissing = columns.reduce((acc, c) => acc + c.missingCount, 0);

    // 3. Detect duplicate rows
    const serializedRows = new Set<string>();
    let duplicates = 0;
    for (const r of rows) {
      const s = JSON.stringify(r);
      if (serializedRows.has(s)) {
        duplicates++;
      } else {
        serializedRows.add(s);
      }
    }

    const numericCount = columns.filter((c) => c.type === 'numeric').length;
    const categoricalCount = columns.filter((c) => c.type === 'categorical').length;

    // Validation for clustering viability
    if (numericCount < 2) {
      setErrorMessage(
        `El conjunto de datos debe contener al menos 2 variables numéricas para realizar clustering. Actualmente solo se detectaron ${numericCount} variables numéricas válidas.`
      );
      return;
    }

    const summary: DatasetSummary = {
      fileName,
      fileSize,
      totalRows: rows.length,
      totalColumns: columns.length,
      numericCount,
      categoricalCount,
      totalMissingValues: totalMissing,
      duplicateRows: duplicates,
      sheetNames,
      activeSheet,
      columns,
      previewRows: rows.slice(0, 10),
      rawData: rows,
    };

    setErrorMessage(null);
    onDatasetLoaded(summary);
  };

  // Handle file reading from input or drag
  const handleFile = async (file: File) => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!['csv', 'txt', 'xls', 'xlsx'].includes(ext || '')) {
        throw new Error('Formato no soportado. Por favor sube un archivo CSV, TXT, XLS o XLSX.');
      }

      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'array' });
      setRawWorkbook(wb);

      const firstSheetName = wb.SheetNames[0];
      const ws = wb.Sheets[firstSheetName];
      const rows = XLSX.utils.sheet_to_json<Record<string, any>>(ws);

      processRowsIntoSummary(rows, file.name, file.size, wb.SheetNames, firstSheetName);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Error al procesar el archivo. Verifica el formato.');
    } finally {
      setLoading(false);
    }
  };

  // Change Excel sheet if workbook has multiple
  const handleSheetChange = (sheetName: string) => {
    if (!rawWorkbook || !dataset) return;
    const ws = rawWorkbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, any>>(ws);
    processRowsIntoSummary(rows, dataset.fileName, dataset.fileSize, rawWorkbook.SheetNames, sheetName);
  };

  // Load built-in cellsegmentation2 demo dataset
  const handleLoadDemoDataset = () => {
    setLoading(true);
    setTimeout(() => {
      const demoRecords = generateDemoTelecomRecords();
      processRowsIntoSummary(
        demoRecords,
        'cellsegmentation2.xlsx',
        18450,
        ['Datos_Clientes'],
        'Datos_Clientes'
      );
      setLoading(false);
    }, 250);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-2">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Cargar Base de Datos
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Formatos compatibles: CSV, TXT, XLS, XLSX. El archivo se procesa de forma real en memoria.
          </p>
        </div>

        {/* Demo buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={downloadDemoTelecomExcel}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 transition-colors"
            title="Descargar archivo Excel para probar la carga manual"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar cellsegmentation2.xlsx</span>
          </button>

          <button
            onClick={handleLoadDemoDataset}
            className="flex items-center gap-1.5 px-3 py-2 bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 rounded-lg text-xs font-semibold border border-cyan-500/30 transition-colors"
          >
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Cargar Base Demo</span>
          </button>
        </div>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
          }
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
          isDragging
            ? 'border-cyan-400 bg-cyan-950/20 scale-[0.99]'
            : 'border-slate-800 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.txt,.xls,.xlsx"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFile(e.target.files[0]);
            }
          }}
        />

        <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-cyan-400 shadow-md">
          {loading ? (
            <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Upload className="w-6 h-6" />
          )}
        </div>

        <div className="text-center">
          <p className="text-sm font-semibold text-slate-200">
            {loading ? 'Leyendo y validando archivo...' : 'Arrastra y suelta tu base de datos aquí'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            o haz clic para explorar en tu equipo (CSV, TXT, XLS, XLSX)
          </p>
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 bg-rose-950/50 border border-rose-800 rounded-xl flex items-start gap-3 text-rose-200 text-xs">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold">Validación no superada</div>
            <div className="mt-0.5 text-rose-300">{errorMessage}</div>
          </div>
        </div>
      )}

      {/* Dataset Summary & Metrics */}
      {dataset && (
        <div className="space-y-6">
          {/* Sheet Selector if multiple sheets */}
          {dataset.sheetNames && dataset.sheetNames.length > 1 && (
            <div className="flex items-center gap-2 p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs">
              <span className="text-slate-400 font-medium">Hoja seleccionada de Excel:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {dataset.sheetNames.map((sheet) => (
                  <button
                    key={sheet}
                    onClick={() => handleSheetChange(sheet)}
                    className={`px-3 py-1 rounded-md font-medium transition-colors ${
                      dataset.activeSheet === sheet
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {sheet}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 6 Core Required Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                Registros
              </span>
              <span className="text-xl font-bold text-white font-mono tabular-nums mt-1 block">
                {dataset.totalRows.toLocaleString()}
              </span>
              <span className="text-[10px] text-emerald-400 mt-1 block flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Base válida
              </span>
            </div>

            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                Variables
              </span>
              <span className="text-xl font-bold text-white font-mono tabular-nums mt-1 block">
                {dataset.totalColumns}
              </span>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Columnas totales
              </span>
            </div>

            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                Numéricas
              </span>
              <span className="text-xl font-bold text-cyan-400 font-mono tabular-nums mt-1 block">
                {dataset.numericCount}
              </span>
              <span className="text-[10px] text-cyan-500 mt-1 block">
                Aptas para K-Means
              </span>
            </div>

            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                Categóricas
              </span>
              <span className="text-xl font-bold text-slate-300 font-mono tabular-nums mt-1 block">
                {dataset.categoricalCount}
              </span>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Segmentación mixta
              </span>
            </div>

            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                Valores Faltantes
              </span>
              <span
                className={`text-xl font-bold font-mono tabular-nums mt-1 block ${
                  dataset.totalMissingValues > 0 ? 'text-amber-400' : 'text-slate-200'
                }`}
              >
                {dataset.totalMissingValues}
              </span>
              <span className="text-[10px] text-slate-400 mt-1 block">
                {dataset.totalMissingValues === 0 ? 'Completitud 100%' : 'Imputación disponible'}
              </span>
            </div>

            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                Duplicados
              </span>
              <span
                className={`text-xl font-bold font-mono tabular-nums mt-1 block ${
                  dataset.duplicateRows > 0 ? 'text-amber-400' : 'text-slate-200'
                }`}
              >
                {dataset.duplicateRows}
              </span>
              <span className="text-[10px] text-slate-400 mt-1 block">
                {dataset.duplicateRows === 0 ? 'Cero duplicados' : 'Filas redundantes'}
              </span>
            </div>
          </div>

          {/* First 10 Rows Preview */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-3.5 border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-semibold text-slate-200">
                <Eye className="w-4 h-4 text-cyan-400" />
                <span>Vista preliminar (Primeras 10 filas del archivo)</span>
              </div>
              <span className="text-slate-500 font-mono text-[11px]">
                {dataset.fileName} · {dataset.totalRows} registros cargados
              </span>
            </div>

            <div className="overflow-x-auto max-h-80">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-slate-800 sticky top-0 z-10">
                    <th className="p-2.5 font-medium text-slate-400 font-mono text-[11px]">#</th>
                    {dataset.columns.map((c) => (
                      <th
                        key={c.name}
                        className="p-2.5 font-semibold text-slate-200 whitespace-nowrap"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>{c.name}</span>
                          <span
                            className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                              c.type === 'numeric'
                                ? 'bg-cyan-950 text-cyan-300'
                                : c.type === 'id'
                                ? 'bg-slate-800 text-slate-400'
                                : 'bg-violet-950 text-violet-300'
                            }`}
                          >
                            {c.type}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {dataset.previewRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-2.5 font-mono text-[11px] text-slate-500 tabular-nums">
                        {idx + 1}
                      </td>
                      {dataset.columns.map((c) => (
                        <td
                          key={c.name}
                          className="p-2.5 text-slate-300 font-mono text-xs tabular-nums whitespace-nowrap"
                        >
                          {row[c.name] !== null && row[c.name] !== undefined
                            ? String(row[c.name])
                            : <span className="text-slate-600 italic">null</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Validation & Next Button */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <CheckCircle className="w-4 h-4" />
              <span>
                Datos validados: {dataset.numericCount} variables numéricas listas para clustering.
              </span>
            </div>

            <button
              onClick={onProceed}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
            >
              <span>CONTINUAR: DEFINIR SECTOR</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
