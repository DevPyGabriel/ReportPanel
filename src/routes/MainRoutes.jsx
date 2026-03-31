import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import { MainLayout } from '../layout/MainLayout'
import { PageHeading } from '../components/pages/PageHeading'
import { CreateReportPage } from "../pages/CreateReportPage";
import { ReportListPage } from "../pages/ReportListPage";
import Login from "../pages/Login";

/**
 * Componente principal de rutas de la aplicación.
 * Maneja la autenticación global y el enrutamiento entre páginas.
 * Requiere login al iniciar la aplicación, persistiendo durante la sesión del navegador.
 */
export const MainRoutes = () => {
  // Estado para controlar si el usuario está autenticado.
  // Inicializado desde sessionStorage para persistir durante la sesión del navegador.
  const [isAuthenticated, setIsAuthenticated] = useState(() => sessionStorage.getItem("session_active") === "true");

  // Función para cerrar sesión
  const handleLogout = () => {
    sessionStorage.removeItem("session_active");
    setIsAuthenticated(false);
  };

  return (
    <BrowserRouter>
      {/* Condicional: muestra login si no autenticado, sino las rutas protegidas */}
      {isAuthenticated ? (
        <Routes>
          {/* Ruta principal: Crear reporte */}
          <Route
            path="/"
            element={
              <MainLayout onLogout={handleLogout}>
                <PageHeading title="Crear Reporte de Vaciado"/>
                <CreateReportPage />
              </MainLayout>
            }
          />
          {/* Ruta para lista de reportes */}
          <Route
            path="/reportlist"
            element={
              <MainLayout onLogout={handleLogout}>
                <PageHeading title="Lista de Reportes"/>
                <ReportListPage />
              </MainLayout>
            }
          />
          {/* Ruta para análisis (en desarrollo) */}
          <Route
            path="/reportAnalytics"
            element={
              <MainLayout onLogout={handleLogout}>
                <PageHeading title="Analisis de Reportes"/>
              </MainLayout>
            }
          />
        </Routes>
      ) : (
        // Componente de login: recibe callback para actualizar autenticación
        <Login onLogin={() => setIsAuthenticated(true)} />
      )}
    </BrowserRouter>
  );
};
