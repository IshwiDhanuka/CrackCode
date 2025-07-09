import Header from "./header";
import Footer from "./footer";
import Sidebar from "./sidebar";
import { useState } from "react";

const Layout = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex bg-black text-white min-h-screen">
      {/* Sidebar */}
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* Main Content */}
      <div
        className={`transition-all duration-300 flex flex-col flex-1`}
        style={{ marginLeft: isCollapsed ? '4rem' : '16rem' }} // dynamic margin-left
      >
        <Header />
        <main className="flex-1 p-6 overflow-x-hidden">{children}</main>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
