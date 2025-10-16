import React, { useState, useEffect } from "react";
import { ArrowUp, ArrowDown, X } from "lucide-react";

interface Comment {
  id: number;
  lowerLimit: string;
  upperLimit: string;
  comment: string;
  category: string;
  school: string;
}

const CommentSetup: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [selectedClass, setSelectedClass] = useState("Form Teacher");
  const [selectedSchool, setSelectedSchool] = useState("Junior School");

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | null>(null);
  const [currentComment, setCurrentComment] = useState<Comment | null>(null);

  const [lowerScoreLimit, setLowerScoreLimit] = useState("");
  const [upperScoreLimit, setUpperScoreLimit] = useState("");
  const [formTeacherComment, setFormTeacherComment] = useState("");

  const classOptions = ["Form Teacher", "Hostel Supervisor", "Principal"];
  const schoolOptions = ["Junior School", "Senior School", "Nursery", "Primary"];

  // --- Load from localStorage on mount ---
  useEffect(() => {
    const stored = localStorage.getItem("comments");
    if (stored) {
      setComments(JSON.parse(stored));
    }
  }, []);

  // --- Persist to localStorage whenever comments change ---
  useEffect(() => {
    localStorage.setItem("comments", JSON.stringify(comments));
  }, [comments]);

  const filteredComments = comments.filter(
    (c) => c.category === selectedClass && c.school === selectedSchool
  );

  const handleAddNew = () => {
    setModalMode("add");
    setLowerScoreLimit("");
    setUpperScoreLimit("");
    setFormTeacherComment("");
    setShowModal(true);
  };

  const handleEdit = (comment: Comment) => {
    setModalMode("edit");
    setCurrentComment(comment);
    setLowerScoreLimit(comment.lowerLimit);
    setUpperScoreLimit(comment.upperLimit);
    setFormTeacherComment(comment.comment);
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this comment?")) {
      setComments(comments.filter((c) => c.id !== id));
    }
  };

  const handleSave = () => {
    if (!lowerScoreLimit || !upperScoreLimit || !formTeacherComment.trim()) {
      alert("Please fill in all fields.");
      return;
    }

    if (modalMode === "add") {
      const newComment: Comment = {
        id: Date.now(),
        lowerLimit: lowerScoreLimit,
        upperLimit: upperScoreLimit,
        comment: formTeacherComment,
        category: selectedClass,
        school: selectedSchool,
      };
      setComments([...comments, newComment]);
    } else if (modalMode === "edit" && currentComment) {
      setComments(
        comments.map((c) =>
          c.id === currentComment.id
            ? {
                ...c,
                lowerLimit: lowerScoreLimit,
                upperLimit: upperScoreLimit,
                comment: formTeacherComment,
              }
            : c
        )
      );
    }

    setShowModal(false);
  };

  const handleReorder = (index: number, direction: "up" | "down") => {
    const filtered = [...filteredComments];
    const globalComments = [...comments];
    const filteredIndexes = comments
      .map((c, i) => (c.category === selectedClass && c.school === selectedSchool ? i : -1))
      .filter((i) => i !== -1);

    if (direction === "up" && index > 0) {
      const temp = filtered[index - 1];
      filtered[index - 1] = filtered[index];
      filtered[index] = temp;
    } else if (direction === "down" && index < filtered.length - 1) {
      const temp = filtered[index + 1];
      filtered[index + 1] = filtered[index];
      filtered[index] = temp;
    }

    filtered.forEach((f, i) => {
      globalComments[filteredIndexes[i]] = f;
    });

    setComments(globalComments);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b p-6 gap-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Comment Entry Setup
            </h2>

            {/* School Dropdown */}
            <select
              value={selectedSchool}
              onChange={(e) => setSelectedSchool(e.target.value)}
              className="border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {schoolOptions.map((school) => (
                <option key={school} value={school}>
                  {school}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {classOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
            <button
              onClick={handleAddNew}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-5 py-2 rounded-lg transition"
            >
              Add New Comment
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-700">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 font-medium">#</th>
                <th className="px-6 py-4 font-medium">Lower Limit</th>
                <th className="px-6 py-4 font-medium">Upper Limit</th>
                <th className="px-6 py-4 font-medium">Comment</th>
                <th className="px-6 py-4 font-medium text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredComments.map((comment, index) => (
                <tr
                  key={comment.id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-4 text-center font-medium">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4">{comment.lowerLimit}</td>
                  <td className="px-6 py-4">{comment.upperLimit}</td>
                  <td className="px-6 py-4">{comment.comment}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 justify-center">
                      <button
                        onClick={() => handleReorder(index, "up")}
                        className="p-1 rounded hover:bg-gray-100"
                      >
                        <ArrowUp className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleReorder(index, "down")}
                        className="p-1 rounded hover:bg-gray-100"
                      >
                        <ArrowDown className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleEdit(comment)}
                        className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded text-sm font-medium transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="bg-red-100 text-red-600 hover:bg-red-200 px-3 py-1 rounded text-sm font-medium transition"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredComments.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-8 text-gray-400 font-medium"
                  >
                    No comments available for this category and school
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {modalMode === "add"
                ? "Add New Comment Entry"
                : "Edit Comment Entry"}
            </h3>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">
                  Lower Score Limit
                </label>
                <input
                  type="text"
                  value={lowerScoreLimit}
                  onChange={(e) => setLowerScoreLimit(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Enter lower score limit"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-1 block">
                  Upper Score Limit
                </label>
                <input
                  type="text"
                  value={upperScoreLimit}
                  onChange={(e) => setUpperScoreLimit(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Enter upper score limit"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-1 block">
                  Comment
                </label>
                <input
                  type="text"
                  value={formTeacherComment}
                  onChange={(e) => setFormTeacherComment(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Enter comment"
                />
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentSetup;
