import React, { useState, useRef } from "react";
import { Upload, X, FileText } from "lucide-react";
import * as XLSX from "xlsx";

export default function UploadExcelModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    quoteNo: "",
    quoteDate: new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    customer: "",
  });
  const [file, setFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState(null);
  const fileRef = useRef(null);

  const iStyle = {
    width: "100%",
    padding: "9px 12px",
    border: "1px solid #E2E8F0",
    borderRadius: 8,
    fontSize: 13,
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
  };

  const handleProcess = async () => {
    if (!form.quoteNo || !form.customer) {
      setError("Quote No. and Customer Name are required.");
      return;
    }
    if (!file) {
      setError("Please select an Excel file.");
      return;
    }

    setParsing(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert sheet to JSON array of arrays
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        let items = [];
        let totalExclGST = 0;
        let started = false;

        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          if (!row || row.length === 0) continue;

          const slNoVal = row[0] !== undefined ? String(row[0]).trim() : "";
          const descVal = row[1] !== undefined ? String(row[1]).trim() : "";
          
          if (descVal.toLowerCase() === "description") {
            started = true;
            continue;
          }

          if (started && descVal) {
            let hsn = row[2] !== undefined ? String(row[2]).trim() : "9403";
            if (!hsn) hsn = "9403";
            
            // Quantity might be in col 4, Rate in 5, Amount in 6
            const qty = parseFloat(row[4]) || 0;
            const rate = parseFloat(row[5]) || 0;
            const amount = parseFloat(row[6]) || 0;

            const itemTotal = amount > 0 ? amount : parseFloat((qty * rate).toFixed(2));
            
            items.push({
              slNo: slNoVal,
              description: descVal,
              hsn: hsn,
              gst: "18%",
              width: 0,
              height: 0,
              area: qty,
              costPerSqft: rate,
              totalCost: itemTotal
            });

            totalExclGST += itemTotal;
          }
        }

        if (items.length === 0) {
          throw new Error("No valid items found. Please check the Excel format.");
        }

        const totalInclGST = parseFloat((totalExclGST * 1.18).toFixed(2));

        onSave({
          ...form,
          items,
          totalExclGST,
          totalInclGST
        });
        
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to parse Excel file.");
        setParsing(false);
      }
    };
    
    reader.onerror = () => {
      setError("Error reading file.");
      setParsing(false);
    };

    reader.readAsBinaryString(file);
  };

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        zIndex: 150,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          width: "100%",
          maxWidth: 500,
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          overflow: "hidden"
        }}
      >
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #E2E8F0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#fff",
          }}
        >
          <h2
            style={{
              fontSize: 18,
              fontWeight: 600,
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Upload size={18} color="#6366F1" /> Upload Excel BOQ
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "#F1F5F9",
              border: "none",
              cursor: "pointer",
              width: 32,
              height: 32,
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={16} />
          </button>
        </div>
        
        <div style={{ padding: "20px 24px" }}>
          {error && (
            <div style={{ padding: 12, background: "#FEF2F2", color: "#EF4444", borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
              {error}
            </div>
          )}
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, color: "#64748B", marginBottom: 5, fontWeight: 500 }}>
                Quote No. *
              </label>
              <input
                style={iStyle}
                placeholder="e.g. 360"
                value={form.quoteNo}
                onChange={(e) => setForm(p => ({ ...p, quoteNo: e.target.value }))}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, color: "#64748B", marginBottom: 5, fontWeight: 500 }}>
                Quote Date
              </label>
              <input
                style={iStyle}
                value={form.quoteDate}
                onChange={(e) => setForm(p => ({ ...p, quoteDate: e.target.value }))}
              />
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              <label style={{ display: "block", fontSize: 12, color: "#64748B", marginBottom: 5, fontWeight: 500 }}>
                Customer Name *
              </label>
              <input
                style={iStyle}
                placeholder="Customer name"
                value={form.customer}
                onChange={(e) => setForm(p => ({ ...p, customer: e.target.value }))}
              />
            </div>
          </div>

          <div
            onClick={() => fileRef.current?.click()}
            style={{
              border: "2px dashed #CBD5E1",
              borderRadius: 10,
              padding: "30px 20px",
              textAlign: "center",
              cursor: "pointer",
              background: file ? "#F0FDF4" : "#F8FAFC",
              transition: "all 0.2s",
              marginBottom: 20
            }}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx, .xls"
              style={{ display: "none" }}
              onChange={(e) => setFile(e.target.files[0])}
            />
            {file ? (
              <div>
                <FileText size={28} color="#22C55E" style={{ margin: "0 auto 8px" }} />
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#166534" }}>{file.name}</p>
                <p style={{ margin: 0, fontSize: 12, color: "#22C55E", marginTop: 4 }}>Click to change file</p>
              </div>
            ) : (
              <div>
                <Upload size={28} color="#94A3B8" style={{ margin: "0 auto 8px" }} />
                <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: "#475569" }}>Click to select Excel file</p>
                <p style={{ margin: 0, fontSize: 12, color: "#94A3B8", marginTop: 4 }}>Supports .xlsx, .xls</p>
              </div>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button
              onClick={onClose}
              disabled={parsing}
              style={{
                padding: "9px 18px",
                border: "1px solid #E2E8F0",
                borderRadius: 8,
                background: "none",
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleProcess}
              disabled={parsing}
              style={{
                padding: "9px 20px",
                background: "#6366F1",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                cursor: parsing ? "not-allowed" : "pointer",
                fontSize: 14,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 8
              }}
            >
              {parsing ? "Processing..." : "Generate & Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
