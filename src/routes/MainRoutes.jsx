import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from '../layout/MainLayout'
import { PageHeading } from '../components/pages/PageHeading'
import { CreateReportPage } from "../pages/CreateReportPage";
import { ReportListPage } from "../pages/ReportListPage";

export const MainRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <MainLayout>
              <PageHeading title="Crear Reporte de Vaciado"/>
              <CreateReportPage />
            </MainLayout>
          }
        />
        <Route
          path="/reportlist"
          element={
            <MainLayout>
              <PageHeading title="Lista de Reportes"/>
              <ReportListPage />
            </MainLayout>
          }
        />
        <Route
          path="/reportAnalytics"
          element={
            <MainLayout>
              <PageHeading title="Analisis de Reportes"/>
            </MainLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};
