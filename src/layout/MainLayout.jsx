import { Sidebar } from "../components/layout/Sidebar";

export const MainLayout = ( {children} ) => {
  return (
    // use flex so sidebar and content sit side by side; content takes remaining space
    <main className="h-screen bg-neutral-100 text-neutral-900 font-inter flex overflow-hidden">
      {/* fixed-width sidebar */}
      <Sidebar />

      {/* page content area; add padding so it doesn't touch the sidebar */}
      <div className="flex-1 h-screen overflow-y-auto p-6">
        {children}
      </div>
    </main>
  );
};

export default MainLayout