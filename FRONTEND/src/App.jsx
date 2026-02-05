// FRONTEND/src/App.jsx - VERSIÓN CORREGIDA
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import useResponsive from './hooks/useResponsive';

// Layouts
import MainLayout from './layouts/MainLayout';

// Pages
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Alertas from './pages/Alertas/Alertas';
import Configuration from './pages/Configuration/Configuration';
import Personal from './pages/Personal/Personal';
import Search from './pages/Search/Search';
import ProtectedRoute from './routes/ProtectedRoute';

// Páginas de flota con nuevos nombres
import FlotaServicio from './pages/flota/FlotaServicio/FlotaServicio';
import HistorialVehicular from './pages/flota/HistorialVehicular/HistorialVehicular';
import VehiculosVendidos from './pages/flota/VehiculosVendidos/VehiculosVendidos';
import EquipamientoVehiculos from './pages/flota/EquipamientoVehiculos/EquipamientoVehiculos';

// Otras páginas
import Sedes from './pages/Sedes/Sedes';
import Proveedores from './pages/Proveedores/Proveedores';
import Reportes from './pages/Reportes/Reportes';

// Loading Screen
const LoadingScreen = () => (
  <div className="loading-screen">
    <div className="spinner-large"></div>
    <h2>Cargando GESCOP...</h2>
    <p>Inicializando sistema de gestión</p>
  </div>
);

// App Component
const App = () => {
  const responsive = useResponsive();
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Simular carga inicial
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      <AuthProvider>
        <AppProvider>
          <div className="App" data-responsive={responsive.currentBreakpoint}>
            <Routes>
              {/* Ruta pública - Login */}
              <Route path="/login" element={<Login />} />
              
              {/* Rutas protegidas */}
              <Route path="/" element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="alertas" element={<Alertas />} />
                <Route path="configuracion" element={<Configuration />} />
                
                {/* Rutas de Flota con nuevos nombres */}
                <Route path="flota">
                  <Route path="flota-servicio" element={<FlotaServicio />} />
                  <Route path="historial-vehicular" element={<HistorialVehicular />} />
                  <Route path="vehiculos-vendidos" element={<VehiculosVendidos />} />
                  <Route path="equipamiento-vehiculos" element={<EquipamientoVehiculos />} />
                </Route>
                
                {/* Otras rutas */}
                <Route path="personal" element={<Personal />} />
                <Route path="sedes" element={<Sedes />} />
                <Route path="proveedores" element={<Proveedores />} />
                <Route path="reportes" element={<Reportes />} />
                <Route path="search" element={<Search />} />
              </Route>
              
              {/* Ruta 404 */}
              <Route path="*" element={
                <div className="not-found">
                  <h1>404 - Página no encontrada</h1>
                  <p>La página que buscas no existe.</p>
                  <a href="/">Volver al inicio</a>
                </div>
              } />
            </Routes>
          </div>
        </AppProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;