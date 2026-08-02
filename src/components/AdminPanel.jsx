/**
 * Componente: AdminPanel
 *
 * Panel de administración - Estilo AKAHL Premium.
 * - Buscador rápido de telas al inicio
 * - Ver catálogo de telas completo
 * - Editar precios y disponibilidad
 * - Crear y eliminar telas
 * - Ajustar multiplicadores de precio
 * - Gestionar PINs de acceso
 * - Ver historial de cotizaciones
 */

import { useState, useCallback, useEffect } from 'react';
import {
  getAllFabrics,
  updateFabric,
  getPricingConfig,
  updatePricingMultipliers,
  getAllPinsAPI,
  savePinAPI,
  deletePinAPI,
  resetPinsAPI,
  getFabricByCode,
  createFabric,
  deleteFabric,
  getQuotations,
  calculatePrice
} from '../services/api';
import FabricCard from './FabricCard';
import PriceDisplay from './PriceDisplay';
import ManufacturingSelector from './ManufacturingSelector';
import GarmentSelector from './GarmentSelector';

// ============================================
// TIPOS DE MANUFACTURA (duplicado para quick quote)
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

// ============================================
// COMPONENTE
// ============================================

function AdminPanel({ onActivity }) {
  // Estado de telas
  const [fabrics, setFabrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingFabric, setEditingFabric] = useState(null);
  const [creatingFabric, setCreatingFabric] = useState(false);

  // Buscador rápido (Quick Quote)
  const [quickSearchCode, setQuickSearchCode] = useState('');
  const [quickSearchResult, setQuickSearchResult] = useState(null);
  const [quickSearching, setQuickSearching] = useState(false);
  const [quickNotFound, setQuickNotFound] = useState(false);
  const [quickManufacturingType, setQuickManufacturingType] = useState('bespoke');
  const [quickGarmentType, setQuickGarmentType] = useState('2-piece-suit');
  const [quickPriceResult, setQuickPriceResult] = useState(null);

  // Estado de multiplicadores
  const [pricing, setPricing] = useState(null);
  const [editingPricing, setEditingPricing] = useState(false);
  const [tempMultipliers, setTempMultipliers] = useState(null);

  // Filtros
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Estado de PINs
  const [pins, setPins] = useState({});
  const [showPinSection, setShowPinSection] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [newPinName, setNewPinName] = useState('');
  const [newPinRole, setNewPinRole] = useState('USER');

  // Historial de cotizaciones
  const [quotations, setQuotations] = useState([]);
  const [showQuotations, setShowQuotations] = useState(false);
  const [loadingQuotations, setLoadingQuotations] = useState(false);

  // Nueva tela (para crear)
  const [newFabricData, setNewFabricData] = useState({
    codigo: '',
    nombre: '',
    color: '',
    precio_por_yarda: 0,
    disponibilidad: 'disponible',
    id_coleccion: 1,
    composicion: '',
    peso: ''
  });

  // ============================================
  // CARGA DE DATOS
  // ============================================

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [fabricsData, pricingData] = await Promise.all([
        getAllFabrics(),
        getPricingConfig(),
      ]);
      setFabrics(fabricsData);
      setPricing(pricingData);
      setTempMultipliers(JSON.parse(JSON.stringify(pricingData.multipliers)));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    setPins(getAllPinsAPI());
  }, []);

  // ============================================
  // BUSCADOR RÁPIDO (Quick Quote)
  // ============================================

  const handleQuickSearch = async () => {
    if (!quickSearchCode.trim()) {
      setQuickSearchResult(null);
      setQuickNotFound(false);
      setQuickPriceResult(null);
      return;
    }

    setQuickSearching(true);
    setQuickNotFound(false);
    onActivity?.();

    try {
      const result = await getFabricByCode(quickSearchCode.trim());

      if (result) {
        setQuickSearchResult(result);
        setQuickNotFound(false);

        // Calcular precio
        const price = await calculatePrice({
          manufacturingType: quickManufacturingType,
          garmentType: quickGarmentType,
          fabricId: result.id,
          fabricCode: result.codigo,
          basePrice: result.basePricePerMeter,
        });
        setQuickPriceResult(price);
      } else {
        setQuickSearchResult(null);
        setQuickNotFound(true);
        setQuickPriceResult(null);
      }
    } catch (error) {
      console.error('Error in quick search:', error);
      setQuickSearchResult(null);
      setQuickNotFound(true);
      setQuickPriceResult(null);
    } finally {
      setQuickSearching(false);
    }
  };

  useEffect(() => {
    if (quickSearchResult && quickManufacturingType && quickGarmentType) {
      const recalculate = async () => {
        const price = await calculatePrice({
          manufacturingType: quickManufacturingType,
          garmentType: quickGarmentType,
          fabricId: quickSearchResult.id,
          basePrice: quickSearchResult.basePricePerMeter,
        });
        setQuickPriceResult(price);
      };
      recalculate();
    }
  }, [quickManufacturingType, quickGarmentType, quickSearchResult]);

  const handleQuickClear = () => {
    setQuickSearchCode('');
    setQuickSearchResult(null);
    setQuickNotFound(false);
    setQuickPriceResult(null);
    setQuickManufacturingType('bespoke');
    setQuickGarmentType('2-piece-suit');
    onActivity?.();
  };

  // ============================================
  // MANEJADORES DE TELAS
  // ============================================

  const handleSaveFabric = async () => {
    if (!editingFabric) return;

    try {
      const updated = await updateFabric(editingFabric.id, {
        basePricePerMeter: parseFloat(editingFabric.basePricePerMeter),
        availability: editingFabric.availability,
      });

      setFabrics(fabrics.map(f => f.id === updated.id ? updated : f));
      setEditingFabric(null);
      onActivity?.();
    } catch (error) {
      console.error('Error saving fabric:', error);
    }
  };

  const handleToggleAvailability = async (fabric) => {
    const newAvailability = fabric.availability === 'available' ? 'out_of_stock' : 'available';

    try {
      const updated = await updateFabric(fabric.id, { availability: newAvailability });
      setFabrics(fabrics.map(f => f.id === updated.id ? updated : f));
      onActivity?.();
    } catch (error) {
      console.error('Error toggling availability:', error);
    }
  };

  const handleDeleteFabric = async (fabricId) => {
    if (!confirm('¿Eliminar esta tela? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await deleteFabric(fabricId);
      setFabrics(fabrics.filter(f => f.id !== fabricId));
      onActivity?.();
    } catch (error) {
      console.error('Error deleting fabric:', error);
      alert('Error al eliminar la tela');
    }
  };

  const handleCreateFabric = async () => {
    if (!newFabricData.codigo || !newFabricData.nombre) {
      alert('Código y nombre son obligatorios');
      return;
    }

    try {
      const created = await createFabric({
        codigo: newFabricData.codigo,
        name: newFabricData.nombre,
        color: newFabricData.color || newFabricData.nombre,
        basePricePerMeter: parseFloat(newFabricData.precio_por_yarda),
        availability: newFabricData.disponibilidad === 'disponible' ? 'available' : 'out_of_stock',
        id_coleccion: parseInt(newFabricData.id_coleccion),
        composition: newFabricData.composicion,
        weight: newFabricData.peso
      });

      setFabrics([...fabrics, created]);
      setCreatingFabric(false);
      setNewFabricData({
        codigo: '',
        nombre: '',
        color: '',
        precio_por_yarda: 0,
        disponibilidad: 'disponible',
        id_coleccion: 1,
        composicion: '',
        peso: ''
      });
      onActivity?.();
    } catch (error) {
      console.error('Error creating fabric:', error);
      alert('Error al crear la tela');
    }
  };

  const filteredFabrics = fabrics.filter((fabric) => {
    const matchesFilter = filter === 'all' || fabric.availability === filter;
    const matchesSearch = !searchTerm ||
      fabric.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fabric.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fabric.supplier.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  // ============================================
  // MANEJADORES DE PRECIOS
  // ============================================

  const handleSaveMultipliers = async () => {
    try {
      await updatePricingMultipliers(tempMultipliers);
      setPricing({ ...pricing, multipliers: tempMultipliers });
      setEditingPricing(false);
      onActivity?.();
    } catch (error) {
      console.error('Error saving multipliers:', error);
    }
  };

  // ============================================
  // MANEJADORES DE PINs
  // ============================================

  const handleSavePin = () => {
    if (!newPin || newPin.length !== 4) {
      alert('El PIN debe tener exactamente 4 dígitos');
      return;
    }

    if (!newPinName.trim()) {
      alert('El nombre es obligatorio');
      return;
    }

    savePinAPI(newPin, {
      role: newPinRole,
      name: newPinName.trim(),
      permissions: newPinRole === 'ADMIN' ? ['quotations', 'admin'] : ['quotations'],
      description: newPinRole === 'ADMIN' ? 'Acceso completo' : 'Acceso a cotizaciones'
    });

    setPins(getAllPinsAPI());
    setNewPin('');
    setNewPinName('');
    setNewPinRole('USER');
    onActivity?.();
  };

  const handleDeletePin = (pinToDelete) => {
    if (pinToDelete === '1234' || pinToDelete === '9999') {
      alert('No puedes eliminar los PINs por defecto del sistema');
      return;
    }

    if (confirm(`¿Eliminar PIN ${pinToDelete}?`)) {
      deletePinAPI(pinToDelete);
      setPins(getAllPinsAPI());
      onActivity?.();
    }
  };

  const handleResetPins = () => {
    if (confirm('¿Restablecer todos los PINs a los valores por defecto?')) {
      resetPinsAPI();
      setPins(getAllPinsAPI());
      onActivity?.();
    }
  };

  // ============================================
  // MANEJADORES DE COTIZACIONES
  // ============================================

  const handleLoadQuotations = async () => {
    setLoadingQuotations(true);
    try {
      const data = await getQuotations();
      setQuotations(Array.isArray(data) ? data : []);
      setShowQuotations(true);
    } catch (error) {
      console.error('Error loading quotations:', error);
      alert('Error al cargar el historial de cotizaciones');
    } finally {
      setLoadingQuotations(false);
    }
  };

  // ============================================
  // RENDERIZADO
  // ============================================

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-akahl-secondary/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-akahl-secondary rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-2 border-transparent border-t-akahl-secondary/50 rounded-full animate-spin" style={{animationDirection: 'reverse'}}></div>
          </div>
          <p className="text-akahl-secondary/60 tracking-[0.2em] uppercase text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ============================================
          BUSCADOR RÁPIDO (Quick Quote) - PRIORIDAD
          ============================================ */}
      <div className="card-premium animate-slide-up">
        <div className="h-px bg-gradient-to-r from-akahl-secondary via-akahl-secondary/50 to-transparent mb-5"></div>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-6 bg-akahl-secondary rounded-full"></div>
          <label className="text-sm font-semibold text-akahl-secondary/80 tracking-[0.2em] uppercase">
            Quick Fabric Search
          </label>
        </div>

        <div className="flex gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={quickSearchCode}
              onChange={(e) => {
                setQuickSearchCode(e.target.value.toUpperCase());
                setQuickNotFound(false);
                onActivity?.();
              }}
              placeholder="Enter fabric code..."
              className="input-field flex-1 text-2xl bg-akahl-primary/50 border-akahl-secondary/30 placeholder:text-akahl-secondary/30"
              maxLength={20}
              onKeyDown={(e) => e.key === 'Enter' && handleQuickSearch()}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-akahl-secondary/40">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <button
            onClick={handleQuickSearch}
            disabled={quickSearching || !quickSearchCode.trim()}
            className="btn-primary px-10 shadow-premium disabled:opacity-50"
          >
            {quickSearching ? 'SEARCHING...' : 'SEARCH'}
          </button>
        </div>

        {quickNotFound && (
          <div className="mt-5 p-4 bg-red-950/40 border border-red-900/50 rounded-xl animate-fadeIn">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-950/60 rounded-xl flex items-center justify-center flex-shrink-0 border border-red-900/50">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-red-400 tracking-wide">Fabric Not Found</p>
                <p className="text-sm text-red-400/70 mt-1">Verify the code and try again</p>
              </div>
            </div>
          </div>
        )}

        {/* Resultado del buscador rápido */}
        {quickSearchResult && (
          <>
            <div className="mt-5">
              <FabricCard fabric={quickSearchResult} />
            </div>

            <div className="grid md:grid-cols-2 gap-6 mt-5">
              <ManufacturingSelector
                types={MANUFACTURING_TYPES}
                selected={quickManufacturingType}
                onSelect={(type) => {
                  setQuickManufacturingType(type);
                  onActivity?.();
                }}
              />
              <GarmentSelector
                types={GARMENT_TYPES}
                selected={quickGarmentType}
                onSelect={(type) => {
                  setQuickGarmentType(type);
                  onActivity?.();
                }}
              />
            </div>

            {quickPriceResult && (
              <div className="mt-5 animate-scale-in">
                <PriceDisplay
                  price={quickPriceResult.finalPrice}
                  desglose={quickPriceResult.desglose}
                  fabric={quickSearchResult}
                  garmentType={GARMENT_TYPES.find(g => g.id === quickGarmentType)?.name}
                  manufacturingType={MANUFACTURING_TYPES.find(m => m.id === quickManufacturingType)?.name}
                  onNewQuotation={handleQuickClear}
                />
              </div>
            )}
          </>
        )}

        <div className="h-px bg-gradient-to-r from-transparent via-akahl-secondary/30 to-transparent mt-5"></div>
      </div>

      {/* ============================================
          MULTIPLICADORES DE PRECIO
          ============================================ */}
      <div className="card-premium animate-fadeIn">
        <div className="h-px bg-gradient-to-r from-akahl-secondary via-akahl-secondary/50 to-transparent mb-5"></div>

        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-akahl-secondary rounded-full"></div>
            <h3 className="text-lg font-display font-semibold text-white tracking-[0.15em] uppercase">Price Multipliers</h3>
          </div>
          {!editingPricing && (
            <button
              onClick={() => setEditingPricing(true)}
              className="px-4 py-2 bg-akahl-secondary/10 hover:bg-akahl-secondary/20 text-akahl-secondary font-medium rounded-lg transition-all active:scale-95 border border-akahl-secondary/30"
            >
              Edit
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-akahl-secondary/20">
                <th className="text-left py-3 px-3 font-medium text-akahl-secondary/60 tracking-[0.1em] uppercase text-xs">Garment</th>
                <th className="text-center py-3 px-3 font-medium text-akahl-secondary/60 tracking-[0.1em] uppercase text-xs">Bespoke</th>
                <th className="text-center py-3 px-3 font-medium text-akahl-secondary/60 tracking-[0.1em] uppercase text-xs">Industrial</th>
              </tr>
            </thead>
            <tbody>
              {pricing && Object.keys(pricing.multipliers.bespoke).map((garment, index) => (
                <tr key={garment} className="border-b border-akahl-secondary/10 last:border-0 hover:bg-akahl-secondary/5 transition-colors">
                  <td className="py-3 px-3 text-neutral-300 capitalize">
                    {garment.replace('-', ' ')}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {editingPricing ? (
                      <input
                        type="number"
                        step="0.1"
                        value={tempMultipliers?.bespoke[garment] || 0}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setTempMultipliers(prev => ({
                            ...prev,
                            bespoke: { ...prev.bespoke, [garment]: val }
                          }));
                        }}
                        className="w-20 px-3 py-2 text-center bg-akahl-primary/50 border border-akahl-secondary/30 rounded text-white focus:border-akahl-secondary focus:outline-none transition-all"
                      />
                    ) : (
                      <span className="font-semibold text-akahl-secondary">
                        {pricing.multipliers.bespoke[garment]}<span className="text-neutral-500">x</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {editingPricing ? (
                      <input
                        type="number"
                        step="0.1"
                        value={tempMultipliers?.industrial[garment] || 0}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setTempMultipliers(prev => ({
                            ...prev,
                            industrial: { ...prev.industrial, [garment]: val }
                          }));
                        }}
                        className="w-20 px-3 py-2 text-center bg-akahl-primary/50 border border-akahl-secondary/30 rounded text-white focus:border-akahl-secondary focus:outline-none transition-all"
                      />
                    ) : (
                      <span className="font-semibold text-akahl-secondary">
                        {pricing.multipliers.industrial[garment]}<span className="text-neutral-500">x</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {editingPricing && (
          <div className="mt-5 flex gap-3">
            <button onClick={handleSaveMultipliers} className="btn-success border border-akahl-secondary/40 shadow-premium">
              Save Changes
            </button>
            <button
              onClick={() => {
                setTempMultipliers(JSON.parse(JSON.stringify(pricing.multipliers)));
                setEditingPricing(false);
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        )}

        <div className="h-px bg-gradient-to-r from-transparent via-akahl-secondary/30 to-transparent mt-5"></div>
      </div>

      {/* ============================================
          CATÁLOGO DE TELAS
          ============================================ */}
      <div className="card-premium animate-fadeIn">
        <div className="h-px bg-gradient-to-r from-akahl-secondary via-akahl-secondary/50 to-transparent mb-5"></div>

        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-akahl-secondary rounded-full"></div>
            <h3 className="text-lg font-display font-semibold text-white tracking-[0.15em] uppercase">Fabric Catalog</h3>
          </div>
          <button
            onClick={() => setCreatingFabric(true)}
            className="px-4 py-2 bg-akahl-secondary/10 hover:bg-akahl-secondary/20 text-akahl-secondary font-medium rounded-lg transition-all active:scale-95 border border-akahl-secondary/30 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Fabric
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-5">
          <div className="flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search fabrics..."
              className="input-field text-lg bg-akahl-primary/50 border-akahl-secondary/20"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'all'
                  ? 'bg-akahl-secondary text-akahl-primary shadow-gold-glow'
                  : 'bg-akahl-primary/50 text-neutral-400 hover:bg-akahl-primary/70 border border-akahl-secondary/20'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('available')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'available'
                  ? 'bg-akahl-secondary text-akahl-primary shadow-gold-glow'
                  : 'bg-akahl-primary/50 text-neutral-400 hover:bg-akahl-primary/70 border border-akahl-secondary/20'
              }`}
            >
              In Stock
            </button>
            <button
              onClick={() => setFilter('out_of_stock')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'out_of_stock'
                  ? 'bg-akahl-secondary text-akahl-primary shadow-gold-glow'
                  : 'bg-akahl-primary/50 text-neutral-400 hover:bg-akahl-primary/70 border border-akahl-secondary/20'
              }`}
            >
              Out of Stock
            </button>
          </div>
        </div>

        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-akahl-secondary/20 bg-akahl-secondary/5">
                <th className="text-left py-3 px-4 font-semibold text-white tracking-[0.1em] uppercase text-xs">Code</th>
                <th className="text-left py-3 px-4 font-semibold text-white tracking-[0.1em] uppercase text-xs">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-white tracking-[0.1em] uppercase text-xs">Supplier</th>
                <th className="text-right py-3 px-4 font-semibold text-white tracking-[0.1em] uppercase text-xs">Price/M</th>
                <th className="text-center py-3 px-4 font-semibold text-white tracking-[0.1em] uppercase text-xs">Status</th>
                <th className="text-center py-3 px-4 font-semibold text-white tracking-[0.1em] uppercase text-xs">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFabrics.map((fabric) => (
                <tr key={fabric.id} className="border-b border-akahl-secondary/10 hover:bg-akahl-secondary/5 transition-colors">
                  <td className="py-3 px-4 font-medium text-akahl-secondary tracking-wide">{fabric.codigo}</td>
                  <td className="py-3 px-4 text-neutral-300">{fabric.name}</td>
                  <td className="py-3 px-4 text-neutral-500">{fabric.supplier}</td>
                  <td className="py-3 px-4 text-right font-medium text-white">
                    ${fabric.basePricePerMeter?.toFixed(2) || '0.00'}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {fabric.availability === 'available' ? (
                      <span className="tag-available">In Stock</span>
                    ) : (
                      <span className="tag-out-of-stock">Out of Stock</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleToggleAvailability(fabric)}
                        className="p-2 rounded-lg hover:bg-akahl-secondary/10 transition-all border border-transparent hover:border-akahl-secondary/30"
                        title="Toggle availability"
                      >
                        {fabric.availability === 'available' ? (
                          <svg className="w-5 h-5 text-akahl-secondary" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={() => setEditingFabric(fabric)}
                        className="p-2 rounded-lg hover:bg-akahl-secondary/10 transition-all border border-transparent hover:border-akahl-secondary/30"
                        title="Edit price"
                      >
                        <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteFabric(fabric.id)}
                        className="p-2 rounded-lg hover:bg-red-950/50 text-red-400 hover:text-red-300 transition-all border border-transparent hover:border-red-900/50"
                        title="Delete fabric"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredFabrics.length === 0 && (
          <div className="text-center py-8 text-neutral-500">
            No fabrics found with current filters.
          </div>
        )}

        <div className="mt-5 pt-5 border-t border-akahl-secondary/20 flex flex-wrap gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-akahl-secondary rounded-full"></div>
            <span className="text-neutral-400">
              <strong className="text-white">{fabrics.length}</strong> Total Fabrics
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-akahl-secondary rounded-full"></div>
            <span className="text-neutral-400">
              <strong className="text-akahl-secondary">{fabrics.filter(f => f.availability === 'available').length}</strong> In Stock
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
            <span className="text-neutral-400">
              <strong className="text-red-400">{fabrics.filter(f => f.availability === 'out_of_stock').length}</strong> Out of Stock
            </span>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-akahl-secondary/30 to-transparent mt-5"></div>
      </div>

      {/* ============================================
          GESTIÓN DE PINs
          ============================================ */}
      <div className="card-premium animate-fadeIn">
        <div className="h-px bg-gradient-to-r from-akahl-secondary via-akahl-secondary/50 to-transparent mb-5"></div>

        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-akahl-secondary rounded-full"></div>
            <h3 className="text-lg font-display font-semibold text-white tracking-[0.15em] uppercase">Access Control</h3>
          </div>
          <button
            onClick={() => setShowPinSection(!showPinSection)}
            className="px-4 py-2 bg-akahl-secondary/10 hover:bg-akahl-secondary/20 text-akahl-secondary font-medium rounded-lg transition-all active:scale-95 border border-akahl-secondary/30"
          >
            {showPinSection ? 'Hide' : 'Manage'}
          </button>
        </div>

        <div className="flex flex-wrap gap-6 text-sm mb-5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-akahl-secondary rounded-full"></div>
            <span className="text-neutral-400">
              <strong className="text-white">{Object.keys(pins).length}</strong> Total PINs
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-akahl-secondary/60 rounded-full"></div>
            <span className="text-neutral-400">
              <strong className="text-akahl-secondary">{Object.values(pins).filter(p => p.role === 'ADMIN').length}</strong> Administrators
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-neutral-600 rounded-full"></div>
            <span className="text-neutral-400">
              <strong className="text-white">{Object.values(pins).filter(p => p.role === 'USER').length}</strong> Associates
            </span>
          </div>
        </div>

        {showPinSection && (
          <div className="space-y-4 animate-fadeIn">
            <div className="border border-akahl-secondary/20 rounded-xl p-5 bg-akahl-primary/30">
              <h4 className="text-sm font-semibold text-akahl-secondary/80 mb-4 tracking-[0.1em] uppercase">Active Access Codes</h4>
              <div className="space-y-3">
                {Object.entries(pins).map(([pin, config]) => (
                  <div key={pin} className="flex items-center justify-between p-4 bg-akahl-primary/50 rounded-xl border border-akahl-secondary/10 hover:border-akahl-secondary/20 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-akahl-secondary/10 rounded-xl flex items-center justify-center border border-akahl-secondary/20">
                        <span className="text-xl font-display font-bold text-akahl-secondary tracking-widest">
                          {'•'.repeat(pin.length)}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-white tracking-wide">{config.name}</p>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          {config.role === 'ADMIN' ? 'Administrator' : 'Associate'}
                          {pin === '1234' || pin === '9999' ? ' • Default' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${
                        config.role === 'ADMIN'
                          ? 'bg-akahl-secondary/20 text-akahl-secondary border border-akahl-secondary/40'
                          : 'bg-akahl-primary/50 text-neutral-400 border border-akahl-secondary/20'
                      }`}>
                        {config.role === 'ADMIN' ? 'Admin' : 'User'}
                      </span>
                      {pin !== '1234' && pin !== '9999' && (
                        <button
                          onClick={() => handleDeletePin(pin)}
                          className="p-2.5 rounded-lg hover:bg-red-950/50 text-red-400 hover:text-red-300 transition-all border border-transparent hover:border-red-900/50"
                          title="Delete PIN"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-akahl-secondary/20 rounded-xl p-5 bg-akahl-primary/30">
              <h4 className="text-sm font-semibold text-akahl-secondary/80 mb-4 tracking-[0.1em] uppercase">Add New Access Code</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <input
                  type="text"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="4-digit PIN"
                  className="input-field text-lg text-center"
                  maxLength={4}
                />
                <input
                  type="text"
                  value={newPinName}
                  onChange={(e) => setNewPinName(e.target.value)}
                  placeholder="Name (e.g., Juan Pérez)"
                  className="input-field"
                />
                <div className="flex gap-2">
                  <select
                    value={newPinRole}
                    onChange={(e) => setNewPinRole(e.target.value)}
                    className="select-field flex-1"
                  >
                    <option value="USER">Associate</option>
                    <option value="ADMIN">Administrator</option>
                  </select>
                  <button
                    onClick={handleSavePin}
                    disabled={!newPin || newPin.length !== 4 || !newPinName.trim()}
                    className="btn-success px-6 border border-akahl-secondary/40 disabled:opacity-50 shadow-premium"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={handleResetPins}
              className="w-full py-3 bg-red-950/40 hover:bg-red-950/60 text-red-400 font-medium rounded-xl transition-all border border-red-900/50 active:scale-[0.99]"
            >
              Reset All PINs to Defaults
            </button>
          </div>
        )}

        <div className="h-px bg-gradient-to-r from-transparent via-akahl-secondary/30 to-transparent mt-5"></div>
      </div>

      {/* ============================================
          MODAL EDITAR TELA
          ============================================ */}
      {editingFabric && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="card-premium max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setEditingFabric(null)}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-akahl-secondary/10 transition-colors text-neutral-400 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1 h-6 bg-akahl-secondary rounded-full"></div>
                <h3 className="text-xl font-display font-semibold text-white tracking-[0.15em] uppercase">Edit Fabric</h3>
              </div>
              <div className="h-px bg-gradient-to-r from-akahl-secondary to-transparent mt-3"></div>
            </div>

            <div className="space-y-5">
              <div className="p-4 bg-akahl-primary/50 rounded-lg border border-akahl-secondary/10">
                <p className="text-sm font-medium text-akahl-secondary">
                  {editingFabric.codigo} — {editingFabric.name}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-akahl-secondary/80 mb-3 tracking-[0.1em] uppercase">
                  Price per Meter
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editingFabric.basePricePerMeter}
                  onChange={(e) => setEditingFabric({
                    ...editingFabric,
                    basePricePerMeter: parseFloat(e.target.value) || 0
                  })}
                  className="input-field text-xl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-akahl-secondary/80 mb-3 tracking-[0.1em] uppercase">
                  Availability
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setEditingFabric({...editingFabric, availability: 'available'})}
                    className={`p-4 rounded-xl border transition-all ${
                      editingFabric.availability === 'available'
                        ? 'border-akahl-secondary bg-akahl-secondary/10 text-akahl-secondary'
                        : 'border-akahl-secondary/20 bg-akahl-primary/50 text-neutral-400 hover:border-akahl-secondary/40'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">In Stock</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setEditingFabric({...editingFabric, availability: 'out_of_stock'})}
                    className={`p-4 rounded-xl border transition-all ${
                      editingFabric.availability === 'out_of_stock'
                        ? 'border-red-900/50 bg-red-950/30 text-red-400'
                        : 'border-akahl-secondary/20 bg-akahl-primary/50 text-neutral-400 hover:border-red-900/30'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">Out of Stock</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button onClick={handleSaveFabric} className="btn-success border border-akahl-secondary/40 shadow-premium">
                Save Changes
              </button>
              <button
                onClick={() => setEditingFabric(null)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================
          MODAL CREAR TELA
          ============================================ */}
      {creatingFabric && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="card-premium max-w-md w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setCreatingFabric(false)}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-akahl-secondary/10 transition-colors text-neutral-400 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1 h-6 bg-akahl-secondary rounded-full"></div>
                <h3 className="text-xl font-display font-semibold text-white tracking-[0.15em] uppercase">Create New Fabric</h3>
              </div>
              <div className="h-px bg-gradient-to-r from-akahl-secondary to-transparent mt-3"></div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-akahl-secondary/80 mb-2 tracking-[0.1em] uppercase">Code *</label>
                <input
                  type="text"
                  value={newFabricData.codigo}
                  onChange={(e) => setNewFabricData({...newFabricData, codigo: e.target.value.toUpperCase()})}
                  placeholder="e.g., TL-402"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-akahl-secondary/80 mb-2 tracking-[0.1em] uppercase">Name *</label>
                <input
                  type="text"
                  value={newFabricData.nombre}
                  onChange={(e) => setNewFabricData({...newFabricData, nombre: e.target.value})}
                  placeholder="e.g., Italian Linen Navy Blue"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-akahl-secondary/80 mb-2 tracking-[0.1em] uppercase">Color</label>
                <input
                  type="text"
                  value={newFabricData.color}
                  onChange={(e) => setNewFabricData({...newFabricData, color: e.target.value})}
                  placeholder="e.g., Navy Blue"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-akahl-secondary/80 mb-2 tracking-[0.1em] uppercase">Price per Yard *</label>
                <input
                  type="number"
                  step="0.01"
                  value={newFabricData.precio_por_yarda}
                  onChange={(e) => setNewFabricData({...newFabricData, precio_por_yarda: parseFloat(e.target.value) || 0})}
                  placeholder="0.00"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-akahl-secondary/80 mb-2 tracking-[0.1em] uppercase">Availability</label>
                <select
                  value={newFabricData.disponibilidad}
                  onChange={(e) => setNewFabricData({...newFabricData, disponibilidad: e.target.value})}
                  className="select-field"
                >
                  <option value="disponible">In Stock</option>
                  <option value="agotado">Out of Stock</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-akahl-secondary/80 mb-2 tracking-[0.1em] uppercase">Composition</label>
                  <input
                    type="text"
                    value={newFabricData.composicion}
                    onChange={(e) => setNewFabricData({...newFabricData, composicion: e.target.value})}
                    placeholder="e.g., 100% Linen"
                    className="input-field text-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-akahl-secondary/80 mb-2 tracking-[0.1em] uppercase">Weight</label>
                  <input
                    type="text"
                    value={newFabricData.peso}
                    onChange={(e) => setNewFabricData({...newFabricData, peso: e.target.value})}
                    placeholder="e.g., 280g"
                    className="input-field text-lg"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button onClick={handleCreateFabric} className="btn-success border border-akahl-secondary/40 shadow-premium">
                Create Fabric
              </button>
              <button
                onClick={() => {
                  setCreatingFabric(false);
                  setNewFabricData({
                    codigo: '',
                    nombre: '',
                    color: '',
                    precio_por_yarda: 0,
                    disponibilidad: 'disponible',
                    id_coleccion: 1,
                    composicion: '',
                    peso: ''
                  });
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
