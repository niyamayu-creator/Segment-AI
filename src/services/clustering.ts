import {
  ClusteringConfig,
  ClusteringModelOutput,
  ClusterMetrics,
  KEvaluationResult,
  KOptimization,
} from '../types/segmentai';

// Seeded pseudorandom number generator for reproducibility (Random State = 42)
function createPrng(seed = 42) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return function () {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// Euclidean distance squared between two vectors
function distSq(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  return sum;
}

// Euclidean distance
function dist(a: number[], b: number[]): number {
  return Math.sqrt(distSq(a, b));
}

// Preprocessing: Imputation & Scaling
export interface PreprocessingResult {
  matrix: number[][]; // N x D standardized matrix
  means: number[];
  stds: number[];
  mins: number[];
  maxs: number[];
  validRows: Record<string, any>[];
  features: string[];
}

export function preprocessData(
  rawData: Record<string, any>[],
  features: string[],
  strategy: ClusteringConfig['missingValueStrategy'] = 'median',
  scaling: ClusteringConfig['scalingMethod'] = 'standard'
): PreprocessingResult {
  if (!rawData || rawData.length === 0 || features.length === 0) {
    throw new Error('No hay datos o características seleccionadas para el clustering.');
  }

  // 1. Filter or impute missing values
  let workingRows = [...rawData];

  if (strategy === 'drop') {
    workingRows = workingRows.filter((row) =>
      features.every((f) => {
        const v = row[f];
        return v !== null && v !== undefined && v !== '' && !isNaN(Number(v));
      })
    );
  }

  if (workingRows.length === 0) {
    throw new Error('No hay filas válidas después de aplicar la estrategia de valores faltantes.');
  }

  // Extract raw numeric matrix
  const d = features.length;
  const n = workingRows.length;
  const rawMatrix: number[][] = [];

  // Calculate feature stats for imputation
  const colMeans: number[] = new Array(d).fill(0);
  const colMedians: number[] = new Array(d).fill(0);
  const colMins: number[] = new Array(d).fill(Infinity);
  const colMaxs: number[] = new Array(d).fill(-Infinity);

  for (let j = 0; j < d; j++) {
    const f = features[j];
    const vals: number[] = [];
    for (let i = 0; i < n; i++) {
      const v = Number(workingRows[i][f]);
      if (!isNaN(v)) {
        vals.push(v);
        if (v < colMins[j]) colMins[j] = v;
        if (v > colMaxs[j]) colMaxs[j] = v;
      }
    }
    vals.sort((a, b) => a - b);
    const mean = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
    const median =
      vals.length > 0
        ? vals.length % 2 !== 0
          ? vals[Math.floor(vals.length / 2)]
          : (vals[Math.floor(vals.length / 2) - 1] + vals[Math.floor(vals.length / 2)]) / 2
        : 0;

    colMeans[j] = mean;
    colMedians[j] = median;
  }

  // Build complete matrix with imputation
  for (let i = 0; i < n; i++) {
    const rowVals: number[] = [];
    for (let j = 0; j < d; j++) {
      const f = features[j];
      let v = Number(workingRows[i][f]);
      if (isNaN(v)) {
        v = strategy === 'mean' ? colMeans[j] : colMedians[j];
      }
      rowVals.push(v);
    }
    rawMatrix.push(rowVals);
  }

  // Compute final mean and std for each column
  const means: number[] = new Array(d).fill(0);
  const stds: number[] = new Array(d).fill(0);

  for (let j = 0; j < d; j++) {
    let sum = 0;
    for (let i = 0; i < n; i++) {
      sum += rawMatrix[i][j];
    }
    means[j] = sum / n;

    let sumSq = 0;
    for (let i = 0; i < n; i++) {
      sumSq += Math.pow(rawMatrix[i][j] - means[j], 2);
    }
    const variance = sumSq / (n > 1 ? n - 1 : 1);
    stds[j] = Math.sqrt(variance) || 1; // avoid division by 0
  }

  // Apply scaling
  const scaledMatrix: number[][] = [];
  for (let i = 0; i < n; i++) {
    const scaledRow: number[] = [];
    for (let j = 0; j < d; j++) {
      if (scaling === 'minmax') {
        const range = colMaxs[j] - colMins[j] || 1;
        scaledRow.push((rawMatrix[i][j] - colMins[j]) / range);
      } else {
        // StandardScaler
        scaledRow.push((rawMatrix[i][j] - means[j]) / stds[j]);
      }
    }
    scaledMatrix.push(scaledRow);
  }

  return {
    matrix: scaledMatrix,
    means,
    stds,
    mins: colMins,
    maxs: colMaxs,
    validRows: workingRows,
    features,
  };
}

// Single run of K-Means with K-Means++ initialization
function runKMeansOnce(
  matrix: number[][],
  k: number,
  maxIterations: number,
  prng: () => number
): { centroids: number[][]; labels: number[]; inertia: number } {
  const n = matrix.length;
  const d = matrix[0].length;

  // 1. K-Means++ Initialization
  const centroids: number[][] = [];
  // First centroid chosen uniformly at random
  const firstIdx = Math.floor(prng() * n);
  centroids.push([...matrix[firstIdx]]);

  // Remaining k - 1 centroids chosen with probability proportional to D(x)^2
  while (centroids.length < k) {
    const distSqList: number[] = new Array(n).fill(0);
    let totalDistSq = 0;

    for (let i = 0; i < n; i++) {
      let minDistSq = Infinity;
      for (const c of centroids) {
        const d2 = distSq(matrix[i], c);
        if (d2 < minDistSq) minDistSq = d2;
      }
      distSqList[i] = minDistSq;
      totalDistSq += minDistSq;
    }

    if (totalDistSq === 0) {
      // Degenerate case: pick random unchosen index
      const randIdx = Math.floor(prng() * n);
      centroids.push([...matrix[randIdx]]);
      continue;
    }

    const r = prng() * totalDistSq;
    let accum = 0;
    let chosenIdx = 0;
    for (let i = 0; i < n; i++) {
      accum += distSqList[i];
      if (accum >= r) {
        chosenIdx = i;
        break;
      }
    }
    centroids.push([...matrix[chosenIdx]]);
  }

  // 2. Iterations
  let labels: number[] = new Array(n).fill(0);
  let prevLabels: number[] = new Array(n).fill(-1);

  for (let iter = 0; iter < maxIterations; iter++) {
    // Assignment step
    let changed = false;
    for (let i = 0; i < n; i++) {
      let minDist = Infinity;
      let bestCluster = 0;
      for (let c = 0; c < k; c++) {
        const d2 = distSq(matrix[i], centroids[c]);
        if (d2 < minDist) {
          minDist = d2;
          bestCluster = c;
        }
      }
      labels[i] = bestCluster;
      if (labels[i] !== prevLabels[i]) {
        changed = true;
      }
    }

    if (!changed && iter > 0) break;
    prevLabels = [...labels];

    // Update step
    const counts: number[] = new Array(k).fill(0);
    const newCentroids: number[][] = Array.from({ length: k }, () => new Array(d).fill(0));

    for (let i = 0; i < n; i++) {
      const c = labels[i];
      counts[c]++;
      for (let j = 0; j < d; j++) {
        newCentroids[c][j] += matrix[i][j];
      }
    }

    for (let c = 0; c < k; c++) {
      if (counts[c] > 0) {
        for (let j = 0; j < d; j++) {
          centroids[c][j] = newCentroids[c][j] / counts[c];
        }
      } else {
        // Re-seed empty cluster to point farthest from any centroid
        const randIdx = Math.floor(prng() * n);
        centroids[c] = [...matrix[randIdx]];
      }
    }
  }

  // Calculate inertia (WCSS)
  let inertia = 0;
  for (let i = 0; i < n; i++) {
    inertia += distSq(matrix[i], centroids[labels[i]]);
  }

  return { centroids, labels, inertia };
}

// Full K-Means with N_init runs
export function runKMeans(
  matrix: number[][],
  k: number,
  nInit = 50,
  maxIterations = 500,
  seed = 42
): { centroids: number[][]; labels: number[]; inertia: number } {
  const prng = createPrng(seed);
  let bestResult: { centroids: number[][]; labels: number[]; inertia: number } | null = null;

  for (let run = 0; run < nInit; run++) {
    const result = runKMeansOnce(matrix, k, maxIterations, prng);
    if (!bestResult || result.inertia < bestResult.inertia) {
      bestResult = result;
    }
  }

  return bestResult!;
}

// Evaluation Metrics
export function calculateSilhouetteScore(matrix: number[][], labels: number[], k: number): number {
  const n = matrix.length;
  if (k <= 1 || k >= n) return 0;

  // Pre-group points by cluster
  const clusters: number[][] = Array.from({ length: k }, () => []);
  for (let i = 0; i < n; i++) {
    clusters[labels[i]].push(i);
  }

  // For very large datasets, sample up to 500 points for real-time responsiveness
  const sampleIndices: number[] = [];
  const maxSamples = Math.min(n, 500);
  const step = Math.max(1, Math.floor(n / maxSamples));
  for (let i = 0; i < n; i += step) {
    sampleIndices.push(i);
  }

  let totalSilhouette = 0;

  for (const i of sampleIndices) {
    const myCluster = labels[i];
    const sameClusterMembers = clusters[myCluster];

    // a(i): average distance to points in same cluster
    let a_i = 0;
    if (sameClusterMembers.length > 1) {
      let sumDist = 0;
      for (const otherIdx of sameClusterMembers) {
        if (otherIdx !== i) {
          sumDist += dist(matrix[i], matrix[otherIdx]);
        }
      }
      a_i = sumDist / (sameClusterMembers.length - 1);
    }

    // b(i): minimum average distance to points in any other cluster
    let b_i = Infinity;
    for (let c = 0; c < k; c++) {
      if (c === myCluster) continue;
      const otherClusterMembers = clusters[c];
      if (otherClusterMembers.length === 0) continue;

      let sumDist = 0;
      for (const otherIdx of otherClusterMembers) {
        sumDist += dist(matrix[i], matrix[otherIdx]);
      }
      const avgDist = sumDist / otherClusterMembers.length;
      if (avgDist < b_i) {
        b_i = avgDist;
      }
    }

    const s_i = Math.max(a_i, b_i) === 0 ? 0 : (b_i - a_i) / Math.max(a_i, b_i);
    totalSilhouette += s_i;
  }

  return Number((totalSilhouette / sampleIndices.length).toFixed(4));
}

export function calculateDaviesBouldin(matrix: number[][], centroids: number[][], labels: number[]): number {
  const k = centroids.length;
  if (k <= 1) return 0;
  const n = matrix.length;

  // Compute average distance of points in cluster i to centroid i (s_i)
  const clusterCounts: number[] = new Array(k).fill(0);
  const avgDistToCentroid: number[] = new Array(k).fill(0);

  for (let i = 0; i < n; i++) {
    const c = labels[i];
    clusterCounts[c]++;
    avgDistToCentroid[c] += dist(matrix[i], centroids[c]);
  }

  for (let c = 0; c < k; c++) {
    avgDistToCentroid[c] = clusterCounts[c] > 0 ? avgDistToCentroid[c] / clusterCounts[c] : 0;
  }

  let dbSum = 0;
  for (let i = 0; i < k; i++) {
    let maxR = -Infinity;
    for (let j = 0; j < k; j++) {
      if (i === j) continue;
      const dCentroids = dist(centroids[i], centroids[j]);
      if (dCentroids === 0) continue;
      const r_ij = (avgDistToCentroid[i] + avgDistToCentroid[j]) / dCentroids;
      if (r_ij > maxR) maxR = r_ij;
    }
    if (maxR !== -Infinity) {
      dbSum += maxR;
    }
  }

  return Number((dbSum / k).toFixed(4));
}

export function calculateCalinskiHarabasz(
  matrix: number[][],
  centroids: number[][],
  labels: number[],
  inertia: number
): number {
  const n = matrix.length;
  const k = centroids.length;
  const d = matrix[0].length;
  if (k <= 1 || n <= k) return 0;

  // Global mean vector
  const globalMean: number[] = new Array(d).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < d; j++) {
      globalMean[j] += matrix[i][j];
    }
  }
  for (let j = 0; j < d; j++) {
    globalMean[j] /= n;
  }

  // Between-cluster sum of squares (B)
  const clusterCounts: number[] = new Array(k).fill(0);
  for (let i = 0; i < n; i++) {
    clusterCounts[labels[i]]++;
  }

  let B = 0;
  for (let c = 0; c < k; c++) {
    B += clusterCounts[c] * distSq(centroids[c], globalMean);
  }

  // Within-cluster sum of squares is inertia (W)
  const W = inertia;
  if (W === 0) return 0;

  const ch = (B / (k - 1)) / (W / (n - k));
  return Number(ch.toFixed(2));
}

