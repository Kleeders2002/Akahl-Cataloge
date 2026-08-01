/**
 * Componente: PriceDisplay
 *
 * Muestra el precio calculado de forma destacada - Estilo AKAHL.
 * Incluye desglose de costos y botón para nueva cotización.
 */

import { useState } from 'react';

function PriceDisplay({ price, desglose, fabric, garmentType, manufacturingType, onNewQuotation }) {
  const [showDesglose, setShowDesglose] = useState(false);

  return (
    <div className="card bg-gradient-to-br from-white to-neutral-100 overflow-hidden">
      {/* Elemento decorativo */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-neutral-900 opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-neutral-600 text-sm uppercase tracking-wide">Final Price</p>
            <p className="text-xs text-neutral-500 mt-1">
              {manufacturingType} • {garmentType}
            </p>
          </div>
          <button
            onClick={() => setShowDesglose(!showDesglose)}
            className="px-3 py-1.5 bg-neutral-900/5 hover:bg-neutral-900/10 rounded-lg text-sm text-neutral-700 transition-colors border border-neutral-900/10"
          >
            {showDesglose ? 'Hide' : 'View'} Details
          </button>
        </div>

        {/* Precio principal */}
        <div className="text-center py-8">
          <p className="text-7xl sm:text-8xl font-display font-semibold bg-gradient-to-br from-neutral-900 to-neutral-700 bg-clip-text text-transparent tracking-tight">
            ${price.toFixed(2)}
          </p>
          <p className="text-neutral-600 mt-2 tracking-wide">Retail Price</p>
        </div>

        {/* Desglose de costos (expandible) */}
        {showDesglose && (
          <div className="mt-6 p-4 bg-neutral-900 rounded-xl animate-fadeIn">
            <h4 className="text-sm font-semibold text-white mb-3 tracking-wide">PRICE BREAKDOWN</h4>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-400">Base fabric price (meter)</span>
                <span className="font-medium text-white">${fabric.basePricePerMeter.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-neutral-400">Meters required</span>
                <span className="font-medium text-white">{desglose.meters} m</span>
              </div>

              <div className="flex justify-between">
                <span className="text-neutral-400">Total fabric cost</span>
                <span className="font-medium text-white">${desglose.fabricCost.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-neutral-400">Labor multiplier</span>
                <span className="font-medium text-white">{desglose.multiplier}x</span>
              </div>

              <div className="flex justify-between">
                <span className="text-neutral-400">Labor cost</span>
                <span className="font-medium text-white">${desglose.laborCost.toFixed(2)}</span>
              </div>

              <div className="border-t border-white/10 my-2 pt-2 flex justify-between text-base">
                <span className="font-semibold text-white">Total</span>
                <span className="font-bold text-white">${price.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Botón de nueva cotización */}
        <div className="mt-6">
          <button
            onClick={onNewQuotation}
            className="w-full py-4 bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700 text-white font-semibold rounded-lg transition-all active:scale-95 flex items-center justify-center gap-2 border border-white/20"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Quotation
          </button>
        </div>
      </div>
    </div>
  );
}

export default PriceDisplay;
