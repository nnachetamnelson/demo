import React, { useState, useEffect } from "react";
import { Plus, CalendarDays, X, Edit2, Trash2 } from "lucide-react";

interface Term {
  term: string;
  startDate: string;
  endDate: string;
  weeks: string;
}

interface Session {
  session: string;
  terms: Term[];
}

const Session: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([
    {
      session: "2024/2025",
      terms: [
        { term: "First Term", startDate: "2024-09-10", endDate: "2024-12-15", weeks: "14" },
      ],
    },
  ]);

  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showTermModal, setShowTermModal] = useState(false);

  const [sessionForm, setSessionForm] = useState({ session: "" });
  const [termForm, setTermForm] = useState<Term>({ term: "", startDate: "", endDate: "", weeks: "" });

  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<"addSession" | "editSession" | "addTerm" | "editTerm" | null>(null);

  const termOptions = ["First Term", "Second Term", "Third Term"];

  const toggleSession = (session: string) => {
    setExpandedSession(expandedSession === session ? null : session);
  };

  // ---------- SESSION HANDLERS ----------
  const openAddSession = () => {
    setSessionForm({ session: "" });
    setEditMode("addSession");
    setShowSessionModal(true);
  };

  const openEditSession = (session: string) => {
    setSessionForm({ session });
    setCurrentSession(session);
    setEditMode("editSession");
    setShowSessionModal(true);
  };

  const saveSession = () => {
    if (!sessionForm.session.trim()) return alert("Session name required");

    if (editMode === "addSession") {
      setSessions([...sessions, { session: sessionForm.session, terms: [] }]);
    } else if (editMode === "editSession" && currentSession) {
      setSessions((prev) =>
        prev.map((s) => (s.session === currentSession ? { ...s, session: sessionForm.session } : s))
      );
    }

    setShowSessionModal(false);
    setSessionForm({ session: "" });
  };

  const deleteSession = (sessionName: string) => {
    if (window.confirm(`Delete session "${sessionName}" and all its terms?`)) {
      setSessions((prev) => prev.filter((s) => s.session !== sessionName));
    }
  };

  // ---------- TERM HANDLERS ----------
  const openAddTerm = (session: string) => {
    setCurrentSession(session);
    setTermForm({ term: "", startDate: "", endDate: "", weeks: "" });
    setEditMode("addTerm");
    setShowTermModal(true);
  };

  const openEditTerm = (session: string, term: Term) => {
    setCurrentSession(session);
    setTermForm(term);
    setEditMode("editTerm");
    setShowTermModal(true);
  };

  const saveTerm = () => {
    if (!termForm.term || !termForm.startDate || !termForm.endDate)
      return alert("Please fill all term fields");

    setSessions((prev) =>
      prev.map((s) => {
        if (s.session !== currentSession) return s;

        if (editMode === "addTerm") {
          return { ...s, terms: [...s.terms, termForm] };
        }

        if (editMode === "editTerm") {
          return {
            ...s,
            terms: s.terms.map((t) => (t.term === termForm.term ? termForm : t)),
          };
        }

        return s;
      })
    );

    setShowTermModal(false);
    setTermForm({ term: "", startDate: "", endDate: "", weeks: "" });
  };

  const deleteTerm = (sessionName: string, termName: string) => {
    if (window.confirm(`Delete term "${termName}" from session "${sessionName}"?`)) {
      setSessions((prev) =>
        prev.map((s) =>
          s.session === sessionName ? { ...s, terms: s.terms.filter((t) => t.term !== termName) } : s
        )
      );
    }
  };

  // ---------- DYNAMIC WEEK CALCULATION ----------
  useEffect(() => {
    if (termForm.startDate && termForm.endDate) {
      const start = new Date(termForm.startDate);
      const end = new Date(termForm.endDate);
      const diffInMs = end.getTime() - start.getTime();
      const diffInWeeks = Math.ceil(diffInMs / (1000 * 60 * 60 * 24 * 7));
      if (diffInWeeks > 0) {
        setTermForm((prev) => ({ ...prev, weeks: diffInWeeks.toString() }));
      }
    }
  }, [termForm.startDate, termForm.endDate]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Promotion Settings</h2>
        <button
          onClick={openAddSession}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Plus className="w-4 h-4" /> New Session
        </button>
      </div>

      {/* --- SESSION LIST --- */}
      {sessions.map((s, index) => (
        <div key={index} className="mb-5 bg-white border rounded-xl shadow-sm">
          <div className="flex justify-between items-center px-5 py-3">
            <button
              onClick={() => toggleSession(s.session)}
              className="flex-1 text-left font-semibold text-gray-700 hover:text-blue-600"
            >
              {s.session}
            </button>

            <div className="flex gap-3">
              <button onClick={() => openEditSession(s.session)} className="text-blue-600 hover:text-blue-800">
                <Edit2 className="w-4 h-4" />
              </button>
              <button onClick={() => deleteSession(s.session)} className="text-red-600 hover:text-red-800">
                <Trash2 className="w-4 h-4" />
              </button>
              <CalendarDays className="w-5 h-5 text-gray-500" />
            </div>
          </div>

          {expandedSession === s.session && (
            <div className="p-5 border-t">
              <table className="w-full text-left border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-3 border">Term</th>
                    <th className="p-3 border">Start Date</th>
                    <th className="p-3 border">End Date</th>
                    <th className="p-3 border">Weeks</th>
                    <th className="p-3 border text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {s.terms.map((term, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="p-3 border">{term.term}</td>
                      <td className="p-3 border">{term.startDate}</td>
                      <td className="p-3 border">{term.endDate}</td>
                      <td className="p-3 border text-center">{term.weeks}</td>
                      <td className="p-3 border text-center flex justify-center gap-3">
                        <button
                          onClick={() => openEditTerm(s.session, term)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteTerm(s.session, term.term)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <button
                onClick={() => openAddTerm(s.session)}
                className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" /> Add New Term
              </button>
            </div>
          )}
        </div>
      ))}

      {/* --- TERM MODAL --- */}
      {showTermModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                {editMode === "addTerm" ? "Add New Term" : "Edit Term"}
              </h3>
              <button onClick={() => setShowTermModal(false)}>
                <X className="w-5 h-5 text-gray-600 hover:text-gray-800" />
              </button>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Term Name</label>
              <select
                value={termForm.term}
                onChange={(e) => setTermForm({ ...termForm, term: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Select Term</option>
                {termOptions
                  .filter(
                    (t) =>
                      editMode === "editTerm" ||
                      !sessions
                        .find((s) => s.session === currentSession)
                        ?.terms.some((existingTerm) => existingTerm.term === t)
                  )
                  .map((t, idx) => (
                    <option key={idx} value={t}>
                      {t}
                    </option>
                  ))}
              </select>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Date</label>
                  <input
                    type="date"
                    value={termForm.startDate}
                    onChange={(e) => setTermForm({ ...termForm, startDate: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Date</label>
                  <input
                    type="date"
                    value={termForm.endDate}
                    onChange={(e) => setTermForm({ ...termForm, endDate: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {termForm.weeks && (
                <p className="text-sm text-gray-600">
                  Duration: <span className="font-medium">{termForm.weeks} weeks</span>
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowTermModal(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={saveTerm}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Session;