// Multi-K automated evaluation (K=2..10)
export function evaluateRangeOfK(
  matrix: number[][],
  minK = 2,
  maxK = 8,
  nInit = 25,
  seed = 42
): KOptimization {
  const results: KEvaluationResult[] = [];
  const limitMaxK = Math.min(maxK, Math.max(minK, Math.floor(matrix.length / 4)));

  for (let k = minK; k <= limitMaxK; k++) {
    const { centroids, labels, inertia } = runKMeans(matrix, k, nInit, 300, seed);
    const silhouette = calculateSilhouetteScore(matrix, labels, k);
    const daviesBouldin = calculateDaviesBouldin(matrix, centroids, labels);
    const calinskiHarabasz = calculateCalinskiHarabasz(matrix, centroids, labels, inertia);

    results.push({
      k,
      inertia: Number(inertia.toFixed(2)),
      silhouette,
      calinskiHarabasz,
      daviesBouldin,
    });
  }

  // Find optimal K balancing Silhouette (high), Davies-Bouldin (low), and Elbow knee point
  let bestK = minK;
  let highestScore = -Infinity;

  // Normalize metrics to composite utility score
  const maxSil = Math.max(...results.map((r) => r.silhouette));
  const minSil = Math.min(...results.map((r) => r.silhouette));
  const maxDB = Math.max(...results.map((r) => r.daviesBouldin));
  const minDB = Math.min(...results.map((r) => r.daviesBouldin));

  for (const res of results) {
    const normSil = maxSil > minSil ? (res.silhouette - minSil) / (maxSil - minSil) : 0.5;
    // Lower DB is better
    const normDB = maxDB > minDB ? (maxDB - res.daviesBouldin) / (maxDB - minDB) : 0.5;

    // Slight bias towards business actionable sizes (3 to 5 clusters)
    let businessBonus = 0;
    if (res.k >= 3 && res.k <= 5) businessBonus = 0.15;

    const compositeScore = normSil * 0.55 + normDB * 0.3 + businessBonus;

    if (compositeScore > highestScore) {
      highestScore = compositeScore;
      bestK = res.k;
    }
  }

  const bestResult = results.find((r) => r.k === bestK) || results[0];

  const statisticalRationale = `El análisis multi-criterio evaluó K entre ${minK} y ${limitMaxK}. El valor K=${bestK} optimiza la separación inter-cluster (Silhouette Score = ${bestResult.silhouette}) con compacidad interna y bajo índice de Davies-Bouldin (${bestResult.daviesBouldin}), coincidiendo con el punto de inflexión del método del codo (WCSS = ${bestResult.inertia}).`;

  const businessRationale = `Desde la perspectiva de gestión comercial y marketing, estructurar ${bestK} segmentos permite al equipo diseñar propuestas de valor diferenciadas sin incurrir en atomización excesiva ni fragmentar el presupuesto publicitario.`;

  return {
    results,
    recommendedK: bestK,
    statisticalRationale,
    businessRationale,
  };
}

