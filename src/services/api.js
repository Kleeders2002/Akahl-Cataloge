/**
 * Servicios API - Cotizador AKAHL
 *
 * Conexión con el backend AKAHL Atelier:
 * - Base URL: https://akahlclub.onrender.com
 *
 * AUTENTICACIÓN:
 * - Sistema AKAHL Atelier: PIN local (ver config/pins.js) + JWT del backend
 *
 * ENDPOINTS CORREGIDOS:
 * - Auth: /api/catalogo/auth/verify-pin
 * - Fabrics: /api/catalogo/fabrics/*
 * - Pricing: /api/pricing/*
 */

import axios from 'axios';
import { verifyPinLocal, getAllPins, savePin, deletePin, resetPinsToDefaults } from '../config/pins.js';

// ============================================
// CONFIGURACIÓN
// ============================================

const API_URL = import.meta.env.VITE_API_URL || 'https://akahlclub.onrender.com';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para incluir token JWT en cada request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Recargar para volver al PIN lock
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

// ============================================
// AUTENTICACIÓN
// ============================================

/**
 * Verificar PIN de acceso (Sistema Local + Backend JWT)
 * @param {string} pin - PIN de 4 dígitos
 * @returns {Object} { success, role, user, token }
 * ENDPOINT: POST /api/catalogo/auth/verify-pin
 */
export const verifyPin = async (pin) => {
  // 1. Verificación local (validación rápida)
  const pinConfig = verifyPinLocal(pin);

  if (!pinConfig) {
    return {
      success: false,
      role: null,
      user: null,
      token: null
    };
  }

  // 2. Obtener JWT del backend
  try {
    const response = await api.post('/catalogo/auth/verify-pin', { pin });

    const { token, user } = response.data;

    // Guardar JWT en localStorage
    localStorage.setItem('token', token);

    return {
      success: true,
      role: pinConfig.role,
      user: {
        name: pinConfig.name,
        permissions: pinConfig.permissions,
        pin: pin,
        ...user // Datos adicionales del backend
      },
      token
    };
  } catch (error) {
    console.error('Error getting JWT from backend:', error);

    // Fallback: permitir acceso local solo lectura
    return {
      success: true,
      role: pinConfig.role,
      user: {
        name: pinConfig.name,
        permissions: pinConfig.permissions,
        pin: pin
      },
      token: null,
      offlineMode: true
    };
  }
};

/**
 * Login con email y contraseña (para admin web)
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña
 * @returns {Promise} { success, token, must_change_pwd, role }
 * ENDPOINT: POST /api/auth/login
 */
export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

/**
 * Verificar token y obtener info del usuario
 * @returns {Promise} Información del usuario actual
 * ENDPOINT: GET /api/auth/me
 */
export const verifyToken = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

/**
 * Cerrar sesión (cliente)
 */
export const logout = () => {
  localStorage.removeItem('token');
};

// ============================================
// GESTIÓN DE PINs (Local)
// ============================================

export const getAllPinsAPI = () => getAllPins();
export const savePinAPI = (pin, config) => savePin(pin, config);
export const deletePinAPI = (pin) => deletePin(pin);
export const resetPinsAPI = () => resetPinsToDefaults();

// ============================================
// TELAS (FABRICS)
// ============================================

/**
 * Transforma datos del backend al formato del frontend
 * @param {Object} fabric - Tela del backend
 * @returns {Object} Tela en formato frontend
 */
