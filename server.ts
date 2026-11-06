import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize server-side Gemini client if API key is present
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Endpoint for Gemini-powered cluster strategic enhancement
app.post('/api/ai/enhance-clusters', async (req, res) => {
  try {
    const { sector, clustersData } = req.body;

    if (!ai) {
      return res.status(200).json({
        fallback: true,
        message: 'No GEMINI_API_KEY configured on server; using advanced analytical heuristics engine.',
      });
    }

    const prompt = `Actúa como un equipo de Científicos de Datos y Directores de Marketing Estratégico.
Analiza la siguiente información de segmentación de clientes basada en clustering K-Means para el sector "${sector}":

DATOS DE LOS CLUSTERS:
${JSON.stringify(clustersData, null, 2)}

Para cada uno de los ${clustersData.length} clusters, genera:
1. "commercialName": Un nombre comercial y descriptivo de alto impacto (máximo 7 palabras, ej: "Consumidores Digitales y Compradores de Equipos", "Adultos Tradicionales de Voz", "Clientes Premium de Alto Valor").
2. "profileDescription": Descripción ejecutiva de su comportamiento y estilo de vida (2-3 oraciones).
3. "needs": Lista de 3 necesidades críticas identificadas.
4. "motivations": Lista de 3 motivaciones de compra principales.
5. "buyingBehavior": Descripción concisa de sus hábitos de compra.
6. "businessOpportunities": 3 oportunidades comerciales de alto valor.
7. "valueProposition": Propuesta de valor única para este segmento.
8. "recommendedProducts": 3 productos o servicios específicos para el sector "${sector}".
9. "pricingStrategy": Estrategia de precios recomendada (ej: Descreme, Penetración, Paquetes, Dinámico).
10. "retentionStrategy": Estrategia de fidelización y retención para evitar churn.
11. "acquisitionStrategy": Estrategia de captación de nuevos perfiles similares.
12. "crossSellingStrategy": Estrategia de venta cruzada.
13. "upSellingStrategy": Estrategia de venta superior (up-selling).
14. "personaPrompt": Un prompt en inglés detallado para generar una fotografía publicitaria profesional que personifique a este segmento (ej: "Commercial advertising photography portrait of a...").

Responde ÚNICAMENTE en formato JSON con la siguiente estructura:
{
  "clusters": [
    {
      "clusterIndex": 0,
      "commercialName": "...",
      "profileDescription": "...",
      "needs": ["...", "...", "..."],
      "motivations": ["...", "...", "..."],
      "buyingBehavior": "...",
      "businessOpportunities": ["...", "...", "..."],
      "valueProposition": "...",
      "recommendedProducts": ["...", "...", "..."],
      "pricingStrategy": "...",
      "retentionStrategy": "...",
      "acquisitionStrategy": "...",
      "crossSellingStrategy": "...",
      "upSellingStrategy": "...",
      "personaPrompt": "..."
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return res.json({ fallback: false, data: parsed });
  } catch (error: any) {
    console.error('Error calling Gemini for cluster enhancement:', error);
    return res.status(200).json({
      fallback: true,
      error: error.message || 'Error processing AI enhancement',
    });
  }
});

// Endpoint for Gemini-powered communication plans
app.post('/api/ai/communication-plan', async (req, res) => {
  try {
    const { sector, clusterInfo } = req.body;

    if (!ai) {
      return res.status(200).json({
        fallback: true,
        message: 'No GEMINI_API_KEY configured on server; using structured heuristics engine.',
      });
    }

    const prompt = `Actúa como Director de Comunicación y Marketing Digital.
Diseña un Plan de Comunicación y mensajes publicitarios para el segmento de clientes:
Sector: ${sector}
Nombre Comercial: ${clusterInfo.commercialName}
Características principales: ${JSON.stringify(clusterInfo.topFeatures || {})}
Participación: ${clusterInfo.percentage}%

Genera en formato JSON:
{
  "objective": "Objetivo principal de comunicación",
  "mainMessage": "Mensaje principal / Slogan publicitario",
  "toneOfVoice": "Tono de comunicación (ej: Cercano, Aspiracional, Técnico, Empático)",
  "recommendedChannels": ["Canal 1", "Canal 2", "Canal 3"],
  "campaignType": "Tipo de campaña principal",
  "contactFrequency": "Frecuencia sugerida de impacto",
  "callToAction": "Llamado a la acción (CTA)",
  "kpis": ["KPI 1", "KPI 2", "KPI 3"],
  "schedule": [
    {"week": "Semana 1", "action": "Acción inicial de concientización"},
    {"week": "Semana 2", "action": "Oferta personalizada de valor"},
    {"week": "Semana 3", "action": "Seguimiento y conversión"},
    {"week": "Semana 4", "action": "Fidelización y recomendación"}
  ],
  "copyExamples": {
    "whatsapp": "Texto para WhatsApp con emojis sobrios y enlace",
    "emailSubject": "Asunto de correo persuasivo",
    "emailBody": "Cuerpo de correo estructurado (150 palabras)",
    "sms": "Mensaje SMS conciso (máximo 160 caracteres)",
    "socialMedia": "Copia para anuncio en redes sociales con hashtags",
    "digitalAd": "Titular y subtítulo para banner publicitario"
  }
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return res.json({ fallback: false, data: parsed });
  } catch (error: any) {
    console.error('Error generating communication plan with Gemini:', error);
    return res.status(200).json({
      fallback: true,
      error: error.message || 'Error processing AI communication plan',
    });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SEGMENTAI] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[SEGMENTAI] Failed to start server:', err);
  process.exit(1);
});
