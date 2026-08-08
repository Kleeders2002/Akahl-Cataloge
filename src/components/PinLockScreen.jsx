/**
 * Componente: PinLockScreen
 *
 * Pantalla de bloqueo por PIN numérico - Estilo AKAHL Premium
 * Sistema de autenticación local para uso interno.
 *
 * Features:
 * - Numpad táctil grande para iPad/móvil
 * - Indicador visual de dígitos ingresados
 * - Validación local (sin backend)
 * - Animaciones de error y éxito
 * - Diseño premium con colores de marca
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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-akahl-secondary/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-akahl-primary/40 rounded-full blur-3xl animate-float" style={{animationDelay: '-2s'}}></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo/Branding Premium */}
        <div className="text-center mb-8 animate-slideDown">
          {/* Logotipo AKAHL Cataloge (imagen completa, no reconstruir con texto) */}
          <img
            src="/logo-akahl.png"
            alt="AKAHL Cataloge"
            className="w-64 sm:w-72 mx-auto mb-4 select-none pointer-events-none"
          />

          <p className="text-akahl-secondary/60 text-sm tracking-[0.25em] uppercase font-light">
            Internal Quotation System
          </p>
        </div>

        {/* Tarjeta de PIN Premium */}
        <div className="card-premium mb-6 animate-scale-in">
          {/* Indicador de PIN */}
          <div className="mb-8">
            <p className="text-center text-neutral-400 mb-6 font-medium text-sm tracking-[0.15em] uppercase">
              Enter Access Code
            </p>
            <div
              className={`flex justify-center gap-5 transition-all duration-300 ${
                error ? 'animate-pulse' : ''
              }`}
            >
              {[...Array(PIN_LENGTH)].map((_, i) => {
                const isFilled = i < pin.length;
                const isError = error && i === PIN_LENGTH - 1;

                return (
                  <div
                    key={i}
                    className="relative"
                  >
                    {/* Outer ring for filled state */}
                    {isFilled && !error && (
                      <div className="absolute inset-[-4px] bg-akahl-secondary/20 rounded-full blur-sm"></div>
                    )}
                    <div
                      className={`w-4 h-4 rounded-full transition-all duration-300 relative ${
                        isError
                          ? 'bg-red-500 scale-125 shadow-red-500/50'
                          : isFilled
                          ? 'bg-akahl-secondary scale-100 shadow-gold-glow'
                          : 'bg-neutral-700/50 scale-100 border border-akahl-secondary/20'
                      }`}
                    />
                  </div>
                );
              })}
            </div>
            {error && (
              <p className="text-center text-red-400 mt-5 font-medium text-sm animate-fadeIn tracking-wide">
                Invalid access code
              </p>
            )}
            {verifying && (
              <p className="text-center text-akahl-secondary/60 mt-5 font-medium text-sm tracking-wide">
                Verifying...
              </p>
            )}
          </div>

          {/* Numpad Premium */}
          <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto">
            {/* Números 1-9 */}
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num, index) => (
              <button
                key={num}
                onClick={() => handleDigit(String(num))}
                disabled={verifying}
                className={`numpad-btn ${verifying ? 'opacity-50 cursor-not-allowed' : ''}`}
                style={{animationDelay: `${index * 50}ms`}}
              >
                {num}
              </button>
            ))}

            {/* Fila inferior: Clear, 0, Backspace */}
            <button
              onClick={handleClear}
              disabled={verifying || !pin}
              className={`numpad-btn text-sm font-medium tracking-wider ${
                verifying || !pin ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              CLR
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

        {/* Footer informativo Premium */}
        <div className="text-center space-y-2">
          <p className="text-xs text-akahl-secondary/40 tracking-[0.2em] uppercase">
            Authorized Personnel Only
          </p>
          <div className="flex items-center justify-center gap-2">
            <div className="w-8 h-px bg-gradient-to-r from-transparent to-akahl-secondary/30"></div>
            <svg className="w-3 h-3 text-akahl-secondary/30" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
            <div className="w-8 h-px bg-gradient-to-l from-transparent to-akahl-secondary/30"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PinLockScreen;