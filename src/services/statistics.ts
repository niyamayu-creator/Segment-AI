import {
  CategoricalStats,
  ColumnMetadata,
  DescriptiveReport,
  NumericStats,
} from '../types/segmentai';

export function analyzeDatasetColumns(data: Record<string, any>[]): ColumnMetadata[] {
  if (!data || data.length === 0) return [];

  const totalRows = data.length;
  const sample = data[0];
  const colNames = Object.keys(sample);

  return colNames.map((name) => {
    let missingCount = 0;
    const values: any[] = [];
    const uniqueSet = new Set<string>();

    for (let i = 0; i < totalRows; i++) {
      const val = data[i][name];
      if (val === null || val === undefined || val === '' || (typeof val === 'number' && isNaN(val))) {
        missingCount++;
      } else {
        values.push(val);
        uniqueSet.add(String(val).trim());
      }
    }

    // Determine data type
    const nonMissingCount = values.length;
    let numericCount = 0;
    for (const v of values) {
      if (typeof v === 'number' && !isNaN(v)) {
        numericCount++;
      } else if (typeof v === 'string') {
        const clean = v.trim().replace(',', '.');
        if (clean !== '' && !isNaN(Number(clean))) {
          numericCount++;
        }
      }
    }

    const isNumeric = nonMissingCount > 0 && numericCount / nonMissingCount >= 0.85;

    // Check if likely identifier (e.g. ID, ClientId, Codigo, unique per row or name hints)
    const lower = name.toLowerCase();
    const hasIdName =
      lower.includes('id') ||
      lower.includes('codigo') ||
      lower.includes('código') ||
      lower.includes('cliente') ||
      lower.includes('cedula') ||
      lower.includes('identificador');
    const isHighCardinality = nonMissingCount > 0 && uniqueSet.size / nonMissingCount > 0.95 && totalRows > 15;
    const isLikelyId = hasIdName || (isHighCardinality && isNumeric && uniqueSet.size === nonMissingCount);

    let type: ColumnMetadata['type'] = 'categorical';
    if (isLikelyId) {
      type = 'id';
    } else if (isNumeric) {
      type = 'numeric';
    }

    return {
      name,
      type,
      missingCount,
      missingPercentage: Number(((missingCount / totalRows) * 100).toFixed(2)),
      uniqueCount: uniqueSet.size,
      sampleValues: values.slice(0, 5),
      isLikelyId,
      // By default select numeric columns that are not IDs for clustering
      selectedForClustering: isNumeric && !isLikelyId,
    };
  });
}

