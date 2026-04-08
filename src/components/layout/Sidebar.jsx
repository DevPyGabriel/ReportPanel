import * as Icon from '../Icons'

export const Sidebar = ({ onLogout }) => {
  return (
    <aside className="h-screen bg-white w-80 p-6 small-shadow flex flex-col justify-between">
      <div className="w-full flex flex-col gap-y-2">
        <div className='w-full flex justify-center items-center text-4xl tracking-tight font-semibold pb-4'>
          DHA Fundiciones
        </div>
        <a href='/' className='w-full flex items-center p-3 gap-x-1 bg-sky-100/70 rounded-md text-sky-600 hover:bg-sky-200/70 hover:text-sky-700 transition-all duration-200'>
          <Icon.CreateReport />
          <div className=''>Crear nuevo Reporte</div>
        </a>
        <a href='/reportList' className='w-full flex items-center p-3 gap-x-1 bg-yellow-100/70 rounded-md text-yellow-600 hover:bg-yellow-200/70 hover:text-yellow-700 transition-all duration-200'>
          <Icon.ReportList />
          <div className=''>Lista de Reportes</div>
        </a>
        <a href='#' className='w-full flex items-center p-3 gap-x-1 bg-green-100/70 rounded-md text-green-600 hover:bg-green-200/70 hover:text-green-700 transition-all duration-200 hidden'>
          <Icon.ReportAnalisis />
          <div className=''>Analisis de Reporte</div>
        </a>
      </div>
      <div className="w-full flex flex-col gap-y-2">
        <button
          onClick={onLogout}
          className='w-full flex items-center p-3 gap-x-1 bg-red-100/70 rounded-md text-red-600 hover:bg-red-200/70 hover:text-red-700 transition-all duration-200'
        >
          <Icon.Logout />
          <div className=''>Cerrar Sesión</div>
        </button>
      </div>
    </aside>
  );
};
