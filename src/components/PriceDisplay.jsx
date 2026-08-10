/**
 * Componente: PriceDisplay
 *
 * Muestra el precio calculado de forma destacada - Estilo AKAHL Premium.
 * Incluye desglose de costos y botón para nueva cotización.
 */

import { useState } from 'react';

function PriceDisplay({ price, desglose, fabric, garmentType, manufacturingType, onNewQuotation }) {
  const [showDesglose, setShowDesglose] = useState(false);

  // Restar 700 al precio solo cuando es No Bespoke (Industrial)
  const adjustedPrice = manufacturingType === 'No Bespoke' ? price - 700 : price;

  // Format garment type for display
  const formatGarmentType = (type) => {
    return type.replace(/-/g, ' ');
  };

  return (
    <div className="card-premium overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-akahl-secondary/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-akahl-primary/30 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3"></div>
      </div>

      <div className="relative">
        {/* Premium accent line */}
        <div className="h-px bg-gradient-to-r from-akahl-secondary via-akahl-secondary/50 to-akahl-secondary mb-6"></div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-akahl-secondary/60 text-xs uppercase tracking-[0.2em] mb-1">Final Quotation</p>
            <p className="text-neutral-400 text-xs tracking-wider uppercase">
              {manufacturingType} • {formatGarmentType(garmentType)}
            </p>
          </div>
          <button
            onClick={() => setShowDesglose(!showDesglose)}
            className="px-4 py-2 bg-akahl-secondary/10 hover:bg-akahl-secondary/20 rounded-lg text-sm text-akahl-secondary transition-all border border-akahl-secondary/30 active:scale-95"
          >
            {showDesglose ? 'Hide' : 'View'} Details
          </button>
        </div>

        {/* Precio principal Premium */}
        <div className="text-center py-10 relative">
          {/* Decorative swirl */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-akahl-secondary/10 rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-akahl-secondary/5 rounded-full"></div>

          <div className="relative">
            <p className="text-8xl sm:text-9xl font-display font-bold text-gradient-gold tracking-tight animate-scale-in">
              ${adjustedPrice.toFixed(2)}
            </p>
            <div className="flex items-center justify-center gap-2 mt-3">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-akahl-secondary/50"></div>
              <p className="text-akahl-secondary/60 text-sm tracking-[0.2em] uppercase">Retail Price</p>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-akahl-secondary/50"></div>
            </div>
          </div>
        </div>

        {/* Desglose de costos (expandible) */}
        {showDesglose && (
          <div className="mt-6 p-5 bg-akahl-primary-dark/50 rounded-xl animate-fadeIn border border-akahl-secondary/20">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 bg-akahl-secondary rounded-full"></div>
              <h4 className="text-sm font-semibold text-akahl-secondary tracking-[0.15em] uppercase">Price Breakdown</h4>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Base fabric price (meter)</span>
                <span className="font-medium text-white">${fabric.basePricePerMeter.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Meters required</span>
                <span className="font-medium text-white badge-green">{desglose.meters} m</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Total fabric cost</span>
                <span className="font-medium text-akahl-secondary">${desglose.fabricCost.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Labor multiplier</span>
                <span className="font-medium text-white badge-gold">{desglose.multiplier}x</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Labor cost</span>
                <span className="font-medium text-akahl-secondary">${desglose.laborCost.toFixed(2)}</span>
              </div>

              <div className="border-t border-akahl-secondary/20 my-3 pt-3 flex justify-between text-base">
                <span className="font-semibold text-white tracking-wide">Total</span>
                <span className="font-bold text-gradient-gold text-lg">${adjustedPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Botón de nueva cotización Premium */}
        <div className="mt-6">
          <button
            onClick={onNewQuotation}
            className="w-full py-4 bg-gradient-to-r from-akahl-secondary to-akahl-secondary-dark hover:from-akahl-secondary-light hover:to-akahl-secondary active:from-akahl-secondary-dark active:to-akahl-secondary-dark text-akahl-primary font-bold rounded-lg transition-all active:scale-95 flex items-center justify-center gap-2 border border-akahl-secondary/40 shadow-premium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="tracking-[0.1em] uppercase">New Quotation</span>
          </button>
        </div>

        {/* Bottom accent */}
        <div className="h-px bg-gradient-to-r from-transparent via-akahl-secondary/40 to-transparent mt-6"></div>
      </div>
    </div>
  );
}

export default PriceDisplay;
