import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as Icon from "../components/Icons";

export const ReportListPage = () => {
  const [savedReports, setSavedReports] = useState([]);
  const navigate = useNavigate();

  // Cargar reportes desde localStorage
  useEffect(() => {
    const reports = JSON.parse(localStorage.getItem('savedReports') || '[]');
    const now = Date.now();
    const validReports = reports.filter(report => now - report.createdAt < 259200000); // 72 horas
    setSavedReports(validReports);
    localStorage.setItem('savedReports', JSON.stringify(validReports));
  }, []);

  // Función para eliminar un reporte
  const handleDeleteReport = (reportId) => {
    const updatedReports = savedReports.filter(report => report.id !== reportId);
    setSavedReports(updatedReports);
    localStorage.setItem('savedReports', JSON.stringify(updatedReports));
  };

  // Función para editar un reporte
  const handleEditReport = (report) => {
    // Navegar a la página de crear con el reporte para editar
    navigate('/', { state: { editingReport: report } });
  };

  // Función para ver detalles del reporte
  const handleViewReport = (report) => {
    // Por ahora, solo mostrar en consola. Podrías implementar un modal o página de detalles
    console.log('Ver reporte:', report);
    alert(`Reporte ID: ${report.id}\nFecha: ${report.data.generalInfo.fecha}\nColada: ${report.data.generalInfo.colada}`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Reportes Guardados</h2>
        {savedReports.length === 0 ? (
          <p className="text-gray-500">No hay reportes guardados.</p>
        ) : (
          <div className="space-y-4">
            {savedReports.map((report) => (
              <div key={report.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium text-lg">
                      Reporte #{report.id}
                    </h3>
                    <div className="mt-2 grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Fecha:</span> {report.data.generalInfo.fecha || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">Colada:</span> {report.data.generalInfo.colada || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">Operador:</span> {report.data.generalInfo.operador || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">Material:</span> {report.data.generalInfo.material || 'N/A'}
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      Creado: {new Date(report.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleViewReport(report)}
                      className="px-3 py-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors flex items-center gap-1"
                    >
                      <Icon.ReportList className="w-4 h-4" />
                      Ver
                    </button>
                    <button
                      onClick={() => handleEditReport(report)}
                      className="px-3 py-2 bg-yellow-100 text-yellow-600 rounded hover:bg-yellow-200/70 transition-colors flex items-center gap-1"
                    >
                      <Icon.CreateReport className="w-4 h-4" />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteReport(report.id)}
                      className="px-3 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors flex items-center gap-1"
                    >
                      <Icon.Trashcan className="w-4 h-4" /> 
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
