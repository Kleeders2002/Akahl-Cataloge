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
  { id: 'industrial', name: 'Industrial', label: 'Industrial' },
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

  // Calcular precios y desglose usando el nuevo endpoint
  useEffect(() => {
    const loadPrices = async () => {
      setLoading(true);
      try {
        const result = await calculateAllPrices({
          fabricCode: fabric.codigo,
        });

        // Transformar los datos al formato esperado por el componente
        const details = {};
        const basePrice = fabric.precio_neto || fabric.basePricePerMeter;

        GARMENT_TYPES.forEach((garment) => {
          const finalPrice = result.prices[garment.id];
          const breakdown = result.breakdown[garment.id];

          details[garment.id] = {
            fabricCost: breakdown?.fabricCost || 0,
            laborCost: (finalPrice || 0) - (breakdown?.fabricCost || 0),
            finalPrice: finalPrice || 0,
            meters: breakdown?.meters || garment.meters,
            multiplier: breakdown?.markup || MULTIPLIERS[selectedManufacturing][garment.id],
          };
        });

        setPriceDetails(details);
      } catch (error) {
        console.error('Error loading prices:', error);
        // Fallback al cálculo local si falla el endpoint
        const details = {};
        const basePrice = fabric.precio_neto || fabric.basePricePerMeter;

        GARMENT_TYPES.forEach((garment) => {
          const meters = garment.meters;
          const multiplier = MULTIPLIERS[selectedManufacturing][garment.id];

          const fabricCost = basePrice * meters;
          const laborCost = basePrice * multiplier;
          const finalPrice = fabricCost + laborCost;

          details[garment.id] = {
            fabricCost: Math.round(fabricCost * 100) / 100,
            laborCost: Math.round(laborCost * 100) / 100,
            finalPrice: Math.round(finalPrice * 100) / 100,
            meters,
            multiplier,
          };
        });

        setPriceDetails(details);
      } finally {
        setLoading(false);
      }
    };

    loadPrices();
  }, [fabric.codigo, selectedManufacturing]);

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
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-akahl-secondary/20 bg-akahl-secondary/5">
                    <th className="text-left py-3 px-4 font-semibold text-white tracking-[0.1em] uppercase text-xs">Garment</th>
                    <th className="text-center py-3 px-4 font-semibold text-white tracking-[0.1em] uppercase text-xs">Meters</th>
                    <th className="text-center py-3 px-4 font-semibold text-white tracking-[0.1em] uppercase text-xs">Multiplier</th>
                    <th className="text-right py-3 px-4 font-semibold text-white tracking-[0.1em] uppercase text-xs">Fabric Cost</th>
                    <th className="text-right py-3 px-4 font-semibold text-white tracking-[0.1em] uppercase text-xs">Labor Cost</th>
                    <th className="text-right py-3 px-4 font-semibold text-akahl-secondary tracking-[0.1em] uppercase text-xs">Final Price</th>
                  </tr>
                </thead>
                <tbody>
                  {GARMENT_TYPES.map((garment) => {
                    const details = priceDetails[garment.id];
                    if (!details) return null;

                    return (
                      <tr key={garment.id} className="border-b border-akahl-secondary/10 hover:bg-akahl-secondary/5 transition-colors">
                        <td className="py-3 px-4 font-medium text-white">{garment.name}</td>
                        <td className="py-3 px-4 text-center text-neutral-400">{details.meters}m</td>
                        <td className="py-3 px-4 text-center text-neutral-400">{details.multiplier}x</td>
                        <td className="py-3 px-4 text-right text-neutral-300">
                          ${details.fabricCost.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right text-neutral-300">
                          ${details.laborCost.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-akahl-secondary text-base">
                          ${details.finalPrice.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Summary Footer */}
          {!loading && (
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
                    ${(Object.values(priceDetails).reduce((sum, d) => sum + d.finalPrice, 0) / GARMENT_TYPES.length).toFixed(2)}
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
