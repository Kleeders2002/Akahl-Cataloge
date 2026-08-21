/**
 * Componente: AdminPanel
 *
 * Panel de administración reestructurado - Estilo AKAHL Premium.
 * - Sistema de tabs: Marcas, Colecciones, Telas, Multiplicadores
 * - CRUD completo de marcas y colecciones
 * - Gestión individual y batch de telas
 * - Gestión de multiplicadores de precio
 */

import { useState, useCallback, useEffect } from 'react';
import {
  getAllFabrics,
  updateFabric,
  getPricingConfig,
  updatePricingMultipliers,
  getFabricByCode,
  createFabric,
  deleteFabric,
  getAllMarcas,
  createMarca,
  updateMarca,
  deleteMarca,
  getAllColecciones,
  createColeccion,
  updateColeccion,
  deleteColeccion,
  createFabricsBatch,
  updateFabricsBatch,
  deleteFabricsBatch
} from '../services/api';
import AdminPriceModal from './AdminPriceModal';

// ============================================
// CONSTANTES - TIPOS
// ============================================

const MANUFACTURING_TYPES = [
  { id: 'bespoke', name: 'Bespoke', description: 'Handcrafted' },
  { id: 'industrial', name: 'No Bespoke', description: 'Machine made' },
];

const GARMENT_TYPES = [
  { id: 'jacket', name: 'Jacket', image: '/jacket.png' },
  { id: 'trousers', name: 'Trousers', image: '/trousers.png' },
  { id: 'vest', name: 'Vest', image: '/vest.png' },
  { id: '2-piece', name: '2-Piece Suit', image: '/2-piece.png' },
  { id: '3-piece', name: '3-Piece Suit', image: '/3-piece.png' },
];

const TABS = [
  { id: 'marcas', label: 'Brands' },
  { id: 'colecciones', label: 'Collections' },
  { id: 'telas', label: 'Fabrics' },
  { id: 'multiplicadores', label: 'Multipliers' },
];

// ============================================
// COMPONENTE
// ============================================

