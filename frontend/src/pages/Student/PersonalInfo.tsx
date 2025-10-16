import React from "react";

interface Props {
  student: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const PersonalInfo: React.FC<Props> = ({ student, handleInputChange }) => (
  <div className="grid md:grid-cols-2 gap-6">
    {[
      ["First Name", "firstName"],
      ["Middle Name", "middleName"],
      ["Last Name", "lastName"],
      ["Admission Number", "admissionNo"],
      ["Email Address", "email"],
      ["Gender", "gender"],
      ["Date of Birth", "dob"],
      ["Date Admitted", "dateAdmitted"],
      ["Class", "class"],
      ["State of Origin", "stateOfOrigin"],
      ["Local Government Area", "lga"],
      ["Previous School", "previousSchool"],
    ].map(([label, name]) => (
      <div key={name}>
        <label className="block text-sm font-medium text-gray-500 mb-1">
          {label}
        </label>
        <input
          type="text"
          name={name}
          value={student[name] || ""}
          onChange={handleInputChange}
          className="w-full rounded-md border p-2"
        />
      </div>
    ))}

    <div className="md:col-span-2">
      <label className="block text-sm font-medium text-gray-500 mb-1">
        Home Address
      </label>
      <textarea
        name="homeAddress"
        value={student.homeAddress || ""}
        onChange={handleInputChange}
        className="w-full rounded-md border p-2"
      />
    </div>
  </div>
);

export default PersonalInfo;
