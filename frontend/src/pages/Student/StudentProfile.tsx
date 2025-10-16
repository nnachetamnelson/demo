import React, { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Check, Printer, Upload, Info } from "lucide-react";
import PersonalInfo from "./PersonalInfo";
import GuardianInfo from "./GuardianInfo";
import AcademicInfo from "./AcademicInfo";

type SectionType = "guardian" | "academic" | undefined;

interface GuardianData {
  fatherName: string;
  fatherPhone: string;
  fatherOccupation: string;
  motherName: string;
  motherPhone: string;
  motherOccupation: string;
  address: string;
}

interface AcademicData {
  session: string;
  firstTerm: number;
  secondTerm: number;
  thirdTerm: number;
  highestAverage: number;
  studentAverage: number;
  lowestAverage: number;
}

interface StudentData {
  id: number;
  picture?: string;
  firstName: string;
  middleName: string;
  lastName: string;
  gender: string;
  className: string;
  admissionNo: string;
  dob: string;
  dateAdmitted?: string;
  email?: string;
  stateOfOrigin?: string;
  lga?: string;
  homeAddress?: string;
  previousSchool?: string;
  guardian: GuardianData;
  academic: AcademicData;
}

const mockStudent: StudentData = {
  id: 2,
  firstName: "Onwuka",
  middleName: "Emmanuel",
  lastName: "Munachi",
  gender: "Male",
  className: "SS 2B",
  admissionNo: "ATESS/41082",
  dob: "2010-08-05",
  dateAdmitted: "2022-09-12",
  email: "onwuka.emmanuel@example.com",
  stateOfOrigin: "Abia",
  lga: "Umuahia North",
  homeAddress: "25A Garden Avenue, Enugu",
  previousSchool: "Victory Junior School",
  guardian: {
    fatherName: "Mr. Onwuka Samuel",
    fatherPhone: "+2348012345678",
    fatherOccupation: "Civil Engineer",
    motherName: "Mrs. Onwuka Grace",
    motherPhone: "+2348098765432",
    motherOccupation: "Teacher",
    address: "25A Garden Avenue, Enugu",
  },
  academic: {
    session: "2025/2026",
    firstTerm: 85,
    secondTerm: 88,
    thirdTerm: 90,
    highestAverage: 95,
    studentAverage: 87.6,
    lowestAverage: 62,
  },
};

const StudentProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [student, setStudent] = useState<StudentData>(mockStudent);
  const [activeTab, setActiveTab] = useState("personal");

  // Determine source page
  const sourcePage = (location.state as { from?: string })?.from || "StudentList";
  const isDeactivate = sourcePage === "StudentList";
  const accountActionLabel = isDeactivate ? "Deactivate Account" : "Activate Account";

  const handleAccountAction = () => {
    if (isDeactivate) {
      alert("Account Deactivated!");
    } else {
      alert("Account Activated!");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    section?: SectionType,
    field?: string
  ) => {
    const { name, value } = e.target;

    if (section === "guardian" && field) {
      setStudent((prev) => ({
        ...prev,
        guardian: { ...prev.guardian, [field]: value },
      }));
    } else if (section === "academic" && field) {
      setStudent((prev) => ({
        ...prev,
        academic: { ...prev.academic, [field]: value },
      }));
    } else {
      setStudent((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setStudent((prev) => ({ ...prev, picture: imageUrl }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow p-8 relative">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="relative">
            {student.picture ? (
              <img
                src={student.picture}
                alt="Student"
                className="w-28 h-28 object-cover rounded-xl border"
              />
            ) : (
              <div className="w-28 h-28 rounded-xl bg-blue-100 flex items-center justify-center text-4xl">
                👤
              </div>
            )}
            <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full cursor-pointer">
              <Upload size={16} />
              <input
                type="file"
                accept="image/png, image/jpg, image/jpeg"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
              {`${student.firstName} ${student.middleName} ${student.lastName}`}
              <Check className="text-blue-500" size={20} />
            </h2>
            <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
              {student.gender}
            </span>

            <div className="mt-4 flex flex-wrap gap-4">
              <div>
                <p className="text-gray-500 text-sm">Class</p>
                <p className="font-semibold text-gray-800">{student.className}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Admission No.</p>
                <p className="font-semibold text-gray-800">{student.admissionNo}</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => window.print()}
            className="absolute right-8 top-8 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow"
          >
            <Printer size={18} /> Print Profile
          </button>
        </div>

        {/* Tabs */}
        <div className="mt-8 border-b border-gray-200 flex space-x-6 text-sm font-medium">
          {["personal", "guardian", "academic"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 capitalize ${
                activeTab === tab
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500"
              }`}
            >
              {tab === "personal"
                ? "Student Personal Information"
                : tab === "guardian"
                ? "Parent | Guardian Information"
                : "Academic Records"}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          {activeTab === "personal" && (
            <PersonalInfo student={student} handleInputChange={handleInputChange} />
          )}
          {activeTab === "guardian" && (
            <GuardianInfo student={student} handleInputChange={handleInputChange} />
          )}
          {activeTab === "academic" && (
            <AcademicInfo student={student} handleInputChange={handleInputChange} />
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-10 flex justify-end gap-4">
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
          >
            Back to List
          </button>
          <button
            onClick={() => alert("Changes Saved!")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Save Changes
          </button>
          <button
            onClick={handleAccountAction}
            className={`px-4 py-2 rounded-md shadow text-white ${
              isDeactivate ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {accountActionLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