const transformFabricFromBackend = (fabric) => {
  const availabilityMap = {
    'disponible': 'available',
    'agotado': 'out_of_stock',
    'por_pedido': 'available',
    'descontinuado': 'out_of_stock'
  };

  // Extraer marca de la estructura anidada
  const marca = fabric.coleccion?.marca?.nombre ||
                fabric.marca?.nombre ||
                fabric.marca ||
                fabric.proveedor ||
                'Unknown';

  const coleccion = fabric.coleccion?.nombre ||
                    fabric.coleccion ||
                    fabric.categoria ||
                    'Unknown';

  const precioPorYarda = parseFloat(fabric.precio_por_yarda || fabric.precio_por_metro || 0);
  const descuento = parseFloat(fabric.descuento || 0);
  const precioNeto = descuento > 0
    ? precioPorYarda * (1 - descuento)
    : precioPorYarda;

  return {
    id: fabric.id_tela || fabric.id,
    codigo: fabric.codigo,
    code: fabric.codigo, // Para compatibilidad
    name: fabric.color || fabric.nombre,
    color: fabric.color,
    nombre: fabric.nombre,
    basePricePerMeter: precioPorYarda,
    price: precioPorYarda, // Para compatibilidad
    precio_neto: precioNeto,
    precio_por_yarda: precioPorYarda,
    descuento: descuento,
    availability: availabilityMap[fabric.disponibilidad] || 'available',
    marca: marca,
    supplier: marca, // Para compatibilidad con código existente
    coleccion: coleccion,
    category: fabric.categoria || fabric.coleccion?.categoria || 'Fabric',
    composition: fabric.composicion || 'N/A',
    weight: fabric.peso || 'N/A',
    // Campos adicionales
    visible_publico: fabric.visible_publico,
    id_coleccion: fabric.id_coleccion,
    imagen_url: fabric.imagen_url
  };
};

/**
 * Transforma datos del frontend al formato del backend
 * @param {Object} fabric - Tela en formato frontend
 * @returns {Object} Tela en formato backend
 */
const transformFabricToBackend = (fabric) => {
  const availabilityMap = {
    'available': 'disponible',
    'out_of_stock': 'agotado'
  };

  return {
    codigo: fabric.codigo,
    color: fabric.name || fabric.color,
    nombre: fabric.nombre || fabric.name,
    precio_por_yarda: fabric.basePricePerMeter || fabric.price,
    descuento: fabric.descuento || 0,
    disponibilidad: availabilityMap[fabric.availability] || 'disponible',
    id_coleccion: fabric.id_coleccion,
    composicion: fabric.composition,
    peso: fabric.weight,
    categoria: fabric.category,
    imagen_url: fabric.imagen_url
  };
};

/**
 * Obtener todas las telas
 * @returns {Promise<Array>} Lista de telas
 * ENDPOINT: GET /api/catalogo/fabrics
 */
export const getAllFabrics = async () => {
  const response = await api.get('/catalogo/fabrics');
  const fabrics = response.data.data || response.data;
  return Array.isArray(fabrics) ? fabrics.map(transformFabricFromBackend) : [];
};

/**
 * Buscar tela por código
 * @param {string} code - Código de tela (ej. "TL-402")
 * @returns {Promise<Object|null>} Tela encontrada o null
 * ENDPOINT: GET /api/catalogo/fabrics/code/:code
 */
