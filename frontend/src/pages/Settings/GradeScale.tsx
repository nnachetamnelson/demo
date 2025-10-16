import React, { useState } from "react";
import { Pencil, Trash2, X } from "lucide-react";

interface Grade {
  id: number;
  lowerLimit: number;
  upperLimit: number;
  grade: string;
  remarks: string;
  color: string;
}

const GradeScale: React.FC = () => {
  const [schoolLevel, setSchoolLevel] = useState("Junior School");
  const [grades, setGrades] = useState<Grade[]>([
    { id: 1, lowerLimit: 70, upperLimit: 100, grade: "A", remarks: "Excellent", color: "#22c55e" },
    { id: 2, lowerLimit: 50, upperLimit: 69.99, grade: "C", remarks: "Credit", color: "#facc15" },
    { id: 3, lowerLimit: 40, upperLimit: 49.99, grade: "P", remarks: "Pass", color: "#60a5fa" },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editGrade, setEditGrade] = useState<Grade | null>(null);

  const openAddModal = () => {
    setEditGrade(null);
    setShowModal(true);
  };

  const openEditModal = (grade: Grade) => {
    setEditGrade(grade);
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    setGrades(grades.filter((g) => g.id !== id));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const lowerLimit = parseFloat((form.elements.namedItem("lowerLimit") as HTMLInputElement).value);
    const upperLimit = parseFloat((form.elements.namedItem("upperLimit") as HTMLInputElement).value);
    const grade = (form.elements.namedItem("grade") as HTMLInputElement).value;
    const remarks = (form.elements.namedItem("remarks") as HTMLInputElement).value;
    const color = (form.elements.namedItem("color") as HTMLInputElement).value || "#ffffff";

    if (editGrade) {
      setGrades((prev) =>
        prev.map((g) =>
          g.id === editGrade.id ? { ...editGrade, lowerLimit, upperLimit, grade, remarks, color } : g
        )
      );
    } else {
      const newGrade: Grade = {
        id: grades.length + 1,
        lowerLimit,
        upperLimit,
        grade,
        remarks,
        color,
      };
      setGrades((prev) => [...prev, newGrade]);
    }

    setShowModal(false);
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm mt-4">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <select
          value={schoolLevel}
          onChange={(e) => setSchoolLevel(e.target.value)}
          className="border border-gray-300 rounded-md px-4 py-2 text-sm w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option>Junior School</option>
          <option>Senior School</option>
        </select>

        <button
          onClick={openAddModal}
          className="mt-3 sm:mt-0 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-md"
        >
          Add New Grade Scale
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm text-gray-700">
          <thead>
            <tr className="bg-gray-50 border-b text-gray-600 font-semibold">
              <th className="py-3 px-4 text-left">Lower Limit</th>
              <th className="py-3 px-4 text-left">Upper Limit</th>
              <th className="py-3 px-4 text-left">Grade</th>
              <th className="py-3 px-4 text-left">Remarks</th>
              <th className="py-3 px-4 text-left">Color</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {grades.map((g) => (
              <tr key={g.id} className="border-b hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4">{g.lowerLimit}</td>
                <td className="py-3 px-4">{g.upperLimit}</td>
                <td className="py-3 px-4 font-semibold">{g.grade}</td>
                <td className="py-3 px-4">{g.remarks}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-5 h-5 rounded-full border border-gray-300"
                      style={{ backgroundColor: g.color }}
                    ></span>
                    <span className="text-xs text-gray-500">{g.color}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-center flex justify-center gap-3">
                  <button
                    onClick={() => openEditModal(g)}
                    className="text-blue-500 hover:text-blue-600 flex items-center gap-1"
                  >
                    <Pencil size={16} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(g.id)}
                    className="text-red-500 hover:text-red-600 flex items-center gap-1"
                  >
                    <Trash2 size={16} />
                    <span>Delete</span>
                  </button>
                </td>
              </tr>
            ))}

            {grades.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-6 text-gray-400">
                  No grade scales available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>

            <h2 className="text-lg font-semibold mb-4">
              {editGrade ? "Edit Grade Scale" : "Add New Grade Scale"}
            </h2>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lower Limit</label>
                <input
                  type="number"
                  name="lowerLimit"
                  defaultValue={editGrade?.lowerLimit || ""}
                  className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upper Limit</label>
                <input
                  type="number"
                  name="upperLimit"
                  defaultValue={editGrade?.upperLimit || ""}
                  className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                <input
                  type="text"
                  name="grade"
                  defaultValue={editGrade?.grade || ""}
                  className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                <input
                  type="text"
                  name="remarks"
                  defaultValue={editGrade?.remarks || ""}
                  className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* 🎨 Color Picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    name="color"
                    defaultValue={editGrade?.color || "#ffffff"}
                    className="h-8 w-16 rounded border cursor-pointer"
                  />
                  <span className="text-sm text-gray-500">
                    {editGrade?.color || "#ffffff"}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-200 rounded-md text-sm hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GradeScale;
