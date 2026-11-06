import * as XLSX from 'xlsx';

export interface TelecomRecord {
  ID_Cliente: number;
  Edad: number;
  'Minutos preferidos': number;
  Adicionales: number;
  Equipo: number;
  'Minutos no preferidos': number;
  Internet: number;
  Ingreso: number;
  Tipo_Plan: string;
}

// Generate realistic customer records for cellsegmentation2.xlsx
export function generateDemoTelecomRecords(): TelecomRecord[] {
  const records: TelecomRecord[] = [];
  let id = 1001;

  // Cluster A: Consumidores Digitales & Compradores de Equipos (~28%)
  // Young adults, high internet/data, high equipment purchase, moderate-low voice
  for (let i = 0; i < 75; i++) {
    const age = Math.round(21 + Math.random() * 14); // 21 - 35
    const prefMin = Math.round(80 + Math.random() * 120); // 80 - 200 min
    const noPrefMin = Math.round(30 + Math.random() * 70);
    const internet = Math.round(25 + Math.random() * 35); // 25 - 60 GB
    const equipo = Math.round(850 + Math.random() * 650); // $850 - $1500 equipo alta gama
    const adicionales = Math.round(35 + Math.random() * 45); // suscripciones streaming, cloud
    const ingreso = Math.round(1800 + Math.random() * 1600); // $1800 - $3400
    records.push({
      ID_Cliente: id++,
      Edad: age,
      'Minutos preferidos': prefMin,
      Adicionales: adicionales,
      Equipo: equipo,
      'Minutos no preferidos': noPrefMin,
      Internet: internet,
      Ingreso: ingreso,
      Tipo_Plan: Math.random() > 0.3 ? 'Pospago Digital' : 'Pospago Ilimitado',
    });
  }

  // Cluster B: Adultos Tradicionales de Voz (~26%)
  // Older, high preferred voice minutes, low internet/data, low equipment purchase
  for (let i = 0; i < 70; i++) {
    const age = Math.round(52 + Math.random() * 20); // 52 - 72
    const prefMin = Math.round(480 + Math.random() * 420); // 480 - 900 min voz
    const noPrefMin = Math.round(120 + Math.random() * 150);
    const internet = Math.round(2 + Math.random() * 6); // 2 - 8 GB (bajo consumo digital)
    const equipo = Math.round(120 + Math.random() * 180); // $120 - $300 equipo básico
    const adicionales = Math.round(5 + Math.random() * 15);
    const ingreso = Math.round(1400 + Math.random() * 1300); // $1400 - $2700
    records.push({
      ID_Cliente: id++,
      Edad: age,
      'Minutos preferidos': prefMin,
      Adicionales: adicionales,
      Equipo: equipo,
      'Minutos no preferidos': noPrefMin,
      Internet: internet,
      Ingreso: ingreso,
      Tipo_Plan: Math.random() > 0.4 ? 'Plan Voz Plena' : 'Pospago Básico',
    });
  }

  // Cluster C: Clientes Premium de Alto Valor (~22%)
  // High income, high equipment, very high internet & minutes, premium add-ons
  for (let i = 0; i < 60; i++) {
    const age = Math.round(36 + Math.random() * 18); // 36 - 54
    const prefMin = Math.round(550 + Math.random() * 450); // 550 - 1000 min
    const noPrefMin = Math.round(200 + Math.random() * 250);
    const internet = Math.round(50 + Math.random() * 45); // 50 - 95 GB
    const equipo = Math.round(1100 + Math.random() * 800); // $1100 - $1900 flagship
    const adicionales = Math.round(75 + Math.random() * 70); // roaming, multi-line, priority
    const ingreso = Math.round(4500 + Math.random() * 4500); // $4500 - $9000
    records.push({
      ID_Cliente: id++,
      Edad: age,
      'Minutos preferidos': prefMin,
      Adicionales: adicionales,
      Equipo: equipo,
      'Minutos no preferidos': noPrefMin,
      Internet: internet,
      Ingreso: ingreso,
      Tipo_Plan: 'Pospago Black VIP',
    });
  }

  // Cluster D: Jóvenes y Consumo Esencial / Control (~24%)
  // Budget conscious, moderate data, low minutes, low income, low spend
  for (let i = 0; i < 65; i++) {
    const age = Math.round(18 + Math.random() * 12); // 18 - 30
    const prefMin = Math.round(60 + Math.random() * 90); // 60 - 150 min
    const noPrefMin = Math.round(15 + Math.random() * 35);
    const internet = Math.round(8 + Math.random() * 10); // 8 - 18 GB
    const equipo = Math.round(150 + Math.random() * 220); // $150 - $370 gama media
    const adicionales = Math.round(2 + Math.random() * 12);
    const ingreso = Math.round(650 + Math.random() * 700); // $650 - $1350
    records.push({
      ID_Cliente: id++,
      Edad: age,
      'Minutos preferidos': prefMin,
      Adicionales: adicionales,
      Equipo: equipo,
      'Minutos no preferidos': noPrefMin,
      Internet: internet,
      Ingreso: ingreso,
      Tipo_Plan: Math.random() > 0.5 ? 'Prepago Control' : 'Flex Estudiante',
    });
  }

  // Shuffle dataset deterministically for authentic random appearance
  let seed = 42;
  const random = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  for (let i = records.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [records[i], records[j]] = [records[j], records[i]];
  }

  return records;
}

// Generates an Excel workbook file blob of cellsegmentation2.xlsx
export function downloadDemoTelecomExcel(): void {
  const records = generateDemoTelecomRecords();
  const ws = XLSX.utils.json_to_sheet(records);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Datos_Clientes');
  XLSX.writeFile(wb, 'cellsegmentation2.xlsx');
}