export function calculateDescriptiveReport(
  data: Record<string, any>[],
  columns: ColumnMetadata[],
  sector: string = 'General'
): DescriptiveReport {
  const numericStats: NumericStats[] = [];
  const categoricalStats: CategoricalStats[] = [];
  const qualityIssues: DescriptiveReport['qualityIssues'] = [];

  const numericColNames: string[] = [];

  // Analyze columns
  for (const col of columns) {
    const rawValues = data
      .map((row) => row[col.name])
      .filter((v) => v !== null && v !== undefined && v !== '' && !Number.isNaN(Number(v)));

    if (col.type === 'numeric' || (col.type === 'id' && !col.isLikelyId)) {
      const nums = rawValues.map((v) => Number(String(v).replace(',', '.'))).sort((a, b) => a - b);
      const n = nums.length;

      if (n === 0) continue;
      numericColNames.push(col.name);

      const sum = nums.reduce((acc, curr) => acc + curr, 0);
      const mean = sum / n;

      // Median
      const mid = Math.floor(n / 2);
      const median = n % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;

      // Mode
      const freqMap = new Map<number, number>();
      let maxFreq = 0;
      let mode = nums[0];
      for (const val of nums) {
        const count = (freqMap.get(val) || 0) + 1;
        freqMap.set(val, count);
        if (count > maxFreq) {
          maxFreq = count;
          mode = val;
        }
      }

      // Variance & StdDev
      const variance = nums.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / (n > 1 ? n - 1 : 1);
      const stdDev = Math.sqrt(variance);

      // Percentiles
      const getPercentile = (p: number) => {
        const index = (p / 100) * (n - 1);
        const lower = Math.floor(index);
        const upper = Math.ceil(index);
        const weight = index - lower;
        if (lower === upper) return nums[lower];
        return nums[lower] * (1 - weight) + nums[upper] * weight;
      };

      const p25 = getPercentile(25);
      const p50 = median;
      const p75 = getPercentile(75);
      const p90 = getPercentile(90);
      const iqr = p75 - p25;

      // Outlier detection (Tukey's IQR method)
      const lowerFence = p25 - 1.5 * iqr;
      const upperFence = p75 + 1.5 * iqr;
      const outlierCount = nums.filter((v) => v < lowerFence || v > upperFence).length;

      // Coefficient of Variation
      const cv = mean !== 0 ? Number(((stdDev / Math.abs(mean)) * 100).toFixed(2)) : 0;

      // Skewness (Fisher-Pearson)
      let skewness = 0;
      if (n > 2 && stdDev > 0) {
        const m3 = nums.reduce((acc, v) => acc + Math.pow(v - mean, 3), 0) / n;
        skewness = m3 / Math.pow(stdDev, 3);
      }

      // Kurtosis (excess kurtosis)
      let kurtosis = 0;
      if (n > 3 && stdDev > 0) {
        const m4 = nums.reduce((acc, v) => acc + Math.pow(v - mean, 4), 0) / n;
        kurtosis = m4 / Math.pow(stdDev, 4) - 3;
      }

      numericStats.push({
        column: col.name,
        count: n,
        mean: Number(mean.toFixed(2)),
        median: Number(median.toFixed(2)),
        mode: Number(mode.toFixed(2)),
        stdDev: Number(stdDev.toFixed(2)),
        variance: Number(variance.toFixed(2)),
        min: Number(nums[0].toFixed(2)),
        max: Number(nums[n - 1].toFixed(2)),
        p25: Number(p25.toFixed(2)),
        p50: Number(p50.toFixed(2)),
        p75: Number(p75.toFixed(2)),
        p90: Number(p90.toFixed(2)),
        cv,
        skewness: Number(skewness.toFixed(2)),
        kurtosis: Number(kurtosis.toFixed(2)),
        iqr: Number(iqr.toFixed(2)),
        outlierCount,
      });

      // Check quality issues
      if (variance === 0) {
        qualityIssues.push({
          type: 'zero_variance',
          severity: 'high',
          column: col.name,
          message: `La variable "${col.name}" tiene varianza cero (todos los valores son idénticos).`,
          recommendation: 'Excluir del clustering ya que no aporta poder de diferenciación.',
        });
      }

      if (outlierCount > n * 0.08) {
        qualityIssues.push({
          type: 'outlier',
          severity: 'medium',
          column: col.name,
          message: `Detectados ${outlierCount} valores atípicos (${((outlierCount / n) * 100).toFixed(1)}% de la muestra).`,
          recommendation: 'Se recomienda estandarización robusta o revisión de valores extremos antes de K-means.',
        });
      }
    } else {
      // Categorical analysis
      const freqMap = new Map<string, number>();
      for (const val of rawValues) {
        const str = String(val).trim();
        freqMap.set(str, (freqMap.get(str) || 0) + 1);
      }

      const totalValid = rawValues.length;
      const sortedFreqs = Array.from(freqMap.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([value, count]) => ({
          value,
          count,
          percentage: Number(((count / (totalValid || 1)) * 100).toFixed(1)),
        }));

      categoricalStats.push({
        column: col.name,
        total: totalValid,
        uniqueCount: freqMap.size,
        mode: sortedFreqs[0]?.value || 'N/A',
        frequencies: sortedFreqs.slice(0, 10),
      });
    }

    // Check missing values
    if (col.missingPercentage > 15) {
      qualityIssues.push({
        type: 'missing',
        severity: col.missingPercentage > 30 ? 'high' : 'medium',
        column: col.name,
        message: `La variable "${col.name}" tiene ${col.missingPercentage}% de valores faltantes.`,
        recommendation:
          col.missingPercentage > 40
            ? 'Considerar remover la variable del modelo'
            : 'Aplicar imputación por mediana o media en el paso de preparación.',
      });
    }

    if (col.isLikelyId) {
      qualityIssues.push({
        type: 'identifier',
        severity: 'high',
        column: col.name,
        message: `Identificada como clave única o identificador de cliente.`,
        recommendation: 'Mantener excluida del clustering para evitar agrupamientos espurios.',
      });
    }
  }

  // Calculate Pearson Correlation Matrix between numeric columns
  const pCols = numericStats.map((s) => s.column);
  const matrix: number[][] = [];

  for (let i = 0; i < pCols.length; i++) {
    matrix[i] = [];
    const colA = pCols[i];
    const meanA = numericStats[i].mean;
    const stdA = numericStats[i].stdDev;

    for (let j = 0; j < pCols.length; j++) {
      if (i === j) {
        matrix[i][j] = 1.0;
        continue;
      }
      const colB = pCols[j];
      const meanB = numericStats[j].mean;
      const stdB = numericStats[j].stdDev;

      let sumProd = 0;
      let count = 0;

      for (const row of data) {
        const valA = Number(row[colA]);
        const valB = Number(row[colB]);
        if (!isNaN(valA) && !isNaN(valB)) {
          sumProd += (valA - meanA) * (valB - meanB);
          count++;
        }
      }

      if (count > 1 && stdA > 0 && stdB > 0) {
        const r = sumProd / ((count - 1) * stdA * stdB);
        const bounded = Math.max(-1, Math.min(1, r));
        matrix[i][j] = Number(bounded.toFixed(3));

        // Check for severe collinearity
        if (i < j && Math.abs(bounded) > 0.88) {
          qualityIssues.push({
            type: 'redundancy',
            severity: 'medium',
            column: `${colA} ↔ ${colB}`,
            message: `Alta correlación lineal detectada (r = ${matrix[i][j]}). Posible redundancia de información.`,
            recommendation: 'Evaluar conservar solo una o aplicar reducción dimensional PCA.',
          });
        }
      } else {
        matrix[i][j] = 0;
      }
    }
  }

  // Generate executive diagnostic summary
  const executiveSummary = `Se analizaron ${data.length} registros y ${columns.length} variables para el sector ${sector}. El conjunto cuenta con ${pCols.length} variables numéricas candidatas para clustering. ${
    qualityIssues.length === 0
      ? 'La base presenta excelente calidad estadística, sin valores faltantes críticos ni variables redundantes extremas.'
      : `Se identificaron ${qualityIssues.length} observaciones de calidad técnica (valores atípicos, potenciales identificadores y correlaciones), las cuales son mitigadas por el pipeline de estandarización StandardScaler y selección de características.`
  }`;

  return {
    numericStats,
    categoricalStats,
    correlations: {
      columns: pCols,
      matrix,
    },
    qualityIssues,
    executiveSummary,
  };
}
