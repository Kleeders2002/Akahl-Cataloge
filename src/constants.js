/**
 * Constantes compartidas - Cotizador AKAHL
 *
 * Única fuente de verdad para tipos de manufactura, tipos de prenda y
 * ajustes de precio. Antes estaban duplicadas en 4 componentes y podían
 * desincronizarse entre sí.
 */

// Ajuste de precio aplicado en el frontend para No Bespoke (Industrial).
// Es una regla de negocio visual: el backend no recibe el tipo de manufactura.
// TODO: mover al backend para evitar un doble descuento si algún día
// el API calcula precios industriales.
export const NO_BESPOKE_DISCOUNT = 700;

export const MANUFACTURING_TYPES = [
  {
    id: 'bespoke',
    name: 'Bespoke',
    label: 'Bespoke',
    description: 'Handcrafted',
  },
  {
    id: 'industrial',
    name: 'No Bespoke',
    label: 'No Bespoke',
    description: 'Machine made',
  },
];

export const GARMENT_TYPES = [
  { id: 'jacket', name: 'Jacket', label: 'Jacket', image: '/jacket.png', meters: 2.5 },
  { id: 'trousers', name: 'Trousers', label: 'Trousers', image: '/trousers.png', meters: 1.8 },
  { id: 'vest', name: 'Vest', label: 'Vest', image: '/vest.png', meters: 1.2 },
  { id: '2-piece', name: '2-Piece Suit', label: '2-Piece Suit', image: '/2-piece.png', meters: 4.3 },
  { id: '3-piece', name: '3-Piece Suit', label: '3-Piece Suit', image: '/3-piece.png', meters: 5.5 },
];

/**
 * Aplica el ajuste de No Bespoke (-$700) a un precio del backend.
 * El precio base del backend es el mismo para ambos tipos de manufactura.
 * @param {number} price - Precio base del backend
 * @param {string} manufacturingId - 'bespoke' | 'industrial'
 * @returns {number} Precio ajustado
 */
export const applyManufacturingAdjustment = (price, manufacturingId) => {
  if (typeof price !== 'number' || isNaN(price)) return price;
  return manufacturingId === 'industrial' ? price - NO_BESPOKE_DISCOUNT : price;
};
