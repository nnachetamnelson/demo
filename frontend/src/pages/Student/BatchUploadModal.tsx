import React, { useState } from "react";
import { X, Upload } from "lucide-react";
import Papa from "papaparse";
import ExcelJS from "exceljs";

interface BatchUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (records: any[]) => void;
}

const BatchUploadModal: React.FC<BatchUploadModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [records, setRecords] = useState<any[]>([]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split(".").pop()?.toLowerCase();

    if (ext === "csv") {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => setRecords(results.data),
      });
    } else if (ext === "xlsx") {
      try {
        const reader = new FileReader();
        reader.onload = async (evt) => {
          const data = evt.target?.result as ArrayBuffer;
          const workbook = new ExcelJS.Workbook();
          await workbook.xlsx.load(data);

          const sheet = workbook.worksheets[0];
          const parsed: any[] = [];

          sheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return; // Skip header
            const rowData: any = {};
            sheet.getRow(1).eachCell((cell, colNumber) => {
              const key = (cell.value || "").toString().trim();
              rowData[key] = row.getCell(colNumber).value || "";
            });
            parsed.push(rowData);
          });

          setRecords(parsed);
        };
        reader.readAsArrayBuffer(file);
      } catch (error) {
        alert("Failed to parse Excel file.");
        console.error(error);
      }
    } else {
      alert("Please upload a CSV or Excel file only.");
    }
  };

  const handleClose = () => {
    setRecords([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl p-6 relative">
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
        >
          <X size={20} />
        </button>

        <h2 className="text-lg font-semibold mb-4">Batch Upload Students</h2>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-4">
          <Upload size={32} className="mx-auto mb-3 text-gray-500" />
          <p className="text-gray-600 mb-2">Upload CSV or Excel File</p>
          <input
            type="file"
            accept=".csv, .xlsx"
            onChange={handleFileUpload}
            className="cursor-pointer"
          />
        </div>

        {records.length > 0 && (
          <>
            <p className="text-gray-500 text-sm mb-2">
              Showing first 10 of {records.length} records
            </p>
            <div className="max-h-64 overflow-y-auto border rounded-md mb-4">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100 text-gray-700 sticky top-0">
                  <tr>
                    {Object.keys(records[0]).map((key) => (
                      <th key={key} className="py-2 px-3 text-left">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {records.slice(0, 10).map((row, i) => (
                    <tr key={i} className="border-t text-gray-600">
                      {Object.values(row).map((val, j) => (
                        <td key={j} className="py-2 px-3">
                          {val as string}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={() => onSave(records)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
            >
              Save All Records
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default BatchUploadModal;
