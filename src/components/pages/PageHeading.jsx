import * as Icons from '../Icons'

export const PageHeading = ({ title = "Panel de Reportes" }) => {

  return (
    <div className="text-4xl font-semibold tracking-tight flex items-center gap-x-2 pb-6">
      <div className='text-sky-500'><Icons.ReportPanel size='32'/></div>
      <div>{title}</div>
    </div>
  );
};

export default PageHeading