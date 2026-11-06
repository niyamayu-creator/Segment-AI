import React, { useState } from 'react';
import {
  Radio,
  Building,
  ShoppingBag,
  Store,
  HeartPulse,
  GraduationCap,
  Palmtree,
  Shield,
  Factory,
  Truck,
  Coffee,
  Home,
  Laptop,
  HelpCircle,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import { EconomicSector } from '../../types/segmentai';

interface Props {
  selectedSector: EconomicSector | string;
  onSelectSector: (sector: EconomicSector | string) => void;
  onProceed: () => void;
}

const SECTOR_OPTIONS: { name: EconomicSector; icon: any; desc: string }[] = [
  { name: 'Telecomunicaciones', icon: Radio, desc: 'Planes móviles, consumo de datos, minutos, recargas y adquisición de equipos.' },
  { name: 'Banca y finanzas', icon: Building, desc: 'Tarjetas de crédito, préstamos, saldos de ahorro, transacciones e inversiones.' },
  { name: 'Comercio minorista', icon: ShoppingBag, desc: 'Frecuencia de compra, ticket promedio, categorías de producto y promociones.' },
  { name: 'Retail', icon: Store, desc: 'Grandes superficies, programas de lealtad, omnicanalidad y recurrencia.' },
  { name: 'Salud', icon: HeartPulse, desc: 'Pólizas médicas, uso de servicios clínicos, perfiles preventivos y telemedicina.' },
  { name: 'Educación', icon: GraduationCap, desc: 'Programas académicos, permanencia, tasas de finalización y educación continua.' },
  { name: 'Turismo', icon: Palmtree, desc: 'Reservas hoteleras, vuelos, paquetes vacacionales y viajeros corporativos vs ocio.' },
  { name: 'Seguros', icon: Shield, desc: 'Pólizas de vida, hogar, autos, siniestralidad y niveles de cobertura contratada.' },
  { name: 'Manufactura', icon: Factory, desc: 'Volumen de pedidos B2B, cadenas de suministro, recurrencia de insumos y contratos.' },
  { name: 'Transporte', icon: Truck, desc: 'Logística de carga, movilidad urbana, flotas y frecuencia de trayectos.' },
  { name: 'Alimentos y bebidas', icon: Coffee, desc: 'Canales de distribución, consumo masivo, preferencias dietéticas y empaques.' },
  { name: 'Inmobiliario', icon: Home, desc: 'Arrendamientos, compraventa de propiedades, zonas geográficas y perfil inversionista.' },
  { name: 'Tecnología', icon: Laptop, desc: 'SaaS, licencias corporativas, usuarios activos mensuales (MAU) y consumo cloud.' },
  { name: 'Otro', icon: HelpCircle, desc: 'Define un sector económico personalizado para contextualizar las estrategias.' },
];

export const Step3Sector: React.FC<Props> = ({
  selectedSector,
  onSelectSector,
  onProceed,
}) => {
  const [customSector, setCustomSector] = useState(
    SECTOR_OPTIONS.some((s) => s.name === selectedSector) ? '' : selectedSector
  );
  const [isCustomMode, setIsCustomMode] = useState(
    !SECTOR_OPTIONS.some((s) => s.name === selectedSector) || selectedSector === 'Otro'
  );

  const handleSelect = (sectorName: EconomicSector) => {
    if (sectorName === 'Otro') {
      setIsCustomMode(true);
      onSelectSector(customSector || 'Sector Personalizado');
    } else {
      setIsCustomMode(false);
      onSelectSector(sectorName);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customSector.trim()) {
      onSelectSector(customSector.trim());
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-2">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          ¿Cuál es el sector económico que deseas analizar?
        </h2>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          El sector seleccionado contextualiza de manera rigurosa la interpretación de los centroides, los nombres comerciales generados, la propuesta de valor y las recomendaciones estratégicas posteriores.
        </p>
      </div>

      {/* Grid of Sector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {SECTOR_OPTIONS.map((item) => {
          const Icon = item.icon;
          const isSelected =
            (selectedSector === item.name && !isCustomMode) ||
            (item.name === 'Otro' && isCustomMode);

          return (
            <button
              key={item.name}
              onClick={() => handleSelect(item.name)}
              className={`p-4 rounded-xl text-left border transition-all flex flex-col justify-between gap-3 group relative cursor-pointer ${
                isSelected
                  ? 'bg-cyan-500/15 border-cyan-400/80 shadow-lg shadow-cyan-950/40 scale-[1.01]'
                  : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-400 group-hover:text-cyan-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                {isSelected && (
                  <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                )}
              </div>

              <div>
                <h3 className="text-xs font-bold text-white tracking-tight">
                  {item.name}
                </h3>
                <p className="text-[11px] text-slate-400 leading-snug mt-1">
                  {item.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Custom Sector Input if 'Otro' */}
      {isCustomMode && (
        <form
          onSubmit={handleCustomSubmit}
          className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2"
        >
          <label className="text-xs font-semibold text-slate-200">
            Escribe el nombre de tu sector o nicho de mercado:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={customSector}
              onChange={(e) => {
                setCustomSector(e.target.value);
                onSelectSector(e.target.value);
              }}
              placeholder="Ej: Fintech de Remesas, Consultoría B2B, Gimnasios y Fitness..."
              className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
            >
              Fijar Sector
            </button>
          </div>
        </form>
      )}

      {/* Confirmation & Next Button */}
      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between gap-4">
        <div className="text-xs text-slate-300">
          Sector activo para contextualización: <strong className="text-cyan-300">{selectedSector}</strong>
        </div>

        <button
          onClick={onProceed}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
        >
          <span>CONTINUAR: ANÁLISIS DESCRIPTIVO</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
