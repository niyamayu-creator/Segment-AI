export type EconomicSector =
  | 'Telecomunicaciones'
  | 'Banca y finanzas'
  | 'Comercio minorista'
  | 'Retail'
  | 'Salud'
  | 'Educación'
  | 'Turismo'
  | 'Seguros'
  | 'Manufactura'
  | 'Transporte'
  | 'Alimentos y bebidas'
  | 'Inmobiliario'
  | 'Tecnología'
  | 'Otro';

export interface ColumnMetadata {
  name: string;
  type: 'numeric' | 'categorical' | 'id' | 'datetime';
  missingCount: number;
  missingPercentage: number;
  uniqueCount: number;
  sampleValues: any[];
  isLikelyId: boolean;
  selectedForClustering: boolean;
}

export interface DatasetSummary {
  fileName: string;
  fileSize: number;
  totalRows: number;
  totalColumns: number;
  numericCount: number;
  categoricalCount: number;
  totalMissingValues: number;
  duplicateRows: number;
  sheetNames?: string[];
  activeSheet?: string;
  columns: ColumnMetadata[];
  previewRows: Record<string, any>[];
  rawData: Record<string, any>[];
}

export interface NumericStats {
  column: string;
  count: number;
  mean: number;
  median: number;
  mode: number;
  stdDev: number;
  variance: number;
  min: number;
  max: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
  cv: number; // Coefficient of variation (%)
  skewness: number;
  kurtosis: number;
  iqr: number;
  outlierCount: number;
}

export interface CategoricalStats {
  column: string;
  total: number;
  uniqueCount: number;
  mode: string;
  frequencies: { value: string; count: number; percentage: number }[];
}

export interface DescriptiveReport {
  numericStats: NumericStats[];
  categoricalStats: CategoricalStats[];
  correlations: {
    columns: string[];
    matrix: number[][];
  };
  qualityIssues: {
    type: 'outlier' | 'missing' | 'redundancy' | 'identifier' | 'zero_variance';
    severity: 'low' | 'medium' | 'high';
    column: string;
    message: string;
    recommendation: string;
  }[];
  executiveSummary: string;
}

export interface KEvaluationResult {
  k: number;
  inertia: number; // WCSS
  silhouette: number;
  calinskiHarabasz: number;
  daviesBouldin: number;
}

export interface KOptimization {
  results: KEvaluationResult[];
  recommendedK: number;
  statisticalRationale: string;
  businessRationale: string;
}

export interface ClusteringConfig {
  k: number;
  randomState: number;
  nInit: number;
  maxIterations: number;
  scalingMethod: 'standard' | 'minmax';
  missingValueStrategy: 'mean' | 'median' | 'mode' | 'drop';
  selectedColumns: string[];
  algorithm: 'kmeans' | 'hierarchical';
}

export interface ClusterMetrics {
  clusterIndex: number;
  label: string;
  count: number;
  percentage: number;
  standardizedCentroid: Record<string, number>;
  originalCentroid: Record<string, number>;
  topDifferentiatingFeatures: {
    feature: string;
    zScore: number;
    clusterMean: number;
    globalMean: number;
    differencePercent: number;
    direction: 'above' | 'below';
  }[];
  isLowSizeWarning: boolean;
}

export interface StrategicMarketingPlan {
  commercialName: string;
  profileDescription: string;
  needs: string[];
  motivations: string[];
  buyingBehavior: string;
  businessOpportunities: string[];
  valueProposition: string;
  recommendedProducts: string[];
  pricingStrategy: string;
  retentionStrategy: string;
  acquisitionStrategy: string;
  crossSellingStrategy: string;
  upSellingStrategy: string;
}

export interface CommunicationPlan {
  objective: string;
  mainMessage: string;
  toneOfVoice: string;
  recommendedChannels: string[];
  campaignType: string;
  contactFrequency: string;
  callToAction: string;
  kpis: string[];
  schedule: { week: string; action: string }[];
  copyExamples: {
    whatsapp: string;
    emailSubject: string;
    emailBody: string;
    sms: string;
    socialMedia: string;
    digitalAd: string;
  };
}

export interface VisualPersona {
  clusterIndex: number;
  clusterName: string;
  imageUrl: string;
  imagePrompt: string;
  archetypeTitle: string;
  demographicHint: string;
  keyMotto: string;
  isAiGenerated: boolean;
}

export interface ClusteringModelOutput {
  config: ClusteringConfig;
  labels: number[]; // cluster index per row
  pcaPoints: { x: number; y: number; cluster: number; id: string | number }[];
  pcaVarianceExplained: [number, number]; // [PC1 %, PC2 %]
  clusters: ClusterMetrics[];
  globalEvaluation: {
    silhouetteScore: number;
    daviesBouldinIndex: number;
    calinskiHarabaszIndex: number;
    inertia: number;
    totalRowsUsed: number;
  };
  processedData: Record<string, any>[];
  standardizedMatrix: number[][];
  strategies: Record<number, StrategicMarketingPlan>;
  communications: Record<number, CommunicationPlan>;
  personas: Record<number, VisualPersona>;
}
