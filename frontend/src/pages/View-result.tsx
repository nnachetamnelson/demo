// src/pages/ViewResult.tsx
import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

interface Student {
  id: number;
  name: string;
  gender: string;
  className: string;
  subject: string;
  term: string;
  session: string;
  average: number;
  position: string;
}

const ViewResult: React.FC = () => {
  // Dynamic options (could be fetched from API)
  const classes = ["JS 1A", "JS 1B", "SS 1A", "SS 2B"];
  const subjects = ["Mathematics", "English", "Business Studies", "Physics"];
  const terms = ["First", "Second", "Third"];
  const sessions = ["2023/24", "2024/25", "2025/26"];

  // Selected values
  const [selectedClass, setSelectedClass] = useState(classes[0]);
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]);
  const [selectedTerm, setSelectedTerm] = useState(terms[0]);
  const [selectedSession, setSelectedSession] = useState(sessions[0]);

  // Full list of students (simulating fetched data)
  const allStudents: Student[] = [
    { id: 1, name: "Abba Prince–Victor Amad", gender: "Male", className: "JS 1A", subject: "Business Studies", term: "Third", session: "2024/25", average: 90.8, position: "1st" },
    { id: 2, name: "Anya Chinweaku Chukwu", gender: "Female", className: "JS 1B", subject: "Mathematics", term: "Third", session: "2024/25", average: 78.3, position: "2nd" },
    { id: 3, name: "John Doe", gender: "Male", className: "JS 1A", subject: "Business Studies", term: "Third", session: "2024/25", average: 85.0, position: "2nd" },
    { id: 4, name: "Jane Smith", gender: "Female", className: "JS 1A", subject: "English", term: "Second", session: "2024/25", average: 92.0, position: "1st" },
  ];

  // State for filtered students
  const [students, setStudents] = useState<Student[]>(allStudents);

  const handleChange = (id: number, field: keyof Student, value: string | number) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.id === id ? { ...student, [field]: value } : student
      )
    );
  };

  const calculateTotal = (s: Student) => s.average;

  // Filter function
  const filterStudents = () => {
    const filtered = allStudents.filter(
      (s) =>
        s.className === selectedClass &&
        s.subject === selectedSubject &&
        s.term === selectedTerm &&
        s.session === selectedSession
    );
    setStudents(filtered);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center p-6">
      <div className="w-full max-w-6xl bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8">
        <h1 className="text-2xl font-semibold text-center mb-6 dark:text-white">
          Students Result
        </h1>
        <hr className="border-gray-200 dark:border-gray-700 mb-8" />

        {/* Filter Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Class Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Select Class <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full bg-gray-100 dark:bg-gray-700 border-none rounded-lg px-4 py-3 appearance-none focus:ring-2 focus:ring-blue-500"
              >
                {classes.map((cls) => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3.5 text-gray-500" />
            </div>
          </div>

          {/* Subject Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Subject <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full bg-gray-100 dark:bg-gray-700 border-none rounded-lg px-4 py-3 appearance-none focus:ring-2 focus:ring-blue-500"
              >
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3.5 text-gray-500" />
            </div>
          </div>

          {/* Term Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Term <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(e.target.value)}
                className="w-full bg-gray-100 dark:bg-gray-700 border-none rounded-lg px-4 py-3 appearance-none focus:ring-2 focus:ring-blue-500"
              >
                {terms.map((term) => (
                  <option key={term} value={term}>{term}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3.5 text-gray-500" />
            </div>
          </div>

          {/* Session Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Session <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={selectedSession}
                onChange={(e) => setSelectedSession(e.target.value)}
                className="w-full bg-gray-100 dark:bg-gray-700 border-none rounded-lg px-4 py-3 appearance-none focus:ring-2 focus:ring-blue-500"
              >
                {sessions.map((session) => (
                  <option key={session} value={session}>{session}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3.5 text-gray-500" />
            </div>
          </div>
        </div>

        {/* Show Result Button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={filterStudents}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-lg shadow"
          >
            Show Result
          </button>
        </div>

        {/* Students Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                <th className="px-4 py-3">S/N</th>
                <th className="px-4 py-3">STUDENT NAME</th>
                <th className="px-4 py-3">GENDER</th>
                <th className="px-4 py-3">CLASS</th>
                <th className="px-4 py-3">AVERAGE</th>
                <th className="px-4 py-3">POSITION</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, idx) => (
                <tr key={student.id} className="border-b border-gray-100 dark:border-gray-700">
                  <td className="px-4 py-3">{idx + 1}</td>
                  <td className="px-4 py-3">{student.name}</td>
                  <td className="px-4 py-3">{student.gender}</td>
                  <td className="px-4 py-3">{student.className}</td>
                  <td className="px-4 py-3">{student.average}</td>
                  <td className="px-4 py-3">{student.position}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ViewResult;