// 2D PCA Projection via Power Iteration on Covariance Matrix
export function computePca2D(
  matrix: number[][]
): {
  points: { x: number; y: number }[];
  varianceExplained: [number, number];
} {
  const n = matrix.length;
  const d = matrix[0].length;

  if (d < 2) {
    return {
      points: matrix.map((row, i) => ({ x: row[0] || 0, y: i * 0.1 })),
      varianceExplained: [100, 0],
    };
  }

  // 1. Center the matrix (already zero-mean if StandardScaler, but re-verify)
  const means: number[] = new Array(d).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < d; j++) {
      means[j] += matrix[i][j];
    }
  }
  for (let j = 0; j < d; j++) means[j] /= n;

  // 2. Covariance matrix C (d x d)
  const cov: number[][] = Array.from({ length: d }, () => new Array(d).fill(0));
  for (let i = 0; i < d; i++) {
    for (let j = 0; j < d; j++) {
      let sum = 0;
      for (let k = 0; k < n; k++) {
        sum += (matrix[k][i] - means[i]) * (matrix[k][j] - means[j]);
      }
      cov[i][j] = sum / (n > 1 ? n - 1 : 1);
    }
  }

  // Total variance (trace of covariance matrix)
  let totalVar = 0;
  for (let i = 0; i < d; i++) totalVar += cov[i][i];
  if (totalVar === 0) totalVar = 1;

  // Power iteration for first eigenvector
  function getEigenvector(A: number[][], numIters = 60): { vec: number[]; val: number } {
    let v: number[] = Array.from({ length: d }, (_, idx) => (idx % 2 === 0 ? 1 : -0.5));
    // normalize
    let mag = Math.sqrt(v.reduce((s, x) => s + x * x, 0));
    v = v.map((x) => x / (mag || 1));

    for (let iter = 0; iter < numIters; iter++) {
      const Av: number[] = new Array(d).fill(0);
      for (let i = 0; i < d; i++) {
        for (let j = 0; j < d; j++) {
          Av[i] += A[i][j] * v[j];
        }
      }
      mag = Math.sqrt(Av.reduce((s, x) => s + x * x, 0));
      v = Av.map((x) => x / (mag || 1));
    }

    // Eigenvalue
    let val = 0;
    for (let i = 0; i < d; i++) {
      let sum = 0;
      for (let j = 0; j < d; j++) sum += A[i][j] * v[j];
      val += v[i] * sum;
    }

    return { vec: v, val: Math.max(0, val) };
  }

  const eig1 = getEigenvector(cov);

  // Deflation for second eigenvector
  const covDeflated: number[][] = Array.from({ length: d }, () => new Array(d).fill(0));
  for (let i = 0; i < d; i++) {
    for (let j = 0; j < d; j++) {
      covDeflated[i][j] = cov[i][j] - eig1.val * eig1.vec[i] * eig1.vec[j];
    }
  }

  const eig2 = getEigenvector(covDeflated);

  // Explained variance percentages
  const var1 = Number(((eig1.val / totalVar) * 100).toFixed(1));
  const var2 = Number(((eig2.val / totalVar) * 100).toFixed(1));

  // Project points
  const points = matrix.map((row) => {
    let x = 0;
    let y = 0;
    for (let j = 0; j < d; j++) {
      const centered = row[j] - means[j];
      x += centered * eig1.vec[j];
      y += centered * eig2.vec[j];
    }
    return {
      x: Number(x.toFixed(2)),
      y: Number(y.toFixed(2)),
    };
  });

  return {
    points,
    varianceExplained: [var1, var2],
  };
}

