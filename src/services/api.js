/**
 * Servicios API - Cotizador AKAHL
 *
 * Conexión con el backend existente de AKAHL Club:
 * - https://akahlclub.onrender.com
 *
 * AUTENTICACIÓN:
 * - Sistema AKAHL Atelier: PIN local (ver config/pins.js)
 * - Sistema AKAHL Club: JWT Tokens
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
      // Token expirado o inválido
      localStorage.removeItem('token');

      // Si estamos en AKAHL Atelier, volver a pantalla de PIN
      if (window.location.pathname !== '/login') {
        // Recargar la página para volver al PIN lock
        window.location.reload();
      }
    }
    return Promise.reject(error);
  }
);

// ============================================
// AUTENTICACIÓN
// ============================================

/**
 * Login con email y contraseña
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña
 * @returns {Promise} { success, token, must_change_pwd, role }
 */
export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data; // { success, token, must_change_pwd, role, ... }
};

/**
 * Verificar token y obtener info del usuario
 * @returns {Promise} Información del usuario actual
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
// LONA AKN (4 digits)
/**
 * Verificar PIN de acceso (Sistema Local AKAHL Atelier)
 * @param {string} pin - PIN de 4 dígitos
 * @returns {Object} { success, role, user, token }
 *
 * NOTA: Ahora esta función válida el PIN localmente Y obtiene un JWT del backend
 */
export const verifyPin = async (pin) => {
  // 1. Verificación local (primero, validación rápida)
  const pinConfig = verifyPinLocal(pin);

  if (!pinConfig) {
    return {
      success: false,
      role: null,
      user: null,
      token: null
    };
  }

  // 2. Si PIN es válido localmente, obtener JWT del backend
  try {
    const response = await api.post('/auth/verify-pin', { pin });

    // Backend retornó un JWT válido
    const { token, user } = response.data;

    // Guardar JWT en localStorage para requests futuras
    localStorage.setItem('token', token);

    return {
      success: true,
      role: pinConfig.role,
      user: {
        name: pinConfig.name,
        permissions: pinConfig.permissions,
        pin: pin, // PIN actual para referencias futuras
        ...user // Datos adicionales del backend
      },
      token // Retornar el token para uso inmediato si es necesario
    };
  } catch (error) {
    console.error('Error getting JWT from backend:', error);

    // Fallback: si el backend falla, permitir acceso local solo lectura
    // (Esto mantiene compatibilidad si el backend está caído)
    return {
      success: true,
      role: pinConfig.role,
      user: {
        name: pinConfig.name,
        permissions: pinConfig.permissions,
        pin: pin
      },
      token: null,
      offlineMode: true // Indicar que estamos sin JWT
    };
  }
};

/**
 * Obtener todos los PINs configurados (para Admin Panel)
 * @returns {Object} Todos los PINs
 */
export const getAllPinsAPI = () => {
  return getAllPins();
};

/**
 * Guardar un nuevo PIN (para Admin Panel)
 * @param {string} pin - PIN a guardar
 * @param {Object} config - Configuración del PIN
 * @returns {boolean} Éxito de la operación
 */
export const savePinAPI = (pin, config) => {
  return savePin(pin, config);
};

/**
 * Eliminar un PIN (para Admin Panel)
 * @param {string} pin - PIN a eliminar
 * @returns {boolean} Éxito de la operación
 */
export const deletePinAPI = (pin) => {
  return deletePin(pin);
};

/**
 * Restablecer PINs a valores por defecto (para Admin Panel)
 * @returns {boolean} Éxito de la operación
 */
export const resetPinsAPI = () => {
  return resetPinsToDefaults();
};

// ============================================
// TELAS (FABRICS)
// ============================================

/**
 * Transforma datos del backend al formato del frontend
 * @param {Object} fabric - Tela del backend
 * @returns {Object} Tela en formato frontend
 */
