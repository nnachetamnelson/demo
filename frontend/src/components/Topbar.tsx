import { Menu, Bell, UserCircle } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useMemo } from "react";

interface TopbarProps {
  onMenuClick: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ onMenuClick }) => {
  const location = useLocation();

  // Map of route → title (same as sidebar items)
  const routeTitles: Record<string, string> = {
    "/": "Dashboard",
    "/studentList": "All Students",
    "/graduatedStudent": "Graduated Students",
    "/deactivated-students": "Deactivated Students",
    "/attendance": "Attendance",
    "/staffList": "Staff Directory",
    "/deactivatedstaff": "Deactivated Staff",
    "/classes": "Class List",
    "/classlevel": "Class Level",
    "/Classallocations": "Class Allocation",
    "/enterResults": "Entries",
    "/viewresults": "View Results",
    "/subjects": "Publish Result",
    "/schoolProfile": "Settings",
  };

  // Determine title based on the current route
  const currentTitle = useMemo(() => {
    return routeTitles[location.pathname] || "Dashboard";
  }, [location.pathname]);

  return (
    <header className="flex justify-between items-center bg-white shadow-sm px-4 md:px-6 py-3 sticky top-0 z-20">
      {/* Hamburger (mobile only) */}
      <button
        onClick={onMenuClick}
        className="md:hidden text-gray-700 hover:text-indigo-600"
      >
        <Menu size={24} />
      </button>

      {/* ✅ Dynamic Title */}
      <h1 className="text-lg font-semibold text-gray-800">{currentTitle}</h1>

      <div className="flex items-center gap-4 text-gray-600">
        <Bell className="hover:text-gray-800 cursor-pointer" size={20} />
        <UserCircle className="hover:text-gray-800 cursor-pointer" size={24} />
      </div>
    </header>
  );
};

export default Topbar;

