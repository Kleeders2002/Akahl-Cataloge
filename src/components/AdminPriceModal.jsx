/**
 * Componente: AdminPriceModal
 *
 * Modal administrativo con desglose completo de costos
 * Muestra: precio por yarda, precio neto, costo de manufactura, precio final
 */

import { useState, useEffect } from 'react';
import { calculateAllPrices } from '../services/api';

const MANUFACTURING_TYPES = [
  { id: 'bespoke', name: 'Bespoke', label: 'Bespoke' },
  { id: 'industrial', name: 'No Bespoke', label: 'No Bespoke' },
];

const GARMENT_TYPES = [
  { id: 'jacket', name: 'Jacket', meters: 2.5 },
  { id: 'trousers', name: 'Trousers', meters: 1.8 },
  { id: 'vest', name: 'Vest', meters: 1.2 },
  { id: '2-piece', name: '2-Piece Suit', meters: 4.3 },
  { id: '3-piece', name: '3-Piece Suit', meters: 5.5 },
];

const MULTIPLIERS = {
  bespoke: {
    jacket: 8.5,
    trousers: 4.5,
    vest: 3.5,
    '2-piece': 12.0,
    '3-piece': 15.0,
  },
  industrial: {
    jacket: 5.5,
    trousers: 3.0,
    vest: 2.5,
    '2-piece': 7.5,
    '3-piece': 9.5,
  },
};

