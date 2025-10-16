import React, { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { api } from "../../lib/api";
import { toast } from "react-toastify";

interface AddEditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  initialData?: any;
}

const AddEditStudentModal: React.FC<AddEditStudentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<{ id: number; name: string }[]>([]);
  const [formData, setFormData] = useState({
    picture: "",
    firstName: "",
    middleName: "",
    lastName: "",
    gender: "",
    dob: "",
    classId: "",
    dateAdmitted: "",
    email: "",
    stateOfOrigin: "",
    lga: "",
    homeAddress: "",
    previousSchool: "",
    fatherName: "",
    fatherPhone: "",
    fatherOccupation: "",
    motherName: "",
    motherPhone: "",
    motherOccupation: "",
    parentAddress: "",
  });

  // ✅ Prefill data when editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        ...formData,
        ...initialData,
        classId: initialData.classId?.toString() || "",
        dob: initialData.dob || "",
        dateAdmitted: initialData.dateAdmitted || "",
      });
    } else {
      setFormData({
        picture: "",
        firstName: "",
        middleName: "",
        lastName: "",
        gender: "",
        dob: "",
        classId: "",
        dateAdmitted: "",
        email: "",
        stateOfOrigin: "",
        lga: "",
        homeAddress: "",
        previousSchool: "",
        fatherName: "",
        fatherPhone: "",
        fatherOccupation: "",
        motherName: "",
        motherPhone: "",
        motherOccupation: "",
        parentAddress: "",
      });
    }
  }, [initialData, isOpen]);

  // ✅ Fetch class list once when modal opens
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const res = await api.get("/api/classroom/classes");
        setClasses(Array.isArray(res.data?.data) ? res.data.data : []);
      } catch (error) {
        console.error("Failed to load classes:", error);
        toast.error("Unable to fetch class list");
      } finally {
        setLoading(false);
      }
    };
    if (isOpen) fetchClasses();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 2));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        classId: formData.classId ? Number(formData.classId) : undefined,
      };
      await onSave(payload);
      toast.success(initialData ? "Student updated successfully!" : "Student saved successfully!");
      onClose();
    } catch (error: any) {
      console.error("❌ Error saving student:", error);
      toast.error(error.response?.data?.message || "Failed to save student");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 relative overflow-y-auto max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold text-center mb-4">
          {initialData ? "Edit Student" : "Add New Student"}
        </h2>

        {/* Step indicator */}
        <div className="flex justify-center mb-5 gap-3">
          {[1, 2].map((n) => (
            <div
              key={n}
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === n ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              {n}
            </div>
          ))}
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <h3 className="text-lg font-semibold mb-3">Personal Information</h3>
            <div className="grid grid-cols-2 gap-3">
              <input name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First Name" className="border rounded-md p-2" />
              <input name="middleName" value={formData.middleName} onChange={handleChange} placeholder="Middle Name" className="border rounded-md p-2" />
              <input name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last Name" className="border rounded-md p-2" />

              <select name="gender" value={formData.gender} onChange={handleChange} className="border rounded-md p-2">
                <option value="">Select Gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="border rounded-md p-2" />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Date Admitted</label>
                <input type="date" name="dateAdmitted" value={formData.dateAdmitted} onChange={handleChange} className="border rounded-md p-2" />
              </div>

              {/* ✅ Class Dropdown */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Class</label>
                <select name="classId" value={formData.classId} onChange={handleChange} className="border rounded-md p-2">
                  <option value="">Select Class</option>
                  {classes.length === 0 ? (
                    <option disabled>{loading ? "Loading classes..." : "No classes available"}</option>
                  ) : (
                    classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <input name="stateOfOrigin" value={formData.stateOfOrigin} onChange={handleChange} placeholder="State of Origin" className="border rounded-md p-2" />
              <input name="lga" value={formData.lga} onChange={handleChange} placeholder="LGA" className="border rounded-md p-2" />
              <input name="homeAddress" value={formData.homeAddress} onChange={handleChange} placeholder="Home Address" className="border rounded-md p-2 col-span-2" />
            </div>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <h3 className="text-lg font-semibold mb-3">Parent / Guardian Information</h3>
            <div className="grid grid-cols-2 gap-3">
              <input name="fatherName" value={formData.fatherName} onChange={handleChange} placeholder="Father's Name" className="border rounded-md p-2" />
              <input name="fatherPhone" value={formData.fatherPhone} onChange={handleChange} placeholder="Father's Phone" className="border rounded-md p-2" />
              <input name="motherName" value={formData.motherName} onChange={handleChange} placeholder="Mother's Name" className="border rounded-md p-2" />
              <input name="motherPhone" value={formData.motherPhone} onChange={handleChange} placeholder="Mother's Phone" className="border rounded-md p-2" />
              <input name="fatherOccupation" value={formData.fatherOccupation} onChange={handleChange} placeholder="Father's Occupation" className="border rounded-md p-2" />
              <input name="motherOccupation" value={formData.motherOccupation} onChange={handleChange} placeholder="Mother's Occupation" className="border rounded-md p-2" />
              <input name="parentAddress" value={formData.parentAddress} onChange={handleChange} placeholder="Parent Address" className="border rounded-md p-2 col-span-2" />
            </div>
          </>
        )}

        {/* ✅ Buttons */}
        <div className="flex justify-between mt-6">
          {step > 1 && (
            <button onClick={prevStep} className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md">
              Previous
            </button>
          )}
          {step < 2 ? (
            <button onClick={nextStep} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {initialData ? "Update Student" : "Save Student"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddEditStudentModal;
