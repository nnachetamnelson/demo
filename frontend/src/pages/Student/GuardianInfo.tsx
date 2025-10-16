import React from "react";

interface Props {
  student: any;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    section?: "guardian" | "academic",
    field?: string
  ) => void;
}

const GuardianInfo: React.FC<Props> = ({ student, handleInputChange }) => (
  <div className="grid md:grid-cols-2 gap-6">
    {[
      ["Father's Name", "fatherName"],
      ["Father's Contact Phone", "fatherPhone"],
      ["Father's Occupation", "fatherOccupation"],
      ["Mother's Name", "motherName"],
      ["Mother's Contact Phone", "motherPhone"],
      ["Mother's Occupation", "motherOccupation"],
    ].map(([label, field]) => (
      <div key={field}>
        <label className="block text-sm font-medium text-gray-500 mb-1">
          {label}
        </label>
        <input
          type="text"
          value={student.guardian[field]}
          onChange={(e) => handleInputChange(e, "guardian", field)}
          className="w-full rounded-md border p-2"
        />
      </div>
    ))}

    <div className="md:col-span-2">
      <label className="block text-sm font-medium text-gray-500 mb-1">
        Parent Contact Address
      </label>
      <textarea
        value={student.guardian.address}
        onChange={(e) => handleInputChange(e, "guardian", "address")}
        className="w-full rounded-md border p-2"
      />
    </div>
  </div>
);

export default GuardianInfo;
