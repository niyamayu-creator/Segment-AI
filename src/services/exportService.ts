import * as XLSX from 'xlsx';
import { ClusteringModelOutput, DatasetSummary } from '../types/segmentai';

// 1. Export Multi-Sheet Excel Workbook
export function exportClusteringToExcel(
  dataset: DatasetSummary,
  output: ClusteringModelOutput,
  sector: string
): void {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Base original
  const wsOriginal = XLSX.utils.json_to_sheet(dataset.rawData);
  XLSX.utils.book_append_sheet(wb, wsOriginal, 'Base_Original');

  // Sheet 2: Base procesada
  const wsProcessed = XLSX.utils.json_to_sheet(output.processedData);
  XLSX.utils.book_append_sheet(wb, wsProcessed, 'Base_Procesada');

  // Sheet 3: Variables estandarizadas
  const stdRows = output.standardizedMatrix.map((row, idx) => {
    const obj: Record<string, any> = {
      Registro_ID: idx + 1,
      Cluster_Asignado: output.labels[idx] + 1,
    };
    output.config.selectedColumns.forEach((col, j) => {
      obj[`Z_${col}`] = Number(row[j].toFixed(4));
    });
    return obj;
  });
  const wsStandardized = XLSX.utils.json_to_sheet(stdRows);
  XLSX.utils.book_append_sheet(wb, wsStandardized, 'Variables_Estandarizadas');

  // Sheet 4: Cluster asignado a cada registro
  const assignments = output.processedData.map((row, idx) => {
    const clusterIdx = output.labels[idx];
    const strategy = output.strategies[clusterIdx];
    return {
      Registro_ID: idx + 1,
      Cluster_ID: clusterIdx + 1,
      Nombre_Comercial: strategy?.commercialName || `Segmento ${clusterIdx + 1}`,
      PCA_X: output.pcaPoints[idx]?.x || 0,
      PCA_Y: output.pcaPoints[idx]?.y || 0,
      ...row,
    };
  });
  const wsAssignments = XLSX.utils.json_to_sheet(assignments);
  XLSX.utils.book_append_sheet(wb, wsAssignments, 'Asignacion_Clusters');

  // Sheet 5: Centroides (Originales y Estandarizados)
  const centroidRows: any[] = [];
  output.clusters.forEach((cl) => {
    const strategy = output.strategies[cl.clusterIndex];
    // Original Centroids
    centroidRows.push({
      Cluster: cl.label,
      Nombre_Comercial: strategy?.commercialName || cl.label,
      Tipo_Metrica: 'Unidades Originales (Promedio)',
      Clientes: cl.count,
      Porcentaje: `${cl.percentage}%`,
      ...cl.originalCentroid,
    });
    // Standardized Centroids
    centroidRows.push({
      Cluster: cl.label,
      Nombre_Comercial: strategy?.commercialName || cl.label,
      Tipo_Metrica: 'Z-Scores Estandarizados',
      Clientes: cl.count,
      Porcentaje: `${cl.percentage}%`,
      ...cl.standardizedCentroid,
    });
  });
  const wsCentroids = XLSX.utils.json_to_sheet(centroidRows);
  XLSX.utils.book_append_sheet(wb, wsCentroids, 'Centroides');

  // Sheet 6: Resumen de segmentos
  const summaryRows = output.clusters.map((cl) => {
    const strategy = output.strategies[cl.clusterIndex];
    const comm = output.communications[cl.clusterIndex];
    const topFeatStr = cl.topDifferentiatingFeatures
      .slice(0, 3)
      .map((f) => `${f.feature} (${f.direction === 'above' ? '+' : ''}${f.differencePercent}%)`)
      .join('; ');

    return {
      Cluster_ID: cl.clusterIndex + 1,
      Nombre_Comercial: strategy?.commercialName || cl.label,
      Participacion_Clientes: cl.count,
      Porcentaje: `${cl.percentage}%`,
      Variables_Diferenciadoras: topFeatStr,
      Propuesta_Valor: strategy?.valueProposition || '',
      Estrategia_Precios: strategy?.pricingStrategy || '',
      Mensaje_Principal: comm?.mainMessage || '',
      Canales_Recomendados: (comm?.recommendedChannels || []).join(', '),
      Alerta_Inestabilidad: cl.isLowSizeWarning ? 'SI (Menos de 5%)' : 'NO',
    };
  });
  const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen_Segmentos');

  // Write and trigger download
  const dateStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `SEGMENTAI_${sector.replace(/\s+/g, '_')}_Segmentacion_${dateStr}.xlsx`);
}