export const getFabricByCode = async (code) => {
  try {
    const response = await api.get(`/catalogo/fabrics/code/${encodeURIComponent(code)}`);
    const fabric = response.data.data || response.data;
    return transformFabricFromBackend(fabric);
  } catch (error) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

/**
 * Buscar telas por texto
 * @param {string} query - Texto a buscar
 * @returns {Promise<Array>} Lista de telas coincidentes
 * ENDPOINT: GET /api/catalogo/fabrics/search?q=query
 */
export const searchFabrics = async (query) => {
  try {
    const response = await api.get('/catalogo/fabrics/search', {
      params: { q: query }
    });
    const fabrics = response.data.data || response.data;
    return Array.isArray(fabrics) ? fabrics.map(transformFabricFromBackend) : [];
  } catch (error) {
    // Fallback: buscar localmente si el endpoint falla
    const allFabrics = await getAllFabrics();
    const filtered = allFabrics.filter(f =>
      f.codigo.toLowerCase().includes(query.toLowerCase()) ||
      f.name.toLowerCase().includes(query.toLowerCase()) ||
      f.supplier.toLowerCase().includes(query.toLowerCase())
    );
    return filtered;
  }
};

/**
 * Crear nueva tela (ADMIN only)
 * @param {Object} fabric - Datos de la tela (formato frontend)
 * @returns {Promise<Object>} Tela creada
 * ENDPOINT: POST /api/catalogo/fabrics
 */
export const createFabric = async (fabric) => {
  const backendData = transformFabricToBackend(fabric);
  const response = await api.post('/catalogo/fabrics', backendData);
  return transformFabricFromBackend(response.data.data || response.data);
};

/**
 * Actualizar información de una tela (ADMIN only)
 * @param {number} id - ID de la tela
 * @param {Object} data - Datos a actualizar (formato frontend)
 * @returns {Promise<Object>} Tela actualizada
 * ENDPOINT: PUT /api/catalogo/fabrics/:id
 */
export const updateFabric = async (id, data) => {
  const backendData = transformFabricToBackend(data);
  const response = await api.put(`/catalogo/fabrics/${id}`, backendData);
  return transformFabricFromBackend(response.data.data || response.data);
};

/**
 * Cambiar disponibilidad de tela (ADMIN only)
 * @param {number} id - ID de la tela
 * @param {string} availability - 'available' | 'out_of_stock'
 * ENDPOINT: PATCH /api/catalogo/fabrics/:id/availability
 */
export const toggleFabricAvailability = async (id, availability) => {
  const availabilityMap = {
    'available': 'disponible',
    'out_of_stock': 'agotado'
  };

  const response = await api.patch(`/catalogo/fabrics/${id}/availability`, {
    disponibilidad: availabilityMap[availability] || availability
  });
  return transformFabricFromBackend(response.data.data || response.data);
};

/**
 * Eliminar una tela (ADMIN only)
 * @param {number} id - ID de la tela
 * @returns {Promise<Object>} Respuesta de eliminación
 * ENDPOINT: DELETE /api/catalogo/fabrics/:id
 */
export const deleteFabric = async (id) => {
  const response = await api.delete(`/catalogo/fabrics/${id}`);
  return response.data;
};

// ============================================
// PRECIOS Y COTIZACIONES
// ============================================

/**
 * Transforma configuración de precios del backend al formato frontend
 * @param {Object} config - Config del backend
 * @returns {Object} Config en formato frontend
 */
const transformPricingFromBackend = (config) => {
  const garmentCodeMap = {
    'chaqueta': 'jacket',
    'pantalon': 'trousers',
    'chaleco': 'vest',
    'traje_2_piezas': '2-piece',
    'traje_3_piezas': '3-piece',
  };

  const multipliers = {
    bespoke: {},
    industrial: {}
  };

  if (config.multiplicadores) {
    for (const [key, value] of Object.entries(config.multiplicadores)) {
      const [tipo_manufactura, tipo_prenda_codigo] = key.split('_');
      const frontendGarment = garmentCodeMap[tipo_prenda_codigo] || tipo_prenda_codigo;

      if (multipliers[tipo_manufactura] !== undefined) {
        multipliers[tipo_manufactura][frontendGarment] = value.valor;
      }
    }
  }

  // Defaults si no hay datos
  if (Object.keys(multipliers.bespoke).length === 0) {
    multipliers.bespoke = {
      jacket: 8.5,
      trousers: 4.5,
      vest: 3.5,
      '2-piece': 12.0,
      '3-piece': 15.0,
    };
  }

  if (Object.keys(multipliers.industrial).length === 0) {
    multipliers.industrial = {
      jacket: 5.5,
      trousers: 3.0,
      vest: 2.5,
      '2-piece': 7.5,
      '3-piece': 9.5,
    };
  }

  return { multipliers };
};

/**
 * Obtener configuración de precios (multiplicadores)
 * @returns {Promise<Object>} Multiplicadores y configuración
 * ENDPOINT: GET /api/catalogo/multiplicadores
 */
export const getPricingConfig = async () => {
  const response = await api.get('/catalogo/multiplicadores');
  const data = response.data.data || response.data;

  // Transformar al formato esperado por el frontend
  const tipos = Array.isArray(data) ? data : [];

  // Mapear tipos de prenda al formato usado en el frontend
  const garmentMap = {
    'JACKET': 'jacket',
    '2 PIECES': '2-piece',
    '3 PIECES': '3-piece',
    'TROUSERS': 'trousers',
    'VEST': 'vest'
  };

  // Crear estructura de multiplicadores
  const multipliers = {
    bespoke: {},
    industrial: {}
  };

  tipos.forEach(tipo => {
    const frontendCode = garmentMap[tipo.nombre] || tipo.nombre.toLowerCase();
    // Usar el markup como multiplicador base
    multipliers.bespoke[frontendCode] = tipo.markup || 3;
    multipliers.industrial[frontendCode] = tipo.markup ? tipo.markup * 0.65 : 2;
  });

  return { multipliers, tipos };
};

/**
 * Calcular precio de una prenda usando el backend
 * @param {Object} params - Parámetros de cálculo
 * @returns {Object} Precio calculado
 * ENDPOINT: POST /api/catalogo/pricing/calculate
 */
export const calculatePrice = async ({ garmentType, fabricCode }) => {
  console.log('🧮 calculatePrice called with:', { garmentType, fabricCode });

  try {
    const response = await api.post('/catalogo/pricing/calculate', {
      tipo_prenda_codigo: garmentType,
      codigo_tela: fabricCode
    });

    console.log('✅ Backend response:', response.data);

    // Transformar respuesta del backend al formato del frontend
    const data = response.data.data || response.data;

    console.log('📋 Transformed data:', {
      precio_final: data.precio_final,
      desglose: data.desglose
    });

    const result = {
      finalPrice: data.precio_final,
      desglose: {
        fabricCost: data.desglose?.costo_tela,
        fixedCosts: data.desglose?.gastos_fijos,
        totalCost: data.desglose?.costo_total,
        markup: data.desglose?.markup,
        meters: data.desglose?.yardas_requeridas
      },
      tela: data.tela
    };

    console.log('📤 Returning:', result);
    return result;
  } catch (error) {
    // Si falla el backend, no hacer fallback - propagar el error
    console.error('❌ Backend calculate failed:', error);
    console.error('Error response:', error.response?.data);
    throw error;
  }
};

/**
 * Calcular precios de todas las prendas en una sola llamada
 * @param {string} fabricCode - Código de la tela
 * @returns {Object} Precios de todas las prendas
 * ENDPOINT: POST /api/catalogo/pricing/calculate-all
 */
export const calculateAllPrices = async ({ fabricCode }) => {
  console.log('🧮 calculateAllPrices called with:', { fabricCode });

  try {
    const response = await api.post('/catalogo/pricing/calculate-all', {
      codigo_tela: fabricCode
    });

    console.log('✅ Backend response:', response.data);

    // Transformar respuesta del backend al formato del frontend
    const data = response.data.data || response.data;

    // Mapear los precios por código de prenda para fácil acceso
    const pricesByGarment = {};
    const breakdownByGarment = {};

    if (data.precios && Array.isArray(data.precios)) {
      data.precios.forEach((item) => {
        const garmentCode = item.codigo;
        pricesByGarment[garmentCode] = item.precio_final;
        breakdownByGarment[garmentCode] = {
          fabricCost: item.desglose?.costo_tela,
          fixedCosts: item.desglose?.gastos_fijos,
          totalCost: item.desglose?.costo_total,
          markup: item.desglose?.markup,
          meters: item.desglose?.yardas_requeridas
        };
      });
    }

    const result = {
      tela: data.tela,
      prices: pricesByGarment,
      breakdown: breakdownByGarment,
      rawPrices: data.precios
    };

    console.log('📤 Returning:', result);
    return result;
  } catch (error) {
    console.error('❌ Backend calculate-all failed:', error);
    console.error('Error response:', error.response?.data);
    throw error;
  }
};

/**
 * Calcular precio en frontend (fallback)
 */
const calculatePriceFrontend = ({ manufacturingType, garmentType, basePrice }) => {
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

  const FABRIC_METERS = {
    jacket: 2.5,
    trousers: 1.8,
    vest: 1.2,
    '2-piece': 4.3,
    '3-piece': 5.5,
  };

  const multiplier = MULTIPLIERS[manufacturingType]?.[garmentType] || 1;
  const meters = FABRIC_METERS[garmentType] || 1;

  const fabricCost = basePrice * meters;
  const laborCost = basePrice * multiplier;
  const finalPrice = Math.round((fabricCost + laborCost) * 100) / 100;

  return {
    finalPrice,
    desglose: {
      fabricCost: Math.round(fabricCost * 100) / 100,
      laborCost: Math.round(laborCost * 100) / 100,
      multiplier,
      meters,
    }
  };
};

/**
 * Actualizar multiplicadores de precio (ADMIN only)
 * @param {Array} tipos - Array de tipos de prenda con todos los campos editables
 * @returns {Promise<Object>} Configuración actualizada
 * ENDPOINT: POST /api/catalogo/multiplicadores
 */
export const updatePricingMultipliers = async (tipos = []) => {
  // Transformar el array de tipos al formato que espera la API
  const multiplicadores = tipos.map(tipo => ({
    id_tipo_prenda: tipo.id,
    yardas_requeridas: parseFloat(tipo.yardas_requeridas) || 0,
    costo_manufactura: parseFloat(tipo.costo_manufactura) || 0,
    costo_envio: parseFloat(tipo.costo_envio) || 0,
    costo_forro: parseFloat(tipo.costo_forro) || 0,
    markup: parseFloat(tipo.markup) || 3
  }));

  const response = await api.post('/catalogo/multiplicadores', { multiplicadores });
  return response.data;
};

/**
 * Obtener historial de cotizaciones (ADMIN only)
 * @returns {Promise<Array>} Lista de cotizaciones
 * ENDPOINT: GET /api/catalogo/pricing/quotations
 */
export const getQuotations = async () => {
  const response = await api.get('/catalogo/pricing/quotations');
  return response.data.data || response.data;
};

/**
 * Guardar una cotización
 * @param {Object} quotationData - Datos de la cotización
 * @returns {Promise<Object>} Cotización creada
 * ENDPOINT: POST /api/catalogo/pricing/quotations
 */
export const saveQuotation = async (quotationData) => {
  const response = await api.post('/catalogo/pricing/quotations', quotationData);
  return response.data;
};

/**
 * Obtener vista interna con costos completos (ADMIN only)
 * @returns {Promise<Object>} Vista interna
 * ENDPOINT: GET /api/catalogo/pricing/internal-view
 */
export const getInternalView = async () => {
  const response = await api.get('/catalogo/pricing/internal-view');
  return response.data.data || response.data;
};

/**
 * Obtener catálogo público (sin costos)
 * @returns {Promise<Object>} Catálogo público
 * ENDPOINT: GET /api/catalogo/pricing/public-catalog
 */
export const getPublicCatalog = async () => {
  const response = await api.get('/catalogo/pricing/public-catalog');
  return response.data.data || response.data;
};

// ============================================
// MARCAS (BRANDS)
// ============================================

/**
 * Obtener todas las marcas
 * @returns {Promise<Array>} Lista de marcas
 * ENDPOINT: GET /api/catalogo/marcas
 */
export const getAllMarcas = async () => {
  const response = await api.get('/catalogo/marcas');
  return response.data.data || response.data;
};

/**
 * Crear nueva marca
 * @param {string} nombre - Nombre de la marca
 * @returns {Promise<Object>} Marca creada
 * ENDPOINT: POST /api/catalogo/marcas
 */
export const createMarca = async (nombre) => {
  const response = await api.post('/catalogo/marcas', { nombre });
  return response.data.data || response.data;
};

/**
 * Actualizar marca
 * @param {number} id - ID de la marca
 * @param {string} nombre - Nuevo nombre
 * @returns {Promise<Object>} Marca actualizada
 * ENDPOINT: PUT /api/catalogo/marcas/:id
 */
export const updateMarca = async (id, nombre) => {
  const response = await api.put(`/catalogo/marcas/${id}`, { nombre });
  return response.data.data || response.data;
};

/**
 * Eliminar marca
 * @param {number} id - ID de la marca
 * @returns {Promise<Object>} Respuesta de eliminación
 * ENDPOINT: DELETE /api/catalogo/marcas/:id
 */
export const deleteMarca = async (id) => {
  const response = await api.delete(`/catalogo/marcas/${id}`);
  return response.data;
};

// ============================================
// COLECCIONES (COLLECTIONS)
// ============================================

/**
 * Obtener todas las colecciones
 * @returns {Promise<Array>} Lista de colecciones
 * ENDPOINT: GET /api/catalogo/colecciones
 */
export const getAllColecciones = async () => {
  const response = await api.get('/catalogo/colecciones');
  return response.data.data || response.data;
};

/**
 * Crear nueva colección
 * @param {number} id_marca - ID de la marca
 * @param {string} nombre - Nombre de la colección
 * @returns {Promise<Object>} Colección creada
 * ENDPOINT: POST /api/catalogo/colecciones/marcas/:marcaId/colecciones
 */
export const createColeccion = async (id_marca, nombre) => {
  const response = await api.post(`/catalogo/colecciones/marcas/${id_marca}/colecciones`, {
    nombre
  });
  return response.data.data || response.data;
};

/**
 * Actualizar colección
 * @param {number} id - ID de la colección
 * @param {string} nombre - Nuevo nombre
 * @returns {Promise<Object>} Colección actualizada
 * ENDPOINT: PUT /api/catalogo/colecciones/:id
 */
export const updateColeccion = async (id, nombre) => {
  const response = await api.put(`/catalogo/colecciones/${id}`, {
    nombre
  });
  return response.data.data || response.data;
};

/**
 * Eliminar colección
 * @param {number} id - ID de la colección
 * @returns {Promise<Object>} Respuesta de eliminación
 * ENDPOINT: DELETE /api/catalogo/colecciones/:id
 */
export const deleteColeccion = async (id) => {
  const response = await api.delete(`/catalogo/colecciones/${id}`);
  return response.data;
};

// ============================================
// TELAS - OPERACIONES BATCH
// ============================================

/**
 * Crear múltiples telas (BATCH)
 * @param {number} id_coleccion - ID de la colección
 * @param {Array<string>} codigos - Array de códigos de tela
 * @param {number} precio_por_yarda - Precio por yarda
 * @param {number} descuento - Descuento (0.35 = 35%)
 * @returns {Promise<Object>} Resultado con telas creadas y errores
 * ENDPOINT: POST /api/catalogo/fabrics/batch
 */
export const createFabricsBatch = async (id_coleccion, codigos, precio_por_yarda, descuento) => {
  const response = await api.post('/catalogo/fabrics/batch', {
    id_coleccion,
    codigos,
    precio_por_yarda,
    descuento
  });
  return response.data;
};

/**
 * Actualizar múltiples telas (BATCH)
 * @param {Array<number>} ids - Array de IDs de telas
 * @param {number} precio_por_yarda - Nuevo precio por yarda (opcional)
 * @param {number} descuento - Nuevo descuento (opcional)
 * @param {number} id_coleccion - Nueva colección (opcional)
 * @returns {Promise<Object>} Resultado con telas actualizadas
 * ENDPOINT: PUT /api/catalogo/fabrics/batch
 */
export const updateFabricsBatch = async (ids, precio_por_yarda, descuento, id_coleccion) => {
  const body = { ids };
  if (precio_por_yarda !== undefined) body.precio_por_yarda = precio_por_yarda;
  if (descuento !== undefined) body.descuento = descuento;
  if (id_coleccion !== undefined) body.id_coleccion = id_coleccion;

  const response = await api.put('/catalogo/fabrics/batch', body);
  return response.data;
};

/**
 * Eliminar múltiples telas (BATCH)
 * @param {Array<number>} ids - Array de IDs de telas
 * @returns {Promise<Object>} Resultado con telas eliminadas y errores
 * ENDPOINT: DELETE /api/catalogo/fabrics/batch
 */
export const deleteFabricsBatch = async (ids) => {
  const response = await api.delete('/catalogo/fabrics/batch', { data: { ids } });
  return response.data;
};

// ============================================
// EXPORTAR
// ============================================

export default api;
