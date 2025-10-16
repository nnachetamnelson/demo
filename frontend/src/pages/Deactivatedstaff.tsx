import React, { useState } from "react";
import { Search } from "lucide-react";

interface Staff {
  id: number;
  name: string;
  gender: string;
  staffId: string;
  contact: string;
  dateofdeactivate: string;
  position: string;
  category: "All" | "Academic" | "Non Academic";
}

const Deactivatedstaff: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"All" | "Academic" | "Non Academic">("All");
  const [searchTerm, setSearchTerm] = useState("");

  const staffData: Staff[] = [
    {
      id: 1,
      name: "Abasiama Michael",
      gender: "Male",
      staffId: "059",
      contact: "08034802788",
      dateofdeactivate: "Science",
      position: "Lecturer",
      category: "Academic",
    },
    {
      id: 2,
      name: "Udoette Abasiama",
      gender: "Male",
      staffId: "060",
      contact: "08032830394",
      dateofdeactivate: "Admin",
      position: "HR Officer",
      category: "Non Academic",
    },
    {
      id: 3,
      name: "Dickson Joshua",
      gender: "Male",
      staffId: "057",
      contact: "08161753324",
      dateofdeactivate: "Mathematics",
      position: "Lecturer",
      category: "Academic",
    },
    {
      id: 4,
      name: "Ikechukwu Chinecherem",
      gender: "Female",
      staffId: "063",
      contact: "07032271110",
      dateofdeactivate: "Library",
      position: "Librarian",
      category: "Non Academic",
    },
    {
      id: 5,
      name: "Chiemela Ogbone Camelia",
      gender: "Female",
      staffId: "061",
      contact: "08063211114",
      dateofdeactivate: "Biology",
      position: "Lecturer",
      category: "Academic",
    },
  ];

  const filteredStaff = staffData.filter((staff) => {
    const matchesTab = activeTab === "All" || staff.category === activeTab;
    const matchesSearch = staff.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Tabs */}
      <div className="flex items-center border-b border-gray-200 mb-6">
        {["All Staff", "Academic Staff", "Non Academic Staff"].map((tab) => {
          const key = tab.includes("Academic") ? (tab === "Academic Staff" ? "Academic" : "Non Academic") : "All";
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(key as any)}
              className={`px-4 pb-2 font-semibold text-lg border-b-2 transition-colors duration-200 ${
                activeTab === key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Search + Button */}
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-80">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search Staffs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md bg-gray-100 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b">
            <tr className="text-gray-400 uppercase text-sm">
              <th className="py-3 px-6 font-medium">S/N</th>
              <th className="py-3 px-6 font-medium">Full Name</th>
              <th className="py-3 px-6 font-medium">Gender</th>
              <th className="py-3 px-6 font-medium">Staff ID</th>
              <th className="py-3 px-6 font-medium">Contact Number</th>
              <th className="py-3 px-6 font-medium">Date of Deactivate</th>
            
              <th className="py-3 px-6 font-medium">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredStaff.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-6 text-gray-500">
                  No staff found.
                </td>
              </tr>
            ) : (
              filteredStaff.map((staff, index) => (
                <tr
                  key={staff.id}
                  className="border-b hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="py-3 px-6">{index + 1}</td>
                  <td className="py-3 px-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="w-6 h-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a8.25 8.25 0 0115 0"
                        />
                      </svg>
                    </div>
                    <span className="font-medium text-gray-700">{staff.name}</span>
                  </td>
                  <td className="py-3 px-6">{staff.gender}</td>
                  <td className="py-3 px-6">{staff.staffId}</td>
                  <td className="py-3 px-6">{staff.contact}</td>
                  <td className="py-3 px-6">{staff.dateofdeactivate}</td>
                  
                  <td className="py-3 px-6">
                    <button className="bg-blue-100 text-blue-600 px-4 py-1.5 rounded-md font-medium hover:bg-blue-200 transition">
                      View Staff
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Deactivatedstaff;
