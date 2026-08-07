/**
 * Componente: QuotationScreen
 *
 * Pantalla principal de cotización - Estilo AKAHL Premium.
 * - Buscador visible con filtros avanzados
 * - Lista de todas las telas con paginación
 * - Búsqueda en tiempo real
 * - Filtros por marca, precio y nombre
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { getAllFabrics, getFabricByCode, calculatePrice } from '../services/api';
import FabricCard from './FabricCard';
import PriceDisplay from './PriceDisplay';
import ManufacturingSelector from './ManufacturingSelector';
import GarmentSelector from './GarmentSelector';
import GarmentPriceModal from './GarmentPriceModal';

// ============================================
// TIPOS DE MANUFACTURA
// ============================================

const MANUFACTURING_TYPES = [
  {
    id: 'bespoke',
    name: 'Bespoke',
    description: 'Handcrafted',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    ),
  },
  {
    id: 'industrial',
    name: 'Industrial',
    description: 'Machine made',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

// ============================================
// TIPOS DE PRENDA
// ============================================

const GARMENT_TYPES = [
  {
    id: 'jacket',
    name: 'Jacket',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 10l-4.553-2.276A1 1 0 003 8.618v6.764a1 1 0 001.447.894L9 14" />
      </svg>
    )
  },
  {
    id: 'trousers',
    name: 'Trousers',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 21v-8m0 0V3l5 4 5-4v10m0 0v8" />
      </svg>
    )
  },
  {
    id: 'vest',
    name: 'Vest',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v18M9 3v18M15 3v18M19 3v18" />
      </svg>
    )
  },
  {
    id: '2-piece-suit',
    name: '2-Piece Suit',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 10l-4.553-2.276A1 1 0 003 8.618v6.764a1 1 0 001.447.894L9 14M12 3v18" />
      </svg>
    )
  },
  {
    id: '3-piece-suit',
    name: '3-Piece Suit',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 21v-8m0 0V3l5 4 5-4v10m0 0v8M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 10l-4.553-2.276A1 1 0 003 8.618v6.764a1 1 0 001.447.894L9 14" />
      </svg>
    )
  },
  {
    id: 'dress-executive',
    name: 'Executive Dress',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m-4-8h8" />
      </svg>
    )
  },
];

// Rangos de precio
const PRICE_RANGES = [
  { id: 'all', label: 'All Prices', min: 0, max: Infinity },
  { id: '0-50', label: 'Under $50', min: 0, max: 50 },
  { id: '50-100', label: '$50 - $100', min: 50, max: 100 },
  { id: '100-150', label: '$100 - $150', min: 100, max: 150 },
  { id: '150+', label: '$150+', min: 150, max: Infinity },
];

// Helper para obtener precio de forma segura
const safePrice = (price, fallback = 0) => {
  const num = parseFloat(price);
  return isNaN(num) ? fallback : num;
};

// Helper para formatear precio
const formatPrice = (price, decimals = 2) => {
  return safePrice(price, 0).toFixed(decimals);
};

// ============================================
// COMPONENTE
// ============================================

function QuotationScreen({ onActivity }) {
  // Estado de carga de telas
  const [allFabrics, setAllFabrics] = useState([]);
  const [loadingFabrics, setLoadingFabrics] = useState(true);

  // Búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');

  // Paginación
  const [displayedCount, setDisplayedCount] = useState(10);

  // Tela seleccionada para cotización
  const [selectedFabric, setSelectedFabric] = useState(null);
  const [manufacturingType, setManufacturingType] = useState('bespoke');
  const [garmentType, setGarmentType] = useState('2-piece-suit');
  const [priceResult, setPriceResult] = useState(null);

  // Modal de precios de prendas
  const [modalFabric, setModalFabric] = useState(null);

  // ============================================
  // CARGA DE TELAS
  // ============================================

  useEffect(() => {
    const loadFabrics = async () => {
      setLoadingFabrics(true);
      try {
        console.log('🔍 Cargando telas desde el endpoint...');
        const fabrics = await getAllFabrics();
        console.log('✅ Telas cargadas:', fabrics.length, 'telas');

        // LOG: Ver la estructura de los datos
        if (fabrics.length > 0) {
          console.log('📋 Estructura de la primera tela:', fabrics[0]);
          console.log('💰 basePricePerMeter:', fabrics[0].basePricePerMeter, 'Tipo:', typeof fabrics[0].basePricePerMeter);
        }

        setAllFabrics(fabrics);
      } catch (error) {
        console.error('❌ Error loading fabrics:', error);
        console.error('Error details:', error.message, error.response?.data);

        // No cargar datos mock - dejar el array vacío para mostrar error
        setAllFabrics([]);
      } finally {
        setLoadingFabrics(false);
      }
    };

    loadFabrics();
  }, []);

  // ============================================
  // FILTROS Y BÚSQUEDA
  // ============================================

  // Obtener marcas únicas de las lista de telas
  const brands = useMemo(() => {
    const brandSet = new Set(allFabrics.map(f => f.supplier).filter(Boolean));
    return ['all', ...Array.from(brandSet).sort()];
  }, [allFabrics]);

  // Filtrar telas según todos los criterios
  const filteredFabrics = useMemo(() => {
    return allFabrics.filter((fabric) => {
      // Filtro de búsqueda de texto
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        fabric.codigo?.toLowerCase().includes(searchLower) ||
        fabric.name?.toLowerCase().includes(searchLower) ||
        fabric.supplier?.toLowerCase().includes(searchLower);

      // Filtro de marca
      const matchesBrand = selectedBrand === 'all' || fabric.supplier === selectedBrand;

      // Filtro de precio
      const priceRange = PRICE_RANGES.find(r => r.id === selectedPriceRange);
      const fabricPrice = safePrice(fabric.basePricePerMeter);
      const matchesPrice =
        fabricPrice >= priceRange?.min &&
        fabricPrice <= priceRange?.max;

      // Filtro de disponibilidad
      const matchesAvailability =
        availabilityFilter === 'all' ||
        (availabilityFilter === 'available' && fabric.availability === 'available') ||
        (availabilityFilter === 'out_of_stock' && fabric.availability === 'out_of_stock');

      return matchesSearch && matchesBrand && matchesPrice && matchesAvailability;
    });
  }, [allFabrics, searchTerm, selectedBrand, selectedPriceRange, availabilityFilter]);

  // Telas a mostrar (con paginación)
  const displayedFabrics = filteredFabrics.slice(0, displayedCount);
  const hasMore = filteredFabrics.length > displayedCount;

  // ============================================
  // SELECCIÓN DE TELA PARA COTIZACIÓN
  // ============================================

  const handleSelectFabric = useCallback((fabric) => {
    setModalFabric(fabric);
    onActivity?.();
  }, [onActivity]);

  const handleSelectForQuotation = useCallback((fabric) => {
    setSelectedFabric(fabric);
    setManufacturingType('bespoke');
    setGarmentType('2-piece-suit');

    // Calcular precio automáticamente
    const calculate = async () => {
      try {
        const price = await calculatePrice({
          manufacturingType: 'bespoke',
          garmentType: '2-piece-suit',
          fabricId: fabric.id,
          basePrice: safePrice(fabric.precio_neto || fabric.basePricePerMeter),
        });
        setPriceResult(price);
      } catch (error) {
        console.error('Error calculating price:', error);
      }
    };

    calculate();
    onActivity?.();

    // Scroll suave hacia la parte de cotización
    setTimeout(() => {
      document.getElementById('quotation-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }, [onActivity]);

  // Recalcular precio cuando cambian selecciones
  useEffect(() => {
    if (selectedFabric && manufacturingType && garmentType) {
      const recalculate = async () => {
        try {
          const price = await calculatePrice({
            manufacturingType,
            garmentType,
            fabricId: selectedFabric.id,
            basePrice: selectedFabric.precio_neto || selectedFabric.basePricePerMeter,
          });
          setPriceResult(price);
        } catch (error) {
          console.error('Error recalculating price:', error);
        }
      };

      recalculate();
    }
  }, [manufacturingType, garmentType, selectedFabric]);

  // ============================================
  // LIMPIEZA
  // ============================================

  const handleClearSelection = useCallback(() => {
    setSelectedFabric(null);
    setPriceResult(null);
    setManufacturingType('bespoke');
    setGarmentType('2-piece-suit');
    onActivity?.();
  }, [onActivity]);

  // ============================================
  // RENDERIZADO
  // ============================================

  return (
    <div className="space-y-6">
      {/* ============================================
          BUSCADOR Y FILTROS
          ============================================ */}
      <div className="card-premium animate-slide-up">
        <div className="h-px bg-gradient-to-r from-akahl-secondary via-akahl-secondary/50 to-transparent mb-5"></div>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-1 h-6 bg-akahl-secondary rounded-full"></div>
          <label className="text-sm font-semibold text-akahl-secondary/80 tracking-[0.2em] uppercase">
            Fabric Catalog
          </label>
          <span className="text-neutral-500 text-sm ml-2">
            ({filteredFabrics.length} fabrics)
          </span>
        </div>

        {/* Buscador principal */}
        <div className="mb-5">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                onActivity?.();
              }}
              placeholder="Search by code, name, or supplier..."
              className="input-field text-xl bg-akahl-primary/50 border-akahl-secondary/30 placeholder:text-akahl-secondary/30"
              autoFocus
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-akahl-secondary/40">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                onActivity?.();
              }}
              className="mt-3 text-sm text-akahl-secondary/70 hover:text-akahl-secondary transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear search
            </button>
          )}
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Filtro por Marca */}
          <div>
            <label className="block text-xs text-akahl-secondary/60 uppercase tracking-wider mb-2">
              Brand / Supplier
            </label>
            <select
              value={selectedBrand}
              onChange={(e) => {
                setSelectedBrand(e.target.value);
                onActivity?.();
              }}
              className="select-field"
            >
              {brands.map(brand => (
                <option key={brand} value={brand}>
                  {brand === 'all' ? 'All Brands' : brand}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Precio */}
          <div>
            <label className="block text-xs text-akahl-secondary/60 uppercase tracking-wider mb-2">
              Price Range
            </label>
            <select
              value={selectedPriceRange}
              onChange={(e) => {
                setSelectedPriceRange(e.target.value);
                onActivity?.();
              }}
              className="select-field"
            >
              {PRICE_RANGES.map(range => (
                <option key={range.id} value={range.id}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Disponibilidad */}
          <div>
            <label className="block text-xs text-akahl-secondary/60 uppercase tracking-wider mb-2">
              Availability
            </label>
            <select
              value={availabilityFilter}
              onChange={(e) => {
                setAvailabilityFilter(e.target.value);
                onActivity?.();
              }}
              className="select-field"
            >
              <option value="all">All</option>
              <option value="available">In Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-akahl-secondary/30 to-transparent mt-5"></div>
      </div>

      {/* ============================================
          LISTA DE TELAS
          ============================================ */}
      {loadingFabrics ? (
        <div className="card-premium">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="relative w-16 h-16 mx-auto mb-4">
                <div className="absolute inset-0 border-4 border-akahl-secondary/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-transparent border-t-akahl-secondary rounded-full animate-spin"></div>
              </div>
              <p className="text-akahl-secondary/60 tracking-[0.2em] uppercase text-sm">Loading fabrics...</p>
            </div>
          </div>
        </div>
      ) : filteredFabrics.length === 0 ? (
        <div className="card-premium">
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-akahl-primary/50 rounded-xl flex items-center justify-center border border-akahl-secondary/20">
              <svg className="w-8 h-8 text-akahl-secondary/40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-neutral-400 text-lg">No fabrics found</p>
            <p className="text-neutral-500 text-sm mt-2">Try adjusting your filters</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedBrand('all');
                setSelectedPriceRange('all');
                setAvailabilityFilter('all');
                onActivity?.();
              }}
              className="mt-4 px-6 py-2 bg-akahl-secondary/10 hover:bg-akahl-secondary/20 text-akahl-secondary font-medium rounded-lg transition-all border border-akahl-secondary/30"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Tabla de telas */}
          <div className="card-premium overflow-hidden">
            <div className="overflow-x-auto -mx-2">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-akahl-secondary/20 bg-akahl-secondary/5">
                    <th className="text-left py-4 px-4 font-semibold text-white tracking-[0.1em] uppercase text-xs">Brand</th>
                    <th className="text-left py-4 px-4 font-semibold text-white tracking-[0.1em] uppercase text-xs">Collection</th>
                    <th className="text-left py-4 px-4 font-semibold text-white tracking-[0.1em] uppercase text-xs">Code</th>
                    <th className="text-center py-4 px-4 font-semibold text-white tracking-[0.1em] uppercase text-xs">Status</th>
                    <th className="text-center py-4 px-4 font-semibold text-white tracking-[0.1em] uppercase text-xs">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedFabrics.map((fabric, index) => (
                    <tr
                      key={fabric.id}
                      className="border-b border-akahl-secondary/10 hover:bg-akahl-secondary/5 transition-colors animate-fadeIn cursor-pointer"
                      style={{ animationDelay: `${index * 30}ms` }}
                      onClick={() => handleSelectFabric(fabric)}
                    >
                      <td className="py-4 px-4 text-white font-medium">{fabric.marca || fabric.supplier}</td>
                      <td className="py-4 px-4 text-neutral-300">{fabric.coleccion}</td>
                      <td className="py-4 px-4">
                        <span className="font-display font-bold text-akahl-secondary tracking-wide">
                          {fabric.codigo}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        {fabric.availability === 'available' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-950/50 text-emerald-400 border border-emerald-900/50">
                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                            In Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-950/50 text-red-400 border border-red-900/50">
                            <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                            Out of Stock
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-1 text-akahl-secondary/60">
                          <span className="text-xs">View Prices</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Botón "Cargar más" */}
            {hasMore && (
              <div className="text-center py-4">
                <button
                  onClick={() => {
                    setDisplayedCount(prev => prev + 10);
                    onActivity?.();
                  }}
                  className="px-8 py-3 bg-akahl-secondary/10 hover:bg-akahl-secondary/20 text-akahl-secondary font-medium rounded-lg transition-all border border-akahl-secondary/30"
                >
                  Load More ({filteredFabrics.length - displayedCount} remaining)
                </button>
              </div>
            )}

            {/* Indicador de fin de lista */}
            {!hasMore && displayedFabrics.length > 0 && (
              <div className="text-center text-neutral-500 text-sm py-4 border-t border-akahl-secondary/10">
                Showing all {filteredFabrics.length} fabrics
              </div>
            )}
          </div>
        </>
      )}

      {/* ============================================
          SECCIÓN DE COTIZACIÓN (cuando hay tela seleccionada)
          ============================================ */}
      {selectedFabric && (
        <div id="quotation-section" className="space-y-6 animate-slide-up">
          {/* Tela seleccionada */}
          <div>
            <FabricCard fabric={selectedFabric} />
          </div>

          {/* Selectores */}
          <div className="grid md:grid-cols-2 gap-6">
            <ManufacturingSelector
              types={MANUFACTURING_TYPES}
              selected={manufacturingType}
              onSelect={(type) => {
                setManufacturingType(type);
                onActivity?.();
              }}
            />

            <GarmentSelector
              types={GARMENT_TYPES}
              selected={garmentType}
              onSelect={(type) => {
                setGarmentType(type);
                onActivity?.();
              }}
            />
          </div>

          {/* Precio calculado */}
          {priceResult && (
            <div className="animate-scale-in">
              <PriceDisplay
                price={priceResult.finalPrice}
                desglose={priceResult.desglose}
                fabric={selectedFabric}
                garmentType={GARMENT_TYPES.find(g => g.id === garmentType)?.name}
                manufacturingType={MANUFACTURING_TYPES.find(m => m.id === manufacturingType)?.name}
                onNewQuotation={handleClearSelection}
              />
            </div>
          )}
        </div>
      )}

      {/* ============================================
          MODAL DE PRECIOS DE PRENDAS
          ============================================ */}
      {modalFabric && (
        <GarmentPriceModal
          fabric={modalFabric}
          onClose={() => setModalFabric(null)}
          onActivity={onActivity}
        />
      )}
    </div>
  );
}

export default QuotationScreen;
