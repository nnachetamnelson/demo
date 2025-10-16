import React, { useState, useEffect, useCallback } from "react";
import { Search, X, ChevronDown, ChevronUp } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../auth/AuthContext";

interface Staff {
  id: number;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender: string;
  category: "Academic" | "Non Academic";
  role: string;
  dateEmployed?: string;
  stateOfOrigin?: string;
  localGovernmentArea?: string;
  homeAddress?: string;
  nextOfKinFirstName?: string;
  nextOfKinMiddleName?: string;
  nextOfKinLastName?: string;
  nextOfKinPhone?: string;
  nextOfKinOccupation?: string;
  nextOfKinRelationship?: string;
  nextOfKinAddress?: string;
  institution?: string;
  courseOfStudy?: string;
  yearAdmitted?: string;
  yearGraduated?: string;
  certificate?: string;
}

type Section = "personal" | "nextOfKin" | "education";

const StaffList: React.FC = () => {
  const { accessToken } = useAuth();

  // State
  const [staffData, setStaffData] = useState<Staff[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"All" | "Academic" | "Non Academic">("All");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [totalPages, setTotalPages] = useState(1);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [editingStaffId, setEditingStaffId] = useState<number | null>(null);

  // Collapsible sections
  const [openSection, setOpenSection] = useState<Section | null>("personal");

  // Form data
  const [formData, setFormData] = useState<Staff>({
    id: 0,
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    category: "Academic",
    role: "",
    dateEmployed: "",
    stateOfOrigin: "",
    localGovernmentArea: "",
    homeAddress: "",
    nextOfKinFirstName: "",
    nextOfKinMiddleName: "",
    nextOfKinLastName: "",
    nextOfKinPhone: "",
    nextOfKinOccupation: "",
    nextOfKinRelationship: "",
    nextOfKinAddress: "",
    institution: "",
    courseOfStudy: "",
    yearAdmitted: "",
    yearGraduated: "",
    certificate: "",
  });

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch all staff
  const fetchStaff = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const params: any = { page, limit };
      if (activeTab !== "All") params.category = activeTab;
      if (debouncedSearch) params.search = debouncedSearch;

      console.log("Fetching staff with params:", params);
      const res = await api.get("/api/classroom/staff", {
        headers: { Authorization: `Bearer ${accessToken}` },
        params,
      });

      console.log("Staff response:", res.data);

      const staffWithNames = res.data.staff.map((s: Staff) => ({
        ...s,
        name: `${s.firstName} ${s.lastName}`,
      }));

      setStaffData(staffWithNames);
      setTotalPages(Math.ceil(res.data.total / limit));
    } catch (err: any) {
      console.error("Fetch staff error:", err);
    } finally {
      setLoading(false);
    }
  }, [accessToken, page, limit, activeTab, debouncedSearch]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  // Fetch single staff by ID
  const getStaffById = async (id: number) => {
    if (!accessToken) return;
    try {
      console.log(`Fetching staff with ID: ${id}`);
      const res = await api.get(`/api/classroom/staff/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      console.log("Single staff fetched:", res.data);
      return res.data;
    } catch (err) {
      console.error("Get staff by ID error:", err);
    }
  };

  // Handle create or update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setMessage("");

    try {
      // Remove empty fields
      const payload = Object.fromEntries(
        Object.entries(formData).filter(([_, v]) => v !== "")
      );

      let res;
      if (editingStaffId) {
        console.log("Updating staff:", editingStaffId, payload);
        res = await api.put(`/api/classroom/staff/${editingStaffId}`, payload, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
      } else {
        console.log("Creating staff:", payload);
        res = await api.post("/api/classroom/staff", payload, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
      }

      console.log("Submit response:", res.data);
      setMessage(`✅ Staff ${editingStaffId ? "updated" : "created"} successfully!`);
      setShowModal(false);
      setEditingStaffId(null);

      // Reset form
      setFormData({
        id: 0,
        firstName: "",
        middleName: "",
        lastName: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        gender: "",
        category: "Academic",
        role: "",
        dateEmployed: "",
        stateOfOrigin: "",
        localGovernmentArea: "",
        homeAddress: "",
        nextOfKinFirstName: "",
        nextOfKinMiddleName: "",
        nextOfKinLastName: "",
        nextOfKinPhone: "",
        nextOfKinOccupation: "",
        nextOfKinRelationship: "",
        nextOfKinAddress: "",
        institution: "",
        courseOfStudy: "",
        yearAdmitted: "",
        yearGraduated: "",
        certificate: "",
      });

      fetchStaff();
    } catch (err: any) {
      console.error("Submit staff error:", err);
      setMessage(err.response?.data?.message || "❌ Failed to create/update staff");
    } finally {
      setSubmitLoading(false);
    }
  };

  // Open modal for edit
  const handleEdit = async (id: number) => {
    const staff = await getStaffById(id);
    if (staff) {
      setFormData(staff);
      setEditingStaffId(id);
      setShowModal(true);
    }
  };

  // Toggle collapsible sections
  const toggleSection = (section: Section) => {
    setOpenSection((prev) => (prev === section ? null : section));
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Tabs */}
      <div className="flex items-center border-b border-gray-200 mb-6">
        {["All Staff", "Academic Staff", "Non Academic Staff"].map((tab) => {
          const key = tab === "All Staff" ? "All" : tab.includes("Academic") ? "Academic" : "Non Academic";
          return (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(key as any);
                setPage(1);
              }}
              className={`px-4 pb-2 font-semibold text-lg border-b-2 transition-colors duration-200 ${
                activeTab === key ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Search + Create */}
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-80">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search Staffs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md bg-gray-100 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={() => {
            setShowModal(true);
            setEditingStaffId(null);
          }}
          className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-md font-medium shadow-sm transition"
        >
          {editingStaffId ? "Edit Profile" : "Create Profile"}
        </button>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b">
            <tr className="text-gray-400 uppercase text-sm">
              {["S/N", "Full Name", "Gender", "Staff ID", "Contact Number", "Position", "Actions"].map((header) => (
                <th key={header} className="py-3 px-6 font-medium">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-6 text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : staffData.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-6 text-gray-500">
                  No staff found.
                </td>
              </tr>
            ) : (
              staffData.map((staff, index) => (
                <tr key={staff.id} className="border-b hover:bg-gray-50 transition-colors duration-150">
                  <td className="py-3 px-6">{(page - 1) * limit + index + 1}</td>
                  <td className="py-3 px-6">{staff.firstName} {staff.lastName}</td>
                  <td className="py-3 px-6">{staff.gender}</td>
                  <td className="py-3 px-6">{staff.id}</td>
                  <td className="py-3 px-6">{staff.phone}</td>
                  <td className="py-3 px-6">{staff.role}</td>
                  <td className="py-3 px-6">
                    <button
                      onClick={() => handleEdit(staff.id)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          className="px-3 py-1 rounded-md border border-gray-300"
        >
          Prev
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
          className="px-3 py-1 rounded-md border border-gray-300"
        >
          Next
        </button>
      </div>

      {/* Modal */}
{showModal && (
  <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
    <div className="bg-white rounded-lg w-11/12 max-w-3xl p-6 relative max-h-[90vh] overflow-y-auto">
      <button
        onClick={() => setShowModal(false)}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
      >
        <X />
      </button>
      <h2 className="text-xl font-semibold mb-4">{editingStaffId ? "Edit Staff" : "Create Staff"}</h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* PERSONAL INFO */}
        <div className="border-b pb-4">
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => toggleSection("personal")}
          >
            <h3 className="font-medium">Personal Info</h3>
            {openSection === "personal" ? <ChevronUp /> : <ChevronDown />}
          </div>
          {openSection === "personal" && (
            <div className="mt-2 grid grid-cols-2 gap-4">
              <input
                placeholder="First Name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="border px-3 py-2 rounded-md w-full"
              />
              <input
                placeholder="Middle Name"
                value={formData.middleName}
                onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                className="border px-3 py-2 rounded-md w-full"
              />
              <input
                placeholder="Last Name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="border px-3 py-2 rounded-md w-full"
              />
              <input
                placeholder="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="border px-3 py-2 rounded-md w-full"
              />
              <input
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="border px-3 py-2 rounded-md w-full"
              />
              <input
                placeholder="Date of Birth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="border px-3 py-2 rounded-md w-full"
              />
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="border px-3 py-2 rounded-md w-full"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value as "Academic" | "Non Academic" })
                }
                className="border px-3 py-2 rounded-md w-full"
              >
                <option value="Academic">Academic</option>
                <option value="Non Academic">Non Academic</option>
              </select>
              <input
                placeholder="Role / Position"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="border px-3 py-2 rounded-md w-full"
              />
              <input
                placeholder="Date Employed"
                type="date"
                value={formData.dateEmployed}
                onChange={(e) => setFormData({ ...formData, dateEmployed: e.target.value })}
                className="border px-3 py-2 rounded-md w-full"
              />
              <input
                placeholder="State of Origin"
                value={formData.stateOfOrigin}
                onChange={(e) => setFormData({ ...formData, stateOfOrigin: e.target.value })}
                className="border px-3 py-2 rounded-md w-full"
              />
              <input
                placeholder="Local Government Area"
                value={formData.localGovernmentArea}
                onChange={(e) => setFormData({ ...formData, localGovernmentArea: e.target.value })}
                className="border px-3 py-2 rounded-md w-full"
              />
              <input
                placeholder="Home Address"
                value={formData.homeAddress}
                onChange={(e) => setFormData({ ...formData, homeAddress: e.target.value })}
                className="border px-3 py-2 rounded-md w-full col-span-2"
              />
            </div>
          )}
        </div>

        {/* NEXT OF KIN */}
        <div className="border-b pb-4">
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => toggleSection("nextOfKin")}
          >
            <h3 className="font-medium">Next of Kin</h3>
            {openSection === "nextOfKin" ? <ChevronUp /> : <ChevronDown />}
          </div>
          {openSection === "nextOfKin" && (
            <div className="mt-2 grid grid-cols-2 gap-4">
              <input
                placeholder="First Name"
                value={formData.nextOfKinFirstName}
                onChange={(e) => setFormData({ ...formData, nextOfKinFirstName: e.target.value })}
                className="border px-3 py-2 rounded-md w-full"
              />
              <input
                placeholder="Middle Name"
                value={formData.nextOfKinMiddleName}
                onChange={(e) => setFormData({ ...formData, nextOfKinMiddleName: e.target.value })}
                className="border px-3 py-2 rounded-md w-full"
              />
              <input
                placeholder="Last Name"
                value={formData.nextOfKinLastName}
                onChange={(e) => setFormData({ ...formData, nextOfKinLastName: e.target.value })}
                className="border px-3 py-2 rounded-md w-full"
              />
              <input
                placeholder="Phone Number"
                value={formData.nextOfKinPhone}
                onChange={(e) => setFormData({ ...formData, nextOfKinPhone: e.target.value })}
                className="border px-3 py-2 rounded-md w-full"
              />
              <input
                placeholder="Occupation"
                value={formData.nextOfKinOccupation}
                onChange={(e) => setFormData({ ...formData, nextOfKinOccupation: e.target.value })}
                className="border px-3 py-2 rounded-md w-full"
              />
              <input
                placeholder="Relationship"
                value={formData.nextOfKinRelationship}
                onChange={(e) => setFormData({ ...formData, nextOfKinRelationship: e.target.value })}
                className="border px-3 py-2 rounded-md w-full"
              />
              <input
                placeholder="Address"
                value={formData.nextOfKinAddress}
                onChange={(e) => setFormData({ ...formData, nextOfKinAddress: e.target.value })}
                className="border px-3 py-2 rounded-md w-full col-span-2"
              />
            </div>
          )}
        </div>

        {/* EDUCATION */}
        <div className="border-b pb-4">
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => toggleSection("education")}
          >
            <h3 className="font-medium">Education</h3>
            {openSection === "education" ? <ChevronUp /> : <ChevronDown />}
          </div>
          {openSection === "education" && (
            <div className="mt-2 grid grid-cols-2 gap-4">
              <input
                placeholder="Institution"
                value={formData.institution}
                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                className="border px-3 py-2 rounded-md w-full"
              />
              <input
                placeholder="Course of Study"
                value={formData.courseOfStudy}
                onChange={(e) => setFormData({ ...formData, courseOfStudy: e.target.value })}
                className="border px-3 py-2 rounded-md w-full"
              />
              <input
                placeholder="Year Admitted"
                value={formData.yearAdmitted}
                onChange={(e) => setFormData({ ...formData, yearAdmitted: e.target.value })}
                className="border px-3 py-2 rounded-md w-full"
              />
              <input
                placeholder="Year Graduated"
                value={formData.yearGraduated}
                onChange={(e) => setFormData({ ...formData, yearGraduated: e.target.value })}
                className="border px-3 py-2 rounded-md w-full"
              />
              <input
                placeholder="Certificate"
                value={formData.certificate}
                onChange={(e) => setFormData({ ...formData, certificate: e.target.value })}
                className="border px-3 py-2 rounded-md w-full col-span-2"
              />
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md font-medium"
        >
          {submitLoading ? "Submitting..." : editingStaffId ? "Update Staff" : "Create Staff"}
        </button>
        {message && <p className="mt-2 text-sm">{message}</p>}
      </form>
    </div>
  </div>
)}

    </div>
  );
};

export default StaffList;
