
















import React, { useState, useEffect } from "react";
import { Edit2, Plus, X } from "lucide-react";
import { api } from "../lib/api";

interface Level {
  id: number;
  name: string;
  category?: string;
}

interface ClassItem {
  id: number;
  name: string;
  levelId?: number | null;
  level?: string | null;
  students: number;
  teacher?: string;
  teacherId?: number | null;
  active: boolean;
}

interface DropdownItem {
  id: string | number;
  name: string;
}

const ClassManagementPage = () => {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [teachers, setTeachers] = useState<DropdownItem[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);
  const [loadingModal, setLoadingModal] = useState(false);

  const [form, setForm] = useState({
    name: "",
    levelId: "",
    formTeacherId: "",
  });

  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [showDeactivatedModal, setShowDeactivatedModal] = useState(false);
  const [editClass, setEditClass] = useState<ClassItem | null>(null);

  // Fetch teachers and levels
  useEffect(() => {
    let isMounted = true;

    const fetchDropdowns = async () => {
      try {
        if (isMounted) setLoadingDropdowns(true);
        const [teachersRes, levelsRes] = await Promise.all([
          api.get("/api/classroom/teachers-dropdown"),
          api.get("/api/classroom/level"),
        ]);

        const teacherData = teachersRes?.data?.data || teachersRes?.data?.teachers || [];
        const levelData = levelsRes?.data?.data || levelsRes?.data?.levels || [];

        if (isMounted) {
          setTeachers(Array.isArray(teacherData) ? teacherData : []);
          setLevels(Array.isArray(levelData) ? levelData : []);
        }
      } catch (err) {
        console.error("Error loading dropdowns:", err);
        if (isMounted) {
          setTeachers([]);
          setLevels([]);
        }
      } finally {
        if (isMounted) setLoadingDropdowns(false);
      }
    };

    fetchDropdowns();
    return () => {
      isMounted = false;
    };
  }, []);

  // Input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Open modal for add/edit
  const openAddEditModal = (cls?: ClassItem) => {
    if (cls) {
      setEditClass(cls);
      setForm({
        name: cls.name,
        levelId: cls.levelId?.toString() || "",
        formTeacherId: cls.teacherId?.toString() || "",
      });
    } else {
      setEditClass(null);
      setForm({ name: "", levelId: "", formTeacherId: "" });
    }
    setShowAddEditModal(true);
  };

  // Add or Edit class
  const handleSubmitClass = async () => {
    if (!form.name || !form.levelId) return alert("Please fill all required fields");
    setLoadingModal(true);

    const payload = {
      name: form.name,
      levelId: Number(form.levelId),
      formTeacherId: form.formTeacherId ? Number(form.formTeacherId) : null,
    };

    try {
      let res;
      if (editClass) {
        res = await api.put(`/api/classroom/classes/${editClass.id}`, payload);
      } else {
        res = await api.post("/api/classroom/classes", payload);
      }

      const savedClass = res.data?.data;

      if (editClass) {
        setClasses(classes.map((cls) => (cls.id === editClass.id ? savedClass : cls)));
      } else {
        setClasses([...classes, savedClass]);
      }

      setShowAddEditModal(false);
      setEditClass(null);
      setForm({ name: "", levelId: "", formTeacherId: "" });
    } catch (err: any) {
      console.error("Failed to save class:", err);
      alert(err?.response?.data?.message || "Failed to save class.");
    } finally {
      setLoadingModal(false);
    }
  };

  // Activate / Deactivate
  const handleDeactivate = (id: number) => {
    setClasses(classes.map((c) => (c.id === id ? { ...c, active: false } : c)));
  };

  const handleActivate = (id: number) => {
    setClasses(classes.map((c) => (c.id === id ? { ...c, active: true } : c)));
  };

  const activeClasses = classes.filter((c) => c.active);
  const deactivatedClasses = classes.filter((c) => !c.active);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
        <input
          type="text"
          placeholder="Search"
          className="border border-gray-300 rounded-lg px-4 py-2 w-full sm:w-1/3 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />
        <div className="flex gap-3">
          <button
            onClick={() => openAddEditModal()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition"
          >
            <Plus size={18} /> Add Class
          </button>
          <button
            onClick={() => setShowDeactivatedModal(true)}
            className="bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200 transition"
          >
            Deactivated Classes
          </button>
        </div>
      </div>

      {/* Active Classes */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeClasses.map((cls) => (
          <div key={cls.id} className="bg-white p-5 rounded-2xl shadow-sm relative">
            <div className="absolute top-3 right-3 flex items-center gap-2">
              <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full">
                Active
              </span>
              <button onClick={() => openAddEditModal(cls)} className="text-gray-500 hover:text-indigo-600">
                <Edit2 size={18} />
              </button>
            </div>
            <div className="flex items-center gap-4 mt-2">
              <div className="bg-purple-100 text-purple-700 rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg">
                {cls.name.split(" ")[0]}
              </div>
              <div>
                <h3 className="text-lg font-semibold">{cls.name}</h3>
                <p className="text-gray-500 text-sm">Class Level: {cls.level}</p>
              </div>
            </div>
            <div className="mt-5">
              <div className="border rounded-lg p-3 text-center">
                <p className="text-2xl font-semibold">{cls.students}</p>
                <p className="text-gray-500 text-sm">No of Students</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                Form Teacher:
                {cls.teacher ? (
                  <span className="ml-2 font-medium text-gray-800">{cls.teacher}</span>
                ) : (
                  <span className="ml-2 text-blue-500 cursor-pointer">Assign</span>
                )}
              </p>
            </div>
            <div className="flex justify-between mt-5">
              <button className="bg-blue-100 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-200 transition text-sm">
                View Class List
              </button>
              <button
                onClick={() => handleDeactivate(cls.id)}
                className="bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200 transition text-sm"
              >
                Deactivate
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showAddEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md relative">
            <button
              onClick={() => {
                setShowAddEditModal(false);
                setEditClass(null);
                setForm({ name: "", levelId: "", formTeacherId: "" });
              }}
              className="absolute top-3 right-3 text-gray-500"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-semibold mb-4">{editClass ? "Edit Class" : "Add New Class"}</h2>

            {loadingDropdowns ? (
              <p>Loading dropdowns...</p>
            ) : (
              <div className="flex flex-col gap-4">
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleInputChange}
                  placeholder="Class Name (e.g. JS 1A)"
                  className="border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Select Level</label>
                  <select
                    name="levelId"
                    value={form.levelId}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="">Select Level</option>
                    {levels.map((lvl) => (
                      <option key={lvl.id} value={lvl.id}>
                        {`${lvl.name}${lvl.category ? ` (${lvl.category})` : ""}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Select Teacher</label>
                  <select
                    name="formTeacherId"
                    value={form.formTeacherId}
                    onChange={handleInputChange}
                    className="border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleSubmitClass}
                  className={`bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition ${
                    loadingModal ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={loadingModal}
                >
                  {loadingModal ? "Saving..." : editClass ? "Update Class" : "Add Class"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Deactivated Classes Modal */}
      {showDeactivatedModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl relative max-h-[80vh] overflow-y-auto">
            <button onClick={() => setShowDeactivatedModal(false)} className="absolute top-3 right-3 text-gray-500">
              <X size={20} />
            </button>
            <h2 className="text-xl font-semibold mb-4">Deactivated Classes</h2>
            {deactivatedClasses.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No deactivated classes</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {deactivatedClasses.map((cls) => (
                  <div key={cls.id} className="border rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold">{cls.name}</h3>
                      <button
                        onClick={() => handleActivate(cls.id)}
                        className="bg-green-100 text-green-600 text-sm px-3 py-1 rounded-lg hover:bg-green-200 transition"
                      >
                        Activate
                      </button>
                    </div>
                    <p className="text-sm text-gray-500">Level: {cls.level}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassManagementPage;
