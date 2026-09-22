/**
 * Componente: GarmentPriceModal
 *
 * Modal que muestra todos los tipos de prenda con sus precios
 * Se abre al seleccionar una tela desde la tabla
 */

import { useState, useEffect } from 'react';
import { calculateAllPrices } from '../services/api';
import { MANUFACTURING_TYPES, GARMENT_TYPES, applyManufacturingAdjustment } from '../constants';

function GarmentPriceModal({ fabric, onClose, onActivity }) {
  const [selectedManufacturing, setSelectedManufacturing] = useState('bespoke');
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPrices = async () => {
      setLoading(true);
      try {
        const result = await calculateAllPrices({
          fabricCode: fabric.codigo,
        });
        setPrices(result.prices);
      } catch (error) {
        console.error('Error loading prices:', error);
        setPrices({});
      } finally {
        setLoading(false);
      }
    };

    loadPrices();
  }, [fabric.codigo]);

  const handleGarmentSelect = (garment) => {
    // La app es de consulta de precios: las prendas del modal no navegan a cotización
    onActivity?.();
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50 modal-backdrop">
      <div className="card-premium max-w-2xl w-full shadow-2xl relative modal-panel max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-akahl-primary/95 backdrop-blur-sm z-10 border-b border-akahl-secondary/20">
          <div className="flex items-center justify-between p-5">
            <div className="flex items-center gap-4">
              <div className="w-1 h-8 bg-akahl-secondary rounded-full"></div>
              <div>
                <h3 className="text-xl font-display font-semibold text-white tracking-[0.15em] uppercase">
                  Price Catalog
                </h3>
                <p className="text-sm text-akahl-secondary/80 mt-1">
                  {fabric.codigo} — {fabric.marca} / {fabric.coleccion}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 rounded-xl hover:bg-akahl-secondary/10 transition-colors text-neutral-400 hover:text-white border border-transparent hover:border-akahl-secondary/30"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Manufacturing Type Toggle */}
          <div className="px-5 pb-4">
            <div className="flex gap-2 p-1 bg-akahl-primary/50 rounded-xl border border-akahl-secondary/20">
              {MANUFACTURING_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => {
                    setSelectedManufacturing(type.id);
                    onActivity?.();
                  }}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                    selectedManufacturing === type.id
                      ? 'bg-akahl-secondary text-akahl-primary shadow-gold-glow'
                      : 'text-neutral-400 hover:text-white hover:bg-akahl-secondary/10'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Garments Grid */}
        <div className="p-5">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-4">
                  <div className="absolute inset-0 border-4 border-akahl-secondary/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-transparent border-t-akahl-secondary rounded-full animate-spin"></div>
                </div>
                <p className="text-akahl-secondary/60 tracking-[0.2em] uppercase text-sm">Calculating prices...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 stagger-soft">
              {GARMENT_TYPES.map((garment) => {
                const price = prices[garment.id];
                const hasPrice = typeof price === 'number';
                // Restar 700 solo cuando es No Bespoke (Industrial)
                const adjustedPrice = hasPrice
                  ? applyManufacturingAdjustment(price, selectedManufacturing)
                  : null;

                return (
                  <button
                    key={garment.id}
                    onClick={() => handleGarmentSelect(garment)}
                    disabled={!hasPrice}
                    className="p-5 bg-akahl-primary/50 rounded-xl border border-akahl-secondary/20 hover:border-akahl-secondary/50 hover:shadow-gold-glow transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-left group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <img
                        src={garment.image}
                        alt={garment.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <svg className="w-5 h-5 text-akahl-secondary/30 group-hover:text-akahl-secondary transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-white mb-2">{garment.name}</h4>
                    {hasPrice ? (
                      <p className="text-2xl font-display font-bold text-shine">
                        ${adjustedPrice.toFixed(2)}
                      </p>
                    ) : (
                      <p className="text-2xl font-display font-bold text-neutral-600">—</p>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Fabric Info Footer */}
          <div className="mt-6 p-4 bg-akahl-secondary/5 rounded-xl border border-akahl-secondary/10 animate-fadeIn">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-akahl-secondary/60 uppercase tracking-wider text-xs mb-1">Brand</p>
                <p className="text-white font-medium">{fabric.marca}</p>
              </div>
              <div>
                <p className="text-akahl-secondary/60 uppercase tracking-wider text-xs mb-1">Collection</p>
                <p className="text-white font-medium">{fabric.coleccion}</p>
              </div>
              <div>
                <p className="text-akahl-secondary/60 uppercase tracking-wider text-xs mb-1">Code</p>
                <p className="text-white font-medium">{fabric.codigo}</p>
              </div>
              <div>
                <p className="text-akahl-secondary/60 uppercase tracking-wider text-xs mb-1">Price per Yard</p>
                <p className="text-white font-medium">${fabric.basePricePerMeter?.toFixed(2) || '0.00'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GarmentPriceModal;