function AdminPanel({ onActivity }) {
  // ============================================
  // ESTADO PRINCIPAL - TABS
  // ============================================
  const [activeTab, setActiveTab] = useState('marcas');
  const [loading, setLoading] = useState(true);

  // ============================================
  // ESTADOS - MARCAS
  // ============================================
  const [marcas, setMarcas] = useState([]);
  const [editingMarca, setEditingMarca] = useState(null);
  const [creatingMarca, setCreatingMarca] = useState(false);
  const [newMarcaName, setNewMarcaName] = useState('');

  // ============================================
  // ESTADOS - COLECCIONES
  // ============================================
  const [colecciones, setColecciones] = useState([]);
  const [editingColeccion, setEditingColeccion] = useState(null);
  const [creatingColeccion, setCreatingColeccion] = useState(false);
  const [newColeccionData, setNewColeccionData] = useState({
    id_marca: '',
    nombre: '',
    descuento_default: 0.35
  });

  // ============================================
  // ESTADOS - TELAS
  // ============================================
  const [fabrics, setFabrics] = useState([]);
  const [editingFabric, setEditingFabric] = useState(null);
  const [creatingFabric, setCreatingFabric] = useState(false);
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

  // Telas - Batch
  const [batchCodes, setBatchCodes] = useState([]);
  const [batchInputValue, setBatchInputValue] = useState('');
  const [batchMarca, setBatchMarca] = useState(''); // Brand seleccionado para batch
  const [batchColeccion, setBatchColeccion] = useState('');
  const [batchPrecio, setBatchPrecio] = useState(0);
  const [batchDescuento, setBatchDescuento] = useState(0.35);
  const [batchResult, setBatchResult] = useState(null);
  const [batchProcessing, setBatchProcessing] = useState(false);

  // Telas - Selección múltiple
  const [selectedFabrics, setSelectedFabrics] = useState([]);
  const [batchActionModal, setBatchActionModal] = useState(null); // 'price' | 'coleccion' | null
  const [batchUpdateData, setBatchUpdateData] = useState({
    precio_por_yarda: '',
    descuento: '',
    id_coleccion: ''
  });

  // Filtros de telas
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // ============================================
  // ESTADOS - MULTIPLICADORES
  // ============================================
  const [pricing, setPricing] = useState(null);
  const [editingPricing, setEditingPricing] = useState(false);
  const [tempMultipliers, setTempMultipliers] = useState(null);

  // ============================================
  // OTROS ESTADOS
  // ============================================
  const [priceModalFabric, setPriceModalFabric] = useState(null);

  // ============================================
  // CARGA DE DATOS
  // ============================================
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [marcasData, coleccionesData, fabricsData, pricingData] = await Promise.all([
        getAllMarcas().catch(() => []),
        getAllColecciones().catch(() => []),
        getAllFabrics(),
        getPricingConfig(),
      ]);
      setMarcas(Array.isArray(marcasData) ? marcasData : []);
      setColecciones(Array.isArray(coleccionesData) ? coleccionesData : []);
      setFabrics(Array.isArray(fabricsData) ? fabricsData : []);
      setPricing(pricingData);
      // Inicializar tempMultipliers con los tipos completos para edición
      setTempMultipliers(JSON.parse(JSON.stringify(pricingData?.tipos || [])));

      // Set default brand y colección para batch
      if (marcasData?.length > 0) {
        const firstBrand = marcasData[0];
        setBatchMarca(firstBrand.id_marca);
        // Buscar la primera colección de este brand
        const firstBrandCollection = coleccionesData?.find(c => c.id_marca === firstBrand.id_marca);
        if (firstBrandCollection) {
          setBatchColeccion(firstBrandCollection.id_coleccion);
        }
      }
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
  // HANDLERS - MARCAS
  // ============================================
  const handleCreateMarca = async () => {
    if (!newMarcaName.trim()) {
      alert('El nombre de la marca es obligatorio');
      return;
    }
    try {
      const created = await createMarca(newMarcaName.trim());
      setMarcas([...marcas, created]);
      setNewMarcaName('');
      setCreatingMarca(false);
      onActivity?.();
    } catch (error) {
      console.error('Error creating marca:', error);
      alert(error.response?.data?.message || 'Error creating brand');
    }
  };

  const handleUpdateMarca = async () => {
    if (!editingMarca?.nombre.trim()) {
      alert('El nombre de la marca es obligatorio');
      return;
    }
    try {
      const updated = await updateMarca(editingMarca.id_marca, editingMarca.nombre.trim());
      setMarcas(marcas.map(m => m.id_marca === updated.id_marca ? updated : editingMarca));
      setEditingMarca(null);
      onActivity?.();
    } catch (error) {
      console.error('Error updating marca:', error);
      alert(error.response?.data?.message || 'Error updating brand');
    }
  };

  const handleDeleteMarca = async (marca) => {
    const coleccionesCount = marca._count?.colecciones || 0;
    if (coleccionesCount > 0) {
      alert(`Cannot delete brand "${marca.nombre}" because it has ${coleccionesCount} associated collection(s).\n\nDelete collections first.`);
      return;
    }
    if (!confirm(`Delete brand "${marca.nombre}"?`)) {
      return;
    }
    try {
      await deleteMarca(marca.id_marca);
      setMarcas(marcas.filter(m => m.id_marca !== marca.id_marca));
      onActivity?.();
    } catch (error) {
      console.error('Error deleting marca:', error);
      alert(error.response?.data?.message || 'Error deleting brand');
    }
  };

  // ============================================
  // HANDLERS - COLECCIONES
  // ============================================
  const handleCreateColeccion = async () => {
    if (!newColeccionData.id_marca || !newColeccionData.nombre.trim()) {
      alert('Brand and name are required');
      return;
    }
    try {
      const created = await createColeccion(
        parseInt(newColeccionData.id_marca),
        newColeccionData.nombre.trim(),
        parseFloat(newColeccionData.descuento_default)
      );
      setColecciones([...colecciones, created]);
      setNewColeccionData({ id_marca: '', nombre: '', descuento_default: 0.35 });
      setCreatingColeccion(false);
      onActivity?.();
    } catch (error) {
      console.error('Error creating coleccion:', error);
      alert(error.response?.data?.message || 'Error creating collection');
    }
  };

  const handleUpdateColeccion = async () => {
    if (!editingColeccion?.nombre.trim()) {
      alert('Collection name is required');
      return;
    }
    try {
      const updated = await updateColeccion(
        editingColeccion.id_coleccion,
        editingColeccion.nombre.trim(),
        parseFloat(editingColeccion.descuento_default)
      );
      setColecciones(colecciones.map(c => c.id_coleccion === updated.id_coleccion ? updated : editingColeccion));
      setEditingColeccion(null);
      onActivity?.();
    } catch (error) {
      console.error('Error updating coleccion:', error);
      alert(error.response?.data?.message || 'Error updating collection');
    }
  };

  const handleDeleteColeccion = async (coleccion) => {
    const telasCount = coleccion._count?.telas || 0;
    if (telasCount > 0) {
      alert(`Cannot delete collection "${coleccion.nombre}" because it has ${telasCount} associated fabric(s).\n\nDelete or reassign fabrics first.`);
      return;
    }
    if (!confirm(`Delete collection "${coleccion.nombre}"?`)) {
      return;
    }
    try {
      await deleteColeccion(coleccion.id_coleccion);
      setColecciones(colecciones.filter(c => c.id_coleccion !== coleccion.id_coleccion));
      onActivity?.();
    } catch (error) {
      console.error('Error deleting coleccion:', error);
      alert(error.response?.data?.message || 'Error deleting collection');
    }
  };

  // ============================================
  // HANDLERS - TELAS (BATCH)
  // ============================================
  const handleBatchAddCode = () => {
    const code = batchInputValue.trim().toUpperCase();
    if (!code) return;
    if (batchCodes.includes(code)) {
      alert('This code is already in the list');
      return;
    }
    setBatchCodes([...batchCodes, code]);
    setBatchInputValue('');
  };

  const handleBatchRemoveCode = (code) => {
    setBatchCodes(batchCodes.filter(c => c !== code));
  };

  const handleBatchBrandChange = (newBrandId) => {
    setBatchMarca(newBrandId);
    // Actualizar a la primera colección del nuevo brand
    const firstCollectionOfBrand = colecciones.find(c => c.id_marca === parseInt(newBrandId));
    if (firstCollectionOfBrand) {
      setBatchColeccion(firstCollectionOfBrand.id_coleccion);
    }
  };

  const handleBatchCreate = async () => {
    if (batchCodes.length === 0) {
      alert('Add at least one code');
      return;
    }
    if (!batchColeccion) {
      alert('Select a collection');
      return;
    }

    setBatchProcessing(true);
    try {
      const result = await createFabricsBatch(
        parseInt(batchColeccion),
        batchCodes,
        parseFloat(batchPrecio),
        parseFloat(batchDescuento)
      );

      setBatchResult(result);

      if (result.created > 0) {
        // Recargar telas
        const updatedFabrics = await getAllFabrics();
        setFabrics(updatedFabrics);
      }

      onActivity?.();
    } catch (error) {
      console.error('Error in batch create:', error);
      alert(error.response?.data?.message || 'Error creating fabrics');
    } finally {
      setBatchProcessing(false);
    }
  };

  const handleBatchClear = () => {
    setBatchCodes([]);
    setBatchInputValue('');
    setBatchResult(null);
  };

  // ============================================
  // HANDLERS - TELAS (SELECCIÓN MÚLTIPLE)
  // ============================================
  const handleSelectAllFabrics = (checked) => {
    if (checked) {
      setSelectedFabrics(filteredFabrics);
    } else {
      setSelectedFabrics([]);
    }
  };

  const handleSelectFabric = (fabric, checked) => {
    if (checked) {
      setSelectedFabrics([...selectedFabrics, fabric]);
    } else {
      setSelectedFabrics(selectedFabrics.filter(f => f.id !== fabric.id));
    }
  };

  const handleBatchUpdate = async () => {
    if (selectedFabrics.length === 0) return;

    const ids = selectedFabrics.map(f => f.id);
    const updates = {};

    if (batchActionModal === 'price' && batchUpdateData.precio_por_yarda) {
      updates.precio_por_yarda = parseFloat(batchUpdateData.precio_por_yarda);
    }
    if (batchActionModal === 'price' && batchUpdateData.descuento !== '') {
      updates.descuento = parseFloat(batchUpdateData.descuento);
    }
    if (batchActionModal === 'coleccion' && batchUpdateData.id_coleccion) {
      updates.id_coleccion = parseInt(batchUpdateData.id_coleccion);
    }

    if (Object.keys(updates).length === 0) {
      alert('Specify at least one value to update');
      return;
    }

    try {
      const result = await updateFabricsBatch(ids, updates.precio_por_yarda, updates.descuento, updates.id_coleccion);

      // Recargar telas
      const updatedFabrics = await getAllFabrics();
      setFabrics(updatedFabrics);
      setSelectedFabrics([]);
      setBatchActionModal(null);
      setBatchUpdateData({ precio_por_yarda: '', descuento: '', id_coleccion: '' });

      alert(`Updated: ${result.updated} of ${result.total} fabrics`);
      onActivity?.();
    } catch (error) {
      console.error('Error in batch update:', error);
      alert(error.response?.data?.message || 'Error updating fabrics');
    }
  };

  const handleBatchDelete = async () => {
    if (selectedFabrics.length === 0) return;
    if (!confirm(`Delete ${selectedFabrics.length} fabric(s)? This action cannot be undone.`)) {
      return;
    }

    const ids = selectedFabrics.map(f => f.id);

    try {
      const result = await deleteFabricsBatch(ids);

      // Recargar telas
      const updatedFabrics = await getAllFabrics();
      setFabrics(updatedFabrics);
      setSelectedFabrics([]);

      if (result.errors && result.errors.length > 0) {
        alert(`Deleted: ${result.deleted} of ${result.total} fabrics\n\nErrors:\n${result.errors.map(e => `- ${e.message}`).join('\n')}`);
      } else {
        alert(`Deleted ${result.deleted} fabrics`);
      }

      onActivity?.();
    } catch (error) {
      console.error('Error in batch delete:', error);
      alert(error.response?.data?.message || 'Error deleting fabrics');
    }
  };

  // ============================================
  // HANDLERS - TELAS (INDIVIDUALES)
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
      alert('Error saving fabric');
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
      alert('Error changing availability');
    }
  };

  const handleDeleteFabric = async (fabricId) => {
    if (!confirm('Delete this fabric? This action cannot be undone.')) {
      return;
    }
    try {
      await deleteFabric(fabricId);
      setFabrics(fabrics.filter(f => f.id !== fabricId));
      onActivity?.();
    } catch (error) {
      console.error('Error deleting fabric:', error);
      alert('Error deleting fabric');
    }
  };

  const handleCreateFabric = async () => {
    if (!newFabricData.codigo || !newFabricData.nombre) {
      alert('Code and name are required');
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
        id_coleccion: batchColeccion || 1,
        composicion: '',
        peso: ''
      });
      onActivity?.();
    } catch (error) {
      console.error('Error creating fabric:', error);
      alert('Error creating fabric');
    }
  };

  const filteredFabrics = fabrics.filter((fabric) => {
    const matchesFilter = filter === 'all' || fabric.availability === filter;
    const matchesSearch = !searchTerm ||
      fabric.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fabric.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (fabric.marca || fabric.supplier).toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // ============================================
  // HANDLERS - MULTIPLICADORES
  // ============================================
  const handleSaveMultipliers = async () => {
    try {
      await updatePricingMultipliers(tempMultipliers);
      setPricing({ ...pricing, tipos: tempMultipliers });
      setEditingPricing(false);
      onActivity?.();
    } catch (error) {
      console.error('Error saving multipliers:', error);
      alert('Error saving multipliers');
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
          HEADER CON TABS
          ============================================ */}
      <div className="card-premium animate-slide-up">
        <div className="h-px bg-gradient-to-r from-akahl-secondary via-akahl-secondary/50 to-transparent mb-5"></div>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-1 h-6 bg-akahl-secondary rounded-full"></div>
          <h2 className="text-xl font-display font-semibold text-white tracking-[0.15em] uppercase">Admin Panel</h2>
        </div>

        <div className="flex flex-wrap gap-2">
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3 rounded-xl font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-akahl-secondary text-akahl-primary shadow-premium scale-105'
                    : 'bg-akahl-primary/50 text-neutral-400 hover:bg-akahl-primary/70 border border-akahl-secondary/20'
                }`}
              >
                <span className="tracking-wide">{tab.label}</span>
              </button>
            );
          })}
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-akahl-secondary/30 to-transparent mt-5"></div>
      </div>

      {/* ============================================
          SECCIÓN: MARCAS
          ============================================ */}
      {activeTab === 'marcas' && (
        <div className="card-premium animate-fadeIn">
          <div className="h-px bg-gradient-to-r from-akahl-secondary via-akahl-secondary/50 to-transparent mb-5"></div>

          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-akahl-secondary rounded-full"></div>
              <h3 className="text-lg font-display font-semibold text-white tracking-[0.15em] uppercase">Brands</h3>
            </div>
            <button
              onClick={() => setCreatingMarca(true)}
              className="px-4 py-2 bg-akahl-secondary/10 hover:bg-akahl-secondary/20 text-akahl-secondary font-medium rounded-lg transition-all active:scale-95 border border-akahl-secondary/30 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Brand
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-akahl-secondary/20">
                  <th className="text-left py-3 px-3 font-semibold text-white tracking-[0.1em] uppercase text-xs">Name</th>
                  <th className="text-center py-3 px-3 font-semibold text-white tracking-[0.1em] uppercase text-xs"># Collections</th>
                  <th className="text-center py-3 px-3 font-semibold text-white tracking-[0.1em] uppercase text-xs">Created</th>
                  <th className="text-center py-3 px-3 font-semibold text-white tracking-[0.1em] uppercase text-xs">Actions</th>
                </tr>
              </thead>
              <tbody>
                {marcas.map(marca => (
                  <tr key={marca.id_marca} className="border-b border-akahl-secondary/10 hover:bg-akahl-secondary/5 transition-colors">
                    <td className="py-3 px-3 font-medium text-white">{marca.nombre}</td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                        marca._count?.colecciones > 0
                          ? 'bg-akahl-secondary/20 text-akahl-secondary'
                          : 'bg-neutral-700 text-neutral-400'
                      }`}>
                        {marca._count?.colecciones || 0}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center text-neutral-400">
                      {marca.createdAt ? new Date(marca.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setEditingMarca(marca)}
                          className="p-2 rounded-lg hover:bg-akahl-secondary/10 transition-all border border-transparent hover:border-akahl-secondary/30"
                          title="Edit"
                        >
                          <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteMarca(marca)}
                          className="p-2 rounded-lg hover:bg-red-950/50 text-red-400 hover:text-red-300 transition-all border border-transparent hover:border-red-900/50"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
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

          {marcas.length === 0 && (
            <div className="text-center py-8 text-neutral-500">
              No brands registered. Add the first brand.
            </div>
          )}
        </div>
      )}

      {/* ============================================
          SECCIÓN: COLECCIONES
          ============================================ */}
      {activeTab === 'colecciones' && (
        <div className="card-premium animate-fadeIn">
          <div className="h-px bg-gradient-to-r from-akahl-secondary via-akahl-secondary/50 to-transparent mb-5"></div>

          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-akahl-secondary rounded-full"></div>
              <h3 className="text-lg font-display font-semibold text-white tracking-[0.15em] uppercase">Collections</h3>
            </div>
            <button
              onClick={() => setCreatingColeccion(true)}
              disabled={marcas.length === 0}
              className="px-4 py-2 bg-akahl-secondary/10 hover:bg-akahl-secondary/20 text-akahl-secondary font-medium rounded-lg transition-all active:scale-95 border border-akahl-secondary/30 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Collection
            </button>
          </div>

          {marcas.length === 0 && (
            <div className="mb-5 p-4 bg-akahl-secondary/10 border border-akahl-secondary/30 rounded-xl text-center">
              <p className="text-akahl-secondary/80">First create at least one brand in the Brands section</p>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-akahl-secondary/20">
                  <th className="text-left py-3 px-3 font-semibold text-white tracking-[0.1em] uppercase text-xs">Name</th>
                  <th className="text-left py-3 px-3 font-semibold text-white tracking-[0.1em] uppercase text-xs">Brand</th>
                  <th className="text-center py-3 px-3 font-semibold text-white tracking-[0.1em] uppercase text-xs">Discount</th>
                  <th className="text-center py-3 px-3 font-semibold text-white tracking-[0.1em] uppercase text-xs"># Fabrics</th>
                  <th className="text-center py-3 px-3 font-semibold text-white tracking-[0.1em] uppercase text-xs">Actions</th>
                </tr>
              </thead>
              <tbody>
                {colecciones.map(coleccion => (
                  <tr key={coleccion.id_coleccion} className="border-b border-akahl-secondary/10 hover:bg-akahl-secondary/5 transition-colors">
                    <td className="py-3 px-3 font-medium text-white">{coleccion.nombre}</td>
                    <td className="py-3 px-3 text-neutral-400">{coleccion.marca?.nombre || 'N/A'}</td>
                    <td className="py-3 px-3 text-center">
                      <span className="text-akahl-secondary font-medium">
                        {((coleccion.descuento_default || 0) * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                        coleccion._count?.telas > 0
                          ? 'bg-akahl-secondary/20 text-akahl-secondary'
                          : 'bg-neutral-700 text-neutral-400'
                      }`}>
                        {coleccion._count?.telas || 0}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setEditingColeccion(coleccion)}
                          className="p-2 rounded-lg hover:bg-akahl-secondary/10 transition-all border border-transparent hover:border-akahl-secondary/30"
                          title="Edit"
                        >
                          <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteColeccion(coleccion)}
                          className="p-2 rounded-lg hover:bg-red-950/50 text-red-400 hover:text-red-300 transition-all border border-transparent hover:border-red-900/50"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
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

          {colecciones.length === 0 && marcas.length > 0 && (
            <div className="text-center py-8 text-neutral-500">
              No collections registered. Add the first collection.
            </div>
          )}
        </div>
      )}

      {/* ============================================
          SECCIÓN: TELAS - INGRESO RÁPIDO
          ============================================ */}
      {activeTab === 'telas' && (
        <>
          <div className="card-premium animate-fadeIn">
            <div className="h-px bg-gradient-to-r from-akahl-secondary via-akahl-secondary/50 to-transparent mb-5"></div>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-6 bg-akahl-secondary rounded-full"></div>
              <h3 className="text-lg font-display font-semibold text-white tracking-[0.15em] uppercase">Quick Fabric Entry</h3>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {/* Input de códigos */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-akahl-secondary/80 mb-3 tracking-[0.1em] uppercase">
                    Códigos (presiona Enter para agregar)
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={batchInputValue}
                      onChange={(e) => setBatchInputValue(e.target.value.toUpperCase())}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleBatchAddCode();
                        }
                      }}
                      placeholder="Escribe el código aquí..."
                      className="flex-1 text-3xl font-bold text-white bg-akahl-primary border-2 border-akahl-secondary/50 rounded-xl py-5 px-6 shadow-premium placeholder:text-white/30 focus:border-akahl-secondary focus:outline-none focus:ring-2 focus:ring-akahl-secondary/30"
                    />
                    <button
                      onClick={handleBatchAddCode}
                      className="px-10 py-5 bg-akahl-secondary text-akahl-primary text-xl font-bold rounded-xl border-2 border-akahl-secondary shadow-premium hover:shadow-premium-lg hover:bg-akahl-secondary/90 transition-all active:scale-95"
                    >
                      ADD
                    </button>
                  </div>
                </div>

                {/* Tags de códigos */}
                {batchCodes.length > 0 && (
                  <div className="p-5 bg-akahl-primary/50 rounded-xl border border-akahl-secondary/20">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-base font-semibold text-akahl-secondary tracking-wide">
                        {batchCodes.length} code{batchCodes.length !== 1 ? 's' : ''} added
                      </span>
                      <button
                        onClick={handleBatchClear}
                        className="text-sm text-red-400 hover:text-red-300 transition-colors font-medium"
                      >
                        Clear all
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {batchCodes.map((code, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-akahl-secondary/30 border border-akahl-secondary/50 rounded-lg text-base font-semibold text-akahl-secondary shadow-gold-glow animate-fadeIn"
                          style={{ animationDelay: `${idx * 30}ms` }}
                        >
                          {code}
                          <button
                            onClick={() => handleBatchRemoveCode(code)}
                            className="ml-1 w-5 h-5 flex items-center justify-center rounded-full bg-akahl-secondary/20 text-akahl-secondary hover:bg-akahl-secondary/40 transition-all font-bold"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Campos adicionales */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Brand Selector */}
                  <div>
                    <label className="block text-sm font-medium text-akahl-secondary/80 mb-2 tracking-[0.1em] uppercase">Brand *</label>
                    <select
                      value={batchMarca}
                      onChange={(e) => handleBatchBrandChange(e.target.value)}
                      className="select-field"
                      disabled={marcas.length === 0}
                    >
                      {marcas.map(marca => (
                        <option key={marca.id_marca} value={marca.id_marca}>
                          {marca.nombre}
                        </option>
                      ))}
                    </select>
                    {marcas.length === 0 && (
                      <p className="text-xs text-amber-400 mt-1">Create a brand first</p>
                    )}
                  </div>

                  {/* Collection Selector (filtrado por brand) */}
                  <div>
                    <label className="block text-sm font-medium text-akahl-secondary/80 mb-2 tracking-[0.1em] uppercase">Collection *</label>
                    <select
                      value={batchColeccion}
                      onChange={(e) => setBatchColeccion(e.target.value)}
                      className="select-field"
                      disabled={!batchMarca || colecciones.filter(c => c.id_marca === parseInt(batchMarca)).length === 0}
                    >
                      {batchMarca ? (
                        colecciones
                          .filter(c => c.id_marca === parseInt(batchMarca))
                          .map(c => (
                            <option key={c.id_coleccion} value={c.id_coleccion}>
                              {c.nombre}
                            </option>
                          ))
                      ) : (
                        <option value="">Select brand first</option>
                      )}
                    </select>
                    {batchMarca && colecciones.filter(c => c.id_marca === parseInt(batchMarca)).length === 0 && (
                      <p className="text-xs text-amber-400 mt-1">No collections for this brand</p>
                    )}
                  </div>

                  {/* Price per Yard */}
                  <div>
                    <label className="block text-sm font-medium text-akahl-secondary/80 mb-2 tracking-[0.1em] uppercase">Price per Yard *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={batchPrecio}
                      onChange={(e) => setBatchPrecio(e.target.value)}
                      placeholder="0.00"
                      className="input-field"
                    />
                  </div>

                  {/* Discount */}
                  <div>
                    <label className="block text-sm font-medium text-akahl-secondary/80 mb-2 tracking-[0.1em] uppercase">Discount (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      max="1"
                      min="0"
                      value={batchDescuento}
                      onChange={(e) => setBatchDescuento(e.target.value)}
                      placeholder="0.35"
                      className="input-field"
                    />
                  </div>

                  {/* Create Button */}
                  <div className="flex items-end">
                    <button
                      onClick={handleBatchCreate}
                      disabled={batchCodes.length === 0 || !batchColeccion || batchProcessing}
                      className="btn-success w-full py-4 text-lg font-bold border border-akahl-secondary/40 shadow-premium disabled:opacity-50"
                    >
                      {batchProcessing ? 'Processing...' : `Create ${batchCodes.length} Fabric${batchCodes.length !== 1 ? 's' : ''}`}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Resultado - Solo mostrar cuando hay resultado */}
          {batchResult && (
            <div className="card-premium animate-fadeIn">
              <div className={`w-full p-6 rounded-xl border ${batchResult.errors?.length > 0 ? 'bg-amber-950/30 border-amber-900/50' : 'bg-emerald-950/30 border-emerald-900/50'}`}>
                <h4 className="text-base font-bold mb-4 tracking-[0.1em] uppercase">Result</h4>
                <div className="space-y-3">
                  <p className="text-emerald-400 text-lg font-semibold">
                    ✓ {batchResult.created} of {batchResult.total} fabrics created successfully
                  </p>
                  {batchResult.errors?.length > 0 && (
                    <div className="mt-4">
                      <p className="text-amber-400 mb-3 font-semibold">Errors:</p>
                      {batchResult.errors.map((err, idx) => (
                        <p key={idx} className="text-neutral-400 text-sm ml-4">
                          • {err.codigo || err.id || 'N/A'}: {err.message}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={handleBatchClear}
                  className="mt-5 w-full btn-secondary py-3 text-base font-semibold"
                >
                  New Batch
                </button>
              </div>
            </div>
          )}

          {/* ============================================
              SECCIÓN: TELAS - GESTIÓN MASIVA
              ============================================ */}
          <div className="card-premium animate-fadeIn">
            <div className="h-px bg-gradient-to-r from-akahl-secondary via-akahl-secondary/50 to-transparent mb-5"></div>

            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 bg-akahl-secondary rounded-full"></div>
                <h3 className="text-lg font-display font-semibold text-white tracking-[0.15em] uppercase">Fabric Management</h3>
              </div>
              <button
                onClick={() => setCreatingFabric(true)}
                className="px-4 py-2 bg-akahl-secondary/10 hover:bg-akahl-secondary/20 text-akahl-secondary font-medium rounded-lg transition-all active:scale-95 border border-akahl-secondary/30 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                New Fabric
              </button>
            </div>

            {/* Filtros */}
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

            {/* Acciones batch (solo si hay seleccionadas) */}
            {selectedFabrics.length > 0 && (
              <div className="mb-4 p-4 bg-akahl-secondary/10 border border-akahl-secondary/30 rounded-xl flex items-center justify-between">
                <span className="text-akahl-secondary font-medium">
                  {selectedFabrics.length} selected
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setBatchActionModal('price')}
                    className="px-4 py-2 bg-akahl-primary/50 hover:bg-akahl-primary/70 text-neutral-300 font-medium rounded-lg transition-all border border-akahl-secondary/20"
                  >
                    Update Prices
                  </button>
                  <button
                    onClick={() => setBatchActionModal('coleccion')}
                    className="px-4 py-2 bg-akahl-primary/50 hover:bg-akahl-primary/70 text-neutral-300 font-medium rounded-lg transition-all border border-akahl-secondary/20"
                  >
                    Change Collection
                  </button>
                  <button
                    onClick={handleBatchDelete}
                    className="px-4 py-2 bg-red-950/40 hover:bg-red-950/60 text-red-400 font-medium rounded-lg transition-all border border-red-900/50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}

            {/* Tabla de telas */}
            <div className="overflow-x-auto -mx-2">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-akahl-secondary/20 bg-akahl-secondary/5">
                    <th className="py-3 px-3 font-semibold text-white tracking-[0.1em] uppercase text-xs w-12">
                      <input
                        type="checkbox"
                        checked={selectedFabrics.length === filteredFabrics.length && filteredFabrics.length > 0}
                        onChange={(e) => handleSelectAllFabrics(e.target.checked)}
                        className="w-4 h-4"
                      />
                    </th>
                    <th className="text-left py-3 px-3 font-semibold text-white tracking-[0.1em] uppercase text-xs">Code</th>
                    <th className="text-left py-3 px-3 font-semibold text-white tracking-[0.1em] uppercase text-xs">Brand</th>
                    <th className="text-left py-3 px-3 font-semibold text-white tracking-[0.1em] uppercase text-xs">Collection</th>
                    <th className="text-right py-3 px-3 font-semibold text-white tracking-[0.1em] uppercase text-xs">Price/Yard</th>
                    <th className="text-right py-3 px-3 font-semibold text-akahl-secondary tracking-[0.1em] uppercase text-xs">Net Price</th>
                    <th className="text-center py-3 px-3 font-semibold text-white tracking-[0.1em] uppercase text-xs">Status</th>
                    <th className="text-center py-3 px-3 font-semibold text-white tracking-[0.1em] uppercase text-xs">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFabrics.map((fabric) => {
                    const precioNeto = fabric.precio_neto ||
                      (fabric.descuento ? fabric.basePricePerMeter * (1 - fabric.descuento) : fabric.basePricePerMeter);
                    return (
                      <tr key={fabric.id} className="border-b border-akahl-secondary/10 hover:bg-akahl-secondary/5 transition-colors">
                        <td className="py-3 px-3">
                          <input
                            type="checkbox"
                            checked={selectedFabrics.some(f => f.id === fabric.id)}
                            onChange={(e) => handleSelectFabric(fabric, e.target.checked)}
                            className="w-4 h-4"
                          />
                        </td>
                        <td className="py-3 px-3 font-medium text-akahl-secondary tracking-wide">{fabric.codigo}</td>
                        <td className="py-3 px-3 text-neutral-300">{fabric.marca || fabric.supplier}</td>
                        <td className="py-3 px-3 text-neutral-500 text-xs">{fabric.coleccion}</td>
                        <td className="py-3 px-3 text-right font-medium text-white">
                          ${fabric.basePricePerMeter?.toFixed(2) || '0.00'}
                        </td>
                        <td className="py-3 px-3 text-right font-semibold text-akahl-secondary">
                          ${precioNeto?.toFixed(2) || '0.00'}
                          {fabric.descuento && fabric.descuento > 0 && (
                            <span className="text-xs text-emerald-400 ml-1">
                              ({(fabric.descuento * 100).toFixed(0)}% OFF)
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
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
                        <td className="py-3 px-3">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setPriceModalFabric(fabric)}
                              className="p-1.5 rounded-lg hover:bg-akahl-secondary/10 transition-all border border-transparent hover:border-akahl-secondary/30"
                              title="View prices"
                            >
                              <svg className="w-4 h-4 text-akahl-secondary" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleToggleAvailability(fabric)}
                              className="p-1.5 rounded-lg hover:bg-akahl-secondary/10 transition-all border border-transparent hover:border-akahl-secondary/30"
                              title="Toggle status"
                            >
                              {fabric.availability === 'available' ? (
                                <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                              )}
                            </button>
                            <button
                              onClick={() => setEditingFabric(fabric)}
                              className="p-1.5 rounded-lg hover:bg-akahl-secondary/10 transition-all border border-transparent hover:border-akahl-secondary/30"
                              title="Edit"
                            >
                              <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteFabric(fabric.id)}
                              className="p-1.5 rounded-lg hover:bg-red-950/50 text-red-400 hover:text-red-300 transition-all border border-transparent hover:border-red-900/50"
                              title="Delete"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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
                  <strong className="text-white">{fabrics.length}</strong> Total
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                <span className="text-neutral-400">
                  <strong className="text-emerald-400">{fabrics.filter(f => f.availability === 'available').length}</strong> In Stock
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <span className="text-neutral-400">
                  <strong className="text-red-400">{fabrics.filter(f => f.availability === 'out_of_stock').length}</strong> Out of Stock
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ============================================
          SECCIÓN: MULTIPLICADORES
          ============================================ */}
      {activeTab === 'multiplicadores' && (
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
                Editar
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-akahl-secondary/20">
                  <th className="text-left py-3 px-3 font-medium text-akahl-secondary/60 tracking-[0.1em] uppercase text-xs">Garment</th>
                  <th className="text-center py-3 px-3 font-medium text-akahl-secondary/60 tracking-[0.1em] uppercase text-xs">Yards Req.</th>
                  <th className="text-center py-3 px-3 font-medium text-akahl-secondary/60 tracking-[0.1em] uppercase text-xs">Mfg. Cost</th>
                  <th className="text-center py-3 px-3 font-medium text-akahl-secondary/60 tracking-[0.1em] uppercase text-xs">Ship. Cost</th>
                  <th className="text-center py-3 px-3 font-medium text-akahl-secondary/60 tracking-[0.1em] uppercase text-xs">Lining Cost</th>
                  <th className="text-center py-3 px-3 font-medium text-akahl-secondary/60 tracking-[0.1em] uppercase text-xs">Markup</th>
                </tr>
              </thead>
              <tbody>
                {tempMultipliers && tempMultipliers.map((tipo) => (
                  <tr key={tipo.id} className="border-b border-akahl-secondary/10 last:border-0 hover:bg-akahl-secondary/5 transition-colors">
                    <td className="py-3 px-3 font-medium text-white">
                      {tipo.nombre}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {editingPricing ? (
                        <input
                          type="number"
                          step="0.01"
                          value={tipo.yardas_requeridas || 0}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setTempMultipliers(prev => prev.map(t => t.id === tipo.id ? { ...t, yardas_requeridas: val } : t));
                          }}
                          className="w-20 px-3 py-2 text-center bg-akahl-primary/50 border border-akahl-secondary/30 rounded text-white focus:border-akahl-secondary focus:outline-none transition-all"
                        />
                      ) : (
                        <span className="font-medium text-neutral-300">
                          {tipo.yardas_requeridas || 0}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {editingPricing ? (
                        <input
                          type="number"
                          step="0.01"
                          value={tipo.costo_manufactura || 0}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setTempMultipliers(prev => prev.map(t => t.id === tipo.id ? { ...t, costo_manufactura: val } : t));
                          }}
                          className="w-24 px-3 py-2 text-center bg-akahl-primary/50 border border-akahl-secondary/30 rounded text-white focus:border-akahl-secondary focus:outline-none transition-all"
                        />
                      ) : (
                        <span className="font-medium text-neutral-300">
                          ${tipo.costo_manufactura || 0}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {editingPricing ? (
                        <input
                          type="number"
                          step="0.01"
                          value={tipo.costo_envio || 0}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setTempMultipliers(prev => prev.map(t => t.id === tipo.id ? { ...t, costo_envio: val } : t));
                          }}
                          className="w-20 px-3 py-2 text-center bg-akahl-primary/50 border border-akahl-secondary/30 rounded text-white focus:border-akahl-secondary focus:outline-none transition-all"
                        />
                      ) : (
                        <span className="font-medium text-neutral-300">
                          ${tipo.costo_envio || 0}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {editingPricing ? (
                        <input
                          type="number"
                          step="0.01"
                          value={tipo.costo_forro || 0}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setTempMultipliers(prev => prev.map(t => t.id === tipo.id ? { ...t, costo_forro: val } : t));
                          }}
                          className="w-20 px-3 py-2 text-center bg-akahl-primary/50 border border-akahl-secondary/30 rounded text-white focus:border-akahl-secondary focus:outline-none transition-all"
                        />
                      ) : (
                        <span className="font-medium text-neutral-300">
                          ${tipo.costo_forro || 0}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {editingPricing ? (
                        <input
                          type="number"
                          step="0.01"
                          value={tipo.markup || 0}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setTempMultipliers(prev => prev.map(t => t.id === tipo.id ? { ...t, markup: val } : t));
                          }}
                          className="w-20 px-3 py-2 text-center bg-akahl-primary/50 border border-akahl-secondary/30 rounded text-white focus:border-akahl-secondary focus:outline-none transition-all"
                        />
                      ) : (
                        <span className="font-semibold text-akahl-secondary">
                          {tipo.markup || 0}<span className="text-neutral-500">x</span>
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
                  setTempMultipliers(JSON.parse(JSON.stringify(pricing?.tipos || [])));
                  setEditingPricing(false);
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}


      {/* ============================================
          MODAL: CREAR MARCA
          ============================================ */}
      {creatingMarca && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="card-premium max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => { setCreatingMarca(false); setNewMarcaName(''); }}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-akahl-secondary/10 transition-colors text-neutral-400 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1 h-6 bg-akahl-secondary rounded-full"></div>
                <h3 className="text-xl font-display font-semibold text-white tracking-[0.15em] uppercase">New Brand</h3>
              </div>
              <div className="h-px bg-gradient-to-r from-akahl-secondary to-transparent mt-3"></div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-akahl-secondary/80 mb-2 tracking-[0.1em] uppercase">Brand Name *</label>
                <input
                  type="text"
                  value={newMarcaName}
                  onChange={(e) => setNewMarcaName(e.target.value)}
                  placeholder="e.g., Holland & Sherry"
                  className="input-field text-xl"
                  autoFocus
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button onClick={handleCreateMarca} className="btn-success border border-akahl-secondary/40 shadow-premium flex-1">
                Create Brand
              </button>
              <button
                onClick={() => { setCreatingMarca(false); setNewMarcaName(''); }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================
          MODAL: EDITAR MARCA
          ============================================ */}
      {editingMarca && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="card-premium max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setEditingMarca(null)}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-akahl-secondary/10 transition-colors text-neutral-400 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1 h-6 bg-akahl-secondary rounded-full"></div>
                <h3 className="text-xl font-display font-semibold text-white tracking-[0.15em] uppercase">Edit Brand</h3>
              </div>
              <div className="h-px bg-gradient-to-r from-akahl-secondary to-transparent mt-3"></div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-akahl-secondary/80 mb-2 tracking-[0.1em] uppercase">Brand Name</label>
                <input
                  type="text"
                  value={editingMarca.nombre}
                  onChange={(e) => setEditingMarca({ ...editingMarca, nombre: e.target.value })}
                  className="input-field text-xl"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button onClick={handleUpdateMarca} className="btn-success border border-akahl-secondary/40 shadow-premium flex-1">
                Save Changes
              </button>
              <button onClick={() => setEditingMarca(null)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================
          MODAL: CREAR COLECCIÓN
          ============================================ */}
      {creatingColeccion && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="card-premium max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => { setCreatingColeccion(false); setNewColeccionData({ id_marca: '', nombre: '', descuento_default: 0.35 }); }}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-akahl-secondary/10 transition-colors text-neutral-400 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1 h-6 bg-akahl-secondary rounded-full"></div>
                <h3 className="text-xl font-display font-semibold text-white tracking-[0.15em] uppercase">New Collection</h3>
              </div>
              <div className="h-px bg-gradient-to-r from-akahl-secondary to-transparent mt-3"></div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-akahl-secondary/80 mb-2 tracking-[0.1em] uppercase">Brand *</label>
                <select
                  value={newColeccionData.id_marca}
                  onChange={(e) => setNewColeccionData({ ...newColeccionData, id_marca: e.target.value })}
                  className="select-field"
                >
                  <option value="">Select a brand</option>
                  {marcas.map(marca => (
                    <option key={marca.id_marca} value={marca.id_marca}>{marca.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-akahl-secondary/80 mb-2 tracking-[0.1em] uppercase">Collection Name *</label>
                <input
                  type="text"
                  value={newColeccionData.nombre}
                  onChange={(e) => setNewColeccionData({ ...newColeccionData, nombre: e.target.value })}
                  placeholder="e.g., SUPERNOVA"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-akahl-secondary/80 mb-2 tracking-[0.1em] uppercase">Default Discount (0.35 = 35%)</label>
                <input
                  type="number"
                  step="0.01"
                  max="1"
                  min="0"
                  value={newColeccionData.descuento_default}
                  onChange={(e) => setNewColeccionData({ ...newColeccionData, descuento_default: parseFloat(e.target.value) || 0 })}
                  className="input-field"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button onClick={handleCreateColeccion} className="btn-success border border-akahl-secondary/40 shadow-premium flex-1">
                Create Collection
              </button>
              <button
                onClick={() => { setCreatingColeccion(false); setNewColeccionData({ id_marca: '', nombre: '', descuento_default: 0.35 }); }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================
          MODAL: EDITAR COLECCIÓN
          ============================================ */}
      {editingColeccion && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="card-premium max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setEditingColeccion(null)}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-akahl-secondary/10 transition-colors text-neutral-400 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1 h-6 bg-akahl-secondary rounded-full"></div>
                <h3 className="text-xl font-display font-semibold text-white tracking-[0.15em] uppercase">Edit Collection</h3>
              </div>
              <div className="h-px bg-gradient-to-r from-akahl-secondary to-transparent mt-3"></div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-akahl-primary/50 rounded-lg border border-akahl-secondary/10">
                <p className="text-sm text-neutral-400">Brand: <span className="text-white">{editingColeccion.marca?.nombre || 'N/A'}</span></p>
              </div>
              <div>
                <label className="block text-sm font-medium text-akahl-secondary/80 mb-2 tracking-[0.1em] uppercase">Collection Name</label>
                <input
                  type="text"
                  value={editingColeccion.nombre}
                  onChange={(e) => setEditingColeccion({ ...editingColeccion, nombre: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-akahl-secondary/80 mb-2 tracking-[0.1em] uppercase">Default Discount (0.35 = 35%)</label>
                <input
                  type="number"
                  step="0.01"
                  max="1"
                  min="0"
                  value={editingColeccion.descuento_default || 0}
                  onChange={(e) => setEditingColeccion({ ...editingColeccion, descuento_default: parseFloat(e.target.value) || 0 })}
                  className="input-field"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button onClick={handleUpdateColeccion} className="btn-success border border-akahl-secondary/40 shadow-premium flex-1">
                Save Changes
              </button>
              <button onClick={() => setEditingColeccion(null)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================
          MODAL: EDITAR TELA
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
                <label className="block text-sm font-medium text-akahl-secondary/80 mb-3 tracking-[0.1em] uppercase">Price per Yard</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingFabric.basePricePerMeter}
                  onChange={(e) => setEditingFabric({ ...editingFabric, basePricePerMeter: parseFloat(e.target.value) || 0 })}
                  className="input-field text-xl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-akahl-secondary/80 mb-3 tracking-[0.1em] uppercase">Availability</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setEditingFabric({ ...editingFabric, availability: 'available' })}
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
                      <span className="font-medium">En Stock</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setEditingFabric({ ...editingFabric, availability: 'out_of_stock' })}
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
                      <span className="font-medium">Agotado</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button onClick={handleSaveFabric} className="btn-success border border-akahl-secondary/40 shadow-premium">
                Save Changes
              </button>
              <button onClick={() => setEditingFabric(null)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================
          MODAL: CREAR TELA INDIVIDUAL
          ============================================ */}
      {creatingFabric && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="card-premium max-w-md w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => { setCreatingFabric(false); }}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-akahl-secondary/10 transition-colors text-neutral-400 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1 h-6 bg-akahl-secondary rounded-full"></div>
                <h3 className="text-xl font-display font-semibold text-white tracking-[0.15em] uppercase">New Fabric</h3>
              </div>
              <div className="h-px bg-gradient-to-r from-akahl-secondary to-transparent mt-3"></div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-akahl-secondary/80 mb-2 tracking-[0.1em] uppercase">Code *</label>
                <input
                  type="text"
                  value={newFabricData.codigo}
                  onChange={(e) => setNewFabricData({ ...newFabricData, codigo: e.target.value.toUpperCase() })}
                  placeholder="e.g., TL-402"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-akahl-secondary/80 mb-2 tracking-[0.1em] uppercase">Name *</label>
                <input
                  type="text"
                  value={newFabricData.nombre}
                  onChange={(e) => setNewFabricData({ ...newFabricData, nombre: e.target.value })}
                  placeholder="e.g., Italian Linen Navy Blue"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-akahl-secondary/80 mb-2 tracking-[0.1em] uppercase">Color</label>
                <input
                  type="text"
                  value={newFabricData.color}
                  onChange={(e) => setNewFabricData({ ...newFabricData, color: e.target.value })}
                  placeholder="e.g., Navy Blue"
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-akahl-secondary/80 mb-2 tracking-[0.1em] uppercase">Price per Yard *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newFabricData.precio_por_yarda}
                    onChange={(e) => setNewFabricData({ ...newFabricData, precio_por_yarda: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-akahl-secondary/80 mb-2 tracking-[0.1em] uppercase">Colección</label>
                  <select
                    value={newFabricData.id_coleccion}
                    onChange={(e) => setNewFabricData({ ...newFabricData, id_coleccion: parseInt(e.target.value) })}
                    className="select-field"
                  >
                    {colecciones.map(c => (
                      <option key={c.id_coleccion} value={c.id_coleccion}>
                        {c.marca?.nombre} - {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-akahl-secondary/80 mb-2 tracking-[0.1em] uppercase">Disponibilidad</label>
                <select
                  value={newFabricData.disponibilidad}
                  onChange={(e) => setNewFabricData({ ...newFabricData, disponibilidad: e.target.value })}
                  className="select-field"
                >
                  <option value="disponible">En Stock</option>
                  <option value="agotado">Agotado</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-akahl-secondary/80 mb-2 tracking-[0.1em] uppercase">Composition</label>
                  <input
                    type="text"
                    value={newFabricData.composicion}
                    onChange={(e) => setNewFabricData({ ...newFabricData, composicion: e.target.value })}
                    placeholder="e.g., 100% Linen"
                    className="input-field text-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-akahl-secondary/80 mb-2 tracking-[0.1em] uppercase">Weight</label>
                  <input
                    type="text"
                    value={newFabricData.peso}
                    onChange={(e) => setNewFabricData({ ...newFabricData, peso: e.target.value })}
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
                    id_coleccion: batchColeccion || 1,
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

      {/* ============================================
          MODAL: ACCIONES BATCH
          ============================================ */}
      {batchActionModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="card-premium max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => { setBatchActionModal(null); setBatchUpdateData({ precio_por_yarda: '', descuento: '', id_coleccion: '' }); }}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-akahl-secondary/10 transition-colors text-neutral-400 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1 h-6 bg-akahl-secondary rounded-full"></div>
                <h3 className="text-xl font-display font-semibold text-white tracking-[0.15em] uppercase">
                  {batchActionModal === 'price' ? 'Update Prices' : 'Change Collection'}
                </h3>
              </div>
              <div className="h-px bg-gradient-to-r from-akahl-secondary to-transparent mt-3"></div>
              <p className="text-sm text-neutral-400 mt-2">
                {selectedFabrics.length} fabric{selectedFabrics.length !== 1 ? 's' : ''} selected
              </p>
            </div>

            <div className="space-y-4">
              {batchActionModal === 'price' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-akahl-secondary/80 mb-2 tracking-[0.1em] uppercase">New Price per Yard</label>
                    <input
                      type="number"
                      step="0.01"
                      value={batchUpdateData.precio_por_yarda}
                      onChange={(e) => setBatchUpdateData({ ...batchUpdateData, precio_por_yarda: e.target.value })}
                      placeholder="Leave empty to keep current"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-akahl-secondary/80 mb-2 tracking-[0.1em] uppercase">New Discount (0.35 = 35%)</label>
                    <input
                      type="number"
                      step="0.01"
                      max="1"
                      min="0"
                      value={batchUpdateData.descuento}
                      onChange={(e) => setBatchUpdateData({ ...batchUpdateData, descuento: e.target.value })}
                      placeholder="Leave empty to keep current"
                      className="input-field"
                    />
                  </div>
                </>
              )}

              {batchActionModal === 'coleccion' && (
                <div>
                  <label className="block text-sm font-medium text-akahl-secondary/80 mb-2 tracking-[0.1em] uppercase">New Collection</label>
                  <select
                    value={batchUpdateData.id_coleccion}
                    onChange={(e) => setBatchUpdateData({ ...batchUpdateData, id_coleccion: e.target.value })}
                    className="select-field"
                  >
                    <option value="">Select a collection</option>
                    {colecciones.map(c => (
                      <option key={c.id_coleccion} value={c.id_coleccion}>
                        {c.marca?.nombre} - {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <button onClick={handleBatchUpdate} className="btn-success border border-akahl-secondary/40 shadow-premium flex-1">
                Apply Changes
              </button>
              <button
                onClick={() => { setBatchActionModal(null); setBatchUpdateData({ precio_por_yarda: '', descuento: '', id_coleccion: '' }); }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================
          MODAL: PRECIOS ADMINISTRATIVOS
          ============================================ */}
      {priceModalFabric && (
        <AdminPriceModal
          fabric={priceModalFabric}
          pricing={pricing}
          onClose={() => setPriceModalFabric(null)}
          onActivity={onActivity}
        />
      )}
    </div>
  );
}

export default AdminPanel;
