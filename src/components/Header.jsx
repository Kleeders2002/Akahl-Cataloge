/**
 * Componente: Header
 *
 * Header compartido - Estilo AKAHL.
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
        const minutes = Math.floor(elapsed / 60000);
        setElapsedTime(`${minutes}m`);
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
    <header className="bg-neutral-900/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo y usuario */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {/* Needle icon */}
              <div className="w-8 h-8 border border-white/20 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <div>
                <h2 className="font-display font-semibold text-white text-lg tracking-wide">
                  {currentView === 'admin' ? 'Administration' : 'Quotation'}
                </h2>
                <p className="text-xs text-neutral-500 tracking-wide flex items-center gap-2">
                  <span>{currentUser?.name || 'User'}</span>
                  <span>•</span>
                  <span>{formatDate(currentTime)} {formatTime(currentTime)}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center gap-2">
            {/* Toggle Admin/Quotation */}
            {userRole === 'ADMIN' && (
              <>
                {currentView === 'quotation' ? (
                  <button
                    onClick={onGoToAdmin}
                    className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 rounded-lg transition-all active:scale-95 border border-white/10"
                  >
                    <svg
                      className="w-4 h-4 text-neutral-400"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="font-medium text-neutral-300 text-sm tracking-wide">Admin</span>
                  </button>
                ) : (
                  <button
                    onClick={onBackToQuotation}
                    className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 rounded-lg transition-all active:scale-95 border border-white/10"
                  >
                    <svg
                      className="w-4 h-4 text-neutral-400"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span className="font-medium text-neutral-300 text-sm tracking-wide">Quote</span>
                  </button>
                )}
              </>
            )}

            {/* Logout */}
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-3 py-2.5 bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 rounded-lg transition-all active:scale-95 border border-white/10"
            >
              <svg
                className="w-4 h-4 text-neutral-400"
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
              <span className="font-medium text-neutral-300 text-sm hidden sm:inline tracking-wide">
                Logout
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
