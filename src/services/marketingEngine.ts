import {
  ClusterMetrics,
  CommunicationPlan,
  EconomicSector,
  StrategicMarketingPlan,
  VisualPersona,
} from '../types/segmentai';

// Pre-generated advertising photography personas for the core archetypes
const DEFAULT_PERSONA_IMAGES = [
  '/src/assets/images/persona_digital_tech_1793931832624.jpg',
  '/src/assets/images/persona_traditional_voice_1793931833299.jpg',
  '/src/assets/images/persona_premium_vip_1793931834043.jpg',
  '/src/assets/images/persona_value_saver_1793931834960.jpg',
];

// Contextual heuristic naming and strategy generator based on cluster centroid signatures
export function generateStrategicPlans(
  clusters: ClusterMetrics[],
  sector: EconomicSector | string
): {
  strategies: Record<number, StrategicMarketingPlan>;
  communications: Record<number, CommunicationPlan>;
  personas: Record<number, VisualPersona>;
} {
  const strategies: Record<number, StrategicMarketingPlan> = {};
  const communications: Record<number, CommunicationPlan> = {};
  const personas: Record<number, VisualPersona> = {};

  clusters.forEach((cl, idx) => {
    const topFeats = cl.topDifferentiatingFeatures;
    const highestPos = topFeats.filter((f) => f.direction === 'above');
    const highestNeg = topFeats.filter((f) => f.direction === 'below');

    // Detect behavioral signature from centroid features
    const featNames = topFeats.map((f) => f.feature.toLowerCase());
    const isHighTechOrData = topFeats.some(
      (f) =>
        (f.feature.toLowerCase().includes('internet') ||
          f.feature.toLowerCase().includes('equipo') ||
          f.feature.toLowerCase().includes('digital') ||
          f.feature.toLowerCase().includes('tecnolog')) &&
        f.direction === 'above'
    );
    const isHighVoiceOrSenior = topFeats.some(
      (f) =>
        (f.feature.toLowerCase().includes('edad') ||
          f.feature.toLowerCase().includes('minutos') ||
          f.feature.toLowerCase().includes('voz') ||
          f.feature.toLowerCase().includes('tradicional')) &&
        f.direction === 'above'
    );
    const isHighIncomeOrVip = topFeats.some(
      (f) =>
        (f.feature.toLowerCase().includes('ingreso') ||
          f.feature.toLowerCase().includes('gasto') ||
          f.feature.toLowerCase().includes('adicionales') ||
          f.feature.toLowerCase().includes('premium')) &&
        f.direction === 'above' &&
        f.zScore > 0.4
    );
    const isBudgetOrLowSpend = topFeats.some(
      (f) =>
        (f.feature.toLowerCase().includes('ingreso') ||
          f.feature.toLowerCase().includes('equipo') ||
          f.feature.toLowerCase().includes('gasto')) &&
        f.direction === 'below'
    );

    let commercialName = `Segmento ${idx + 1}: Perfil de Valor`;
    let archetypeTitle = 'Cliente de Valor Estratégico';
    let demographicHint = 'Usuarios de consumo balanceado';
    let keyMotto = 'Calidad y eficiencia comprobada.';

    if (isHighIncomeOrVip) {
      commercialName = `Clientes Premium de Alto Valor`;
      archetypeTitle = 'Líder Ejecutivo & Alta Gama';
      demographicHint = 'Adultos 35-55 años con alto poder adquisitivo y alta demanda de servicios';
      keyMotto = 'Excelencia sin interrupciones ni límites.';
    } else if (isHighTechOrData && !isHighVoiceOrSenior) {
      commercialName = `Consumidores Digitales y Compradores de Equipos`;
      archetypeTitle = 'Innovador Digital & Conectividad Total';
      demographicHint = 'Jóvenes profesionales 22-38 años hiperconectados y adictos al streaming';
      keyMotto = 'Velocidad, tecnología de punta y autonomía.';
    } else if (isHighVoiceOrSenior) {
      commercialName = `Adultos Tradicionales de Voz`;
      archetypeTitle = 'Usuario Fiel & Comunicación Directa';
      demographicHint = 'Segmento maduro 48-70 años que prioriza el contacto humano y la certeza';
      keyMotto = 'Confianza, claridad y atención personalizada.';
    } else if (isBudgetOrLowSpend) {
      commercialName = `Jóvenes y Consumo Esencial`;
      archetypeTitle = 'Consumidor Inteligente de Presupuesto Controlado';
      demographicHint = 'Estudiantes y primeros empleos 18-30 años buscando máxima relación costo-beneficio';
      keyMotto = 'Máximo rendimiento sin sorpresas en la factura.';
    } else {
      // Dynamic synthesis from strongest positive feature
      const strongest = highestPos[0]?.feature || 'Comportamiento Específico';
      commercialName = `Segmento Focalizado en ${strongest}`;
      archetypeTitle = `Especialista en ${strongest}`;
      demographicHint = `Grupo con afinidad destacada en ${strongest}`;
    }

    // 13 Strategic Pillars
    const topDiffSummary = highestPos.map((f) => `${f.feature} (+${f.differencePercent}%)`).join(', ');
    const lowDiffSummary = highestNeg.map((f) => `${f.feature} (${f.differencePercent}%)`).join(', ');

    strategies[cl.clusterIndex] = {
      commercialName,
      profileDescription: `Representa el ${cl.percentage}% de la cartera (${cl.count} registros). Sobresale por valores significativamente superiores en ${topDiffSummary || 'variables clave'}${lowDiffSummary ? ` y menor demanda en ${lowDiffSummary}` : ''}. Su comportamiento responde a patrones consolidados dentro del sector ${sector}.`,
      needs: [
        `Garantía de rendimiento continuo en sus variables prioritarias (${highestPos[0]?.feature || 'servicio principal'}).`,
        `Transparencia operativa y esquemas tarifarios acordes a su perfil de consumo.`,
        `Atención y soporte omnicanal adaptado a sus preferencias de interacción.`,
      ],
      motivations: [
        isHighIncomeOrVip
          ? 'Prestigio, prioridad en servicio y acceso a lo último del mercado'
          : isHighTechOrData
          ? 'Novedad tecnológica, velocidad y autoservicio digital'
          : isHighVoiceOrSenior
          ? 'Estabilidad, atención humana y ausencia de complicaciones técnicas'
          : 'Optimización de presupuesto y control total del gasto',
        'Sentimiento de correspondencia justa entre costo y beneficio recibido',
        'Facilidad para escalar o ajustar planes sin penalizaciones',
      ],
      buyingBehavior: isHighIncomeOrVip
        ? 'Decisiones basadas en calidad y conveniencia; baja sensibilidad al precio y alta lealtad si se respeta su tiempo.'
        : isHighTechOrData
        ? 'Compara opciones en línea, responde activamente a lanzamientos de hardware y paquetes con beneficios de entretenimiento.'
        : isHighVoiceOrSenior
        ? 'Compra reflexiva y presencial/telefónica; alta fidelidad cuando experimenta buen trato y facturación clara.'
        : 'Sensible al precio y promociones temporales; busca planes con recarga flexible y sin contratos forzosos.',
      businessOpportunities: [
        `Desarrollo de planes paquetizados con atributos específicos para su nivel de ${highestPos[0]?.feature || 'consumo'}.`,
        `Monetización mediante ventas cruzadas en categorías complementarias del sector ${sector}.`,
        `Blindaje preventivo contra competidores agresivos en precio mediante programas de fidelidad.`,
      ],
      valueProposition: `Ofrecer una experiencia integral en ${sector} diseñada a la medida de quienes priorizan ${highestPos[0]?.feature || 'calidad'}, eliminando fricciones y maximizando su satisfacción diaria.`,
      recommendedProducts: [
        isHighIncomeOrVip
          ? `Plan Premium Concierge con atención preferencial y beneficios VIP para ${sector}`
          : isHighTechOrData
          ? `Paquete Conectividad Total con subsidio en equipos de última generación`
          : isHighVoiceOrSenior
          ? `Plan Familiar Comunica con minutos ilimitados y asistencia telefónica senior`
          : `Plan Smart Flex con control de gasto en tiempo real y rollover de saldo`,
        `Servicios adicionales de valor agregado (seguros, streaming o asistencia técnica)`,
        `Programa de renovación periódica con condiciones preferenciales`,
      ],
      pricingStrategy: isHighIncomeOrVip
        ? 'Estrategia de precios por valor percibido (Value-Based Pricing) y paquetes cerrados todo incluido sin tarifas ocultas.'
        : isHighTechOrData
        ? 'Precios escalonados con cuotas financiadas de hardware y recompensas por consumo digital continuo.'
        : isHighVoiceOrSenior
        ? 'Tarifa plana predecible con garantías de congelamiento de precio a cambio de permanencia voluntaria.'
        : 'Estrategia de penetración y precio psicológico competitivo con micropagos y facilidades de activación.',
      retentionStrategy: `Seguimiento proactivo de satisfacción, detección temprana de caídas en su métrica clave (${highestPos[0]?.feature || 'uso'}) y bonificaciones sorpresa en aniversarios del contrato.`,
      acquisitionStrategy: `Campañas segmentadas en canales digitales y puntos estratégicos destacando testimonios reales y la ventaja comparativa en ${highestPos[0]?.feature || 'prestaciones'}.`,
      crossSellingStrategy: `Recomendación de servicios complementarios pertinentes (ej. protección de equipos, suscripciones colaborativas o asistencias especializadas) justo en momentos de alta satisfacción.`,
      upSellingStrategy: `Incentivos de migración al nivel inmediatamente superior ofreciendo un mes de prueba gratuita con acceso a beneficios de la gama alta.`,
    };

    // Communication Plan
    communications[cl.clusterIndex] = {
      objective: `Posicionar la propuesta de valor de ${sector} e incrementar el compromiso y ticket promedio del segmento "${commercialName}".`,
      mainMessage: isHighIncomeOrVip
        ? 'Tu nivel de exigencia merece un servicio que supere cualquier expectativa.'
        : isHighTechOrData
        ? 'Conéctate al futuro con la mayor velocidad y los dispositivos que marcan tendencia.'
        : isHighVoiceOrSenior
        ? 'Siempre cerca de quienes más quieres, con la claridad y confianza de siempre.'
        : 'El control y la libertad que buscas, cuidando tu bolsillo en cada paso.',
      toneOfVoice: isHighIncomeOrVip
        ? 'Sofisticado, exclusivo, respetuoso y orientado a la excelencia'
        : isHighTechOrData
        ? 'Dinámico, fresco, vanguardista e intuitivo'
        : isHighVoiceOrSenior
        ? 'Cálido, claro, empático y paciente'
        : 'Cercano, práctico, transparente y optimista',
      recommendedChannels: isHighIncomeOrVip
        ? ['Ejecutivo de Cuenta / Concierge', 'Correo Electrónico VIP', 'Notificaciones de App Exclusiva']
        : isHighTechOrData
        ? ['WhatsApp Business interactivo', 'Redes Sociales (Instagram, TikTok)', 'Push Notifications']
        : isHighVoiceOrSenior
        ? ['Llamada de servicio personalizada', 'SMS directo', 'Punto de atención presencial']
        : ['WhatsApp automatizado', 'Publicidad en redes sociales', 'Banners en web y app'],
      campaignType: isHighIncomeOrVip
        ? 'Campaña de Reconocimiento y Fidelización VIP'
        : isHighTechOrData
        ? 'Campaña de Lanzamiento y Actualización Tecnológica'
        : isHighVoiceOrSenior
        ? 'Campaña de Lealtad y Atención Cercana'
        : 'Campaña de Valor Esencial y Ahorro Inteligente',
      contactFrequency: isHighIncomeOrVip
        ? 'Quincenal o mensual, con contenido altamente curado'
        : isHighTechOrData
        ? 'Semanal con ofertas dinámicas y tips interactivos'
        : isHighVoiceOrSenior
        ? 'Mensual, enfocada en fechas de corte y novedades directas'
        : 'Quincenal, coincidiendo con ciclos de pago habituales',
      callToAction: isHighIncomeOrVip
        ? 'Descubre tus beneficios exclusivos'
        : isHighTechOrData
        ? 'Activa tu nueva experiencia hoy'
        : isHighVoiceOrSenior
        ? 'Llámanos gratis para acompañarte'
        : 'Aprovecha tu tarifa especial aquí',
      kpis: [
        'Tasa de Apertura y Lectura (Open Rate > 35%)',
        'Tasa de Conversión a Oferta Personalizada (CR > 8%)',
        'Reducción de Tasa de Churn en 15% a 90 días',
        'Incremento de ARPU (Ingreso promedio por usuario)',
      ],
      schedule: [
        { week: 'Semana 1', action: 'Lanzamiento de mensaje de agradecimiento y presentación del nuevo plan de beneficios.' },
        { week: 'Semana 2', action: 'Envío de oferta de valor exclusiva con incentivo directo para activar.' },
        { week: 'Semana 3', action: 'Recordatorio con testimonio y resolución interactiva de dudas vía canal preferido.' },
        { week: 'Semana 4', action: 'Evaluación de satisfacción rápida (NPS) y entrega de recompensa por permanencia.' },
      ],
      copyExamples: {
        whatsapp: `Hola! 🌟 En SEGMENTAI sabemos que para ti ${highestPos[0]?.feature || 'la calidad'} es lo primero. Queremos que disfrutes de tu plan "${commercialName}" con beneficios creados exclusivamente para ti. Revisa los detalles aquí: https://tu-empresa.com/segmento-${idx + 1}`,
        emailSubject: `[Exclusivo] Diseñado para ti: La nueva era de tu servicio en ${sector}`,
        emailBody: `Estimado(a) cliente:\n\nPorque tu tranquilidad y rendimiento son nuestra prioridad, hemos actualizado tu perfil dentro de la categoría "${commercialName}".\n\nDisfruta de mayores ventajas en ${topDiffSummary || 'tus servicios diarios'} sin trámites complicados.\n\nHaz clic en el enlace para conocer tus beneficios activos hoy mismo.`,
        sms: `SEGMENTAI: Tienes disponible una mejora exclusiva en tu plan ${commercialName}. Conoce mas y activalo hoy en bit.ly/promo-seg${idx + 1}`,
        socialMedia: `¿Buscas más de lo que realmente usas? Conoce la solución de ${sector} pensada para ${commercialName}. #Innovacion #${sector.replace(/\s+/g, '')} #SEGMENTAI`,
        digitalAd: `Exclusivo para ${commercialName} | Potencia tu experiencia en ${sector} con la máxima calidad garantizada.`,
      },
    };

    // Persona visual assignment
    const assignedImage = DEFAULT_PERSONA_IMAGES[idx % DEFAULT_PERSONA_IMAGES.length];
    personas[cl.clusterIndex] = {
      clusterIndex: cl.clusterIndex,
      clusterName: commercialName,
      imageUrl: assignedImage,
      imagePrompt: `Commercial advertising photography portrait of a person representing ${commercialName} in the ${sector} industry, natural corporate or lifestyle lighting, 8k commercial quality.`,
      archetypeTitle,
      demographicHint,
      keyMotto,
      isAiGenerated: true,
    };
  });

  return { strategies, communications, personas };
}

