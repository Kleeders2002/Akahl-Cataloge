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
    'traje_2_piezas': '2-piece-suit',
    'traje_3_piezas': '3-piece-suit',
    'vestido_ejecutivo': 'dress-executive'
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
      '2-piece-suit': 12.0,
      '3-piece-suit': 15.0,
      'dress-executive': 10.0
    };
  }

  if (Object.keys(multipliers.industrial).length === 0) {
    multipliers.industrial = {
      jacket: 5.5,
      trousers: 3.0,
      vest: 2.5,
      '2-piece-suit': 7.5,
      '3-piece-suit': 9.5,
      'dress-executive': 6.5
    };
  }

  return { multipliers };
};

/**
 * Obtener configuración de precios
 * @returns {Promise<Object>} Multiplicadores y configuración
 * ENDPOINT: GET /api/pricing/config
 */
export const getPricingConfig = async () => {
  const response = await api.get('/pricing/config');
  const config = response.data.data || response.data;
  return transformPricingFromBackend(config);
};

/**
 * Calcular precio de una prenda usando el backend
 * @param {Object} params - Parámetros de cálculo
 * @returns {Object} Precio calculado
 * ENDPOINT: POST /api/pricing/calculate
 */
export const calculatePrice = async ({ manufacturingType, garmentType, fabricId, fabricCode, basePrice }) => {
  try {
    const response = await api.post('/pricing/calculate', {
      manufacturingType,
      garmentType,
      fabricId,
      fabricCode,
      basePrice
    });

    return response.data;
  } catch (error) {
    // Fallback: cálculo local
    console.warn('Backend calculate failed, using frontend calculation:', error.message);
    return calculatePriceFrontend({ manufacturingType, garmentType, basePrice });
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
      '2-piece-suit': 12.0,
      '3-piece-suit': 15.0,
      'dress-executive': 10.0,
    },
    industrial: {
      jacket: 5.5,
      trousers: 3.0,
      vest: 2.5,
      '2-piece-suit': 7.5,
      '3-piece-suit': 9.5,
      'dress-executive': 6.5,
    },
  };

  const FABRIC_METERS = {
    jacket: 2.5,
    trousers: 1.8,
    vest: 1.2,
    '2-piece-suit': 4.3,
    '3-piece-suit': 5.5,
    'dress-executive': 3.0,
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
 * @param {Object} multipliers - Nuevos multiplicadores (formato frontend)
 * @returns {Promise<Object>} Configuración actualizada
 * ENDPOINT: PUT /api/pricing/tipos-prenda
 */
export const updatePricingMultipliers = async (multipliers) => {
  const garmentCodeMap = {
    'jacket': 'chaqueta',
    'trousers': 'pantalon',
    'vest': 'chaleco',
    '2-piece-suit': 'traje_2_piezas',
    '3-piece-suit': 'traje_3_piezas',
    'dress-executive': 'vestido_ejecutivo'
  };

  const multiplicadores = [];

  for (const [manufacturingType, garments] of Object.entries(multipliers)) {
    for (const [garmentKey, value] of Object.entries(garments)) {
      const backendCode = garmentCodeMap[garmentKey] || garmentKey;

      multiplicadores.push({
        tipo_manufactura: manufacturingType,
        tipo_prenda_codigo: backendCode,
        valor: value
      });
    }
  }

  const response = await api.put('/pricing/tipos-prenda', { multiplicadores });
  return transformPricingFromBackend(response.data.data || response.data);
};

/**
 * Obtener historial de cotizaciones (ADMIN only)
 * @returns {Promise<Array>} Lista de cotizaciones
 * ENDPOINT: GET /api/pricing/quotations
 */
export const getQuotations = async () => {
  const response = await api.get('/pricing/quotations');
  return response.data.data || response.data;
};

/**
 * Guardar una cotización
 * @param {Object} quotationData - Datos de la cotización
 * @returns {Promise<Object>} Cotización creada
 * ENDPOINT: POST /api/pricing/quotations
 */
export const saveQuotation = async (quotationData) => {
  const response = await api.post('/pricing/quotations', quotationData);
  return response.data;
};

/**
 * Obtener vista interna con costos completos (ADMIN only)
 * @returns {Promise<Object>} Vista interna
 * ENDPOINT: GET /api/pricing/internal-view
 */
export const getInternalView = async () => {
  const response = await api.get('/pricing/internal-view');
  return response.data.data || response.data;
};

/**
 * Obtener catálogo público (sin costos)
 * @returns {Promise<Object>} Catálogo público
 * ENDPOINT: GET /api/pricing/public-catalog
 */
export const getPublicCatalog = async () => {
  const response = await api.get('/pricing/public-catalog');
  return response.data.data || response.data;
};

// ============================================
// EXPORTAR
// ============================================

export default api;