// 2. Export CSV of Clustered Dataset
export function exportClusteringToCsv(output: ClusteringModelOutput, fileName = 'clientes_segmentados.csv'): void {
  const assignments = output.processedData.map((row, idx) => {
    const clusterIdx = output.labels[idx];
    const strategy = output.strategies[clusterIdx];
    return {
      ...row,
      Segmento_ID: clusterIdx + 1,
      Nombre_Comercial: strategy?.commercialName || `Segmento ${clusterIdx + 1}`,
      PCA_1: output.pcaPoints[idx]?.x || 0,
      PCA_2: output.pcaPoints[idx]?.y || 0,
    };
  });

  const ws = XLSX.utils.json_to_sheet(assignments);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// 3. Download Presentation Slides as JSON / HTML Deck
export function downloadPresentationDeck(output: ClusteringModelOutput, sector: string): void {
  const slides = [
    {
      title: 'SEGMENTAI: Informe de Segmentación Estratégica',
      subtitle: `Sector: ${sector} | K=${output.config.k} Clusters`,
      bullets: [
        `Base de datos: ${output.globalEvaluation.totalRowsUsed} clientes procesados.`,
        `Variables seleccionadas: ${output.config.selectedColumns.join(', ')}.`,
        `Silhouette Score: ${output.globalEvaluation.silhouetteScore} (Excelente separabilidad).`,
        `Inercia WCSS: ${output.globalEvaluation.inertia}.`,
      ],
    },
    ...output.clusters.map((cl) => {
      const s = output.strategies[cl.clusterIndex];
      const c = output.communications[cl.clusterIndex];
      return {
        title: `Segmento ${cl.clusterIndex + 1}: ${s?.commercialName || cl.label}`,
        subtitle: `Tamaño: ${cl.count} clientes (${cl.percentage}%)`,
        bullets: [
          `Propuesta de Valor: ${s?.valueProposition}`,
          `Variables Clave: ${cl.topDifferentiatingFeatures
            .slice(0, 3)
            .map((f) => `${f.feature} (${f.differencePercent}%)`)
            .join(', ')}`,
          `Estrategia Comercial: ${s?.pricingStrategy}`,
          `Mensaje Principal: "${c?.mainMessage}"`,
          `Canales: ${(c?.recommendedChannels || []).join(', ')}`,
        ],
      };
    }),
    {
      title: 'Recomendaciones Gerenciales y Próximos Pasos',
      subtitle: 'Plan de Despliegue Trimestral',
      bullets: [
        'Priorizar segmentos por valor de vida del cliente (LTV) y facilidad de captación.',
        'Integrar las etiquetas de cluster en el CRM transaccional para automatizar flujos de comunicación.',
        'Monitorear indicadores de migración y rotación de clientes con periodicidad mensual.',
      ],
    },
  ];

  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Presentación Ejecutiva SEGMENTAI - ${sector}</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #0b1329; color: #f8fafc; padding: 40px; }
    .slide { background: #132042; border: 1px solid #1e3a8a; border-radius: 12px; padding: 36px; margin-bottom: 30px; box-shadow: 0 10px 25px rgba(0,0,0,0.4); page-break-after: always; }
    h1 { color: #38bdf8; font-size: 24px; margin-top: 0; }
    h2 { color: #94a3b8; font-size: 16px; margin-bottom: 20px; font-weight: normal; }
    ul { list-style: none; padding-left: 0; }
    li { padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 15px; line-height: 1.5; }
    li::before { content: "•"; color: #06b6d4; font-weight: bold; display: inline-block; width: 1.2em; }
    .footer { text-align: right; font-size: 11px; color: #64748b; margin-top: 20px; }
  </style>
</head>
<body>
  ${slides
    .map(
      (slide, idx) => `
    <div class="slide">
      <h1>${slide.title}</h1>
      <h2>${slide.subtitle}</h2>
      <ul>
        ${slide.bullets.map((b) => `<li>${b}</li>`).join('')}
      </ul>
      <div class="footer">Slide ${idx + 1} de ${slides.length} | SEGMENTAI Intelligence</div>
    </div>
  `
    )
    .join('')}
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', `SEGMENTAI_${sector.replace(/\s+/g, '_')}_Presentacion.html`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
