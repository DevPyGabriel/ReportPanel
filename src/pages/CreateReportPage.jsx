import React, { useRef, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx-js-style";
import * as Icon from "../components/Icons";

/**
 * Página principal para crear y editar reportes de vaciado.
 * Incluye formularios para información general, piezas y materia prima.
 * Permite guardar reportes localmente y exportar a Excel.
 */
export const CreateReportPage = () => {
  // Referencia para generar IDs únicos para filas
  const nextId = useRef(1);
  // Estado para filas de materia prima
  const [rows, setRows] = useState([
    { id: 0, material: "", codigo: "", kilos: "" },
  ]);
  // Referencia al último input para foco automático
  const lastRowInputRef = useRef(null);
  // Hooks de React Router para navegación y estado
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

  // Estado para indicadores
  const [indicators, setIndicators] = useState({
    kgsArenaMolde: "",
    kgsArenaTotal: "",
    escoria: "",
    fundido: "",
    bruto: "",
    neto: "",
    retorno: "",
  });
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
      totalArenaCliente: "",
    },
  ]);

  // Estados para persistencia y gestión de reportes
  const [savedReports, setSavedReports] = useState([]);
  const [editingReport, setEditingReport] = useState(null);
  const [isReadOnly, setIsReadOnly] = useState(false);

  // Cargar reporte para edición si viene desde ReportListPage o limpiar si es nuevo
  useEffect(() => {
    if (location.state?.editingReport) {
      const report = location.state.editingReport;
      setGeneralInfo(report.data.generalInfo);
      setIndicators(
        report.data.indicators || {
          kgsArenaMolde: "",
          kgsArenaTotal: "",
          escoria: "",
          fundido: "",
          bruto: "",
          neto: "",
          retorno: "",
        },
      );
      setPieceGrids(report.data.pieceGrids);
      setRows(report.data.rows);
      setEditingReport(report);
      setIsReadOnly(false);
    } else {
      // Limpiar formulario si se accede sin estado (Crear nuevo reporte)
      setGeneralInfo({
        fecha: new Date().toISOString().split("T")[0],
        colada: "",
        operador: "Adelis Vielma",
        material: "",
        params: "",
        observation: "",
      });
      setIndicators({
        kgsArenaMolde: "",
        kgsArenaTotal: "",
        escoria: "",
        fundido: "",
        bruto: "",
        neto: "",
        retorno: "",
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
          totalArenaCliente: "",
        },
      ]);
      setRows([{ id: 0, material: "", codigo: "", kilos: "" }]);
      setEditingReport(null);
      setIsReadOnly(false);
    }
  }, [location.state]);

  // Calcular valores derivados
  useEffect(() => {
    const kgsArenaTotal = pieceGrids.reduce((sum, grid) => {
      const kgsArenaMolde = parseFloat(grid.kgsArenaMolde || 0);
      const cantMoldes = parseFloat(grid.cantMoldes || 0);
      return sum + kgsArenaMolde * cantMoldes;
    }, 0);

    const fundido = rows.reduce(
      (sum, row) => sum + parseFloat(row.kilos || 0),
      0,
    );

    const bruto = pieceGrids.reduce(
      (sum, grid) => sum + parseFloat(grid.totalBruto || 0),
      0,
    );

    const neto = pieceGrids.reduce(
      (sum, grid) => sum + parseFloat(grid.totalNeto || 0),
      0,
    );

    const escoria = 0.07 * fundido;

    const retorno = fundido - escoria - neto;

    setIndicators((prev) => ({
      ...prev,
      kgsArenaTotal: kgsArenaTotal.toFixed(2),
      fundido: fundido.toFixed(2),
      bruto: bruto.toFixed(2),
      neto: neto.toFixed(2),
      escoria: escoria.toFixed(2),
      retorno: retorno.toFixed(2),
    }));
  }, [pieceGrids, rows]);

  // Calcular totales por cliente
  useEffect(() => {
    setPieceGrids((prev) =>
      prev.map((grid) => {
        const cantPiezas = parseFloat(grid.cantPiezas || 0);
        const pesoBruto = parseFloat(grid.pesoBruto || 0);
        const pesoNeto = parseFloat(grid.pesoNeto || 0);
        const cantMoldes = parseFloat(grid.cantMoldes || 0);
        const kgsArenaMolde = parseFloat(grid.kgsArenaMolde || 0);
        return {
          ...grid,
          totalBruto: (pesoBruto * cantPiezas).toFixed(2),
          totalNeto: (pesoNeto * cantPiezas).toFixed(2),
          totalArenaCliente: (kgsArenaMolde * cantMoldes).toFixed(2),
        };
      }),
    );
  }, [
    pieceGrids
      .map(
        (g) =>
          `${g.cantPiezas}-${g.pesoBruto}-${g.pesoNeto}-${g.cantMoldes}-${g.kgsArenaMolde}`,
      )
      .join("|"),
  ]);

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
  /**
   * Guarda el reporte actual en localStorage.
   * Si es edición, actualiza el reporte existente; sino, crea uno nuevo.
   * Limpia el formulario después de guardar y navega si era edición.
   */
  const handleSaveReport = () => {
    const reportData = {
      generalInfo,
      indicators,
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
    setIndicators({
      kgsArenaMolde: "",
      kgsArenaTotal: "",
      escoria: "",
      fundido: "",
      bruto: "",
      neto: "",
      retorno: "",
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
        kgsArenaMolde: "",
        kgsArenaMolde: "",
        totalArenaCliente: "",
      },
    ]);
    setRows([{ id: 0, material: "", codigo: "", kilos: "" }]);
    setEditingReport(null);
    setIsReadOnly(false);
    // Si estaba editando, volver a la lista
    if (editingReport) {
      navigate("/reportlist");
    }
  };

  // Función para exportar a Excel
  /**
   * Exporta el reporte actual a un archivo Excel (.xlsx).
   * Genera una hoja con formato tabular, incluyendo headers, datos y estilos.
   * Usa la librería XLSX para crear y descargar el archivo.
   */
  const handleExportExcel = () => {
    const reportData = {
      generalInfo,
      indicators,
      pieceGrids,
      rows,
    };
    const wsData = [
      [

        "Fecha",
        reportData.generalInfo.fecha,
        "Operador",
        reportData.generalInfo.operador,
      ],
      [
        "Colada",
        reportData.generalInfo.colada,
        "Material",
        reportData.generalInfo.material,
      ],

      ...reportData.pieceGrids.flatMap((grid) => [
        [],
        [
          "Cliente",
          "Código",
          "Descripción",
          "ODP",
          "Serial",
          "Cant. Piezas",
        ],
        [
          grid.cliente,
          grid.codigo,
          grid.descripcion,
          grid.odp,
          grid.serial,
          grid.cantPiezas,
        ],
        [
          "Cant. Moldes",
          "Kgs arena molde",
          "Peso Bruto",
          "Peso Neto",
          "Total Bruto",
          "Total Neto",
        ],
        [
          grid.cantMoldes,
          grid.kgsArenaMolde,
          grid.pesoBruto,
          grid.pesoNeto,
          grid.totalBruto,
          grid.totalNeto,
        ],
      ]),
      [],
      [
        "Parametros de Vaciado",
        null,
        "Observaciones",
      ],
      [
        reportData.generalInfo.params,
        null,
        reportData.generalInfo.observation,
      ],
      [],
      [        
        "Kgs arena molde",
        "Kgs arena total",
        "Escoria",
      ],
      [
        reportData.indicators.kgsArenaMolde,
        reportData.indicators.kgsArenaTotal,
        reportData.indicators.escoria,
      ],
      [        
        "Fundido",
        "Bruto",
        "Neto",
        "Retorno",
      ],
      [
        reportData.indicators.fundido,
        reportData.indicators.bruto,
        reportData.indicators.neto,
        reportData.indicators.retorno,
      ],
      [],
      ["Materia Prima"],
      ["Material", "Código", "Kilos"],
      ...reportData.rows.map((row) => [row.material, row.codigo, row.kilos]),
      [],
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    const paramDataRowIndex = 5 + reportData.pieceGrids.length;

    // Calcular auto-fit para las columnas
    const colWidths = Array(13).fill(0);
    wsData.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell == null) return;
        const cellValue = cell.toString();
        // Ignorar el texto largo para que no afecte el cálculo
        if (
          rowIndex === paramDataRowIndex &&
          (colIndex === 0 || colIndex === 2)
        )
          return;
        colWidths[colIndex] = Math.max(
          colWidths[colIndex] || 0,
          cellValue.length,
        );
      });
    });

    ws["!cols"] = colWidths.map((w, colIndex) => {
      if (colIndex === 0) return { wch: 30 }; // A fijo
      if (colIndex === 1) return { wch: Math.max(15, (w || 10) + 2) }; // B min 15
      if (colIndex === 2) return { wch: 30 }; // C fijo
      return { wch: (w || 10) + 2 }; // Resto auto-fit
    });

    ws["!rows"] = [];

    const titles = [
      "Fecha",
      "Operador",
      "Colada",
      "Material",
      "Piezas",
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
      "Total Arena Cliente",
      "Materia Prima",
      "Kilos",
      "Parametros de Vaciado",
      "Observaciones",
      "Kgs arena molde",
      "Kgs arena total",
      "Escoria",
      "Fundido",
      "Bruto",
      "Neto",
      "Retorno",
    ];

    for (const key in ws) {
      if (key.startsWith("!")) continue;

      if (ws[key]) {
        const cellAddress = XLSX.utils.decode_cell(key);
        const isParamDataRow = cellAddress.r === paramDataRowIndex;

        const isTitle = titles.includes(ws[key].v);
        if (isTitle) {
          ws[key].v = ws[key].v.toUpperCase();
        }
        ws[key].s = {
          font: {
            color: { rgb: "000000" },
            bold: isTitle,
          },
          border: {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } },
          },
        };

        if (isParamDataRow) {
          ws[key].s.alignment = {
            wrapText: true,
            vertical: "top",
            horizontal: "left",
          };
        }
      }
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reporte");
    XLSX.writeFile(wb, "reporte.xlsx");
  };

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      { id: nextId.current++, material: "", codigo: "", kilos: "" },
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

  const updateIndicators = (field, value) => {
    setIndicators((prev) => ({ ...prev, [field]: value }));
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
        kgsArenaMolde: "",
        totalArenaCliente: "",
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
            <div className="p-3 flex flex-col bg-white rounded-md small-shadow border-l-4 border-sky-400 col-span-3">
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

            <div className="p-3 flex flex-col bg-white rounded-md small-shadow border-l-4 border-sky-400 justify-center">
              <div className="text-neutral-950/40 text-sm">Codigo</div>
              <input
                type="text"
                value={grid.codigo}
                onChange={(e) =>
                  updatePieceGrid(grid.id, "codigo", e.target.value)
                }
                placeholder="Código pieza"
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

            <div className="p-3 flex flex-col bg-white rounded-md small-shadow border-l-4 border-yellow-400">
              <div className="text-neutral-950/40 text-sm">Kgs arena molde</div>
              <input
                id="kgs-molde"
                type="number"
                min="0"
                step="any"
                value={grid.kgsArenaMolde}
                onChange={(e) =>
                  updatePieceGrid(grid.id, "kgsArenaMolde", e.target.value)
                }
                placeholder="0.00"
                className="font-semibold bg-transparent outline-none text-left"
                readOnly={isReadOnly}
              />
            </div>

            <div className="p-3 flex flex-col bg-white rounded-md small-shadow border-l-4 border-yellow-400">
              <div className="text-neutral-950/40 text-sm" id="kgs-arena-total-cliente">
                Kgs arena total
              </div>
              <input
                type="number"
                min="0"
                step="any"
                value={grid.totalArenaCliente}
                onChange={(e) =>
                  updatePieceGrid(grid.id, "totalArenaCliente", e.target.value)
                }
                placeholder="0.00"
                className="font-semibold bg-transparent outline-none text-left"
                readOnly={true}
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
              <div
                className="text-neutral-950/40 text-sm"
                id="total-bruto-cliente"
              >
                Total Bruto
              </div>
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
                readOnly={true}
              />
            </div>

            <div className="p-3 flex flex-col bg-white rounded-md small-shadow border-l-4 border-yellow-400 justify-center">
              <div
                className="text-neutral-950/40 text-sm"
                id="total-neto-cliente"
              >
                Total Neto
              </div>
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
                readOnly={true}
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
                  Código
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
                  <td className="py-2 px-4">
                    <input
                      value={row.codigo}
                      onChange={(e) =>
                        updateRow(row.id, "codigo", e.target.value)
                      }
                      onKeyDown={(e) => handleRowKeyDown(e, row)}
                      placeholder="Código"
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

      <div className="grid grid-cols-3 grid-rows-2 w-full gap-2 py-4">
        <div className="p-3 flex flex-col bg-white rounded-md small-shadow border-l-4 border-yellow-400">
          <div className="text-neutral-950/40 text-sm" id="kgs-arena-total">
            Kgs arena total
          </div>
          <input
            type="number"
            min="0"
            step="any"
            value={indicators.kgsArenaTotal}
            onChange={(e) => updateIndicators("kgsArenaTotal", e.target.value)}
            placeholder="0.00"
            className="font-semibold bg-transparent outline-none text-left"
            readOnly={true}
          />
        </div>

        <div
          className="p-3 flex flex-col bg-white rounded-md small-shadow border-l-4 border-yellow-400"
          id="escoria-container"
        >
          <div className="text-neutral-950/40 text-sm">Escoria</div>
          <input
            type="number"
            min="0"
            step="any"
            value={indicators.escoria}
            onChange={(e) => updateIndicators("escoria", e.target.value)}
            placeholder="0.00"
            className="font-semibold bg-transparent outline-none text-left"
            readOnly={true}
          />
        </div>

        <div
          className="p-3 flex flex-col bg-white rounded-md small-shadow border-l-4 border-yellow-400"
          id="fundido-container"
        >
          <div className="text-neutral-950/40 text-sm">Fundido</div>
          <input
            type="number"
            min="0"
            step="any"
            value={indicators.fundido}
            onChange={(e) => updateIndicators("fundido", e.target.value)}
            placeholder="0.00"
            className="font-semibold bg-transparent outline-none text-left"
            readOnly={true}
          />
        </div>

        <div className="p-3 flex flex-col bg-white rounded-md small-shadow border-l-4 border-yellow-400">
          <div className="text-neutral-950/40 text-sm" id="bruto-container">
            Bruto
          </div>
          <input
            type="number"
            min="0"
            step="any"
            value={indicators.bruto}
            onChange={(e) => updateIndicators("bruto", e.target.value)}
            placeholder="0.00"
            className="font-semibold bg-transparent outline-none text-left"
            readOnly={true}
          />
        </div>

        <div className="p-3 flex flex-col bg-white rounded-md small-shadow border-l-4 border-yellow-400">
          <div className="text-neutral-950/40 text-sm" id="neto-container">
            Neto
          </div>
          <input
            type="number"
            min="0"
            step="any"
            value={indicators.neto}
            onChange={(e) => updateIndicators("neto", e.target.value)}
            placeholder="0.00"
            className="font-semibold bg-transparent outline-none text-left"
            readOnly={true}
          />
        </div>

        <div className="p-3 flex flex-col bg-white rounded-md small-shadow border-l-4 border-yellow-400">
          <div className="text-neutral-950/40 text-sm" id="retorno-container">
            Retorno
          </div>
          <input
            type="number"
            min="0"
            step="any"
            value={indicators.retorno}
            onChange={(e) => updateIndicators("retorno", e.target.value)}
            placeholder="0,00"
            className="font-semibold bg-transparent outline-none text-left text-neutral-950 placeholder:text-neutral-950"
            readOnly={true}
          />
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
          onClick={() => {
            handleSaveReport();
            handleExportExcel();
          }}
          className="bg-sky-500 text-white px-2 pr-3 flex items-center gap-x-1 py-2 rounded hover:bg-sky-600 cursor-pointer"
        >
          <Icon.Save className="w-4 h-4" />
          {editingReport ? "Actualizar Reporte" : "Guardar Reporte"}
        </button>
        <button
          onClick={handleExportExcel}
          className="bg-green-600 text-white px-2 pr-3 py-2 rounded hover:bg-green-700 cursor-pointer flex items-center gap-x-1"
        >
          <Icon.Export className="w-4 h-4" />
          Exportar a Excel
        </button>
      </div>
    </div>
  );
};
