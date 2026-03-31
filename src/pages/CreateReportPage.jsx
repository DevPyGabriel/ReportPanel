import React, { useRef, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import * as Icon from "../components/Icons";

export const CreateReportPage = () => {
  const nextId = useRef(1);
  const [rows, setRows] = useState([{ id: 0, material: "", kilos: "" }]);
  const lastRowInputRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Estado para el primer grid (información general)
  const [generalInfo, setGeneralInfo] = useState({
    fecha: "",
    colada: "",
    operador: "Adelis Vielma",
    material: "",
    params: "",
    observation: "",
  });

  // Estado para los grids de piezas (inicialmente uno con datos)
  const [pieceGrids, setPieceGrids] = useState([
    {
      id: 0,
      cliente: "",
      codigo: "",
      descripcion: "",
      odp: "",
      serial: "",
      cantPiezas: "",
      cantMoldes: "",
      pesoBruto: "",
      pesoNeto: "",
      totalBruto: "",
      totalNeto: "",
    },
  ]);

  // Estados para persistencia y gestión de reportes
  const [savedReports, setSavedReports] = useState([]);
  const [editingReport, setEditingReport] = useState(null);
  const [isReadOnly, setIsReadOnly] = useState(false);

  // Cargar reporte para edición si viene desde ReportListPage
  useEffect(() => {
    if (location.state?.editingReport) {
      const report = location.state.editingReport;
      setGeneralInfo(report.data.generalInfo);
      setPieceGrids(report.data.pieceGrids);
      setRows(report.data.rows);
      setEditingReport(report);
      setIsReadOnly(false);
    }
  }, [location.state]);

  // Cargar reportes desde localStorage y limpiar expirados
  useEffect(() => {
    const reports = JSON.parse(localStorage.getItem("savedReports") || "[]");
    const now = Date.now();
    const validReports = reports.filter(
      (report) => now - report.createdAt < 259200000,
    ); // 72 horas
    setSavedReports(validReports);
    localStorage.setItem("savedReports", JSON.stringify(validReports));
  }, []);

  // Función para guardar reporte
  const handleSaveReport = () => {
    const reportData = {
      generalInfo,
      pieceGrids,
      rows,
    };
    const newReport = {
      id: editingReport ? editingReport.id : Date.now(),
      data: reportData,
      createdAt: editingReport ? editingReport.createdAt : Date.now(),
    };
    const updatedReports = editingReport
      ? savedReports.map((r) => (r.id === editingReport.id ? newReport : r))
      : [...savedReports, newReport];
    setSavedReports(updatedReports);
    localStorage.setItem("savedReports", JSON.stringify(updatedReports));
    // Limpiar formulario
    setGeneralInfo({
      fecha: "",
      colada: "",
      operador: "Adelis Vielma",
      material: "",
      params: "",
      observation: "",
    });
    setPieceGrids([
      {
        id: 0,
        cliente: "",
        codigo: "",
        descripcion: "",
        odp: "",
        serial: "",
        cantPiezas: "",
        cantMoldes: "",
        pesoBruto: "",
        pesoNeto: "",
        totalBruto: "",
        totalNeto: "",
      },
    ]);
    setRows([{ id: 0, material: "", kilos: "" }]);
    setEditingReport(null);
    setIsReadOnly(false);
    // Si estaba editando, volver a la lista
    if (editingReport) {
      navigate("/reportlist");
    }
  };

  // Función para exportar a Excel
  const handleExportExcel = () => {
    const reportData = {
      generalInfo,
      pieceGrids,
      rows,
    };
    const wsData = [
      ["Campo", "Valor"],
      ["Fecha", reportData.generalInfo.fecha],
      ["Colada", reportData.generalInfo.colada],
      ["Operador", reportData.generalInfo.operador],
      ["Material", reportData.generalInfo.material],
      [],
      ["Piezas"],
      [
        "Cliente",
        "Código",
        "Descripción",
        "ODP",
        "Serial",
        "Cant. Piezas",
        "Cant. Moldes",
        "Peso Bruto",
        "Peso Neto",
        "Total Bruto",
        "Total Neto",
      ],
      ...reportData.pieceGrids.map((grid) => [
        grid.cliente,
        grid.codigo,
        grid.descripcion,
        grid.odp,
        grid.serial,
        grid.cantPiezas,
        grid.cantMoldes,
        grid.pesoBruto,
        grid.pesoNeto,
        grid.totalBruto,
        grid.totalNeto,
      ]),
      [],
      ["Materia Prima"],
      ["Material", "Kilos"],
      ...reportData.rows.map((row) => [row.material, row.kilos]),
      [],
      ["Parametros de Vaciado", "Observaciones"],
      [reportData.generalInfo.params, reportData.generalInfo.observation]
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reporte");
    XLSX.writeFile(wb, "reporte.xlsx");
  };

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      { id: nextId.current++, material: "", kilos: "" },
    ]);
  };

  const deleteRow = (id) => {
    setRows((prev) =>
      prev.length === 1 ? prev : prev.filter((r) => r.id !== id),
    );
  };

  const updateRow = (id, field, value) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );
  };

  const handleRowKeyDown = (event, row) => {
    if (event.key !== "Enter") return;

    const isCompletedRow =
      row.material.trim().length > 0 && row.kilos.toString().trim().length > 0;

    if (!isCompletedRow) return;

    const isLastRow = rows[rows.length - 1].id === row.id;
    if (!isLastRow) return;

    addRow();
    window.requestAnimationFrame(() => {
      lastRowInputRef.current?.focus();
    });
  };

  const updateGeneralInfo = (field, value) => {
    setGeneralInfo((prev) => ({ ...prev, [field]: value }));
  };

  const updatePieceGrid = (gridId, field, value) => {
    setPieceGrids((prev) =>
      prev.map((grid) =>
        grid.id === gridId ? { ...grid, [field]: value } : grid,
      ),
    );
  };

  const addPieceGrid = () => {
    setPieceGrids((prev) => [
      ...prev,
      {
        id: nextId.current++,
        cliente: "",
        codigo: "",
        descripcion: "",
        odp: "",
        serial: "",
        cantPiezas: "",
        cantMoldes: "",
        pesoBruto: "",
        pesoNeto: "",
        totalBruto: "",
        totalNeto: "",
      },
    ]);
  };

  const deletePieceGrid = (gridId) => {
    setPieceGrids((prev) => prev.filter((grid) => grid.id !== gridId));
  };

  return (
    <div className="w-full flex flex-col gap-y-2">
      <div className="grid grid-cols-4 grid-rows-1 w-full gap-2 pb-6">
        <div className="p-3 flex flex-col bg-white rounded-md small-shadow border-l-4 border-sky-400">
          <div className="text-neutral-950/40 text-sm">Fecha</div>
          <input
            type="date"
            value={generalInfo.fecha}
            onChange={(e) => updateGeneralInfo("fecha", e.target.value)}
            className="font-semibold bg-transparent outline-none"
            readOnly={isReadOnly}
          />
        </div>

        <div className="p-3 flex flex-col bg-white rounded-md small-shadow border-l-4 border-sky-400">
          <div className="text-neutral-950/40 text-sm">Colada</div>
          <input
            type="text"
            value={generalInfo.colada}
            onChange={(e) => updateGeneralInfo("colada", e.target.value)}
            placeholder="Ej: 56B-026"
            className="font-semibold bg-transparent outline-none"
            readOnly={isReadOnly}
          />
        </div>

        <div className="p-3 flex flex-col bg-white rounded-md small-shadow border-l-4 border-sky-400">
          <div className="text-neutral-950/40 text-sm">Operador</div>
          <input
            type="text"
            value={generalInfo.operador}
            onChange={(e) => updateGeneralInfo("operador", e.target.value)}
            placeholder="Nombre del operador"
            className="font-semibold bg-transparent outline-none"
            readOnly={isReadOnly}
          />
        </div>

        <div className="p-3 flex flex-col bg-white rounded-md small-shadow border-l-4 border-sky-400">
          <div className="text-neutral-950/40 text-sm">Material</div>
          <input
            type="text"
            value={generalInfo.material}
            onChange={(e) => updateGeneralInfo("material", e.target.value)}
            placeholder="Tipo de material"
            className="font-semibold bg-transparent outline-none"
            readOnly={isReadOnly}
          />
        </div>
      </div>

      {pieceGrids.map((grid) => (
        <div key={grid.id}>
          <div
            className={`grid grid-cols-6 grid-rows-2 w-full gap-2 ${grid.id !== 0 ? "pt-4" : ""}`}
            id={grid.id === 0 ? "data-grid" : undefined}
          >
            <div className="p-3 flex flex-col bg-white rounded-md small-shadow border-l-4 border-sky-400 col-span-4">
              <div className="text-neutral-950/40 text-sm">Cliente</div>
              <input
                type="text"
                value={grid.cliente}
                onChange={(e) =>
                  updatePieceGrid(grid.id, "cliente", e.target.value)
                }
                placeholder="Nombre del cliente"
                className="font-semibold bg-transparent outline-none"
                readOnly={isReadOnly}
              />
            </div>

            <div className="p-3 flex flex-col bg-white rounded-md small-shadow border-l-4 border-sky-400 justify-center col-span-2">
              <div className="text-neutral-950/40 text-sm">Codigo</div>
              <input
                type="text"
                value={grid.codigo}
                onChange={(e) =>
                  updatePieceGrid(grid.id, "codigo", e.target.value)
                }
                placeholder="Código de la pieza"
                className="font-semibold bg-transparent outline-none"
                readOnly={isReadOnly}
              />
            </div>

            <div className="p-3 flex flex-col bg-white rounded-md small-shadow border-l-4 border-sky-400 col-span-4">
              <div className="text-neutral-950/40 text-sm">Descripcion</div>
              <input
                type="text"
                value={grid.descripcion}
                onChange={(e) =>
                  updatePieceGrid(grid.id, "descripcion", e.target.value)
                }
                placeholder="Descripción de la pieza"
                className="font-semibold bg-transparent outline-none"
                readOnly={isReadOnly}
              />
            </div>

            <div className="p-3 flex flex-col bg-white rounded-md small-shadow border-l-4 border-sky-400">
              <div className="text-neutral-950/40 text-sm">ODP</div>
              <input
                type="text"
                value={grid.odp}
                onChange={(e) =>
                  updatePieceGrid(grid.id, "odp", e.target.value)
                }
                placeholder="Número ODP"
                className="font-semibold bg-transparent outline-none"
                readOnly={isReadOnly}
              />
            </div>

            <div className="p-3 flex flex-col bg-white rounded-md small-shadow border-l-4 border-sky-400 justify-center">
              <div className="text-neutral-950/40 text-sm">Serial</div>
              <input
                type="text"
                value={grid.serial}
                onChange={(e) =>
                  updatePieceGrid(grid.id, "serial", e.target.value)
                }
                placeholder="Número de serie"
                className="font-semibold bg-transparent outline-none"
                readOnly={isReadOnly}
              />
            </div>

            <div className="p-3 flex flex-col bg-white rounded-md small-shadow border-l-4 border-yellow-400 justify-center">
              <div className="text-neutral-950/40 text-sm">Cant. Piezas</div>
              <input
                type="number"
                min="0"
                value={grid.cantPiezas}
                onChange={(e) =>
                  updatePieceGrid(grid.id, "cantPiezas", e.target.value)
                }
                placeholder="0"
                className="font-semibold bg-transparent outline-none text-left"
                readOnly={isReadOnly}
              />
            </div>

            <div className="p-3 flex flex-col bg-white rounded-md small-shadow border-l-4 border-yellow-400 justify-center">
              <div className="text-neutral-950/40 text-sm">Cant. Moldes</div>
              <input
                type="number"
                min="0"
                value={grid.cantMoldes}
                onChange={(e) =>
                  updatePieceGrid(grid.id, "cantMoldes", e.target.value)
                }
                placeholder="0"
                className="font-semibold bg-transparent outline-none text-left"
                readOnly={isReadOnly}
              />
            </div>

            <div className="p-3 flex flex-col bg-white rounded-md small-shadow border-l-4 border-yellow-400 justify-center">
              <div className="text-neutral-950/40 text-sm">Peso Bruto</div>
              <input
                type="number"
                min="0"
                step="any"
                value={grid.pesoBruto}
                onChange={(e) =>
                  updatePieceGrid(grid.id, "pesoBruto", e.target.value)
                }
                placeholder="0.00"
                className="font-semibold bg-transparent outline-none text-left"
                readOnly={isReadOnly}
              />
            </div>

            <div className="p-3 flex flex-col bg-white rounded-md small-shadow border-l-4 border-yellow-400 justify-center">
              <div className="text-neutral-950/40 text-sm">Peso Neto</div>
              <input
                type="number"
                min="0"
                step="any"
                value={grid.pesoNeto}
                onChange={(e) =>
                  updatePieceGrid(grid.id, "pesoNeto", e.target.value)
                }
                placeholder="0.00"
                className="font-semibold bg-transparent outline-none text-left"
                readOnly={isReadOnly}
              />
            </div>

            <div className="p-3 flex flex-col bg-white rounded-md small-shadow border-l-4 border-yellow-400 justify-center">
              <div className="text-neutral-950/40 text-sm">Total Bruto</div>
              <input
                type="number"
                min="0"
                step="any"
                value={grid.totalBruto}
                onChange={(e) =>
                  updatePieceGrid(grid.id, "totalBruto", e.target.value)
                }
                placeholder="0.00"
                className="font-semibold bg-transparent outline-none text-left"
                readOnly={isReadOnly}
              />
            </div>

            <div className="p-3 flex flex-col bg-white rounded-md small-shadow border-l-4 border-yellow-400 justify-center">
              <div className="text-neutral-950/40 text-sm">Total Neto</div>
              <input
                type="number"
                min="0"
                step="any"
                value={grid.totalNeto}
                onChange={(e) =>
                  updatePieceGrid(grid.id, "totalNeto", e.target.value)
                }
                placeholder="0.00"
                className="font-semibold bg-transparent outline-none text-left"
                readOnly={isReadOnly}
              />
            </div>
          </div>
          {grid.id !== 0 && (
            <div className="flex justify-end mt-2">
              <button
                type="button"
                onClick={() => deletePieceGrid(grid.id)}
                className="inline-flex items-center justify-center rounded-full bg-red-500/10 p-2 text-red-600 hover:bg-red-500/20 cursor-pointer"
                title="Eliminar este grid"
              >
                <Icon.X size="18" />
              </button>
            </div>
          )}
        </div>
      ))}

      <div className="flex items-center justify-between w-full py-3">
        <div className="w-4/10 h-px bg-neutral-950/10"></div>
        <button
          type="button"
          onClick={addPieceGrid}
          className="size-8 bg-sky-500 text-white flex items-center justify-center rounded-full cursor-pointer"
          id="add-row-piece"
        >
          <Icon.Plus />
        </button>
        <div className="w-4/10 h-px bg-neutral-950/10"></div>
      </div>

      <div className="w-full bg-white rounded-md small-shadow p-4">
        <div className="flex items-center gap-x-1 pb-3">
          <div className="text-sky-400">
            <Icon.RawMaterial />
          </div>
          <h1 className="text-2xl tracking-tight font-medium">Materia Prima</h1>
        </div>

        <div className="border-neutral-200 rounded-lg border overflow-clip">
          <table className="w-full">
            <thead className="bg-neutral-200/40 border-b border-neutral-950/15">
              <tr>
                <th className="tracking-tight font-medium text-neutral-950/70 py-2 px-4 text-left">
                  Material
                </th>
                <th className="tracking-tight font-medium text-neutral-950/70 py-2 px-4 text-left">
                  Kilos
                </th>
                <th className="tracking-tight font-medium text-neutral-950/70 py-2 px-4">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="">
              {rows.map((row, idx) => (
                <tr
                  key={row.id}
                  className="tracking-tight border-neutral-200 border-t font-medium even:bg-neutral-200/40 odd:bg-white"
                >
                  <td className="py-2 px-4">
                    <input
                      ref={idx === rows.length - 1 ? lastRowInputRef : null}
                      value={row.material}
                      onChange={(e) =>
                        updateRow(row.id, "material", e.target.value)
                      }
                      onKeyDown={(e) => handleRowKeyDown(e, row)}
                      placeholder="Material"
                      className="w-full bg-transparent outline-none"
                      readOnly={isReadOnly}
                    />
                  </td>
                  <td className="text-left py-2 px-4 w-36">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={row.kilos}
                      onChange={(e) =>
                        updateRow(row.id, "kilos", e.target.value)
                      }
                      onKeyDown={(e) => handleRowKeyDown(e, row)}
                      placeholder="Kilos"
                      className="w-full bg-transparent text-left outline-none"
                      readOnly={isReadOnly}
                    />
                  </td>
                  <td className="text-center py-2 px-4 flex items-center gap-x-2 justify-center">
                    <button
                      type="button"
                      onClick={() => deleteRow(row.id)}
                      className="inline-flex items-center justify-center rounded-full bg-red-500/10 p-1 text-red-600 hover:bg-red-500/20 cursor-pointer"
                      title="Eliminar fila"
                    >
                      <Icon.X size="18" />
                    </button>

                    <button
                      type="button"
                      onClick={addRow}
                      className="inline-flex items-center justify-center rounded-full bg-sky-500/10 p-1 text-sky-600 hover:bg-sky-500/20 cursor-pointer"
                      title="Eliminar fila"
                    >
                      <Icon.Plus size="18" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-2 w-full gap-3">
        <div className="p-4 w-full bg-white small-shadow rounded-md">
          <div className="pb-2">
            <label
              for="observation-text"
              className="text-2xl font-medium tracking-tight"
            >
              Observaciones
            </label>
          </div>

          <textarea
            type="text"
            name="observation"
            id="observation-text"
            placeholder="Ingresar observaciones..."
            value={generalInfo.observation}
            onChange={(e) => updateGeneralInfo("observation", e.target.value)}
            className="focus:outline-0 w-full h-fit min-h-32 field-sizing-content text-neutral-950/50"
          ></textarea>
        </div>

        <div className="p-4 w-full bg-white small-shadow rounded-md">
          <div className="pb-2">
            <label
              for="params-text"
              className="text-2xl font-medium tracking-tight"
            >
              Parametros de Vaciado
            </label>
          </div>

          <textarea
            type="text"
            name="params"
            id="params-text"
            placeholder="Ingresar parametros..."
            value={generalInfo.params}
            onChange={(e) => updateGeneralInfo("params", e.target.value)}
            className="focus:outline-0 w-full h-fit min-h-32 field-sizing-content text-neutral-950/60"
          ></textarea>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex gap-4 mt-4">
        <button
          onClick={handleSaveReport}
          className="bg-sky-500 text-white px-4 py-2 rounded hover:bg-sky-600 cursor-pointer"
        >
          {editingReport ? "Actualizar Reporte" : "Guardar Reporte"}
        </button>
        <button
          onClick={handleExportExcel}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 cursor-pointer"
        >
          Exportar a Excel
        </button>
      </div>
    </div>
  );
};