const transformFabricFromBackend = (fabric) => {
  // Mapeo de disponibilidad
  const availabilityMap = {
    'disponible': 'available',
    'agotado': 'out_of_stock',
    'por_pedido': 'available', // 'available by request' -> available
    'descontinuado': 'out_of_stock'
  };

  return {
    id: fabric.id_tela,
    codigo: fabric.codigo,
    name: fabric.color, // Backend usa 'color' como nombre visible
    color: fabric.color,
    basePricePerMeter: fabric.precio_por_yarda,
    availability: availabilityMap[fabric.disponibilidad] || 'available',
    supplier: fabric.coleccion?.proveedor || 'Unknown',
    coleccion: fabric.coleccion?.nombre || 'Unknown',
    // Campos adicionales del backend
    descuento: fabric.descuento,
    visible_publico: fabric.visible_publico,
    id_coleccion: fabric.id_coleccion
  };
};

/**
 * Transforma configuración de precios del backend al formato frontend
 * @param {Object} config - Config del backend
 * @returns {Object} Config en formato frontend
 */
const transformPricingFromBackend = (config) => {
  // Mapeo inverso de códigos de prenda (backend -> frontend)
  const garmentCodeMap = {
    'chaqueta': 'jacket',
    'pantalon': 'trousers',
    'chaleco': 'vest',
    'traje_2_piezas': '2-piece-suit',
    'traje_3_piezas': '3-piece-suit',
    'vestido_ejecutivo': 'dress-executive'
  };

  // Construir estructura de multiplicadores
  const multipliers = {
    bespoke: {},
    industrial: {}
  };

  if (config.multiplicadores) {
    for (const [key, value] of Object.entries(config.multiplicadores)) {
      // key formato: "bespoke_chaqueta", "industrial_pantalon", etc.
      const [tipo_manufactura, tipo_prenda_codigo] = key.split('_');
      const frontendGarment = garmentCodeMap[tipo_prenda_codigo] || tipo_prenda_codigo;

      if (multipliers[tipo_manufactura] !== undefined) {
        multipliers[tipo_manufactura][frontendGarment] = value.valor;
      }
    }
  }

  // Si no hay multiplicadores personalizados, usar defaults
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

  return {
    multipliers
  };
};

/**
 * Obtener todas las telas
 * @returns {Promise<Array>} Lista de telas
 * ENDPOINT: GET /api/fabrics
 */
export const getAllFabrics = async () => {
  const response = await api.get('/fabrics');

  // Transformar datos del backend al formato frontend
  const fabrics = response.data.data || response.data;
  return Array.isArray(fabrics) ? fabrics.map(transformFabricFromBackend) : [];
};

/**
 * Buscar tela por código
 * @param {string} code - Código de tela (ej. "TL-402")
 * @returns {Promise<Object|null>} Tela encontrada o null
 * ENDPOINT: GET /api/fabrics/code/:code
 */
