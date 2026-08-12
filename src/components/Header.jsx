/**
 * Componente: Header
 *
 * Header premium AKAHL - Estilo de lujo con logo centrado.
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
    <header className="bg-gradient-to-b from-akahl-primary/95 to-akahl-primary/90 backdrop-blur-xl border-b border-akahl-secondary/30 sticky top-0 z-40 shadow-premium">
      {/* Premium gold line accent */}
      <div className="h-px bg-gradient-to-r from-transparent via-akahl-secondary/60 to-transparent"></div>

      <div className="max-w-6xl mx-auto px-4">
        {/* Top section with logo center */}
        <div className="flex items-center justify-between py-4">
          {/* Left side - Brand Badge */}
          <div className="flex items-center gap-3 flex-1">
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <h1 className="font-display font-bold text-gradient-gold text-2xl tracking-[0.3em]">
                  AKAHL
                </h1>
                <span className="badge-gold text-xs py-1 px-3 tracking-wider">
                  CATALOGE
                </span>
              </div>
              <p className="text-xs text-akahl-secondary/70 tracking-[0.2em] uppercase mt-1">
                {currentView === 'admin' ? 'Administration' : 'Internal Quotation'}
              </p>
            </div>
            {/* Mobile: Simple brand */}
            <div className="sm:hidden">
              <h1 className="font-display font-bold text-gradient-gold text-lg tracking-wider">
                AKAHL CATALOGE
              </h1>
            </div>
          </div>

          {/* Center - Logo */}
          <div className="flex-shrink-0">
            <img
              src="/logo-akahl.png"
              alt="AKAHL Logo"
              className="h-12 md:h-14 w-auto object-contain drop-shadow-premium"
            />
          </div>

          {/* Right side - Controls */}
          <div className="flex items-center gap-3 flex-1 justify-end">
            {/* Time info - Desktop */}
            <div className="hidden lg:flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-akahl-primary-dark/60 to-akahl-secondary/10 rounded-xl border border-akahl-secondary/20 shadow-premium">
              {elapsedTime && (
                <div className="text-right">
                  <p className="text-xs text-akahl-secondary/70 uppercase tracking-[0.15em]">Session</p>
                  <p className="text-sm font-bold text-akahl-secondary">{elapsedTime}</p>
                </div>
              )}
              <div className="w-px h-7 bg-gradient-to-b from-transparent via-akahl-secondary/30 to-transparent"></div>
              <div className="text-right">
                <p className="text-xs text-neutral-400 uppercase tracking-wider">{formatDate(currentTime)}</p>
                <p className="text-sm font-bold text-white">{formatTime(currentTime)}</p>
              </div>
            </div>

            {/* Toggle Admin/Quotation */}
            {userRole === 'ADMIN' && (
              <>
                {currentView === 'quotation' ? (
                  <button
                    onClick={onGoToAdmin}
                    className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-akahl-secondary/15 hover:bg-akahl-secondary/25 active:bg-akahl-secondary/35 rounded-xl transition-all active:scale-95 border border-akahl-secondary/40 shadow-premium hover:shadow-premium-lg"
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
                    <span className="font-semibold text-akahl-secondary text-sm tracking-wide">Admin</span>
                  </button>
                ) : (
                  <button
                    onClick={onBackToQuotation}
                    className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-akahl-secondary/15 hover:bg-akahl-secondary/25 active:bg-akahl-secondary/35 rounded-xl transition-all active:scale-95 border border-akahl-secondary/40 shadow-premium hover:shadow-premium-lg"
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
                    <span className="font-semibold text-akahl-secondary text-sm tracking-wide">Quote</span>
                  </button>
                )}
              </>
            )}

            {/* Logout */}
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-950/40 to-red-900/30 hover:from-red-950/60 hover:to-red-900/50 active:from-red-950/80 active:to-red-900/70 rounded-xl transition-all active:scale-95 border border-red-900/60 shadow-lg hover:shadow-red-900/20"
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
              <span className="font-semibold text-red-400 text-sm hidden sm:inline tracking-wide">
                Logout
              </span>
            </button>
          </div>
        </div>

        {/* Mobile time display */}
        <div className="flex md:hidden items-center justify-center gap-4 py-3 border-t border-akahl-secondary/20 bg-akahl-primary-dark/30">
          {elapsedTime && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-akahl-secondary/70 uppercase tracking-wider">Session:</span>
              <span className="text-sm font-semibold text-akahl-secondary">{elapsedTime}</span>
            </div>
          )}
          <div className="w-px h-4 bg-akahl-secondary/20"></div>
          <div className="text-xs text-neutral-400">
            {formatDate(currentTime)} • {formatTime(currentTime)}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
