import React, { useState, useMemo } from "react";
import { CheckSquare, Info } from "lucide-react";

const PromotionSettings: React.FC = () => {
  // --- Dropdown States ---
  const [selectedLevel, setSelectedLevel] = useState("JSS1");
  const [selectedClass, setSelectedClass] = useState("A");
  const [selectedSession, setSelectedSession] = useState("2023/2024");
  const [selectedTerm, setSelectedTerm] = useState("First Term");

  // --- Promotion Criteria States ---
  const [enabledAverage, setEnabledAverage] = useState(true);
  const [enabledCore, setEnabledCore] = useState(false);
  const [enabledCount, setEnabledCount] = useState(false);

  const [passScore, setPassScore] = useState(50);
  const [failScore, setFailScore] = useState(49);
  const [totalSubjects, setTotalSubjects] = useState(7);
  const [passCountScore, setPassCountScore] = useState(50);

  const levels = ["JSS1", "JSS2", "JSS3", "SS1", "SS2", "SS3"];
  const classes = ["A", "B", "C", "D"];

  // --- Mock Student Data ---
  const mockStudents = [
    { id: 1, name: "John Doe", admissionNo: "ADM001", gender: "Male", avgScore: 75, status: "Passed", session: "2023/2024", term: "First Term" },
    { id: 2, name: "Jane Smith", admissionNo: "ADM002", gender: "Female", avgScore: 48, status: "Failed", session: "2023/2024", term: "Second Term" },
    { id: 3, name: "Michael Johnson", admissionNo: "ADM003", gender: "Male", avgScore: 81, status: "Passed", session: "2022/2023", term: "Third Term" },
    { id: 4, name: "Grace Williams", admissionNo: "ADM004", gender: "Female", avgScore: 52, status: "Passed", session: "2024/2025", term: "First Term" },
    { id: 5, name: "David Brown", admissionNo: "ADM005", gender: "Male", avgScore: 39, status: "Failed", session: "2023/2024", term: "First Term" },
    { id: 6, name: "Sarah Connor", admissionNo: "ADM006", gender: "Female", avgScore: 68, status: "Passed", session: "2024/2025", term: "Second Term" },
  ];

  // --- Filter Students ---
  const filteredStudents = useMemo(() => {
    return mockStudents.filter(
      (s) => s.session === selectedSession && s.term === selectedTerm
    );
  }, [selectedSession, selectedTerm]);

  // --- Save Handler ---
  const handleSave = () => {
    const settings = {
      enabledAverage,
      passScore,
      failScore,
      enabledCore,
      enabledCount,
      totalSubjects,
      passCountScore,
      selectedLevel,
      selectedClass,
    };
    console.log("Saved Promotion Settings:", settings);
    alert("Promotion settings saved successfully!");
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* --- Top Dropdowns --- */}
      <div className="flex justify-end items-center gap-3 mb-6">
        <select
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          {levels.map((level) => (
            <option key={level}>{level}</option>
          ))}
        </select>

        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option>Select Class</option>
          {classes.map((cls) => (
            <option key={cls}>{cls}</option>
          ))}
        </select>
      </div>

      {/* --- Promotion by Average Score --- */}
      <div className="bg-white shadow rounded-xl p-6 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <input
            type="checkbox"
            checked={enabledAverage}
            onChange={(e) => setEnabledAverage(e.target.checked)}
            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <h2 className="font-semibold text-lg text-gray-800">
            Promotion by Average Score
          </h2>
        </div>

        <div className="flex flex-col md:flex-row gap-5 mb-4">
          {/* Pass Box */}
          <div className="bg-gray-50 border rounded-xl p-5 flex-1">
            <h3 className="font-bold text-xl mb-2">Pass</h3>
            <label className="text-sm text-gray-500">greater than</label>
            <input
              type="number"
              value={passScore}
              onChange={(e) => setPassScore(Number(e.target.value))}
              className="mt-1 w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>

          {/* Fail Box */}
          <div className="bg-gray-50 border rounded-xl p-5 flex-1">
            <h3 className="font-bold text-xl mb-2">Fail</h3>
            <label className="text-sm text-gray-500">less than</label>
            <input
              type="number"
              value={failScore}
              onChange={(e) => setFailScore(Number(e.target.value))}
              className="mt-1 w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>
        </div>

        <div className="border border-dashed border-blue-300 rounded-lg p-4 bg-blue-50 flex items-start gap-3 mb-6">
          <Info className="text-blue-500 w-5 h-5 mt-1" />
          <p className="text-gray-700 text-sm leading-relaxed">
            Promotion by average score determines a student’s overall success and eligibility for promotion.
          </p>
        </div>
      </div>

      {/* --- Promotion by Core Subject --- */}
      <div className="bg-white shadow rounded-xl p-6 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <input
            type="checkbox"
            checked={enabledCore}
            onChange={(e) => setEnabledCore(e.target.checked)}
            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <h2 className="font-semibold text-lg text-gray-800">
            Promotion by Core Subject
          </h2>
        </div>

        <div className="border border-dashed border-blue-300 rounded-lg p-4 bg-blue-50 flex items-start gap-3 mb-6">
          <Info className="text-blue-500 w-5 h-5 mt-1" />
          <p className="text-gray-700 text-sm leading-relaxed">
            Promotion by core subject determines student success in key subjects and eligibility for promotion.
          </p>
        </div>
      </div>

      {/* --- Promotion by Count --- */}
      <div className="bg-white shadow rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <input
            type="checkbox"
            checked={enabledCount}
            onChange={(e) => setEnabledCount(e.target.checked)}
            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <h2 className="font-semibold text-lg text-gray-800">
            Promotion by Count
          </h2>
        </div>

        <div className="bg-gray-50 border rounded-xl p-5 mb-6">
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm text-gray-600 font-medium mb-1">
                Total Subjects to Pass
              </label>
              <input
                type="number"
                value={totalSubjects}
                onChange={(e) => setTotalSubjects(Number(e.target.value))}
                className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 font-medium mb-1">
                Pass Score
              </label>
              <input
                type="number"
                value={passCountScore}
                onChange={(e) => setPassCountScore(Number(e.target.value))}
                className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-400 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="border border-dashed border-blue-300 rounded-lg p-4 bg-blue-50 flex items-start gap-3 mb-6">
          <Info className="text-blue-500 w-5 h-5 mt-1" />
          <p className="text-gray-700 text-sm leading-relaxed">
            Promotion by count determines if a student passes based on the total number of subjects passed and their scores.
          </p>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg shadow"
          >
            Save Changes
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center mt-6">
        <div className="flex flex-col gap-3 w-full max-w-sm items-center">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium shadow w-full">
            Apply Settings
          </button>
          <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium shadow flex items-center justify-center gap-2 w-full">
            <CheckSquare size={18} /> Publish Promotion
          </button>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white shadow-sm rounded-lg p-6 mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h3 className="text-lg font-semibold text-gray-700">
            Students Promotion List
          </h3>
          <div className="flex gap-3">
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="border rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
            >
              <option value="2022/2023">2022/2023</option>
              <option value="2023/2024">2023/2024</option>
              <option value="2024/2025">2024/2025</option>
            </select>

            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="border rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
            >
              <option value="First Term">First Term</option>
              <option value="Second Term">Second Term</option>
              <option value="Third Term">Third Term</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 text-sm text-left">
            <thead className="bg-gray-100 text-gray-600 font-medium">
              <tr>
                <th className="px-4 py-2 border">S/N</th>
                <th className="px-4 py-2 border">Student Name</th>
                <th className="px-4 py-2 border">Admission No.</th>
                <th className="px-4 py-2 border">Gender</th>
                <th className="px-4 py-2 border">Average Score</th>
                <th className="px-4 py-2 border">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student, index) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border">{index + 1}</td>
                    <td className="px-4 py-2 border">{student.name}</td>
                    <td className="px-4 py-2 border">{student.admissionNo}</td>
                    <td className="px-4 py-2 border">{student.gender}</td>
                    <td className="px-4 py-2 border">{student.avgScore}</td>
                    <td
                      className={`px-4 py-2 border font-semibold ${
                        student.status === "Passed"
                          ? "text-green-600"
                          : "text-red-500"
                      }`}
                    >
                      {student.status}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-gray-500">
                    No students found for the selected session and term.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PromotionSettings;
