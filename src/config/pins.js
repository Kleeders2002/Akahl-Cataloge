/**
 * Configuración de PINs - Sistema de Autenticación Local
 *
 * Sistema de autenticación con PIN para uso interno de AKAHL Atelier.
 * Los PINs se validan localmente sin depender del backend.
 *
 * Para agregar/eliminar PINs:
 * 1. Agregar entrada en PINS_CONFIG
 * 2. O usar Admin Panel para gestión dinámica
 */

// ============================================
// CONFIGURACIÓN DE PINS (Valores por Defecto)
// ============================================

export const PINS_CONFIG = {
  '1234': {
    role: 'USER',
    name: 'Asociado',
    permissions: ['quotations'],
    description: 'Acceso a cotizaciones únicamente'
  },
  '0108': {
    role: 'ADMIN',
    name: 'Administrador',
    permissions: ['quotations', 'admin'],
    description: 'Acceso completo: cotizaciones y administración'
  }
};

// ============================================
// FUNCIONES DE UTILIDAD
// ============================================

/**
 * Verifica si un PIN es válido
 * @param {string} pin - PIN a verificar
 * @returns {Object|null} Configuración del PIN o null si es inválido
 */
export const verifyPinLocal = (pin) => {
  // Primero verificar PINs en localStorage (modificaciones dinámicas)
  const dynamicPins = getDynamicPins();
  const dynamicPin = dynamicPins[pin];
  if (dynamicPin) {
    return dynamicPin;
  }

  // Si no está en dinámicos, buscar en configuración default
  return PINS_CONFIG[pin] || null;
};

/**
 * Obtiene PINs dinámicos desde localStorage
 * @returns {Object} PINs almacenados localmente
 */
export const getDynamicPins = () => {
  try {
    const stored = localStorage.getItem('akahl_pins');
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error reading dynamic PINs:', error);
    return {};
  }
};

/**
 * Guarda un nuevo PIN o actualiza uno existente
 * @param {string} pin - PIN a guardar
 * @param {Object} config - Configuración del PIN
 */
export const savePin = (pin, config) => {
  try {
    const dynamicPins = getDynamicPins();
    dynamicPins[pin] = config;
    localStorage.setItem('akahl_pins', JSON.stringify(dynamicPins));
    return true;
  } catch (error) {
    console.error('Error saving PIN:', error);
    return false;
  }
};

/**
 * Elimina un PIN dinámico
 * @param {string} pin - PIN a eliminar
 */
export const deletePin = (pin) => {
  try {
    const dynamicPins = getDynamicPins();
    delete dynamicPins[pin];
    localStorage.setItem('akahl_pins', JSON.stringify(dynamicPins));
    return true;
  } catch (error) {
    console.error('Error deleting PIN:', error);
    return false;
  }
};

/**
 * Obtiene todos los PINs (defaults + dinámicos)
 * @returns {Object} Todos los PINs configurados
 */
export const getAllPins = () => {
  const dynamicPins = getDynamicPins();
  return { ...PINS_CONFIG, ...dynamicPins };
};

/**
 * Restablece todos los PINs a los valores por defecto
 */
export const resetPinsToDefaults = () => {
  try {
    localStorage.removeItem('akahl_pins');
    return true;
  } catch (error) {
    console.error('Error resetting PINs:', error);
    return false;
  }
};
