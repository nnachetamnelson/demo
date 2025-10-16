import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ChartData {
  subject: string;
  studentScore: number;
  highestScore: number;
}

interface AcademicRecord {
  term: string;
  session: string;
  data: ChartData[];
}

interface AcademicInfoProps {
  student: any;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    section?: "guardian" | "academic",
    field?: string
  ) => void;
}

const AcademicInfo: React.FC<AcademicInfoProps> = ({ student }) => {
  const [term, setTerm] = useState("First Term");
  const [session, setSession] = useState("2025/26");
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [averages, setAverages] = useState({
    highest: 0,
    student: 0,
    lowest: 0,
  });

  const termOptions = ["First Term", "Second Term", "Third Term"];
  const sessionOptions = ["2023/24", "2024/25", "2025/26"];

  // 🔹 Mock Academic Records
  const academicRecords: AcademicRecord[] = [
    {
      term: "First Term",
      session: "2025/26",
      data: [
        { subject: "Mathematics", studentScore: 75, highestScore: 90 },
        { subject: "English", studentScore: 68, highestScore: 88 },
        { subject: "Biology", studentScore: 80, highestScore: 95 },
        { subject: "Chemistry", studentScore: 72, highestScore: 91 },
        { subject: "Physics", studentScore: 78, highestScore: 89 },
      ],
    },
    {
      term: "Second Term",
      session: "2025/26",
      data: [
        { subject: "Mathematics", studentScore: 82, highestScore: 94 },
        { subject: "English", studentScore: 77, highestScore: 90 },
        { subject: "Biology", studentScore: 85, highestScore: 96 },
        { subject: "Chemistry", studentScore: 80, highestScore: 92 },
        { subject: "Physics", studentScore: 81, highestScore: 93 },
      ],
    },
    {
      term: "Third Term",
      session: "2025/26",
      data: [
        { subject: "Mathematics", studentScore: 79, highestScore: 92 },
        { subject: "English", studentScore: 83, highestScore: 95 },
        { subject: "Biology", studentScore: 87, highestScore: 97 },
        { subject: "Chemistry", studentScore: 75, highestScore: 90 },
        { subject: "Physics", studentScore: 84, highestScore: 96 },
      ],
    },
  ];

  // 🔹 Update data dynamically when term/session changes
  useEffect(() => {
    const record = academicRecords.find(
      (r) => r.term === term && r.session === session
    );

    if (record) {
      setChartData(record.data);

      const studentAvg =
        record.data.reduce((sum, d) => sum + d.studentScore, 0) /
        record.data.length;
      const highestAvg =
        record.data.reduce((sum, d) => sum + d.highestScore, 0) /
        record.data.length;
      const lowestAvg = Math.max(studentAvg - 15, 0);

      setAverages({
        highest: highestAvg,
        student: studentAvg,
        lowest: lowestAvg,
      });
    } else {
      setChartData([]);
      setAverages({ highest: 0, student: 0, lowest: 0 });
    }
  }, [term, session]);

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
          Academic Performance
        </h2>

        <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
          <select
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
          >
            {termOptions.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <select
            value={session}
            onChange={(e) => setSession(e.target.value)}
            className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
          >
            {sessionOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Averages */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/30 shadow-sm">
          <h3 className="text-sm text-gray-500 dark:text-gray-400">
            Highest Average
          </h3>
          <p className="text-2xl font-semibold text-blue-600 dark:text-blue-300">
            {averages.highest.toFixed(1)}%
          </p>
        </div>

        <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/30 shadow-sm">
          <h3 className="text-sm text-gray-500 dark:text-gray-400">
            Student Average
          </h3>
          <p className="text-2xl font-semibold text-green-600 dark:text-green-300">
            {averages.student.toFixed(1)}%
          </p>
        </div>

        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/30 shadow-sm">
          <h3 className="text-sm text-gray-500 dark:text-gray-400">
            Lowest Average
          </h3>
          <p className="text-2xl font-semibold text-red-600 dark:text-red-300">
            {averages.lowest.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Chart */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Result Chart
        </h3>
        <div className="w-full h-80">
          {chartData.length > 0 ? (
            <ResponsiveContainer>
              <BarChart
                data={chartData}
                barGap={6}
                barSize={30}
                margin={{ top: 10, right: 20, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="subject"
                  tick={{ fill: "#6B7280", fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#6B7280", fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: "rgba(59,130,246,0.1)" }}
                  contentStyle={{
                    borderRadius: "10px",
                    border: "none",
                    backgroundColor: "#f9fafb",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                  }}
                />
                <Bar
                  dataKey="studentScore"
                  name="Student"
                  fill="rgba(37, 99, 235, 0.7)"
                  radius={[10, 10, 0, 0]}
                  animationDuration={800}
                />
                <Bar
                  dataKey="highestScore"
                  name="Highest"
                  fill="rgba(16, 185, 129, 0.6)"
                  radius={[10, 10, 0, 0]}
                  animationDuration={800}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center mt-10">
              No data available for {term}, {session}.
            </p>
          )}

          {/* Legend */}
          <div className="flex items-center justify-center space-x-10 mt-6">
            <div className="flex items-center space-x-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: "rgba(37, 99, 235, 0.7)" }}
              ></div>
              <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                Student Score
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: "rgba(16, 185, 129, 0.6)" }}
              ></div>
              <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                Highest Score
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcademicInfo;