// Enhances clusters using Gemini API through server proxy
export async function enhanceClustersWithAi(
  clusters: ClusterMetrics[],
  sector: EconomicSector | string
): Promise<{
  strategies?: Record<number, StrategicMarketingPlan>;
  communications?: Record<number, CommunicationPlan>;
  personas?: Record<number, VisualPersona>;
}> {
  try {
    const response = await fetch('/api/ai/enhance-clusters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sector,
        clustersData: clusters.map((c) => ({
          clusterIndex: c.clusterIndex,
          count: c.count,
          percentage: c.percentage,
          topFeatures: c.topDifferentiatingFeatures.slice(0, 4),
          originalCentroid: c.originalCentroid,
        })),
      }),
    });

    if (!response.ok) {
      throw new Error('Network error calling AI enhancement');
    }

    const data = await response.json();
    if (data.fallback || !data.data?.clusters) {
      // Return heuristic fallback
      return generateStrategicPlans(clusters, sector);
    }

    const aiClusters = data.data.clusters as any[];
    const strategies: Record<number, StrategicMarketingPlan> = {};
    const personas: Record<number, VisualPersona> = {};

    aiClusters.forEach((item, i) => {
      const idx = item.clusterIndex !== undefined ? item.clusterIndex : i;
      strategies[idx] = {
        commercialName: item.commercialName || `Segmento ${idx + 1}`,
        profileDescription: item.profileDescription || '',
        needs: item.needs || [],
        motivations: item.motivations || [],
        buyingBehavior: item.buyingBehavior || '',
        businessOpportunities: item.businessOpportunities || [],
        valueProposition: item.valueProposition || '',
        recommendedProducts: item.recommendedProducts || [],
        pricingStrategy: item.pricingStrategy || '',
        retentionStrategy: item.retentionStrategy || '',
        acquisitionStrategy: item.acquisitionStrategy || '',
        crossSellingStrategy: item.crossSellingStrategy || '',
        upSellingStrategy: item.upSellingStrategy || '',
      };

      personas[idx] = {
        clusterIndex: idx,
        clusterName: item.commercialName || `Segmento ${idx + 1}`,
        imageUrl: DEFAULT_PERSONA_IMAGES[idx % DEFAULT_PERSONA_IMAGES.length],
        imagePrompt: item.personaPrompt || `Commercial portrait of ${item.commercialName}`,
        archetypeTitle: item.commercialName,
        demographicHint: item.profileDescription?.slice(0, 80) || '',
        keyMotto: item.valueProposition?.slice(0, 60) || '',
        isAiGenerated: true,
      };
    });

    // Also populate communications
    const defaultRes = generateStrategicPlans(clusters, sector);
    return {
      strategies,
      communications: defaultRes.communications,
      personas,
    };
  } catch (err) {
    console.warn('AI enhancement fallback to heuristics:', err);
    return generateStrategicPlans(clusters, sector);
  }
}
