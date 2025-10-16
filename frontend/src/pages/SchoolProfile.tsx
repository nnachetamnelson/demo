import React, { useState, useEffect } from "react";
import { CheckCircle, Mail, Edit3, Upload } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import { api } from "../lib/api";
import { useAuth } from "../auth/AuthContext";

import CASetup from "./Settings/CASetup";
import GradeScale from "./Settings/GradeScale";
import ManageSubjects from "./Settings/ManageSubjects";
import Promotioncriteria from "./Settings/Promotioncriteria";
import Session from "./Settings/Session";
import Result from "./Settings/Result";
import Comment from "./Settings/Comment";
import SpecialCASetup from "./Settings/SpecialCASetup";

// --- Types ---
interface SchoolProfileData {
  id?: string;
  schoolName: string;
  phoneNo: string;
  phoneNo2: string;
  email: string;
  address: string;
  website: string;
  schoolPrefix: string;
}

interface UserResponse {
  id: string;
  schoolName?: string;
  phoneNo?: string;
  phoneNo2?: string;
  email?: string;
  address?: string;
  website?: string;
  schoolPrefix?: string;
  schoolLogo?: string;
  schoolSignature?: string;
  principalSignature?: string;
}

interface DecodedToken {
  id: number;
  username: string;
  role: string;
  tenantId: string;
  iat: number;
  exp: number;
}

const menuTabs = [
  "School Information",
  "CA Setup",
  "Grade Scale",
  "Subject",
  "Promotion Criteria",
  "Session",
  "Result",
  "Auto-Comment",
  "Special CA Setup",
];

const SchoolProfile: React.FC = () => {
  const { accessToken } = useAuth();
  const [decodedId, setDecodedId] = useState<number | null>(null);

  const [activeTab, setActiveTab] = useState("School Information");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState<SchoolProfileData>({
    id: undefined,
    schoolName: "",
    phoneNo: "",
    phoneNo2: "",
    email: "",
    address: "",
    website: "",
    schoolPrefix: "",
  });

  const [logo, setLogo] = useState<string | null>(null);
  const [schoolStamp, setSchoolStamp] = useState<string | null>(null);
  const [principalSign, setPrincipalSign] = useState<string | null>(null);

  // --- Decode JWT and fetch user ---
  useEffect(() => {
    if (!accessToken) return;

    try {
      const decoded: DecodedToken = jwtDecode(accessToken);
      setDecodedId(decoded.id);
    } catch (error) {
      console.error("❌ Failed to decode token:", error);
    }
  }, [accessToken]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!accessToken || !decodedId) return;

      setLoading(true);
      setMessage("");

      try {
        const res = await api.get(`/api/auth/${decodedId}`);
        const user: UserResponse = res.data.data.user || res.data.data;

        setFormData({
          id: user.id,
          schoolName: user.schoolName || "",
          phoneNo: user.phoneNo || "",
          phoneNo2: user.phoneNo2 || "",
          email: user.email || "",
          address: user.address || "",
          website: user.website || "",
          schoolPrefix: user.schoolPrefix || "",
        });

        setLogo(user.schoolLogo || null);
        setSchoolStamp(user.schoolSignature || null);
        setPrincipalSign(user.principalSignature || null);
      } catch (error: any) {
        console.error("❌ Failed to fetch user:", error);
        setMessage("❌ Failed to load profile. Please refresh.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [accessToken, decodedId]);

  // --- Input Handlers ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setPreview: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  // --- Submit Handler ---

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!decodedId) {
    setMessage("❌ Cannot update profile: missing user ID");
    return;
  }

  setLoading(true);
  setMessage("");

  try {
    // Only include non-empty fields
    const payload: Record<string, any> = {};

    Object.entries(formData).forEach(([key, value]) => {
      if (key === "id") return; // ❌ Skip ID
      if (value !== undefined && value !== null && value !== "") {
        payload[key] = value;
      }
    });

    if (logo) payload.schoolLogo = logo;
    if (schoolStamp) payload.schoolSignature = schoolStamp;
    if (principalSign) payload.principalSignature = principalSign;

    console.log("PATCH payload:", payload);

    await api.patch(`/api/auth/${decodedId}`, payload);
    setMessage("✅ School profile updated successfully!");
  } catch (error: any) {
    console.error("❌ Update failed:", error);
    setMessage("❌ Failed to update profile. Please try again.");
  } finally {
    setLoading(false);
  }
};


  // --- Render Active Tab ---
  const renderContent = () => {
    switch (activeTab) {
      case "School Information":
        return (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block font-medium mb-1">School Name</label>
              <input
                type="text"
                name="schoolName"
                value={formData.schoolName}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-4 py-2"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block font-medium mb-1">Phone No.</label>
                <input
                  type="text"
                  name="phoneNo"
                  value={formData.phoneNo}
                  onChange={handleChange}
                  required
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Phone No. 2</label>
                <input
                  type="text"
                  name="phoneNo2"
                  value={formData.phoneNo2}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-4 py-2"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Website</label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">School Prefix</label>
              <input
                type="text"
                name="schoolPrefix"
                value={formData.schoolPrefix}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2"
              />
            </div>

            {/* Uploads */}
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { label: "School Logo", preview: logo, setter: setLogo },
                { label: "School Stamp", preview: schoolStamp, setter: setSchoolStamp },
                { label: "Principal Signature", preview: principalSign, setter: setPrincipalSign },
              ].map((item) => (
                <div key={item.label} className="flex flex-col items-center">
                  <label className="block font-medium mb-2">{item.label}</label>
                  {item.preview && (
                    <img
                      src={item.preview}
                      alt={item.label}
                      className="w-24 h-24 object-cover border mb-3 rounded-full"
                    />
                  )}
                  <label className="cursor-pointer text-purple-600 flex items-center gap-2">
                    <Upload size={18} /> Upload
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, item.setter)}
                    />
                  </label>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
              {message && <p className="text-green-600 mt-3 font-medium">{message}</p>}
            </div>
          </form>
        );

      case "CA Setup":
        return <CASetup />;
      case "Grade Scale":
        return <GradeScale />;
      case "Subject":
        return <ManageSubjects />;
      case "Promotion Criteria":
        return <Promotioncriteria />;
      case "Session":
        return <Session />;
      case "Result":
        return <Result />;
      case "Auto-Comment":
        return <Comment />;
      case "Special CA Setup":
        return <SpecialCASetup />;
      default:
        return (
          <div className="p-6 text-gray-500">
            Content for <span className="font-medium">{activeTab}</span> coming soon...
          </div>
        );
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center gap-6">
        <img
          src={logo || "/school-logo.png"}
          alt="Logo"
          className="w-32 h-32 rounded-full border-4 border-purple-500 object-cover"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold text-gray-900">{formData.schoolName}</h1>
            <CheckCircle className="text-blue-500 w-5 h-5" />
          </div>
          <div className="flex items-center text-gray-500 mt-1">
            <Mail className="w-4 h-4 mr-2" />
            <span>{formData.email}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-4 mt-6 bg-white px-6 py-3 rounded-xl shadow-sm">
        {menuTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-sm font-medium px-3 py-1 rounded-md transition ${
              activeTab === tab
                ? "text-purple-700 bg-purple-100"
                : "text-gray-600 hover:text-purple-600"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Active Section */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border">
        <div className="border-b px-6 py-4 flex items-center gap-2">
          <Edit3 className="w-5 h-5 text-purple-500" />
          <h2 className="text-lg font-semibold text-gray-800">{activeTab}</h2>
        </div>
        {renderContent()}
      </div>
    </div>
  );
};

export default SchoolProfile;