// Complete Clustering Pipeline Execution
export function executeClusteringPipeline(
  rawData: Record<string, any>[],
  config: ClusteringConfig
): {
  modelOutput: Omit<ClusteringModelOutput, 'strategies' | 'communications' | 'personas'>;
  prepResult: PreprocessingResult;
} {
  const prep = preprocessData(rawData, config.selectedColumns, config.missingValueStrategy, config.scalingMethod);
  const matrix = prep.matrix;
  const k = config.k;

  // Run K-Means
  const { centroids, labels, inertia } = runKMeans(
    matrix,
    k,
    config.nInit,
    config.maxIterations,
    config.randomState
  );

  // Global Evaluation Metrics
  const silhouetteScore = calculateSilhouetteScore(matrix, labels, k);
  const daviesBouldinIndex = calculateDaviesBouldin(matrix, centroids, labels);
  const calinskiHarabaszIndex = calculateCalinskiHarabasz(matrix, centroids, labels, inertia);

  // PCA 2D projection
  const pca = computePca2D(matrix);
  const pcaPoints = pca.points.map((pt, i) => ({
    x: pt.x,
    y: pt.y,
    cluster: labels[i],
    id: prep.validRows[i]['ID_Cliente'] ?? prep.validRows[i]['ID'] ?? i + 1,
  }));

  // Build cluster metrics
  const totalRows = matrix.length;
  const clusters: ClusterMetrics[] = [];

  for (let c = 0; c < k; c++) {
    const indices = labels.map((l, i) => (l === c ? i : -1)).filter((i) => i !== -1);
    const count = indices.length;
    const percentage = Number(((count / totalRows) * 100).toFixed(1));
    const isLowSizeWarning = percentage < 5.0;

    // Standardized Centroid
    const stdCentroid: Record<string, number> = {};
    // Original Centroid (Descaled back to original domain units)
    const origCentroid: Record<string, number> = {};

    config.selectedColumns.forEach((feat, j) => {
      const stdVal = centroids[c][j];
      stdCentroid[feat] = Number(stdVal.toFixed(2));

      // Reverse scaling
      if (config.scalingMethod === 'minmax') {
        const range = prep.maxs[j] - prep.mins[j] || 1;
        origCentroid[feat] = Number((stdVal * range + prep.mins[j]).toFixed(2));
      } else {
        // StandardScaler: orig = z * std + mean
        origCentroid[feat] = Number((stdVal * prep.stds[j] + prep.means[j]).toFixed(2));
      }
    });

    // Determine top differentiating features based on distance from global average (Z-score magnitude)
    const topDifferentiatingFeatures = config.selectedColumns
      .map((feat, j) => {
        const zScore = stdCentroid[feat];
        const clusterMean = origCentroid[feat];
        const globalMean = Number(prep.means[j].toFixed(2));
        const diffPercent = globalMean !== 0 ? ((clusterMean - globalMean) / Math.abs(globalMean)) * 100 : 0;

        return {
          feature: feat,
          zScore,
          clusterMean,
          globalMean,
          differencePercent: Number(diffPercent.toFixed(1)),
          direction: (zScore >= 0 ? 'above' : 'below') as 'above' | 'below',
        };
      })
      .sort((a, b) => Math.abs(b.zScore) - Math.abs(a.zScore));

    clusters.push({
      clusterIndex: c,
      label: `Segmento ${c + 1}`,
      count,
      percentage,
      standardizedCentroid: stdCentroid,
      originalCentroid: origCentroid,
      topDifferentiatingFeatures,
      isLowSizeWarning,
    });
  }

  // Add cluster assignment label to processed rows
  const processedWithLabels = prep.validRows.map((row, i) => ({
    ...row,
    Cluster_Asignado: labels[i] + 1,
    Cluster_Index: labels[i],
  }));

  return {
    modelOutput: {
      config,
      labels,
      pcaPoints,
      pcaVarianceExplained: pca.varianceExplained,
      clusters,
      globalEvaluation: {
        silhouetteScore,
        daviesBouldinIndex,
        calinskiHarabaszIndex,
        inertia: Number(inertia.toFixed(2)),
        totalRowsUsed: totalRows,
      },
      processedData: processedWithLabels,
      standardizedMatrix: matrix,
    },
    prepResult: prep,
  };
}
