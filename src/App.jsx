/**
 * Componente Principal - Cotizador AKAHL
 *
 * Sistema de autenticación con PIN local para uso interno.
 * Los PINs se configuran en src/config/pins.js y pueden gestionarse
 * desde el Admin Panel.
 */

import { useState, useCallback, useEffect } from 'react';
import PinLockScreen from './components/PinLockScreen';
import QuotationScreen from './components/QuotationScreen';
import AdminPanel from './components/AdminPanel';
import Header from './components/Header';
import ToastContainer from './components/ToastContainer';
import './index.css';

// ============================================
// CONSTANTES Y CONFIGURACIÓN
// ============================================

const APP_VIEWS = {
  LOGIN: 'login',
  QUOTATION: 'quotation',
  ADMIN: 'admin',
};

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutos

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

function App() {
  const [currentView, setCurrentView] = useState(APP_VIEWS.LOGIN);
  const [userRole, setUserRole] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [shiftStartTime, setShiftStartTime] = useState(null);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // ============================================
  // EFECTOS
  // ============================================

  /**
   * Verificar autenticación al iniciar la app
   * Verifica si hay un PIN activo en localStorage
   */
  useEffect(() => {
    const checkAuth = () => {
      const activePin = localStorage.getItem('active_pin');
      const activeRole = localStorage.getItem('active_role');

      if (activePin && activeRole) {
        setUserRole(activeRole);
        setCurrentUser({
          name: activeRole === 'ADMIN' ? 'Administrador' : 'Asociado',
          pin: activePin
        });
        setShiftStartTime(new Date());
        setCurrentView(activeRole === 'ADMIN' ? APP_VIEWS.ADMIN : APP_VIEWS.QUOTATION);
        setLastActivity(Date.now());
      }
    };

    checkAuth();
  }, []);

  /**
   * Verificar inactividad y cerrar sesión automáticamente
   */
  useEffect(() => {
    if (currentView === APP_VIEWS.LOGIN) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const inactiveTime = now - lastActivity;

      if (inactiveTime >= INACTIVITY_TIMEOUT) {
        console.log('Inactividad detectada, cerrando sesión...');
        handleLogout();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentView, lastActivity]);

  /**
   * Registrar actividad del usuario
   */
  useEffect(() => {
    if (currentView === APP_VIEWS.LOGIN) return;

    const handleActivity = () => setLastActivity(Date.now());

    window.addEventListener('touchstart', handleActivity);
    window.addEventListener('touchmove', handleActivity);
    window.addEventListener('mousedown', handleActivity);
    window.addEventListener('keydown', handleActivity);

    return () => {
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('touchmove', handleActivity);
      window.removeEventListener('mousedown', handleActivity);
      window.removeEventListener('keydown', handleActivity);
    };
  }, [currentView]);

  // ============================================
  // MANEJADORES
  // ============================================

  /**
   * Maneja login exitoso con PIN
   */
  const handleLoginSuccess = useCallback((role, user) => {
    setUserRole(role);
    setCurrentUser(user);
    setShiftStartTime(new Date());

    // Guardar sesión activa en localStorage
    localStorage.setItem('active_pin', user.pin || '');
    localStorage.setItem('active_role', role);

    setCurrentView(role === 'ADMIN' ? APP_VIEWS.ADMIN : APP_VIEWS.QUOTATION);
    setLastActivity(Date.now());
  }, []);

  /**
   * Cierra sesión
   */
  const handleLogout = useCallback(() => {
    localStorage.removeItem('active_pin');
    localStorage.removeItem('active_role');
    setUserRole(null);
    setCurrentUser(null);
    setShiftStartTime(null);
    setCurrentView(APP_VIEWS.LOGIN);
  }, []);

  /**
   * Cambia a vista de admin
   */
  const handleGoToAdmin = useCallback(() => {
    setCurrentView(APP_VIEWS.ADMIN);
    setLastActivity(Date.now());
  }, []);

  /**
   * Regresa a cotizador
   */
  const handleBackToQuotation = useCallback(() => {
    setCurrentView(APP_VIEWS.QUOTATION);
    setLastActivity(Date.now());
  }, []);

  /**
   * Registra actividad
   */
  const registerActivity = useCallback(() => {
    setLastActivity(Date.now());
  }, []);

  // ============================================
  // RENDERIZADO
  // ============================================

  return (
    <div className="min-h-screen bg-premium luxury-pattern relative overflow-hidden">
      {/* Toast Container */}
      <ToastContainer />

      {/* Ambient glow effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-akahl-secondary/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-akahl-primary/40 rounded-full blur-3xl animate-float" style={{animationDelay: '-3s'}}></div>
      </div>

      {/* Vista de Login (PIN Lock) */}
      {currentView === APP_VIEWS.LOGIN && (
        <PinLockScreen onSuccess={handleLoginSuccess} />
      )}

      {/* Vistas principales */}
      {currentView !== APP_VIEWS.LOGIN && (
        <>
          <Header
            userRole={userRole}
            currentUser={currentUser}
            shiftStartTime={shiftStartTime}
            currentView={currentView}
            onLogout={handleLogout}
            onGoToAdmin={handleGoToAdmin}
            onBackToQuotation={handleBackToQuotation}
          />

          <main className="pb-8 px-4 pt-4 max-w-4xl mx-auto">
            {currentView === APP_VIEWS.QUOTATION && (
              <QuotationScreen onActivity={registerActivity} />
            )}

            {currentView === APP_VIEWS.ADMIN && userRole === 'ADMIN' && (
              <AdminPanel onActivity={registerActivity} />
            )}
          </main>
        </>
      )}
    </div>
  );
}

export default App;
