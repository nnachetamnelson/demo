import React, { useState, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AddEditStudentModal from "./Student/AddEditStudentModal";
import BatchUploadModal from "./Student/BatchUploadModal";
import { api } from "../lib/api";

interface Student {
  id: number;
  firstName: string;
  middleName?: string;
  lastName: string;
  gender: string;
  admissionNumber: string;
  classId?: number;
  className?: string;
  dob?: string;
  status?: "active" | "graduated" | "deactivated";
}

const StudentList: React.FC = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  /** Fetch Students from Backend */
  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/api/students");
      const result = Array.isArray(res.data.data) ? res.data.data : [];
      setStudents(result);
    } catch (err) {
      console.error("Failed to fetch students:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  /** Filter students by name */
  const filteredStudents = students.filter((s) =>
    `${s.firstName} ${s.middleName ?? ""} ${s.lastName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  /** Add or Edit Student */
  const handleSave = async (data: any) => {
    const payload = {
      firstName: data.firstName?.trim(),
      middleName: data.middleName?.trim() || "",
      lastName: data.lastName?.trim(),
      gender: data.gender,
      classId: data.classId || null,
      dob: data.dob || null,
      dateAdmitted: data.dateAdmitted || null,
      picture: data.picture || null,
      email: data.email?.trim() || null,
      stateOfOrigin: data.stateOfOrigin || null,
      lga: data.lga || null,
      homeAddress: data.homeAddress || null,
      previousSchool: data.previousSchool || null,
    };

    try {
      setIsLoading(true);
      let updatedStudent: Student;

      if (editingStudent) {
        // Update existing
        const res = await api.put(`/api/students/${editingStudent.id}`, payload);
        updatedStudent = res.data.data || res.data;
        setStudents((prev) =>
          prev.map((s) => (s.id === editingStudent.id ? updatedStudent : s))
        );
      } else {
        // Create new
        const res = await api.post("/api/students", payload);
        updatedStudent = res.data.data || res.data;
        setStudents((prev) => [...prev, updatedStudent]);
      }

      setEditingStudent(null);
      setIsModalOpen(false);
    } catch (error: any) {
      console.error("Failed to save student:", error.response?.data || error);
    } finally {
      setIsLoading(false);
    }
  };

  /** Batch Upload Handler */
  const handleBatchSave = async (records: any[]) => {
    try {
      const allowedFields = [
        "firstName",
        "middleName",
        "lastName",
        "gender",
        "dob",
        "classId",
        "email",
        "stateOfOrigin",
        "lga",
        "homeAddress",
        "previousSchool",
      ];

      const sanitized = records
        .map((r) => {
          const clean: any = {};
          allowedFields.forEach((key) => {
            if (r[key] !== undefined && r[key] !== null) {
              clean[key] = r[key].toString().trim();
            }
          });
          return clean;
        })
        .filter((r) => r.firstName && r.lastName && r.gender);

      const res = await api.post("/api/students/batch", sanitized);
      const newStudents = res.data.data || res.data;
      setStudents((prev) => [...prev, ...newStudents]);
      setIsBatchModalOpen(false);
    } catch (error) {
      console.error("Failed to batch upload:", error);
    }
  };

  /** Activate / Deactivate Student */
  const toggleStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "deactivated" : "active";
    try {
      await api.patch(`/api/students/${id}/status`, { status: newStatus });
      setStudents((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, status: newStatus } : s
        )
      );
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  /** Open Edit Modal */
  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex justify-center">
      <div className="w-full max-w-7xl bg-white dark:bg-gray-800 shadow-md rounded-2xl p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
          <div className="relative w-full md:w-1/2">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search students..."
              className="w-full bg-gray-100 dark:bg-gray-700 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => {
                setEditingStudent(null);
                setIsModalOpen(true);
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg shadow transition"
            >
              Add Student
            </button>
            <button
              onClick={() => setIsBatchModalOpen(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg shadow transition"
            >
              Batch Upload
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          {isLoading ? (
            <div className="flex justify-center items-center py-10 text-gray-500">
              <Loader2 className="animate-spin mr-2" />
              Loading students...
            </div>
          ) : filteredStudents.length > 0 ? (
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="text-gray-500 dark:text-gray-300 text-sm border-b border-gray-200 dark:border-gray-700">
                  <th className="py-3 px-4 text-left">S/N</th>
                  <th className="py-3 px-4 text-left">Name</th>
                  <th className="py-3 px-4 text-left">Gender</th>
                  <th className="py-3 px-4 text-left">Admission No</th>
                  <th className="py-3 px-4 text-left">Class</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">Actions</th>
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
                    <td className="py-3 px-4 text-gray-800 dark:text-gray-200 font-medium">
                      {student.firstName} {student.middleName} {student.lastName}
                    </td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                      {student.gender}
                    </td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                      {student.admissionNumber}
                    </td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                      {student.className || "—"}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          student.status === "active"
                            ? "bg-green-100 text-green-600"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {student.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 space-x-2">
                      <button
                        onClick={() =>
                          navigate(`/student/${student.id}`, {
                            state: { from: "StudentList" },
                          })
                        }
                        className="bg-blue-100 text-blue-600 text-sm font-medium px-3 py-1 rounded-md shadow hover:bg-blue-200 transition"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleEdit(student)}
                        className="bg-green-100 text-green-600 text-sm font-medium px-3 py-1 rounded-md shadow hover:bg-green-200 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() =>
                          toggleStatus(student.id, student.status || "active")
                        }
                        className={`text-sm font-medium px-3 py-1 rounded-md shadow transition ${
                          student.status === "active"
                            ? "bg-red-100 text-red-600 hover:bg-red-200"
                            : "bg-green-100 text-green-600 hover:bg-green-200"
                        }`}
                      >
                        {student.status === "active" ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center text-gray-500 py-6">No students found.</p>
          )}
        </div>

        {/* Modals */}
        <AddEditStudentModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingStudent(null);
          }}
          onSave={handleSave}
          initialData={editingStudent || undefined}
        />
        <BatchUploadModal
          isOpen={isBatchModalOpen}
          onClose={() => setIsBatchModalOpen(false)}
          onSave={handleBatchSave}
        />
      </div>
    </div>
  );
};

export default StudentList;