function AdminPriceModal({ fabric, pricing, onClose, onActivity }) {
  const [selectedManufacturing, setSelectedManufacturing] = useState('bespoke');
  const [priceDetails, setPriceDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Calcular precios y desglose usando el endpoint calculate-all.
  // El tipo de manufactura NO participa en el cálculo del backend (se aplica
  // solo al renderizar), por eso NO va en las dependencias: antes cada toggle
  // re-lanzaba la petición y, si esa petición fallaba o llegaba tarde,
  // el fallback local mostraba precios con una fórmula distinta a la del backend.
  useEffect(() => {
    let cancelled = false;

    const loadPrices = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const result = await calculateAllPrices({
          fabricCode: fabric.codigo,
        });
        if (cancelled) return;

        // Transformar los datos al formato esperado por el componente
        const details = {};

        GARMENT_TYPES.forEach((garment) => {
          const finalPrice = result.prices[garment.id];
          const breakdown = result.breakdown[garment.id];

          details[garment.id] = {
            fabricCost: breakdown?.fabricCost || 0,
            laborCost: (finalPrice || 0) - (breakdown?.fabricCost || 0),
            finalPrice: finalPrice || 0,
            meters: breakdown?.meters || garment.meters,
            // El markup lo define el backend; fallback estable (no depende del toggle)
            multiplier: breakdown?.markup || MULTIPLIERS.bespoke[garment.id],
          };
        });

        setPriceDetails(details);
      } catch (error) {
        if (cancelled) return;
        console.error('Error loading prices:', error);
        // Mostrar error en lugar de un cálculo local silencioso:
        // la fórmula local no coincide con la del backend y mostraba
        // precios incorrectos sin que el usuario lo notara.
        setLoadError('Prices could not be calculated. Check the connection and try again.');
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadPrices();

    return () => {
      cancelled = true;
    };
  }, [fabric.codigo, reloadKey]);

  const precioNeto = fabric.precio_neto ||
    (fabric.descuento
      ? fabric.basePricePerMeter * (1 - fabric.descuento)
      : fabric.basePricePerMeter);

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="card-premium max-w-4xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-akahl-primary/95 backdrop-blur-sm z-10 border-b border-akahl-secondary/20">
          <div className="flex items-center justify-between p-5">
            <div className="flex items-center gap-4">
              <div className="w-1 h-8 bg-akahl-secondary rounded-full"></div>
              <div>
                <h3 className="text-xl font-display font-semibold text-white tracking-[0.15em] uppercase">
                  Price Details — Admin
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

        {/* Fabric Cost Summary */}
        <div className="p-5 border-b border-akahl-secondary/10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-akahl-primary/50 rounded-xl border border-akahl-secondary/10">
              <p className="text-xs text-akahl-secondary/60 uppercase tracking-wider mb-1">Price per Yard</p>
              <p className="text-xl font-bold text-white">
                ${fabric.basePricePerMeter?.toFixed(2) || '0.00'}
              </p>
            </div>
            <div className="p-4 bg-akahl-primary/50 rounded-xl border border-akahl-secondary/10">
              <p className="text-xs text-akahl-secondary/60 uppercase tracking-wider mb-1">Discount</p>
              <p className="text-xl font-bold text-akahl-secondary">
                {fabric.descuento
                  ? `${(fabric.descuento * 100).toFixed(0)}%`
                  : '—'}
              </p>
            </div>
            <div className="p-4 bg-akahl-secondary/10 rounded-xl border border-akahl-secondary/30">
              <p className="text-xs text-akahl-secondary/60 uppercase tracking-wider mb-1">Net Price</p>
              <p className="text-xl font-bold text-akahl-secondary">
                ${precioNeto?.toFixed(2) || '0.00'}
              </p>
            </div>
            <div className="p-4 bg-akahl-primary/50 rounded-xl border border-akahl-secondary/10">
              <p className="text-xs text-akahl-secondary/60 uppercase tracking-wider mb-1">Manufacturing</p>
              <p className="text-xl font-bold text-white capitalize">
                {selectedManufacturing}
              </p>
            </div>
          </div>
        </div>

        {/* Price Breakdown Table */}
        <div className="p-5">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-4">
                  <div className="absolute inset-0 border-4 border-akahl-secondary/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-transparent border-t-akahl-secondary rounded-full animate-spin"></div>
                </div>
                <p className="text-akahl-secondary/60 tracking-[0.2em] uppercase text-sm">Calculating...</p>
              </div>
            </div>
          ) : loadError ? (
            <div className="text-center py-12">
              <p className="text-red-400 font-medium mb-4">{loadError}</p>
              <button
                onClick={() => {
                  setReloadKey(k => k + 1);
                  onActivity?.();
                }}
                className="px-6 py-2 bg-akahl-secondary/10 hover:bg-akahl-secondary/20 text-akahl-secondary font-medium rounded-lg transition-all border border-akahl-secondary/30"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-akahl-secondary/20 bg-akahl-secondary/5">
                    <th className="text-left py-3 px-4 font-semibold text-white tracking-[0.1em] uppercase text-xs">Garment</th>
                    <th className="text-right py-3 px-4 font-semibold text-neutral-400 tracking-[0.1em] uppercase text-xs">Elaboration Price</th>
                    <th className="text-right py-3 px-4 font-semibold text-akahl-secondary tracking-[0.1em] uppercase text-xs">Multiplied Price</th>
                  </tr>
                </thead>
                <tbody>
                  {GARMENT_TYPES.map((garment) => {
                    const details = priceDetails[garment.id];
                    if (!details) return null;
                    // Elaboration Price = Precio final dividido por el multiplier (el mismo para ambos)
                    const elaborationPrice = details.finalPrice / details.multiplier;
                    // Restar 700 solo al Multiplied Price cuando es No Bespoke (Industrial)
                    const adjustedPrice = selectedManufacturing === 'industrial' ? details.finalPrice - 700 : details.finalPrice;

                    return (
                      <tr key={garment.id} className="border-b border-akahl-secondary/10 hover:bg-akahl-secondary/5 transition-colors">
                        <td className="py-4 px-4 font-medium text-white text-base">{garment.name}</td>
                        <td className="py-4 px-4 text-right text-neutral-300">
                          ${elaborationPrice.toFixed(2)}
                        </td>
                        <td className="py-4 px-4 text-right font-bold text-akahl-secondary text-lg">
                          ${adjustedPrice.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Summary Footer */}
          {!loading && !loadError && (
            <div className="mt-6 p-4 bg-akahl-secondary/5 rounded-xl border border-akahl-secondary/10">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-akahl-secondary/60 uppercase tracking-wider mb-1">Total Fabrics Cost</p>
                  <p className="text-lg font-semibold text-white">
                    ${Object.values(priceDetails).reduce((sum, d) => sum + d.fabricCost, 0).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-akahl-secondary/60 uppercase tracking-wider mb-1">Total Labor Cost</p>
                  <p className="text-lg font-semibold text-white">
                    ${Object.values(priceDetails).reduce((sum, d) => sum + d.laborCost, 0).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-akahl-secondary/60 uppercase tracking-wider mb-1">Avg. Final Price</p>
                  <p className="text-lg font-semibold text-akahl-secondary">
                    ${(Object.values(priceDetails).reduce((sum, d) => {
                      const priceToShow = selectedManufacturing === 'industrial' ? d.finalPrice - 700 : d.finalPrice;
                      return sum + priceToShow;
                    }, 0) / GARMENT_TYPES.length).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPriceModal;
