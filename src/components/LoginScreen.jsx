/**
 * Componente: LoginScreen
 *
 * Pantalla de login - Estilo AKAHL
 * Reemplaza el sistema de PIN por autenticación JWT (email/contraseña)
 * Compatible con el backend existente de AKAHL Club
 */

import { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { login } from '../services/api';

// ============================================
// COMPONENTE
// ============================================

function LoginScreen({ onSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await login(email.trim(), password);

      if (response.success) {
        // Guardar token
        localStorage.setItem('token', response.token);

        // Extraer role del token (si no viene directo en response)
        let role = response.role;
        if (!role && response.token) {
          try {
            const payload = JSON.parse(atob(response.token.split('.')[1]));
            role = payload.role || 'USER';
          } catch (err) {
            console.error('Error decoding token:', err);
          }
        }

        // Notificar éxito
        onSuccess(role, {
          email: email,
          name: response.name || email.split('@')[0]
        });

        // Limpiar formulario
        setEmail('');
        setPassword('');
      } else {
        setError(response.message || 'Invalid credentials');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Enter para submit
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && !isLoading) {
        handleSubmit(e);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [email, password, isLoading]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 border border-white/20 rounded-full mb-4">
            {/* Needle icon */}
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

        {/* Login Card */}
        <div className="card">
          <h2 className="text-xl font-display font-semibold text-white mb-6 tracking-wide text-center">
            Sign In
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2 tracking-wide">
                EMAIL
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  placeholder="your@email.com"
                  className="w-full pl-11 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-white focus:bg-neutral-900 transition-all"
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2 tracking-wide">
                PASSWORD
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-white focus:bg-neutral-900 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="p-3 bg-red-950/30 border border-red-900/50 rounded-lg">
                <p className="text-sm text-red-400 text-center">{error}</p>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-white hover:bg-neutral-100 active:bg-neutral-200 text-neutral-900 font-semibold rounded-lg transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-neutral-600 tracking-wide">
            INTERNAL USE ONLY • AKAHL CLUB
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginScreen;
