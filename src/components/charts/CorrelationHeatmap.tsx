import React, { useState } from 'react';

interface Props {
  columns: string[];
  matrix: number[][];
}

export const CorrelationHeatmap: React.FC<Props> = ({ columns, matrix }) => {
  const [hoveredCell, setHoveredCell] = useState<{
    row: string;
    col: string;
    val: number;
    x: number;
    y: number;
  } | null>(null);

  if (!columns || columns.length === 0 || !matrix || matrix.length === 0) return null;

  // Helper to color cells based on Pearson r (-1 to +1)
  const getCellBg = (r: number) => {
    if (r >= 0) {
      // 0 to 1 -> Cyan to Bright Cyan
      const alpha = Math.min(0.9, Math.max(0.05, Math.abs(r)));
      return `rgba(6, 182, 212, ${alpha})`;
    } else {
      // -1 to 0 -> Rose/Red
      const alpha = Math.min(0.9, Math.max(0.05, Math.abs(r)));
      return `rgba(244, 63, 94, ${alpha})`;
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto pb-2">
        <table className="border-collapse text-xs select-none mx-auto">
          <thead>
            <tr>
              <th className="p-2"></th>
              {columns.map((c, i) => (
                <th
                  key={i}
                  className="p-2 font-medium text-slate-300 text-center max-w-[100px] truncate"
                  title={c}
                >
                  <div className="transform -rotate-45 origin-bottom-left inline-block h-12 w-16 truncate">
                    {c}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {columns.map((rowCol, rIdx) => (
              <tr key={rIdx}>
                <td className="p-2 font-medium text-slate-300 text-right whitespace-nowrap pr-3">
                  {rowCol}
                </td>
                {columns.map((colCol, cIdx) => {
                  const val = matrix[rIdx]?.[cIdx] ?? 0;
                  const bg = getCellBg(val);
                  const isPositive = val >= 0;

                  return (
                    <td
                      key={cIdx}
                      className="p-1 border border-slate-800 text-center cursor-pointer transition-transform hover:scale-110 relative"
                      style={{ backgroundColor: bg }}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoveredCell({
                          row: rowCol,
                          col: colCol,
                          val,
                          x: rect.x + rect.width / 2,
                          y: rect.y,
                        });
                      }}
                      onMouseLeave={() => setHoveredCell(null)}
                    >
                      <span
                        className={`font-mono text-[11px] tabular-nums font-semibold ${
                          Math.abs(val) > 0.4 ? 'text-slate-950 font-bold' : 'text-slate-200'
                        }`}
                      >
                        {val === 1 ? '1.0' : val.toFixed(2)}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Floating tooltip */}
      {hoveredCell && (
        <div className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full bg-slate-900 border border-slate-700 text-slate-100 px-3 py-1.5 rounded-lg text-xs shadow-2xl tabular-nums -mt-2">
          <div className="font-semibold text-cyan-300">
            {hoveredCell.row} ↔ {hoveredCell.col}
          </div>
          <div className="text-slate-300">
            Coeficiente r de Pearson:{' '}
            <strong className={hoveredCell.val > 0.5 ? 'text-cyan-400' : hoveredCell.val < -0.5 ? 'text-rose-400' : 'text-slate-200'}>
              {hoveredCell.val.toFixed(3)}
            </strong>
          </div>
        </div>
      )}

      {/* Color Scale Legend */}
      <div className="flex items-center justify-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-rose-500/80 inline-block" />
          <span>Correlación negativa fuerte (-1.0 a -0.5)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-slate-800 inline-block" />
          <span>Sin correlación (~0.0)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-cyan-500/80 inline-block" />
          <span>Correlación positiva fuerte (+0.5 a +1.0)</span>
        </div>
      </div>
    </div>
  );
};
