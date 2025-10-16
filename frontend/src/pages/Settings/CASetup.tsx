import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

const CASetup: React.FC = () => {
  const [category, setCategory] = useState("Junior School");
  const [caSettings, setCaSettings] = useState([
    { id: 1, enabled: true, caption: "CA 1", score: 20 },
    { id: 2, enabled: true, caption: "CA 2", score: 10 },
    { id: 3, enabled: false, caption: "CA 3", score: 0 },
    { id: 4, enabled: false, caption: "CA 4", score: 0 },
    { id: 5, enabled: false, caption: "CA 5", score: 0 },
  ]);
  const [examScore, setExamScore] = useState<number>(70);
  const [totalScore, setTotalScore] = useState<number>(0);

  // Calculate total score dynamically
  useEffect(() => {
    const totalCA = caSettings
      .filter((ca) => ca.enabled)
      .reduce((sum, ca) => sum + Number(ca.score || 0), 0);
    setTotalScore(totalCA + Number(examScore || 0));
  }, [caSettings, examScore]);

  const handleToggle = (id: number) => {
    setCaSettings((prev) =>
      prev.map((ca) =>
        ca.id === id ? { ...ca, enabled: !ca.enabled } : ca
      )
    );
  };

  const handleChange = (id: number, field: string, value: string | number) => {
    setCaSettings((prev) =>
      prev.map((ca) =>
        ca.id === id ? { ...ca, [field]: value } : ca
      )
    );
  };

  const handleSave = () => {
    console.log("Submitted CA Setup:", {
      category,
      caSettings,
      examScore,
      totalScore,
    });
    alert("CA Setup saved successfully!");
  };

  return (
    <Card className="p-6 bg-white rounded-2xl shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">CA Setup</h2>

        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Senior School">Senior School</SelectItem>
            <SelectItem value="Junior School">Junior School</SelectItem>
            <SelectItem value="Primary School">Primary School</SelectItem>
            <SelectItem value="Nursery School">Nursery School</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-3 font-semibold text-sm border-b py-2">
        <div>Enable</div>
        <div>CA Caption</div>
        <div>Max Score</div>
      </div>

      {/* CA Settings */}
      {caSettings.map((ca) => (
        <div
          key={ca.id}
          className="grid grid-cols-3 items-center py-3 border-b last:border-none"
        >
          <div>
            <Switch
              checked={ca.enabled}
              onCheckedChange={() => handleToggle(ca.id)}
            />
          </div>

          <div>
            <Input
              type="text"
              value={ca.caption}
              disabled={!ca.enabled}
              onChange={(e) =>
                handleChange(ca.id, "caption", e.target.value)
              }
              className={`w-full ${!ca.enabled ? "bg-gray-100" : ""}`}
            />
          </div>

          <div>
            <Input
              type="number"
              value={ca.score}
              disabled={!ca.enabled}
              onChange={(e) =>
                handleChange(ca.id, "score", Number(e.target.value))
              }
              className={`w-full ${!ca.enabled ? "bg-gray-100" : ""}`}
            />
          </div>
        </div>
      ))}

      {/* Exam Score Input */}
      <div className="flex justify-between items-center mt-6 border-t pt-4">
        <label className="font-semibold text-sm">Exam Score:</label>
        <Input
          type="number"
          value={examScore}
          onChange={(e) => setExamScore(Number(e.target.value))}
          className="w-32"
        />
      </div>

      {/* Total Score Display */}
      <div className="flex justify-between items-center mt-3">
        <label className="font-semibold text-sm">Total Score:</label>
        <Input
          type="number"
          value={totalScore}
          readOnly
          className="w-32 bg-gray-100"
        />
      </div>

      {/* Save Button */}
      <div className="flex justify-end mt-6">
        <button
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
        >
          Save Changes
        </button>
      </div>
    </Card>
  );
};

export default CASetup;
