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
        let items = [];
        let totalExclGST = 0;

        for (let sheetIndex = 0; sheetIndex < workbook.SheetNames.length; sheetIndex++) {
          const sheetName = workbook.SheetNames[sheetIndex];
          const worksheet = workbook.Sheets[sheetName];
          const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          let started = false;
          let colMap = { slNo: 0, desc: 1, hsn: -1, qty: 3, rate: 4, amount: 5, gst: 6, width: -1, height: -1 };
          let headerCols = [];
          
          let sheetItems = [];
          let sheetTotalGST = 0;

          for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            if (!row || row.length === 0) continue;

            if (!started) {
              for(let j = 0; j < row.length; j++) {
                if (row[j] !== undefined && row[j] !== null) {
                  const val = String(row[j]).trim().toLowerCase();
                  if (val) {
                    if (!headerCols[j]) headerCols[j] = "";
                    headerCols[j] += " " + val;
                  }
                }
              }

              let tempColMap = { slNo: -1, desc: -1, hsn: -1, qty: -1, rate: -1, amount: -1, gst: -1, width: -1, height: -1 };

              headerCols.forEach((colName, index) => {
                if (!colName) return;
                if (colName.includes("sl") || colName.includes("s.no") || colName.includes("serial") || colName.includes("sr no") || colName.includes("sr.") || colName.includes("sn") || colName === "#" || colName === "no" || colName === "no.") { tempColMap.slNo = index; return; }
                if (colName.includes("particular") || colName.includes("description") || colName.includes("work") || colName.includes("item") || colName.includes("detail") || colName.includes("spec") || colName.includes("product") || colName.includes("material") || colName.includes("name")) { tempColMap.desc = index; return; }
                if (colName.includes("hsn") || colName.includes("sac")) { tempColMap.hsn = index; return; }
                if (colName.includes("qty") || colName.includes("quantity") || colName.includes("area") || colName.includes("sqf") || colName.includes("nos") || colName.includes("unit") || colName.includes("vol")) { tempColMap.qty = index; return; }
                if (colName.includes("rate") || colName.includes("price") || colName.includes("cost per") || colName.includes("cost/sqft") || colName === "cost") { tempColMap.rate = index; return; }
                if ((colName.includes("amount") || colName.includes("amt") || colName.includes("total") || colName.includes("sum") || colName.includes("value")) && !colName.includes("gst") && !colName.includes("area")) { tempColMap.amount = index; return; }
                if ((colName.includes("gst") || colName.includes("tax")) && !colName.includes("amount") && !colName.includes("amt") && !colName.includes("total")) { tempColMap.gst = index; return; }
                if (colName === "w" || colName === "b" || colName.includes("width") || colName.includes("breadth")) { tempColMap.width = index; return; }
                if (colName === "h" || colName === "l" || colName.includes("height") || colName.includes("length") || colName.includes("depth")) { tempColMap.height = index; return; }
              });

              if (tempColMap.desc >= 0 && (tempColMap.amount >= 0 || tempColMap.rate >= 0) && tempColMap.desc !== tempColMap.amount && tempColMap.desc !== tempColMap.rate) {
                let distinctIndices = new Set(Object.values(tempColMap).filter(v => v >= 0));
                if (distinctIndices.size >= 2) {
                  colMap = tempColMap;
                  started = true;
                }
              }
              continue;
            }

            if (started) {
              let slNoVal = colMap.slNo >= 0 && row[colMap.slNo] !== undefined && row[colMap.slNo] !== null ? String(row[colMap.slNo]).trim() : "";
              let descVal = colMap.desc >= 0 && row[colMap.desc] !== undefined && row[colMap.desc] !== null ? String(row[colMap.desc]).trim() : "";
              
              let extraDesc = "";
              for(let c = 0; c < colMap.desc; c++) {
                if (c !== colMap.slNo && row[c] !== undefined && row[c] !== null && String(row[c]).trim() !== "") {
                  extraDesc = String(row[c]).trim();
                  break;
                }
              }

              if (extraDesc && !descVal) {
                descVal = extraDesc;
                extraDesc = ""; 
              } else if (extraDesc && descVal) {
                descVal = extraDesc + " - " + descVal;
                extraDesc = "";
              }
              
              if (descVal && !descVal.toLowerCase().includes("sub total") && !descVal.toLowerCase().includes("grand total") && !descVal.toLowerCase().includes("tax") && !descVal.toLowerCase().startsWith("total")) {
                
                if (extraDesc && !extraDesc.toLowerCase().includes("total") && !extraDesc.toLowerCase().includes("tax")) {
                  sheetItems.push({
                    id: Date.now() + Math.random(),
                    slNo: slNoVal,
                    description: extraDesc,
                    hsn: "", gst: "", width: 0, height: 0, area: 0, costPerSqft: 0, totalCost: 0
                  });
                  slNoVal = ""; 
                }
                
                let hsn = colMap.hsn >= 0 && row[colMap.hsn] !== undefined && row[colMap.hsn] !== null ? String(row[colMap.hsn]).trim() : "9403";
                if (!hsn) hsn = "9403";
                
                const parseNumber = (val) => {
                  if (typeof val === 'number') return val;
                  if (!val) return 0;
                  const cleaned = String(val).replace(/,/g, '').replace(/[^\d.-]/g, '');
                  return parseFloat(cleaned) || 0;
                };

                const qty = parseNumber(row[colMap.qty]);
                const rate = parseNumber(row[colMap.rate]);
                let amount = parseNumber(row[colMap.amount]);
                const width = colMap.width >= 0 ? parseNumber(row[colMap.width]) : 0;
                const height = colMap.height >= 0 ? parseNumber(row[colMap.height]) : 0;
                
                let gstVal = "18%";
                if (colMap.gst >= 0 && row[colMap.gst] !== undefined && row[colMap.gst] !== null) {
                  let rawGst = String(row[colMap.gst]).trim();
                  if (rawGst) {
                    let parsedGst = parseFloat(rawGst);
                    if (!isNaN(parsedGst) && !rawGst.includes("%")) {
                      if (parsedGst < 1) gstVal = `${parsedGst * 100}%`;
                      else gstVal = `${parsedGst}%`;
                    } else {
                      gstVal = rawGst;
                    }
                  }
                }

                const itemTotal = amount > 0 ? amount : parseFloat((qty * rate).toFixed(2));
                
                sheetItems.push({
                  id: Date.now() + Math.random(),
                  slNo: slNoVal,
                  description: descVal,
                  hsn: hsn,
                  gst: gstVal,
                  width: width,
                  height: height,
                  area: qty,
                  costPerSqft: rate,
                  totalCost: itemTotal
                });

                sheetTotalGST += itemTotal;
              }
            }
          }

          if (sheetItems.length === 0) {
            for (let i = 0; i < rows.length; i++) {
              const row = rows[i];
              if (!row || row.length === 0) continue;
              
              let desc = "";
              let extraStr = "";
              let nums = [];
              
              for (let j = 0; j < row.length; j++) {
                if (row[j] !== undefined && row[j] !== null) {
                  const val = row[j];
                  const parsed = parseFloat(String(val).replace(/,/g, '').replace(/[^\d.-]/g, ''));
                  if (typeof val === 'string' && isNaN(Number(val)) && val.trim().length > 1) {
                    if (!desc) desc = val.trim();
                    else if (!extraStr) extraStr = val.trim();
                  } else if (!isNaN(parsed) && String(val).trim() !== "") {
                    nums.push(parsed);
                  }
                }
              }
              
              if (desc && !desc.toLowerCase().includes("total") && !desc.toLowerCase().includes("tax")) {
                if (nums.length >= 2) {
                  let qty = 1, rate = 0, amount = 0;
                  if (nums.length >= 3) {
                    qty = nums[nums.length - 3];
                    rate = nums[nums.length - 2];
                    amount = nums[nums.length - 1];
                  } else if (nums.length === 2) {
                    rate = nums[0];
                    amount = nums[1];
                  }
                  
                  const itemTotal = amount > 0 ? amount : parseFloat((qty * rate).toFixed(2));
                  let finalDesc = desc;
                  if (extraStr && extraStr.length > 1) finalDesc = desc + " - " + extraStr;
                  
                  sheetItems.push({
                    id: Date.now() + Math.random(),
                    slNo: "",
                    description: finalDesc,
                    hsn: "9403",
                    gst: "18%",
                    width: 0, height: 0,
                    area: qty,
                    costPerSqft: rate,
                    totalCost: itemTotal
                  });
                  sheetTotalGST += itemTotal;
                }
              }
            }
          }
          
          if (sheetItems.length > 0) {
            // Include sheet name as a category header if there are multiple sheets
            if (workbook.SheetNames.length > 1) {
              items.push({
                id: Date.now() + Math.random(),
                slNo: "",
                description: `--- ${sheetName.toUpperCase()} ---`,
                hsn: "", gst: "", width: 0, height: 0, area: 0, costPerSqft: 0, totalCost: 0
              });
            }
            items = items.concat(sheetItems);
            totalExclGST += sheetTotalGST;
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
              accept=".xlsx, .xls, .csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
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
                <p style={{ margin: 0, fontSize: 12, color: "#94A3B8", marginTop: 4 }}>Supports all Excel formats (.xlsx, .xls, .csv)</p>
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
