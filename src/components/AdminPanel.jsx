/**
 * Componente: AdminPanel
 *
 * Panel de administración - Estilo AKAHL.
 * - Ver catálogo de telas
 * - Editar precios y disponibilidad
 * - Ajustar multiplicadores de precio
 * - Gestionar PINs de acceso
 */

import { useState, useCallback, useEffect } from 'react';
import { getAllFabrics, updateFabric, getPricingConfig, updatePricingMultipliers, getAllPinsAPI, savePinAPI, deletePinAPI, resetPinsAPI } from '../services/api';

// ============================================
// COMPONENTE
// ============================================

function AdminPanel({ onActivity }) {
  // Estado de telas
  const [fabrics, setFabrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingFabric, setEditingFabric] = useState(null);

  // Estado de multiplicadores
  const [pricing, setPricing] = useState(null);
  const [editingPricing, setEditingPricing] = useState(false);
  const [tempMultipliers, setTempMultipliers] = useState(null);

  // Filtros
  const [filter, setFilter] = useState('all'); // 'all', 'available', 'out_of_stock'
  const [searchTerm, setSearchTerm] = useState('');

  // Estado de PINs
  const [pins, setPins] = useState({});
  const [showPinSection, setShowPinSection] = useState(false);
  const [editingPin, setEditingPin] = useState(null);
  const [newPin, setNewPin] = useState('');
  const [newPinName, setNewPinName] = useState('');
  const [newPinRole, setNewPinRole] = useState('USER');

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

  // ============================================
  // MANEJADORES
  // ============================================

  /**
   * Guarda cambios en una tela
   */
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

  /**
   * Cambia disponibilidad de una tela
   */
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

  /**
   * Guarda multiplicadores
   */
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

  /**
   * Filtra telas
   */
  const filteredFabrics = fabrics.filter((fabric) => {
    const matchesFilter = filter === 'all' || fabric.availability === filter;
    const matchesSearch = !searchTerm ||
      fabric.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fabric.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fabric.supplier.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  // ============================================
  // MANEJADORES DE PINs
  // ============================================

  /**
   * Cargar PINs al iniciar
   */
  useEffect(() => {
    setPins(getAllPinsAPI());
  }, []);

  /**
   * Guardar un nuevo PIN
   */
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

  /**
   * Eliminar un PIN
   */
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

  /**
   * Restablecer PINs a valores por defecto
   */
  const handleResetPins = () => {
    if (confirm('¿Restablecer todos los PINs a los valores por defecto? Se perderán todos los PINs personalizados.')) {
      resetPinsAPI();
      setPins(getAllPinsAPI());
      onActivity?.();
    }
  };

  // ============================================
  // RENDERIZADO
  // ============================================

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <svg className="w-12 h-12 text-white animate-spin mx-auto" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-neutral-500 mt-4 tracking-wide">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sección de multiplicadores */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-display font-semibold text-white tracking-wide">PRICE MULTIPLIERS</h3>
          {!editingPricing && (
            <button
              onClick={() => setEditingPricing(true)}
              className="px-4 py-2 bg-white hover:bg-neutral-100 text-neutral-900 font-medium rounded-lg transition-colors active:scale-95 border border-white/20"
            >
              Edit
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2 px-3 font-medium text-neutral-400 tracking-wide">Garment</th>
                <th className="text-center py-2 px-3 font-medium text-neutral-400 tracking-wide">Bespoke</th>
                <th className="text-center py-2 px-3 font-medium text-neutral-400 tracking-wide">Industrial</th>
              </tr>
            </thead>
            <tbody>
              {pricing && Object.keys(pricing.multipliers.bespoke).map((garment) => (
                <tr key={garment} className="border-b border-white/5 last:border-0">
                  <td className="py-2 px-3 text-neutral-300 capitalize">
                    {garment.replace('-', ' ')}
                  </td>
                  <td className="py-2 px-3 text-center">
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
                        className="w-16 px-2 py-1 text-center bg-neutral-800 border border-neutral-700 rounded text-white focus:border-white focus:outline-none"
                      />
                    ) : (
                      <span className="font-medium text-white">
                        {pricing.multipliers.bespoke[garment]}x
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-center">
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
                        className="w-16 px-2 py-1 text-center bg-neutral-800 border border-neutral-700 rounded text-white focus:border-white focus:outline-none"
                      />
                    ) : (
                      <span className="font-medium text-white">
                        {pricing.multipliers.industrial[garment]}x
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {editingPricing && (
          <div className="mt-4 flex gap-3">
            <button
              onClick={handleSaveMultipliers}
              className="btn-success border border-white/20"
            >
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
      </div>

      {/* Sección de gestión de PINs */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-display font-semibold text-white tracking-wide">ACCESS PINS</h3>
          <button
            onClick={() => setShowPinSection(!showPinSection)}
            className="px-4 py-2 bg-white hover:bg-neutral-100 text-neutral-900 font-medium rounded-lg transition-colors active:scale-95 border border-white/20"
          >
            {showPinSection ? 'Hide' : 'Manage'}
          </button>
        </div>

        {/* Resumen de PINs */}
        <div className="flex flex-wrap gap-4 text-sm text-neutral-500 mb-4">
          <span>
            <strong className="text-white">{Object.keys(pins).length}</strong> total PINs
          </span>
          <span>
            <strong className="text-white">{Object.values(pins).filter(p => p.role === 'ADMIN').length}</strong> administrators
          </span>
          <span>
            <strong className="text-white">{Object.values(pins).filter(p => p.role === 'USER').length}</strong> associates
          </span>
        </div>

        {showPinSection && (
          <div className="space-y-4 animate-fadeIn">
            {/* Lista de PINs */}
            <div className="border border-white/10 rounded-lg p-4">
              <h4 className="text-sm font-medium text-neutral-400 mb-3 tracking-wide">ACTIVE PINS</h4>
              <div className="space-y-2">
                {Object.entries(pins).map(([pin, config]) => (
                  <div key={pin} className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center">
                        <span className="text-lg font-display font-semibold text-white tracking-wider">
                          {'•'.repeat(pin.length)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-white">{config.name}</p>
                        <p className="text-xs text-neutral-400">
                          {config.role === 'ADMIN' ? 'Administrator' : 'Associate'}
                          {pin === '1234' || pin === '9999' ? ' • Default' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        config.role === 'ADMIN'
                          ? 'bg-white/10 text-white border border-white/20'
                          : 'bg-neutral-700 text-neutral-400 border border-white/10'
                      }`}>
                        {config.role === 'ADMIN' ? 'ADMIN' : 'USER'}
                      </span>
                      {pin !== '1234' && pin !== '9999' && (
                        <button
                          onClick={() => handleDeletePin(pin)}
                          className="p-2 rounded-lg hover:bg-red-950/30 text-red-400 hover:text-red-300 transition-colors"
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

            {/* Agregar nuevo PIN */}
            <div className="border border-white/10 rounded-lg p-4">
              <h4 className="text-sm font-medium text-neutral-400 mb-3 tracking-wide">ADD NEW PIN</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                    className="btn-success px-6 border border-white/20 disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Restablecer PINs */}
            <button
              onClick={handleResetPins}
              className="w-full py-3 bg-red-950/30 hover:bg-red-950/50 text-red-400 font-medium rounded-lg transition-colors border border-red-900/50"
            >
              Reset All PINs to Defaults
            </button>
          </div>
        )}
      </div>

      {/* Catálogo de telas */}
      <div className="card">
        {/* Filtros y búsqueda */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search fabrics..."
              className="input-field text-lg"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-white text-neutral-900'
                  : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 border border-white/10'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('available')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'available'
                  ? 'bg-white text-neutral-900'
                  : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 border border-white/10'
              }`}
            >
              In Stock
            </button>
            <button
              onClick={() => setFilter('out_of_stock')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'out_of_stock'
                  ? 'bg-white text-neutral-900'
                  : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 border border-white/10'
              }`}
            >
              Out of Stock
            </button>
          </div>
        </div>

        {/* Tabla de telas */}
        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="text-left py-3 px-4 font-semibold text-white tracking-wide">Code</th>
                <th className="text-left py-3 px-4 font-semibold text-white tracking-wide">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-white tracking-wide">Supplier</th>
                <th className="text-right py-3 px-4 font-semibold text-white tracking-wide">Price/M</th>
                <th className="text-center py-3 px-4 font-semibold text-white tracking-wide">Status</th>
                <th className="text-center py-3 px-4 font-semibold text-white tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFabrics.map((fabric) => (
                <tr key={fabric.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 font-medium text-white tracking-wide">{fabric.code}</td>
                  <td className="py-3 px-4 text-neutral-400">{fabric.name}</td>
                  <td className="py-3 px-4 text-neutral-500">{fabric.supplier}</td>
                  <td className="py-3 px-4 text-right font-medium text-white">
                    ${fabric.basePricePerMeter.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {fabric.availability === 'available' ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/10 text-white border border-white/20">
                        In Stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-950/50 text-red-400 border border-red-900/50">
                        Out of Stock
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleToggleAvailability(fabric)}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                        title="Toggle availability"
                      >
                        {fabric.availability === 'available' ? (
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
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
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                        title="Edit price"
                      >
                        <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
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

        {/* Resumen */}
        <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap gap-4 text-sm text-neutral-500">
          <span>
            <strong className="text-white">{fabrics.length}</strong> total fabrics
          </span>
          <span>
            <strong className="text-white">{fabrics.filter(f => f.availability === 'available').length}</strong> in stock
          </span>
          <span>
            <strong className="text-red-400">{fabrics.filter(f => f.availability === 'out_of_stock').length}</strong> out of stock
          </span>
        </div>
      </div>

      {/* Modal de edición de tela */}
      {editingFabric && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-900 rounded-xl shadow-xl max-w-md w-full p-6 border border-white/10 animate-fadeIn">
            <h3 className="text-xl font-display font-semibold text-white mb-4 tracking-wide">Edit Fabric</h3>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-neutral-400 mb-1">
                  {editingFabric.code} — {editingFabric.name}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2 tracking-wide">
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
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2 tracking-wide">
                  Availability
                </label>
                <select
                  value={editingFabric.availability}
                  onChange={(e) => setEditingFabric({
                    ...editingFabric,
                    availability: e.target.value
                  })}
                  className="select-field"
                >
                  <option value="available">In Stock</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button onClick={handleSaveFabric} className="btn-success border border-white/20">
                Save
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
    </div>
  );
}

export default AdminPanel;
