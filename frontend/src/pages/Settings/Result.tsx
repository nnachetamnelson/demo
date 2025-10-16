import React, { useState } from "react";
import { Info } from "lucide-react";

const Result: React.FC = () => {
  // Separate states for each group of settings
  const [resultOption, setResultOption] = useState<"class" | "level" | "">("");
  const [photoOption, setPhotoOption] = useState<boolean>(false);
  const [commentOption, setCommentOption] = useState<boolean>(false);
  const [mastersheetOption, setMastersheetOption] = useState<"class" | "level" | "">("");
  const [admissionOption, setAdmissionOption] = useState<"normal" | "auto" | "custom" | "">("");

  const handleSave = () => {
    const settings = {
      resultOption,
      photoOption,
      commentOption,
      mastersheetOption,
      admissionOption,
    };
    console.log("Saved Settings:", settings);
    alert("Settings saved successfully!");
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* --- Result by Class/Level --- */}
      <div className="bg-white shadow rounded-xl p-6 mb-8">
        <h2 className="font-semibold text-lg text-gray-800 mb-4">Result by Class/Level</h2>

        <div className="border border-dashed border-blue-300 rounded-lg p-4 bg-blue-50 flex gap-3 mb-6">
          <Info className="text-blue-500 w-5 h-5 mt-1" />
          <p className="text-gray-700 text-sm">
            Choose how to calculate student positions — within a class arm (e.g. JSS 1A)
            or across the entire level (e.g. all JSS 1 classes).
          </p>
        </div>

        <div className="space-y-4">
          {/* Option 1 */}
          <div
            className={`flex items-start justify-between border rounded-lg p-4 cursor-pointer transition ${
              resultOption === "class"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-blue-300"
            }`}
            onClick={() => setResultOption("class")}
          >
            <div>
              <h3 className="font-semibold text-gray-800">Set Result Data by Class</h3>
              <p className="text-gray-600 text-sm">
                Calculate positions <span className="font-medium">within that class arm</span>.
              </p>
            </div>
            <input
              type="radio"
              checked={resultOption === "class"}
              onChange={() => setResultOption("class")}
              className="w-5 h-5 accent-blue-600"
            />
          </div>

          {/* Option 2 */}
          <div
            className={`flex items-start justify-between border rounded-lg p-4 cursor-pointer transition ${
              resultOption === "level"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-blue-300"
            }`}
            onClick={() => setResultOption("level")}
          >
            <div>
              <h3 className="font-semibold text-gray-800">Set Result Data by Level</h3>
              <p className="text-gray-600 text-sm">
                Calculate positions <span className="font-medium">across all classes in the level</span>.
              </p>
            </div>
            <input
              type="radio"
              checked={resultOption === "level"}
              onChange={() => setResultOption("level")}
              className="w-5 h-5 accent-blue-600"
            />
          </div>
        </div>
      </div>

      {/* --- Result Photo --- */}
      <div className="bg-white shadow rounded-xl p-6 mb-8">
        <h2 className="font-semibold text-lg text-gray-800 mb-4">Result Photo</h2>

        <div className="border border-dashed border-blue-300 rounded-lg p-4 bg-blue-50 flex gap-3 mb-6">
          <Info className="text-blue-500 w-5 h-5 mt-1" />
          <p className="text-gray-700 text-sm">
            Check this box to include student photos or placeholders in result design.
          </p>
        </div>

        <label
          className={`flex items-center justify-between border rounded-lg p-4 cursor-pointer transition ${
            photoOption ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300"
          }`}
        >
          <h3 className="font-semibold text-gray-800">Add Student Photo to Result</h3>
          <input
            type="checkbox"
            checked={photoOption}
            onChange={() => setPhotoOption(!photoOption)}
            className="w-5 h-5 accent-blue-600"
          />
        </label>
      </div>

      {/* --- Auto-Comment --- */}
      <div className="bg-white shadow rounded-xl p-6 mb-8">
        <h2 className="font-semibold text-lg text-gray-800 mb-4">Auto-Comment</h2>

        <div className="border border-dashed border-blue-300 rounded-lg p-4 bg-blue-50 flex gap-3 mb-6">
          <Info className="text-blue-500 w-5 h-5 mt-1" />
          <p className="text-gray-700 text-sm">
            Check this box to allow Auto-Comment to override previous comments.
          </p>
        </div>

        <label
          className={`flex items-center justify-between border rounded-lg p-4 cursor-pointer transition ${
            commentOption ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300"
          }`}
        >
          <h3 className="font-semibold text-gray-800">Allow Comments Override</h3>
          <input
            type="checkbox"
            checked={commentOption}
            onChange={() => setCommentOption(!commentOption)}
            className="w-5 h-5 accent-blue-600"
          />
        </label>
      </div>

      {/* --- Mastersheet --- */}
      <div className="bg-white shadow rounded-xl p-6 mb-8">
        <h2 className="font-semibold text-lg text-gray-800 mb-4">Mastersheet by Class/Level</h2>

        <div className="border border-dashed border-blue-300 rounded-lg p-4 bg-blue-50 flex gap-3 mb-6">
          <Info className="text-blue-500 w-5 h-5 mt-1" />
          <p className="text-gray-700 text-sm">
            Process student results either by class arm or by class level.
          </p>
        </div>

        <div className="space-y-4">
          {/* By Class */}
          <div
            className={`flex items-start justify-between border rounded-lg p-4 cursor-pointer transition ${
              mastersheetOption === "class"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-blue-300"
            }`}
            onClick={() => setMastersheetOption("class")}
          >
            <div>
              <h3 className="font-semibold text-gray-800">Set Mastersheet by Class</h3>
              <p className="text-gray-600 text-sm">Process within a single class arm (e.g., JSS 1A).</p>
            </div>
            <input
              type="radio"
              checked={mastersheetOption === "class"}
              onChange={() => setMastersheetOption("class")}
              className="w-5 h-5 accent-blue-600"
            />
          </div>

          {/* By Level */}
          <div
            className={`flex items-start justify-between border rounded-lg p-4 cursor-pointer transition ${
              mastersheetOption === "level"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-blue-300"
            }`}
            onClick={() => setMastersheetOption("level")}
          >
            <div>
              <h3 className="font-semibold text-gray-800">Set Mastersheet by Level</h3>
              <p className="text-gray-600 text-sm">Process across all classes in a level.</p>
            </div>
            <input
              type="radio"
              checked={mastersheetOption === "level"}
              onChange={() => setMastersheetOption("level")}
              className="w-5 h-5 accent-blue-600"
            />
          </div>
        </div>
      </div>

      {/* --- Admission Number Settings --- */}
      <div className="bg-white shadow rounded-xl p-6 mb-8">
        <h2 className="font-semibold text-lg text-gray-800 mb-4">Admission Number Settings</h2>

        <div className="space-y-4">
          {/* Normal */}
          <div
            className={`flex items-start justify-between border rounded-lg p-4 cursor-pointer transition ${
              admissionOption === "normal"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-blue-300"
            }`}
            onClick={() => setAdmissionOption("normal")}
          >
            <div>
              <h3 className="font-semibold text-gray-800">Normal</h3>
              <p className="text-gray-600 text-sm">
                Set admission number manually when creating a student.
              </p>
            </div>
            <input
              type="radio"
              checked={admissionOption === "normal"}
              onChange={() => setAdmissionOption("normal")}
              className="w-5 h-5 accent-blue-600"
            />
          </div>

          {/* Auto */}
          <div
            className={`flex items-start justify-between border rounded-lg p-4 cursor-pointer transition ${
              admissionOption === "auto"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-blue-300"
            }`}
            onClick={() => setAdmissionOption("auto")}
          >
            <div>
              <h3 className="font-semibold text-gray-800">Auto Generation</h3>
              <p className="text-gray-600 text-sm">
                System generates admission numbers using predefined prefix.
              </p>
              <p className="text-gray-600 text-sm font-medium">Prefix: ATESS/</p>
            </div>
            <input
              type="radio"
              checked={admissionOption === "auto"}
              onChange={() => setAdmissionOption("auto")}
              className="w-5 h-5 accent-blue-600"
            />
          </div>

          {/* Custom */}
          <div
            className={`flex items-start justify-between border rounded-lg p-4 cursor-pointer transition ${
              admissionOption === "custom"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-blue-300"
            }`}
            onClick={() => setAdmissionOption("custom")}
          >
            <div>
              <h3 className="font-semibold text-gray-800">Custom</h3>
              <p className="text-gray-600 text-sm">
                Define your own custom admission number format.
              </p>
            </div>
            <input
              type="radio"
              checked={admissionOption === "custom"}
              onChange={() => setAdmissionOption("custom")}
              className="w-5 h-5 accent-blue-600"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-8">
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default Result;
