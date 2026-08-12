/**
 * Componente: Header
 *
 * Header premium AKAHL - Estilo de lujo con logo centrado.
 * Layout: Admin/User (izq) | Logo (centro absoluto) | Logout (der)
 */

function Header({
  userRole,
  currentUser,
  shiftStartTime,
  currentView,
  onLogout,
  onGoToAdmin,
  onBackToQuotation,
}) {
  // ============================================
  // RENDERIZADO
  // ============================================

  return (
    <header className="bg-gradient-to-b from-akahl-primary/95 to-akahl-primary/90 backdrop-blur-xl border-b border-akahl-secondary/30 sticky top-0 z-40 shadow-premium">
      {/* Premium gold line accent */}
      <div className="h-px bg-gradient-to-r from-transparent via-akahl-secondary/60 to-transparent"></div>

      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between py-4 relative">
          {/* Left side - Admin/User button */}
          {userRole === 'ADMIN' && (
            <div className="flex-shrink-0">
              {currentView === 'admin' ? (
                <button
                  onClick={onBackToQuotation}
                  className="flex items-center gap-2 px-5 py-2.5 bg-akahl-secondary/15 hover:bg-akahl-secondary/25 active:bg-akahl-secondary/35 rounded-xl transition-all active:scale-95 border border-akahl-secondary/40 shadow-premium hover:shadow-premium-lg"
                >
                  <svg
                    className="w-4 h-4 text-akahl-secondary"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="font-semibold text-akahl-secondary text-sm tracking-wide">User</span>
                </button>
              ) : (
                <button
                  onClick={onGoToAdmin}
                  className="flex items-center gap-2 px-5 py-2.5 bg-akahl-secondary/15 hover:bg-akahl-secondary/25 active:bg-akahl-secondary/35 rounded-xl transition-all active:scale-95 border border-akahl-secondary/40 shadow-premium hover:shadow-premium-lg"
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
              )}
            </div>
          )}

          {/* Center - Logo (absolute centered) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <img
              src="/logo-akahl.png"
              alt="AKAHL Logo"
              className="h-12 md:h-14 w-auto object-contain drop-shadow-premium"
            />
          </div>

          {/* Right side - Logout button */}
          <div className="flex-shrink-0">
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
      </div>
    </header>
  );
}

export default Header;
