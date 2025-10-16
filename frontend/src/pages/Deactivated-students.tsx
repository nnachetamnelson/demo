// src/pages/Deactivatedstudents.tsx
import React, { useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";



const Deactivatedstudents = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const students = [
    {
      id: 1,
      name: "Jonathan Marvelous Enweremchi",
      gender: "Male",
      admissionNo: "ATESS/41379",
      contact: "",
      class: "SS 2B",
      reason: "left"
    },
    {
      id: 2,
      name: "ONWUKA EMMANUEL MUNACHI",
      gender: "Male",
      admissionNo: "ATESS/41082",
      contact: "",
      class: "SS 2B",
      reason: "left"
    },
    {
      id: 3,
      name: "Anya Ijeoma Onyedika",
      gender: "Female",
      admissionNo: "ATESS/41381",
      contact: "",
      class: "SS 2D",
      reason: "left"
    },
    {
      id: 4,
      name: "Onuu Oke Onuu",
      gender: "Male",
      admissionNo: "ATESS/41078",
      contact: "",
      class: "SS 3B",
      reason: "left"
    },
    {
      id: 5,
      name: "Ifegwu Chidimma Ogbuagu",
      gender: "Female",
      admissionNo: "ATESS/41373",
      contact: "",
      class: "JS 3C",
      reason: "left"
    },
    {
      id: 6,
      name: "Ibe Francis Kalu",
      gender: "Male",
      admissionNo: "ATESS/41315",
      contact: "",
      class: "SS 2D",
      reason: "left"
    },
  ];

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex justify-center">
      <div className="w-full max-w-7xl bg-white dark:bg-gray-800 shadow-sm rounded-2xl p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
          {/* Search Bar */}
          <div className="relative w-full md:w-1/2">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search Students"
              className="w-full bg-gray-100 dark:bg-gray-700 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Buttons */}
          <div className="flex space-x-4">
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg shadow">
              Create Student Profile
            </button>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg shadow">
              Batch Uploads
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="text-gray-500 dark:text-gray-300 text-sm border-b border-gray-100 dark:border-gray-700">
                <th className="py-3 px-4 text-left">S/N</th>
                <th className="py-3 px-4 text-left">NAME</th>
                <th className="py-3 px-4 text-left">GENDER</th>
                <th className="py-3 px-4 text-left">ADMISSION NO</th>
                <th className="py-3 px-4 text-left">CONTACT NUMBER</th>
                <th className="py-3 px-4 text-left">CLASS</th>
                <th className="py-3 px-4 text-left">REASON</th>
                <th className="py-3 px-4 text-left">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student, index) => (
                <tr
                  key={student.id}
                  className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                >
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                    {index + 1}
                  </td>

                  {/* Name & Avatar */}
                  <td className="py-3 px-4 flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-gray-500 text-xl">👤</span>
                    </div>
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {student.name}
                    </span>
                  </td>

                  {/* Gender Tag */}
                  <td className="py-3 px-4">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-md ${
                        student.gender === "Male"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-pink-100 text-pink-600"
                      }`}
                    >
                      {student.gender}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                    {student.admissionNo}
                  </td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                    {student.contact || "-"}
                  </td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                    {student.class}
                  </td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                    {student.reason}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4">
                    <button onClick={() => navigate(`/student/${student.id}`, { state: { from: "DeactivatedStudents" } })} className="bg-blue-100 text-blue-600 text-sm font-medium px-4 py-1 rounded-md shadow hover:bg-blue-200 transition">
                      View Student
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredStudents.length === 0 && (
            <p className="text-center text-gray-500 mt-6">No students found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Deactivatedstudents;
