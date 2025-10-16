import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";


import {
  Home,
  Layers,
  BookOpen,
  LogOut,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../auth/AuthContext";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
 
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const { logout } = useAuth();
const navigate = useNavigate();

  const navItems = [
    { path: "/", label: "Dashboard", icon: <Home size={18} /> },
    {
      label: "Students",
      icon: <Layers size={18} />,
      children: [
        { path: "/studentList", label: "All Students" },
        { path: "/graduatedStudent", label: "Graduated Students" },
        { path: "/deactivated-students", label: "Deactivated Students" },
         { path: "/attendance", label: "Estimated Attendance" }, 
         { path: "/attendance", label: "Assign Club" },
        
      ],
    },
    { label: "Staff Management", 
      icon: <Layers size={18} />,
       children: [ 
        { path: "/staffList", label: "Staff Directory" }, 
        { path: "/deactivatedstaff", label: "Deactivated Staff" }, 
        { path: "/Classallocations", label: "Class Allocation" }, 
        { path: "/attendance", label: "Attendance" },
      ], 
    },
    {
      label: "Class Management",
      icon: <Layers size={18} />,
      children: [
        { path: "/classes", label: "Class List" },
        { path: "/classlevel", label: "Class Level" },
      ],
    },
    { label: "Students Evaluation", 
    icon: <Layers size={18} />, 
    children: [ 
      { path: "/enterResults", label: "Entries" }, 
      { path: "/viewresults", label: "view" }, 
      { path: "/subjects", label: "Publish Result" }, 
      { path: "/attendance", label: "Block Result" }, 
      { path: "/attendance", label: "Discipline" }, ], 
    },
    
    { path: "/enterResults", label: "Grades", icon: <BookOpen size={18} /> },
    { path: "/schoolProfile", label: "Settings", icon: <BookOpen size={18} /> },
  ];


  
       

  const handleToggleSubmenu = (label: string) => {
    setOpenSubmenu(openSubmenu === label ? null : label);
  };

  const SidebarContent = () => (
    <div
      className={`flex flex-col h-full ${
        collapsed ? "w-20" : "w-64"
      } bg-gradient-to-b from-gray-950/90 to-gray-900/80 
      backdrop-blur-md border-r border-gray-800 shadow-xl p-5 
      text-gray-200 transition-all duration-300 relative`}
    >
      {/* Logo + Collapse Button */}
      <div className="flex items-center justify-between mb-10">
        {!collapsed && (
          <h1 className="text-xl font-semibold tracking-wide text-white">
            <span className="text-indigo-500 font-bold">Edu</span>Verse
          </h1>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation — sleek scrollbar */}
      <nav className="flex flex-col overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent hover:scrollbar-thumb-gray-600">
        {navItems.map(({ path, label, icon, children }) => (
          <div key={label}>
            {children ? (
              <button
                onClick={() => handleToggleSubmenu(label)}
                className={`flex items-center justify-between w-full px-3 py-3 text-sm font-medium rounded-xl transition-all duration-300 ${
                  openSubmenu === label
                    ? "bg-indigo-600/20 text-indigo-400"
                    : "hover:bg-gray-800/80 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-3">
                  {icon}
                  {!collapsed && <span>{label}</span>}
                </span>
                {!collapsed &&
                  (openSubmenu === label ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  ))}
              </button>
            ) : (
              <NavLink
                to={path!}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-xl transition-all duration-300 ${
                    isActive
                      ? "bg-indigo-600/20 text-indigo-400"
                      : "hover:bg-gray-800/80 hover:text-white"
                  }`
                }
              >
                {icon}
                {!collapsed && <span>{label}</span>}
              </NavLink>
            )}

            {/* Submenu */}
            <AnimatePresence>
              {!collapsed && children && openSubmenu === label && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="ml-6 mt-2 flex flex-col space-y-1 border-l border-gray-800 pl-4"
                >
                  {children.map((sub) => (
                    <NavLink
                      key={sub.path}
                      to={sub.path}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `px-3 py-2 text-xs rounded-md transition-all duration-200 ${
                          isActive
                            ? "text-indigo-400"
                            : "text-gray-400 hover:text-white hover:bg-gray-800/60"
                        }`
                      }
                    >
                      {sub.label}
                    </NavLink>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="mt-10 pt-4 border-t border-gray-800/60">
        <button
  onClick={() => {
    // Call logout function from context
    logout();
    // Optionally, navigate to login page
    navigate("/login");
  }}
  className={`w-full flex items-center ${
    collapsed ? "justify-center" : "justify-center gap-2"
  } py-3 rounded-xl bg-gray-800/50 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all duration-300`}
>
  <LogOut size={18} />
  {!collapsed && <span>Logout</span>}
</button>

      </div>
    </div>
  );

  return (
    <>
      {/* Overlay for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-30 md:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Fixed Sidebar */}
      <div className="hidden md:flex fixed inset-y-0 left-0 w-64 z-40">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            key="mobile-sidebar"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.3 }}
            className="fixed inset-y-0 left-0 z-40 md:hidden"
          >
            <div className="relative h-full bg-gray-900/95 backdrop-blur-md text-gray-200 p-4 w-64 flex flex-col border-r border-gray-800 rounded-r-2xl">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
                onClick={onClose}
              >
                <X size={24} />
              </button>
              <SidebarContent />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
