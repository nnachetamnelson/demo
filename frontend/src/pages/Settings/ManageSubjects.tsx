import React, { useEffect, useState } from "react";
import { ArrowUp, ArrowDown, X } from "lucide-react";
import { api } from "../../lib/api";

interface Level {
  id: number;
  name: string;
  category: string;
}

interface Subject {
  id: number;
  name: string;
  levelId?: number | null;
  level?: Level | null;
  appliesToAllLevels: boolean;
}

const ManageSubjects: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | null>(null);
  const [currentSubject, setCurrentSubject] = useState<Subject | null>(null);
  const [subjectName, setSubjectName] = useState("");
  const [selectedLevelId, setSelectedLevelId] = useState<number | null>(null);
  const [appliesToAllLevels, setAppliesToAllLevels] = useState(false);


  // ✅ Fetch Levels from backend
  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const { data } = await api.get("/api/classroom/level");
        if (data.success) {
          setLevels(data.data || []);
        }
      } catch (err) {
        console.error("Error fetching levels:", err);
      }
    };
    fetchLevels();
  }, []);

  // ✅ Fetch Subjects
  const fetchSubjects = async () => {
    try {
      const { data } = await api.get("/api/classroom/subjects");
      if (data.success) {
        setSubjects(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching subjects:", err);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  // ✅ Handle Add/Edit actions
  const handleAddNew = () => {
    setModalMode("add");
    setSubjectName("");
    setSelectedLevelId(null);
    setAppliesToAllLevels(false);
    setShowModal(true);
  };

  const handleEdit = (subject: Subject) => {
    setModalMode("edit");
    setCurrentSubject(subject);
    setSubjectName(subject.name);
    setSelectedLevelId(subject.levelId || null);
    setAppliesToAllLevels(subject.appliesToAllLevels);
    setShowModal(true);
  };

  // ✅ Delete Subject
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this subject?")) return;
    try {
      const { data } = await api.delete(`/api/classroom/subjects/${id}`);
      if (data.success) {
        fetchSubjects();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error("Error deleting subject:", err);
    }
  };

  // ✅ Save (Add or Edit)
  const handleSave = async () => {
    if (!subjectName.trim()) return alert("Please enter a subject name.");

    const body = {
      name: subjectName,
      appliesToAllLevels,
      ...(appliesToAllLevels ? {} : { levelId: selectedLevelId }),
    };

    try {
      const { data } =
        modalMode === "add"
          ? await api.post("/api/classroom/subjects", body)
          : await api.put(`/api/classroom/subjects/${currentSubject?.id}`, body);

      if (data.success) {
        fetchSubjects();
        setShowModal(false);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error("Error saving subject:", err);
    }
  };

  // ✅ Reorder handler (frontend only)
  const handleReorder = (index: number, direction: "up" | "down") => {
    const newSubjects = [...subjects];
    if (direction === "up" && index > 0) {
      [newSubjects[index - 1], newSubjects[index]] = [
        newSubjects[index],
        newSubjects[index - 1],
      ];
    } else if (direction === "down" && index < newSubjects.length - 1) {
      [newSubjects[index + 1], newSubjects[index]] = [
        newSubjects[index],
        newSubjects[index + 1],
      ];
    }
    setSubjects(newSubjects);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b p-6 gap-3">
          <h2 className="text-lg font-semibold text-gray-800">
            Manage Subjects
          </h2>
          <button
            onClick={handleAddNew}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-5 py-2 rounded-lg transition"
          >
            Add New Subject
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-700">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 font-medium">#</th>
                <th className="px-6 py-4 font-medium">Subject</th>
                <th className="px-6 py-4 font-medium">Applies To</th>
                <th className="px-6 py-4 font-medium text-center">Reorder</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((subject, index) => (
                <tr
                  key={subject.id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-4">{index + 1}</td>
                  <td className="px-6 py-4 font-medium">{subject.name}</td>
                  <td className="px-6 py-4 text-gray-600 font-medium">
                    {subject.appliesToAllLevels
                      ? "All Classes"
                      : subject.level
                      ? `${subject.level.name} (${subject.level.category})`
                      : "—"}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-1 text-blue-500">
                      <ArrowUp
                        className="w-5 h-5 cursor-pointer hover:text-blue-700"
                        onClick={() => handleReorder(index, "up")}
                      />
                      <ArrowDown
                        className="w-5 h-5 cursor-pointer hover:text-blue-700"
                        onClick={() => handleReorder(index, "down")}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => handleEdit(subject)}
                        className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-4 py-1 rounded text-sm font-medium transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(subject.id)}
                        className="bg-red-100 text-red-600 hover:bg-red-200 px-4 py-1 rounded text-sm font-medium transition"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {modalMode === "add" ? "Add New Subject" : "Edit Subject"}
            </h3>

            <div className="flex flex-col gap-4">
              {/* Subject Name */}
              <div>
                <label className="text-sm text-gray-600 mb-1 block">
                  Subject Name
                </label>
                <input
                  type="text"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Enter subject name"
                />
              </div>

              {/* Applies To */}
              <div>
                <label className="text-sm text-gray-600 mb-1 block">
                  Applies To
                </label>
                <select
                  value={appliesToAllLevels ? "all" : selectedLevelId || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "all") {
                      setAppliesToAllLevels(true);
                      setSelectedLevelId(null);
                    } else {
                      setAppliesToAllLevels(false);
                      setSelectedLevelId(Number(value));
                    }
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Select Level</option>
                  <option value="all">All Classes</option>
                  {levels.map((lvl) => (
                    <option key={lvl.id} value={lvl.id}>
                      {`${lvl.name} (${lvl.category})`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageSubjects;
