/**
 * Componente: AccessCodeScreen
 *
 * Pantalla de acceso con código numérico - Estilo AKAHL Premium.
 * Teclado numérico con indicador de dígitos y validación de código.
 *
 * NOTA: usa el logo "logo-akahl" que ya tienes en tu proyecto.
 * Ajusta la ruta del import según donde esté guardado el archivo.
 *
 * NOTA 2: reutiliza las clases utilitarias que ya usa PriceDisplay.jsx
 * (card-premium, akahl-primary, akahl-secondary, font-display, etc).
 * Si "animate-shake" no existe todavía en tu tailwind.config, agrega el
 * keyframe indicado al final de este archivo (o quita la clase).
 */

import { useState, useEffect } from 'react';
import logoAkahl from '../assets/logo-akahl.png'; // Ajusta esta ruta

const KEYPAD_KEYS = [
  '1', '2', '3',
  '4', '5', '6',
  '7', '8', '9',
  'clr', '0', 'del',
];

function AccessCodeScreen({
  codeLength = 4,
  onComplete,
  validateCode,
  subtitle = 'Internal Quotation System',
  footerText = 'Authorized Personnel Only',
}) {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (code.length !== codeLength) return;

    if (!validateCode) {
      onComplete?.(code);
      return;
    }

    const isValid = validateCode(code);
    if (isValid) {
      onComplete?.(code);
    } else {
      setError(true);
      const timeout = setTimeout(() => {
        setError(false);
        setCode('');
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [code, codeLength, validateCode, onComplete]);

  const handleKeyPress = (key) => {
    if (error) return;

    if (key === 'clr') {
      setCode('');
      return;
    }
    if (key === 'del') {
      setCode((prev) => prev.slice(0, -1));
      return;
    }
    if (code.length < codeLength) {
      setCode((prev) => prev + key);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-akahl-primary relative overflow-hidden px-4">
      {/* Glow decorativo de fondo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-akahl-secondary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-akahl-primary/40 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img
            src={logoAkahl}
            alt="AKAHL Cataloge"
            className="w-64 sm:w-72 mb-4 select-none pointer-events-none"
          />
          <p className="text-akahl-secondary/70 text-xs tracking-[0.3em] uppercase">
            {subtitle}
          </p>
        </div>

        {/* Card de acceso */}
        <div className={`card-premium p-8 ${error ? 'animate-shake' : ''}`}>
          <p className="text-center text-neutral-300 text-xs tracking-[0.25em] uppercase mb-6">
            Enter Access Code
          </p>

          {/* Indicador de dígitos */}
          <div className="flex items-center justify-center gap-3 mb-8">
            {Array.from({ length: codeLength }).map((_, i) => (
              <span
                key={i}
                className={`w-3 h-3 rounded-full border transition-all duration-150 ${
                  error
                    ? 'bg-red-400/80 border-red-400/80'
                    : i < code.length
                    ? 'bg-akahl-secondary border-akahl-secondary'
                    : 'bg-transparent border-akahl-secondary/30'
                }`}
              />
            ))}
          </div>

          {/* Teclado numérico */}
          <div className="grid grid-cols-3 gap-3">
            {KEYPAD_KEYS.map((key) => {
              if (key === 'clr') {
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleKeyPress(key)}
                    className="h-16 rounded-xl bg-akahl-primary-dark/40 border border-akahl-secondary/15 text-neutral-400 text-xs tracking-[0.15em] uppercase font-medium transition-all hover:bg-akahl-primary-dark/60 hover:text-akahl-secondary active:scale-95"
                  >
                    CLR
                  </button>
                );
              }

              if (key === 'del') {
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleKeyPress(key)}
                    aria-label="Delete"
                    className="h-16 rounded-xl bg-akahl-primary-dark/40 border border-akahl-secondary/15 text-neutral-400 flex items-center justify-center transition-all hover:bg-akahl-primary-dark/60 hover:text-akahl-secondary active:scale-95"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9l-6 6m0-6l6 6m5-9H9.83a2 2 0 00-1.42.59l-5 5a2 2 0 000 2.82l5 5a2 2 0 001.42.59H21a2 2 0 002-2V8a2 2 0 00-2-2z" />
                    </svg>
                  </button>
                );
              }

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleKeyPress(key)}
                  className="h-16 rounded-xl bg-akahl-primary-dark/40 border border-akahl-secondary/15 text-white font-display text-2xl transition-all hover:bg-akahl-secondary/10 hover:border-akahl-secondary/40 active:scale-95"
                >
                  {key}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex flex-col items-center gap-2">
          <p className="text-neutral-500 text-[10px] tracking-[0.3em] uppercase">
            {footerText}
          </p>
          <div className="flex items-center gap-2">
            <div className="h-px w-8 bg-akahl-secondary/20"></div>
            <span className="text-akahl-secondary/40 text-[10px]">★</span>
            <div className="h-px w-8 bg-akahl-secondary/20"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccessCodeScreen;

/**
 * Si "animate-shake" no existe en tu tailwind.config.js, agrégalo así:
 *
 * theme: {
 *   extend: {
 *     keyframes: {
 *       shake: {
 *         '0%, 100%': { transform: 'translateX(0)' },
 *         '25%': { transform: 'translateX(-6px)' },
 *         '75%': { transform: 'translateX(6px)' },
 *       },
 *     },
 *     animation: {
 *       shake: 'shake 0.4s ease-in-out',
 *     },
 *   },
 * }
 */