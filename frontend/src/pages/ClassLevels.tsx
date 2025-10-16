import React, { useEffect, useState } from "react";
import { Search, Plus, MoreVertical, Edit2, Trash2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../lib/api";

interface ClassLevel {
  id: number;
  name: string;
  category: string;
}

export default function ClassLevels() {
  const [levels, setLevels] = useState<ClassLevel[]>([]);
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionMenu, setActionMenu] = useState<number | null>(null);
 
  const categories = [
    "Senior",
    "Junior",
    "Primary",
    "Nursery",
  ];

  // ✅ Fetch levels directly from API (no mock fallback)
  const fetchLevels = async () => {
    try {
      const res = await api.get("/api/classroom/level");
      if (res.data?.data) {
        setLevels(res.data.data);
      } else {
        setLevels([]);
      }
    } catch (err) {
      console.error("Failed to fetch levels:", err);
      setLevels([]);
    }
  };

  useEffect(() => {
    fetchLevels();
  }, []);

  const filtered = levels.filter(
    (lvl) =>
      lvl.name.toLowerCase().includes(search.toLowerCase()) ||
      lvl.category.toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => {
    setName("");
    setCategory("");
    setEditId(null);
  };

  const handleAddLevel = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/api/classroom/level", { name, category });
      await fetchLevels();
      resetForm();
      setIsAddModalOpen(false);
    } catch (err) {
      console.error("Failed to add class level:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditLevel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    setLoading(true);
    try {
      await api.put(`/api/classroom/level/${editId}`, { name, category });
      await fetchLevels();
      resetForm();
      setIsEditModalOpen(false);
    } catch (err) {
      console.error("Failed to edit class level:", err);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (lvl: ClassLevel) => {
    setEditId(lvl.id);
    setName(lvl.name);
    setCategory(lvl.category);
    setIsEditModalOpen(true);
    setActionMenu(null);
  };

  const deleteLevel = async (id: number) => {
    if (!confirm("Delete this class level?")) return;
    try {
      await api.delete(`/api/classroom/level/${id}`);
      await fetchLevels();
    } catch (err) {
      console.error("Failed to delete class level:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Class Level Management
        </h1>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search levels..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Add Button */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition-all"
        >
          <Plus size={18} /> Add Level
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-2xl shadow-md">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
            <tr>
              <th className="text-left py-3 px-4 font-medium">Class</th>
              <th className="text-left py-3 px-4 font-medium">Category</th>
              <th className="text-left py-3 px-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((lvl) => (
                <tr
                  key={lvl.id}
                  className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                >
                  <td className="py-3 px-4 text-gray-800 dark:text-gray-100">
                    {lvl.name}
                  </td>
                  <td className="py-3 px-4 text-gray-500 dark:text-gray-300">
                    {lvl.category}
                  </td>
                  <td className="py-3 px-4 relative">
                    <button
                      onClick={() =>
                        setActionMenu(actionMenu === lvl.id ? null : lvl.id)
                      }
                      className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500"
                    >
                      <MoreVertical size={18} />
                    </button>

                    <AnimatePresence>
                      {actionMenu === lvl.id && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="absolute right-8 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 w-32"
                        >
                          <button
                            onClick={() => openEditModal(lvl)}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                          >
                            <Edit2 size={14} /> Edit
                          </button>
                          <button
                            onClick={() => deleteLevel(lvl.id)}
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
                  colSpan={3}
                  className="text-center py-6 text-gray-500 dark:text-gray-400"
                >
                  No class levels found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modals */}
      <AnimatePresence>
        {isAddModalOpen && (
          <Modal
            title="Add New Class Level"
            name={name}
            category={category}
            categories={categories}
            setName={setName}
            setCategory={setCategory}
            loading={loading}
            onClose={() => setIsAddModalOpen(false)}
            onSubmit={handleAddLevel}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isEditModalOpen && (
          <Modal
            title="Edit Class Level"
            name={name}
            category={category}
            categories={categories}
            setName={setName}
            setCategory={setCategory}
            loading={loading}
            onClose={() => setIsEditModalOpen(false)}
            onSubmit={handleEditLevel}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* 🔹 Reusable Modal Component */
interface ModalProps {
  title: string;
  name: string;
  category: string;
  categories: string[];
  setName: (val: string) => void;
  setCategory: (val: string) => void;
  loading: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

function Modal({
  title,
  name,
  category,
  categories,
  setName,
  setCategory,
  loading,
  onClose,
  onSubmit,
}: ModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-lg relative"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-200"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
          {title}
        </h2>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Level Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
