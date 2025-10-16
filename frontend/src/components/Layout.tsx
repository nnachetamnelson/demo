import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* --- Sidebar (Desktop) --- */}
      <div className="hidden md:flex md:w-64 md:flex-col fixed inset-y-0 left-0 z-40">
        <Sidebar isOpen={true} onClose={() => setSidebarOpen(false)} />
      </div>

      {/* --- Sidebar (Mobile Drawer) --- */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-40"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Drawer */}
          <div className="relative w-64 bg-white shadow-lg z-50">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* --- Main Content Area --- */}
      <div className="flex flex-col flex-1 w-full md:ml-64">
        {/* Topbar */}
        <div className="shrink-0">
          <Topbar onMenuClick={() => setSidebarOpen(true)} />
        </div>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent hover:scrollbar-thumb-gray-500">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
