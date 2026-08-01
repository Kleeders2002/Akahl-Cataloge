/**
 * Componente: PinLockScreen
 *
 * Pantalla de bloqueo por PIN numérico - Estilo AKAHL
 * Sistema de autenticación local para uso interno.
 *
 * Features:
 * - Numpad táctil grande para iPad/móvil
 * - Indicador visual de dígitos ingresados
 * - Validación local (sin backend)
 * - Animaciones de error y éxito
 * - Diseño minimalista negro/blanco
 */

import { useState, useCallback, useEffect } from 'react';
import { verifyPin } from '../services/api';

const PIN_LENGTH = 4;

// ============================================
// COMPONENTE
// ============================================

function PinLockScreen({ onSuccess }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // ============================================
  // MANEJADORES
  // ============================================

  /**
   * Agrega un dígito al PIN
   */
  const handleDigit = useCallback((digit) => {
    if (pin.length >= PIN_LENGTH || error || verifying) return;

    setPin(prev => prev + digit);
    setError(false);
  }, [pin.length, error, verifying]);

  /**
   * Elimina el último dígito
   */
  const handleBackspace = useCallback(() => {
    if (error || verifying) return;
    setPin(prev => prev.slice(0, -1));
    setError(false);
  }, [error, verifying]);

  /**
   * Limpia todo el PIN
   */
  const handleClear = useCallback(() => {
    if (verifying) return;
    setPin('');
    setError(false);
  }, [verifying]);

  /**
   * Verifica el PIN cuando se completa
   */
  useEffect(() => {
    const verifyPinAsync = async () => {
      if (pin.length === PIN_LENGTH) {
        setVerifying(true);

        try {
          const result = await verifyPin(pin);

          if (result.success) {
            // Éxito - limpiar y notificar
            setPin('');
            setVerifying(false);
            onSuccess(result.role, result.user);
          } else {
            // Error - mostrar animación
            await new Promise(r => setTimeout(r, 300));
            setError(true);
            setPin('');
            setVerifying(false);
          }
        } catch (err) {
          console.error('Error verifying PIN:', err);
          setError(true);
          setPin('');
          setVerifying(false);
        }
      }
    };

    verifyPinAsync();
  }, [pin, onSuccess]);

  // ============================================
  // EVENTOS DE TECLADO (opcional, para desktop)
  // ============================================

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (verifying) return;

      if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDigit, handleBackspace, handleClear, verifying]);

  // ============================================
  // RENDERIZADO
  // ============================================

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 border border-white/20 rounded-full mb-4">
            {/* Needle icon - representing bespoke tailoring */}
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
          <h1 className="text-3xl font-display font-semibold text-white tracking-wide">AKAHL</h1>
          <p className="text-neutral-500 mt-1 text-sm tracking-widest uppercase">Internal Quotation</p>
        </div>

        {/* Tarjeta de PIN */}
        <div className="card">
          {/* Indicador de PIN */}
          <div className="mb-8">
            <p className="text-center text-neutral-400 mb-4 font-medium text-sm tracking-wide">
              ENTER ACCESS CODE
            </p>
            <div
              className={`flex justify-center gap-4 transition-all duration-200 ${
                error ? 'animate-pulse' : ''
              }`}
            >
              {[...Array(PIN_LENGTH)].map((_, i) => {
                const isFilled = i < pin.length;
                const isError = error && i === PIN_LENGTH - 1;

                return (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full transition-all duration-200 ${
                      isError
                        ? 'bg-red-500 scale-125'
                        : isFilled
                        ? 'bg-white scale-100'
                        : 'bg-neutral-700 scale-100'
                    }`}
                  />
                );
              })}
            </div>
            {error && (
              <p className="text-center text-red-400 mt-4 font-medium text-sm animate-fadeIn tracking-wide">
                Invalid access code
              </p>
            )}
          </div>

          {/* Numpad */}
          <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto">
            {/* Números 1-9 */}
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleDigit(String(num))}
                disabled={verifying}
                className={`numpad-btn ${verifying ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {num}
              </button>
            ))}

            {/* Fila inferior: Clear, 0, Backspace */}
            <button
              onClick={handleClear}
              disabled={verifying || !pin}
              className={`numpad-btn text-base font-medium tracking-wide ${
                verifying || !pin ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Clear
            </button>

            <button
              onClick={() => handleDigit('0')}
              disabled={verifying}
              className={`numpad-btn ${verifying ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              0
            </button>

            <button
              onClick={handleBackspace}
              disabled={verifying || !pin}
              className={`numpad-btn flex items-center justify-center ${
                verifying || !pin ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Footer informativo */}
        <div className="mt-6 text-center">
          <p className="text-xs text-neutral-600 tracking-wide">
            INTERNAL USE ONLY
          </p>
        </div>
      </div>
    </div>
  );
}

export default PinLockScreen;
