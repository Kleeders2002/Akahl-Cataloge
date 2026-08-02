/**
 * Componente: Header
 *
 * Header premium AKAHL - Estilo de lujo.
 * Muestra información del usuario y botones de navegación.
 */

import { useEffect, useState } from 'react';

// ============================================
// COMPONENTE
// ============================================

function Header({
  userRole,
  currentUser,
  shiftStartTime,
  currentView,
  onLogout,
  onGoToAdmin,
  onBackToQuotation,
}) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [elapsedTime, setElapsedTime] = useState('');

  // ============================================
  // EFECTOS
  // ============================================

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      if (shiftStartTime) {
        const elapsed = now - new Date(shiftStartTime);
        const hours = Math.floor(elapsed / 3600000);
        const minutes = Math.floor((elapsed % 3600000) / 60000);
        if (hours > 0) {
          setElapsedTime(`${hours}h ${minutes}m`);
        } else {
          setElapsedTime(`${minutes}m`);
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [shiftStartTime]);

  // ============================================
  // RENDERIZADO
  // ============================================

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <header className="bg-akahl-primary/90 backdrop-blur-xl border-b border-akahl-secondary/20 sticky top-0 z-40 shadow-lg">
      {/* Subtle gold line accent */}
      <div className="h-px bg-gradient-to-r from-transparent via-akahl-secondary/40 to-transparent"></div>

      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo y usuario */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              {/* Premium Needle icon */}
              <div className="w-10 h-10 border border-akahl-secondary/30 rounded-lg flex items-center justify-center bg-akahl-secondary/5 shadow-premium">
                <svg
                  className="w-5 h-5 text-akahl-secondary"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>

              {/* Brand Badge */}
              <div className="hidden sm:block">
                <div className="flex items-center gap-2 mb-0.5">
                  <h1 className="font-display font-bold text-gradient-gold text-xl tracking-widest">
                    AKAHL
                  </h1>
                  <span className="badge-gold text-xs py-0.5 px-2">
                    ATELIER
                  </span>
                </div>
                <p className="text-xs text-akahl-secondary/60 tracking-widest uppercase">
                  {currentView === 'admin' ? 'Administration' : 'Internal Quotation'}
                </p>
              </div>

              {/* Mobile: Simple indicator */}
              <div className="sm:hidden">
                <div className="flex items-center gap-2">
                  <h1 className="font-display font-bold text-gradient-gold text-lg tracking-wider">
                    AKAHL
                  </h1>
                </div>
              </div>
            </div>
          </div>

          {/* Info y botones */}
          <div className="flex items-center gap-3">
            {/* Time info */}
            <div className="hidden md:flex items-center gap-3 px-3 py-2 bg-akahl-primary-dark/50 rounded-lg border border-akahl-secondary/10">
              {elapsedTime && (
                <div className="text-right">
                  <p className="text-xs text-akahl-secondary/60 uppercase tracking-wider">Session</p>
                  <p className="text-sm font-semibold text-akahl-secondary">{elapsedTime}</p>
                </div>
              )}
              <div className="w-px h-6 bg-akahl-secondary/20"></div>
              <div className="text-right">
                <p className="text-xs text-neutral-400">{formatDate(currentTime)}</p>
                <p className="text-sm font-semibold text-white">{formatTime(currentTime)}</p>
              </div>
            </div>

            {/* Toggle Admin/Quotation */}
            {userRole === 'ADMIN' && (
              <>
                {currentView === 'quotation' ? (
                  <button
                    onClick={onGoToAdmin}
                    className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-akahl-secondary/10 hover:bg-akahl-secondary/20 active:bg-akahl-secondary/30 rounded-lg transition-all active:scale-95 border border-akahl-secondary/30"
                  >
                    <svg
                      className="w-4 h-4 text-akahl-secondary"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="font-medium text-akahl-secondary text-sm tracking-wide">Admin</span>
                  </button>
                ) : (
                  <button
                    onClick={onBackToQuotation}
                    className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-akahl-secondary/10 hover:bg-akahl-secondary/20 active:bg-akahl-secondary/30 rounded-lg transition-all active:scale-95 border border-akahl-secondary/30"
                  >
                    <svg
                      className="w-4 h-4 text-akahl-secondary"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span className="font-medium text-akahl-secondary text-sm tracking-wide">Quote</span>
                  </button>
                )}
              </>
            )}

            {/* Logout */}
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-3 py-2.5 bg-red-950/30 hover:bg-red-950/50 active:bg-red-950/70 rounded-lg transition-all active:scale-95 border border-red-900/50"
            >
              <svg
                className="w-4 h-4 text-red-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span className="font-medium text-red-400 text-sm hidden sm:inline tracking-wide">
                Logout
              </span>
            </button>
          </div>
        </div>

        {/* Mobile time display */}
        <div className="flex md:hidden items-center justify-between mt-2 pt-2 border-t border-akahl-secondary/10">
          <div className="flex items-center gap-2">
            {elapsedTime && (
              <>
                <span className="text-xs text-neutral-500 uppercase tracking-wider">Session:</span>
                <span className="text-sm font-semibold text-akahl-secondary">{elapsedTime}</span>
              </>
            )}
          </div>
          <div className="text-xs text-neutral-400">
            {formatDate(currentTime)} • {formatTime(currentTime)}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
