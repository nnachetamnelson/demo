import React, { useEffect, useState } from "react";
import { Search, MoreVertical, Edit2, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ClassAllocation {
  id: number;
  studentName: string;
  gender: string;
  admissionNo: string;
  currentClass: string;
  newClass: string;
  type: string;
}

export default function ClassAllocations() {
  const [allocations, setAllocations] = useState<ClassAllocation[]>([]);
  const [levels, setLevels] = useState<string[]>([]);
  const [sessions, setSessions] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  // form fields
  const [classLevel, setClassLevel] = useState("");
  const [session, setSession] = useState("");
  const [destinationClass, setDestinationClass] = useState("");
  const [placementType, setPlacementType] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionMenu, setActionMenu] = useState<number | null>(null);

  // Load mock data
  useEffect(() => {
    // Simulate API call delay
    setTimeout(() => {
      setLevels(["JSS 1", "JSS 2", "JSS 3", "SS 1", "SS 2", "SS 3"]);
      setSessions(["2023/2024", "2024/2025", "2025/2026"]);

      setAllocations([
        {
          id: 1,
          studentName: "John Doe",
          gender: "Male",
          admissionNo: "ADM001",
          currentClass: "JSS 1",
          newClass: "JSS 2",
          type: "Manual",
        },
        {
          id: 2,
          studentName: "Jane Smith",
          gender: "Female",
          admissionNo: "ADM002",
          currentClass: "JSS 2",
          newClass: "JSS 3",
          type: "Automatic",
        },
        {
          id: 3,
          studentName: "Samuel Johnson",
          gender: "Male",
          admissionNo: "ADM003",
          currentClass: "SS 1",
          newClass: "SS 2",
          type: "Manual",
        },
      ]);
    }, 300);
  }, []);

  // Filter search
  const filtered = allocations.filter(
    (item) =>
      item.studentName.toLowerCase().includes(search.toLowerCase()) ||
      item.currentClass.toLowerCase().includes(search.toLowerCase()) ||
      item.newClass.toLowerCase().includes(search.toLowerCase()) ||
      item.type.toLowerCase().includes(search.toLowerCase())
  );

  // Add allocation
  const handleAddAllocation = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const newAlloc: ClassAllocation = {
        id: Date.now(),
        studentName: `Student ${allocations.length + 1}`,
        gender: Math.random() > 0.5 ? "Male" : "Female",
        admissionNo: `ADM${allocations.length + 10}`,
        currentClass: classLevel,
        newClass: destinationClass,
        type: placementType,
      };

      setAllocations((prev) => [newAlloc, ...prev]);
      setLoading(false);
      setClassLevel("");
      setSession("");
      setDestinationClass("");
      setPlacementType("");
    }, 800);
  };

  // Edit allocation type
  const handleEdit = (id: number) => {
    setAllocations((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              type: item.type === "Manual" ? "Automatic" : "Manual",
            }
          : item
      )
    );
  };

  // Delete allocation
  const deleteAllocation = (id: number) => {
    if (!confirm("Delete this class allocation?")) return;
    setAllocations((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Class Placement
        </h1>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search allocations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 
                       bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 
                       focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Inline Add Allocation Form */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md mb-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Add New Class Placement
        </h2>

        <form
          onSubmit={handleAddAllocation}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end"
        >
          {/* Class */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Class
            </label>
            <select
              value={classLevel}
              onChange={(e) => setClassLevel(e.target.value)}
              required
              className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 
                         bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 
                         focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Select Class...</option>
              {levels.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>
          </div>

          {/* Session */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Session
            </label>
            <select
              value={session}
              onChange={(e) => setSession(e.target.value)}
              required
              className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 
                         bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 
                         focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Select Session...</option>
              {sessions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Destination Class */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Destination Class
            </label>
            <select
              value={destinationClass}
              onChange={(e) => setDestinationClass(e.target.value)}
              required
              className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 
                         bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 
                         focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Select Class...</option>
              {levels.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>
          </div>

          {/* Placement Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Placement Type
            </label>
            <select
              value={placementType}
              onChange={(e) => setPlacementType(e.target.value)}
              required
              className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 
                         bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 
                         focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Select Type...</option>
              <option value="Automatic">Automatic</option>
              <option value="Manual">Manual</option>
            </select>
          </div>

          {/* Submit Button */}
          <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 
                         text-white font-medium transition-all shadow-md disabled:opacity-60"
            >
              {loading ? "Saving..." : "Add Allocation"}
            </button>
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-2xl shadow-md">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
            <tr>
              <th className="text-left py-3 px-4 font-medium">STUDENT NAME</th>
              <th className="text-left py-3 px-4 font-medium">GENDER</th>
              <th className="text-left py-3 px-4 font-medium">ADMISSION NO</th>
              <th className="text-left py-3 px-4 font-medium">CURRENT CLASS</th>
              <th className="text-left py-3 px-4 font-medium">NEW CLASS</th>
              <th className="text-left py-3 px-4 font-medium">TYPE</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((item) => (
                <tr
                  key={item.id}
                  className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                >
                  <td className="py-3 px-4 text-gray-800 dark:text-gray-100">
                    {item.studentName}
                  </td>
                  <td className="py-3 px-4 text-gray-500 dark:text-gray-300">
                    {item.gender}
                  </td>
                  <td className="py-3 px-4 text-gray-500 dark:text-gray-300">
                    {item.admissionNo}
                  </td>
                  <td className="py-3 px-4 text-gray-500 dark:text-gray-300">
                    {item.currentClass}
                  </td>
                  <td className="py-3 px-4 text-gray-500 dark:text-gray-300">
                    {item.newClass}
                  </td>
                  <td className="py-3 px-4 text-gray-500 dark:text-gray-300">
                    {item.type}
                  </td>
                  <td className="py-3 px-4 relative">
                    <button
                      onClick={() =>
                        setActionMenu(actionMenu === item.id ? null : item.id)
                      }
                      className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500"
                    >
                      <MoreVertical size={18} />
                    </button>

                    <AnimatePresence>
                      {actionMenu === item.id && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="absolute right-8 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 w-32"
                        >
                          <button
                            onClick={() => handleEdit(item.id)}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                          >
                            <Edit2 size={14} /> Toggle Type
                          </button>
                          <button
                            onClick={() => deleteAllocation(item.id)}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="text-center py-6 text-gray-500 dark:text-gray-400"
                >
                  No class allocations found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
