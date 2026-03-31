# Contexto del Proyecto
Actúa como un Desarrollador Senior de Frontend. Necesito refactorizar el componente `CreateReportPage.jsx` para implementar una gestión de reportes locales con persistencia de 72 horas.

# Requerimientos Técnicos

## Característica 1: Exportar a Excel (Plantilla)
1.  **Lógica:** Usa la librería `xlsx`. Crea una función `handleExportExcel` que tome los datos actuales de los inputs del formulario.
2.  **Formato:** Los datos deben mapearse a una estructura de "plantilla" (Cabeceras claras en la primera fila).
3.  **UI:** Añade un botón "Exportar Reporte Actual".

## Característica 2: Lista de Reportes con Persistencia (72 Horas)
1.  **Almacenamiento Local:** * Utiliza `localStorage` para que los datos no se borren al cerrar el navegador o refrescar la página.
    * Al guardar un reporte, añade automáticamente una propiedad `createdAt` con el timestamp actual (`Date.now()`).
2.  **Lógica de Expiración (72h):**
    * Implementa un `useEffect` que, al cargar el componente, filtre la lista de reportes. 
    * **Regla:** Eliminar cualquier reporte cuya antigüedad sea mayor a 72 horas (259,200,000 milisegundos).
3.  **CRUD Temporal:**
    * **Guardar:** Al hacer submit, guarda el reporte en el array de `localStorage` y limpia los inputs.
    * **Botón Eliminar:** Borra el registro específico del storage.
    * **Botón Visualizar:** Carga los datos en el formulario en modo `readOnly`.
    * **Botón Editar:** Carga los datos en el formulario, permite cambios y, al guardar, actualiza el registro existente en el storage (manteniendo o renovando su timestamp según prefieras, por defecto mantenlo para respetar las 72h originales).

# Entregables
1. Código actualizado de `CreateReportPage.jsx`.
2. Lógica clara de persistencia y limpieza automática basada en el tiempo.
3. Uso de Tailwind CSS para la interfaz de la tabla de reportes.

# Código Fuente Actual
[PEGA AQUÍ TU CÓDIGO]