export const getFabricByCode = async (code) => {
  try {
    const response = await api.get(`/fabrics/code/${encodeURIComponent(code)}`);
    return response.data;
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
 * ENDPOINT: GET /api/fabrics?q=query
 */
export const searchFabrics = async (query) => {
  const response = await api.get('/fabrics', { params: { q: query } });
  return response.data;
};

/**
 * Actualizar información de una tela (ADMIN only)
 * @param {number} id - ID de la tela
 * @param {Object} data - Datos a actualizar (formato frontend)
 * @returns {Promise<Object>} Tela actualizada
 * ENDPOINT: PUT /api/fabrics/:id
 */
export const updateFabric = async (id, data) => {
  // Mapear campos del frontend al backend
  const backendData = {};

  if (data.basePricePerMeter !== undefined) {
    backendData.precio_por_yarda = data.basePricePerMeter;
  }

  if (data.availability !== undefined) {
    const availabilityMap = {
      'available': 'disponible',
      'out_of_stock': 'agotado'
    };
    backendData.disponibilidad = availabilityMap[data.availability] || data.availability;
  }

  // Campos adicionales que puedan venir
  if (data.codigo !== undefined) backendData.codigo = data.codigo;
  if (data.color !== undefined) backendData.color = data.color;
  if (data.id_coleccion !== undefined) backendData.id_coleccion = data.id_coleccion;

  const response = await api.put(`/fabrics/${id}`, backendData);
  return response.data;
};

/**
 * Cambiar disponibilidad de tela (ADMIN only)
 * @param {number} id - ID de la tela
 * @param {string} availability - 'available' | 'out_of_stock' (frontend)
 *                          - 'disponible' | 'agotado' (backend)
 * ENDPOINT: PATCH /api/fabrics/:id/availability
 */
export const toggleFabricAvailability = async (id, availability) => {
  // Mapear valores del frontend al backend
  const availabilityMap = {
    'available': 'disponible',
    'out_of_stock': 'agotado'
  };

  const response = await api.patch(`/fabrics/${id}/availability`, {
    disponibilidad: availabilityMap[availability] || availability
  });
  return response.data;
};

// ============================================
// PRECIOS Y COTIZACIONES
// ============================================

/**
 * Obtener configuración de precios
 * @returns {Promise<Object>} Multiplicadores y configuración
 * ENDPOINT: GET /api/pricing/config
 */
export const getPricingConfig = async () => {
  const response = await api.get('/pricing/config');

  // Transformar datos del backend al formato frontend
  const config = response.data.data || response.data;
  return transformPricingFromBackend(config);
};

/**
 * Calcular precio de una prenda
 * @param {Object} params - Parámetros de cálculo
 * @returns {Object} Precio calculado
 * NOTA: Este cálculo puede hacerse en frontend o backend
 * ENDPOINT: POST /api/pricing/calculate (si existe en backend)
 */
export const calculatePrice = async ({ manufacturingType, garmentType, fabricId }) => {
  try {
    // Si el backend tiene endpoint de cálculo
    const response = await api.post('/pricing/calculate', {
      manufacturingType,
      garmentType,
      fabricId,
    });
    return response.data;
  } catch (error) {
    // Si no existe, calcular en frontend
    console.warn('Backend calculate endpoint not found, using frontend calculation');
    return calculatePriceFrontend({ manufacturingType, garmentType, fabricId });
  }
};

/**
 * Calcular precio en frontend (fallback)
 */
const calculatePriceFrontend = ({ manufacturingType, garmentType, basePrice }) => {
  // Multiplicadores por defecto (pueden venir de config)
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
 * Guardar cotización (crear registro)
 * @param {Object} quotationData - Datos de la cotización
 * @returns {Promise<Object>} Cotización creada
 * ENDPOINT: POST /api/quotations
 */
export const saveQuotation = async (quotationData) => {
  const response = await api.post('/quotations', quotationData);
  return response.data;
};

/**
 * Obtener historial de cotizaciones
 * @returns {Promise<Array>} Lista de cotizaciones
 * ENDPOINT: GET /api/quotations
 */
export const getQuotations = async () => {
  const response = await api.get('/quotations');
  return response.data;
};

// ============================================
// ADMINISTRACIÓN - MULTIPLICADORES
// ============================================

/**
 * Actualizar multiplicadores de precio (ADMIN only)
 * @param {Object} multipliers - Nuevos multiplicadores (formato frontend)
 *                           { bespoke: { jacket: 8.5, ... }, industrial: { ... } }
 * @returns {Promise<Object>} Configuración actualizada
 * ENDPOINT: PUT /api/pricing/multipliers
 */
export const updatePricingMultipliers = async (multipliers) => {
  // Transformar del formato frontend al formato backend
  const multiplicadores = [];

  // Mapeo de códigos de prenda del frontend al backend
  const garmentCodeMap = {
    'jacket': 'chaqueta',
    'trousers': 'pantalon',
    'vest': 'chaleco',
    '2-piece-suit': 'traje_2_piezas',
    '3-piece-suit': 'traje_3_piezas',
    'dress-executive': 'vestido_ejecutivo'
  };

  // Procesar cada tipo de manufactura
  for (const [manufacturingType, garments] of Object.entries(multipliers)) {
    for (const [garmentKey, value] of Object.entries(garments)) {
      const backendCode = garmentCodeMap[garmentKey] || garmentKey;

      multiplicadores.push({
        tipo_manufactura: manufacturingType, // 'bespoke' o 'industrial'
        tipo_prenda_codigo: backendCode,
        valor: value
      });
    }
  }

  const response = await api.put('/pricing/multipliers', { multiplicadores });
  return response.data;
};

// ============================================
// EXPORTAR
// ============================================

export default api;
