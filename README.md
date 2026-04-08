# Panel de Reportes de Vaciado

Este es un sistema de gestión de reportes de vaciado desarrollado en React con Vite. Permite a los operadores autorizados crear, guardar y gestionar reportes de procesos de vaciado, incluyendo información general, detalles de piezas y materia prima utilizada. El sistema incluye medidas de seguridad para proteger el acceso a los datos.

## Características Principales

- **Autenticación Segura**: Login requerido en cada sesión con contraseña hasheada (SHA-256) configurada inicialmente por el usuario.
- **Creación de Reportes**: Formulario intuitivo para ingresar datos de reportes, con campos para fecha, operador, material, piezas y materia prima.
- **Gestión de Reportes**: Lista de reportes guardados con opciones de edición y eliminación.
- **Exportación a Excel**: Generación automática de archivos Excel con formato profesional.
- **Interfaz Responsiva**: Diseño moderno con Tailwind CSS para una experiencia de usuario fluida.
- **Persistencia Local**: Almacenamiento de reportes en localStorage del navegador.

## Requisitos del Sistema

- Node.js (versión 16 o superior)
- Navegador web moderno con soporte para Web Crypto API (Chrome, Firefox, Edge, etc.)
- Sistema operativo: Windows, macOS o Linux

## Instalación

1. Clona o descarga el repositorio.
2. Navega al directorio del proyecto:
   \`\`\`
   cd ReportPanel
   \`\`\`
3. Instala las dependencias:
   \`\`\`
   npm install
   \`\`\`
4. Inicia el servidor de desarrollo:
   \`\`\`
   npm run dev
   \`\`\`
5. Abre tu navegador y ve a `http://localhost:5173` (o el puerto indicado).

## Uso del Sistema

### Primera Configuración
Al abrir la aplicación por primera vez:
1. Se mostrará un formulario para configurar la contraseña inicial.
2. Ingresa una contraseña segura (mínimo 6 caracteres) y confírmala.
3. Haz clic en "Configurar" para guardar la contraseña hasheada.

### Inicio de Sesión
Cada vez que accedas al sistema:
1. Ingresa la contraseña configurada.
2. Si es correcta, accederás al panel principal.

### Creación de Reportes
1. Desde la página principal ("Crear Reporte de Vaciado"):
   - Completa la información general: Fecha (se autocompleta con la fecha actual), Colada, Operador, Material.
   - Agrega piezas: Cliente, Código, Descripción, ODP, Serial, Cantidad de Piezas/Moldes, Pesos Bruto/Neto, Totales.
   - Agrega materia prima: Material y Kilos (presiona Enter para agregar filas automáticamente).
   - Ingresa observaciones y parámetros de vaciado.
2. Guarda el reporte con "Guardar Reporte" (se almacena localmente).
3. Opcional: Exporta a Excel con "Exportar a Excel".

### Gestión de Reportes
1. Ve a "Lista de Reportes".
2. Verás una lista de reportes guardados con fecha de creación.
3. Opciones:
   - **Editar**: Modifica un reporte existente.
   - **Eliminar**: Borra un reporte (con confirmación).
4. Los reportes se guardan automáticamente en localStorage y expiran después de 72 horas.

### Análisis de Reportes
- Página en desarrollo para futuras funcionalidades de análisis.

## Estructura del Código

### Archivos Principales
- `src/routes/MainRoutes.jsx`: Maneja el enrutamiento y la autenticación global.
- `src/pages/Login.jsx`: Componente de login con configuración inicial y verificación de contraseña.
- `src/pages/CreateReportPage.jsx`: Página para crear y editar reportes.
- `src/pages/ReportListPage.jsx`: Lista de reportes guardados.
- `src/layout/MainLayout.jsx`: Layout principal con sidebar y navegación.
- `src/components/`: Componentes reutilizables (Icons, Sidebar, etc.).

### Tecnologías Utilizadas
- **React**: Framework para la interfaz de usuario.
- **React Router**: Navegación entre páginas.
- **Vite**: Herramienta de desarrollo y build.
- **Tailwind CSS**: Estilos CSS utilitarios.
- **XLSX**: Librería para exportación a Excel.
- **Web Crypto API**: Para hashing de contraseñas.

## Seguridad
- **Autenticación**: Contraseña requerida al iniciar la aplicación, persistiendo durante la sesión del navegador.
- **Hashing**: Contraseñas hasheadas con SHA-256, no almacenadas en texto plano.
- **Validaciones**: Longitud mínima de contraseña, confirmación.
- **Nota**: Este sistema es para uso local; no incluye backend para mayor seguridad en entornos remotos.

## Desarrollo
Para contribuir o modificar:
1. Instala dependencias: `npm install`
2. Ejecuta en modo desarrollo: `npm run dev`
3. Construye para producción: `npm run build`
4. Linting: `npm run lint`

## Solución de Problemas
- **Error de login**: Asegúrate de que la contraseña sea correcta y que localStorage no esté corrupto.
- **Reportes no se guardan**: Verifica que el navegador permita localStorage.
- **Exportación falla**: Asegúrate de tener permisos para descargar archivos.

## Licencia
Este proyecto es de uso interno. Consulta con el desarrollador para permisos de distribución.

---

## Manual de Usuario Detallado

### Introducción
El Panel de Reportes de Vaciado es una herramienta diseñada para operadores de procesos de vaciado. Permite registrar de manera eficiente los detalles de cada operación, asegurando trazabilidad y facilidad de consulta.

### Navegación
- **Sidebar**: Accede a "Crear Reporte", "Lista de Reportes" y "Análisis" (en desarrollo).
- **Encabezados**: Cada página tiene un título descriptivo.

### Campos del Reporte
- **Información General**:
  - Fecha: Automática, editable.
  - Colada: Código de la colada (ej: 56B-026).
  - Operador: Nombre (prellenado con "Adelis Vielma").
  - Material: Tipo de material utilizado.
- **Piezas**:
  - Cliente, Código, Descripción, ODP, Serial.
  - Cantidades y pesos: Campos numéricos con validación.
  - Múltiples piezas: Agrega grids dinámicamente.
- **Materia Prima**:
  - Tabla editable: Agrega filas con Enter.
  - Material y kilos.
- **Observaciones y Parámetros**: Campos de texto libre.

### Exportación
- Genera un archivo Excel con formato tabular, incluyendo encabezados y bordes.
- Se descarga automáticamente al hacer clic en "Exportar a Excel".

### Gestión de Datos
- **Almacenamiento**: localStorage del navegador.
- **Expiración**: Reportes se eliminan automáticamente después de 72 horas.
- **Backup**: Recomendado exportar reportes importantes.

### Soporte
Para soporte técnico, contacta al equipo de desarrollo.