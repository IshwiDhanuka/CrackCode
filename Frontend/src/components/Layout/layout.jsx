import Header from "./header";
import Footer from "./footer";
import Sidebar from "./sidebar";
import { useState } from "react";

const Layout = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(true); // Collapsed by default

  const sidebarWidth = isCollapsed ? "4rem" : "16rem"; // 64px or 256px

  return (
    <div className="bg-black text-white min-h-screen font-sans overflow-x-hidden">
      {/* Sidebar (fixed) */}
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* Main Content */}
      <div
        className="flex flex-col transition-all duration-300"
        style={{
          marginLeft: sidebarWidth,
        }}
      >
        <Header isSidebarCollapsed={isCollapsed} toggleSidebar={() => setIsCollapsed(v => !v)} />
        <main className="flex-1 p-4 overflow-x-auto">
          <div className="w-full">{children}</div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
