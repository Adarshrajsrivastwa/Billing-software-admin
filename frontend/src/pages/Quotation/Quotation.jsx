import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import {
  FileText,
  Plus,
  Trash2,
  X,
  CheckCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Search,
  Calendar,
  User,
  IndianRupee,
  Receipt,
  Download,
  Settings,
  Upload,
} from "lucide-react";
import {
  getQuotations,
  createQuotation,
  updateQuotation,
  deleteQuotation,
} from "../../services/quotations";
import UploadExcelModal from "./UploadExcelModal";

// ─── Default Company Settings ─────────────────────────────
const DEFAULT_COMPANY = {
  name: "S2 URBAN GAZE INTERIORS",
  address:
    "2ND FLOOR, NO.203, PLATINUM\nCITY APARTMENT, HMT MAIN ROAD,\nNEAR PEENYA METRO STATION",
  bank: "272305500751",
  accountHolder: "S2 URBAN GAZE INTERIORS",
  ifsc: "ICIC0001721",
  upi: "s2urbangazeinteriors.ibz@icici",
  qrDataUrl: "/upi_qr_code.png",
  sigDataUrl: "/signature_seal.png",
};

const initialQuotations = [
  {
    id: "QUO359",
    quoteNo: "359",
    quoteDate: "27-May-2026",
    customer: "Hazaribagh",
    totalExclGST: 1588571,
    totalInclGST: 1874513.78,
    items: [
      {
        id: 1,
        slNo: "1.1",
        description:
          "Kitchen Work: Providing and fixing of 18mm th. BWP ply (make: century sainik) for Base units and shutter finished in 1mm thick Laminate. (and in side .8 laminate make Marino) with ebco fitting laminate below 2800 cost. (2mm Edge band make Rehu) with factory finishing with C - profile handle.",
        hsn: "9403",
        gst: "18%",
        width: 13.5,
        height: 2.8,
        area: 37.8,
        costPerSqft: 1850,
        totalCost: 69930,
      },
      {
        id: 2,
        slNo: "1.2",
        description:
          "Kitchen Work: Providing and fixing of 18mm th. BWP ply for Base units and shutter finished in 1mm th. Laminate with ebco fitting and C - profile handle.",
        hsn: "9403",
        gst: "18%",
        width: 8,
        height: 2.8,
        area: 22.4,
        costPerSqft: 1850,
        totalCost: 41440,
      },
      {
        id: 3,
        slNo: "1.3",
        description:
          "Kitchen Top: Providing and fixing of 18mm korj stone for slab with double nosing at the edges with sink cutting and all accessories company make Kalinga stone.",
        hsn: "9403",
        gst: "18%",
        width: 2,
        height: 8,
        area: 16,
        costPerSqft: 1400,
        totalCost: 22400,
      },
      {
        id: 4,
        slNo: "1.4",
        description:
          "Providing and fixing of 18mm MR grade ply for Wall unit with shutter finished in 1mm thick and inside .8 laminate with ebco fitting and profile concealed light (3000k) make GM laminate below 2800 (2mm h band make Rehu).",
        hsn: "9403",
        gst: "18%",
        width: 9,
        height: 2,
        area: 18,
        costPerSqft: 1550,
        totalCost: 27900,
      },
    ],
  },
];

const fmt = (n) =>
  "Rs." + Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2 });
const fmtINR = (n) =>
  "₹" + Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2 });
const calcArea = (w, h) => parseFloat((+w * +h).toFixed(2));
const calcTotal = (area, cost) => parseFloat((+area * +cost).toFixed(2));

// ─── Toast ────────────────────────────────────────────────
function Toast({ toasts }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        zIndex: 999,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            background:
              t.type === "success"
                ? "#059669"
                : t.type === "error"
                  ? "#EF4444"
                  : "#F59E0B",
            color: "#fff",
            padding: "12px 20px",
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 500,
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            display: "flex",
            alignItems: "center",
            gap: 10,
            animation: "slideIn 0.3s ease",
          }}
        >
          {t.type === "success" ? (
            <CheckCircle size={16} />
          ) : t.type === "error" ? (
            <X size={16} />
          ) : (
            <AlertTriangle size={16} />
          )}
          {t.message}
        </div>
      ))}
    </div>
  );
}

// ─── Confirm Delete Dialog ────────────────────────────────
function ConfirmDialog({ quote, onConfirm, onCancel }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        zIndex: 200,
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
          padding: 28,
          width: "100%",
          maxWidth: 380,
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            background: "#FEF2F2",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          <Trash2 size={22} color="#EF4444" />
        </div>
        <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 8 }}>
          Delete Quotation
        </h3>
        <p style={{ color: "#64748B", fontSize: 14, marginBottom: 24 }}>
          Are you sure you want to delete Quote{" "}
          <strong>#{quote.quoteNo}</strong> for{" "}
          <strong>{quote.customer}</strong>? This action cannot be undone.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: 10,
              border: "1px solid #E2E8F0",
              borderRadius: 8,
              background: "none",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: 10,
              background: "#EF4444",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Company Settings Modal ───────────────────────────────
function SettingsModal({ company, onSave, onClose }) {
  const [form, setForm] = useState({ ...company });
  const qrRef = useRef();
  const sigRef = useRef();

  const handleImageUpload = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) =>
      setForm((p) => ({ ...p, [field]: ev.target.result }));
    reader.readAsDataURL(file);
  };

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
          maxWidth: 620,
          maxHeight: "92vh",
          overflowY: "auto",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        }}
      >
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #E2E8F0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "sticky",
            top: 0,
            background: "#fff",
            zIndex: 10,
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
            <Settings size={18} color="#6366F1" /> Company Settings
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
          {/* Company Info */}
          <p
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#64748B",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: 12,
            }}
          >
            Company Info
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginBottom: 12,
            }}
          >
            <div style={{ gridColumn: "1/-1" }}>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  color: "#64748B",
                  marginBottom: 5,
                  fontWeight: 500,
                }}
              >
                Company Name
              </label>
              <input
                style={iStyle}
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
              />
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  color: "#64748B",
                  marginBottom: 5,
                  fontWeight: 500,
                }}
              >
                Address
              </label>
              <textarea
                style={{ ...iStyle, resize: "vertical" }}
                rows={3}
                value={form.address}
                onChange={(e) =>
                  setForm((p) => ({ ...p, address: e.target.value }))
                }
              />
            </div>
          </div>

          {/* Bank Details */}
          <p
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#64748B",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: 12,
              marginTop: 8,
            }}
          >
            Bank Details
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginBottom: 16,
            }}
          >
            {[
              { label: "Account Number", key: "bank" },
              { label: "Account Holder Name", key: "accountHolder" },
              { label: "IFSC Code", key: "ifsc" },
              { label: "UPI ID", key: "upi" },
            ].map(({ label, key }) => (
              <div key={key}>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    color: "#64748B",
                    marginBottom: 5,
                    fontWeight: 500,
                  }}
                >
                  {label}
                </label>
                <input
                  style={iStyle}
                  value={form[key]}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, [key]: e.target.value }))
                  }
                />
              </div>
            ))}
          </div>

          {/* Image Uploads */}
          <p
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#64748B",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: 12,
            }}
          >
            Images
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
              marginBottom: 20,
            }}
          >
            {/* QR Code */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  color: "#64748B",
                  marginBottom: 8,
                  fontWeight: 500,
                }}
              >
                UPI QR Code
              </label>
              <div
                onClick={() => qrRef.current.click()}
                style={{
                  border: "2px dashed #CBD5E1",
                  borderRadius: 10,
                  padding: "16px 12px",
                  textAlign: "center",
                  cursor: "pointer",
                  background: "#F8FAFC",
                  transition: "border-color 0.2s",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.borderColor = "#6366F1")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.borderColor = "#CBD5E1")
                }
              >
                {form.qrDataUrl ? (
                  <img
                    src={form.qrDataUrl}
                    alt="QR"
                    style={{
                      maxWidth: 90,
                      maxHeight: 90,
                      borderRadius: 6,
                      border: "1px solid #E2E8F0",
                    }}
                  />
                ) : (
                  <div>
                    <Upload
                      size={20}
                      color="#94A3B8"
                      style={{ margin: "0 auto 6px" }}
                    />
                    <p style={{ fontSize: 12, color: "#94A3B8", margin: 0 }}>
                      Click to upload QR image
                    </p>
                  </div>
                )}
              </div>
              <input
                ref={qrRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => handleImageUpload(e, "qrDataUrl")}
              />
              {form.qrDataUrl && (
                <button
                  onClick={() => setForm((p) => ({ ...p, qrDataUrl: null }))}
                  style={{
                    marginTop: 6,
                    fontSize: 11,
                    color: "#EF4444",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  ✕ Remove
                </button>
              )}
            </div>

            {/* Signature */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  color: "#64748B",
                  marginBottom: 8,
                  fontWeight: 500,
                }}
              >
                Signature / Stamp
              </label>
              <div
                onClick={() => sigRef.current.click()}
                style={{
                  border: "2px dashed #CBD5E1",
                  borderRadius: 10,
                  padding: "16px 12px",
                  textAlign: "center",
                  cursor: "pointer",
                  background: "#F8FAFC",
                  transition: "border-color 0.2s",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.borderColor = "#6366F1")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.borderColor = "#CBD5E1")
                }
              >
                {form.sigDataUrl ? (
                  <img
                    src={form.sigDataUrl}
                    alt="Signature"
                    style={{
                      maxWidth: 110,
                      maxHeight: 90,
                      borderRadius: 6,
                      border: "1px solid #E2E8F0",
                    }}
                  />
                ) : (
                  <div>
                    <Upload
                      size={20}
                      color="#94A3B8"
                      style={{ margin: "0 auto 6px" }}
                    />
                    <p style={{ fontSize: 12, color: "#94A3B8", margin: 0 }}>
                      Click to upload signature/stamp
                    </p>
                  </div>
                )}
              </div>
              <input
                ref={sigRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => handleImageUpload(e, "sigDataUrl")}
              />
              {form.sigDataUrl && (
                <button
                  onClick={() => setForm((p) => ({ ...p, sigDataUrl: null }))}
                  style={{
                    marginTop: 6,
                    fontSize: 11,
                    color: "#EF4444",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  ✕ Remove
                </button>
              )}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button
              onClick={onClose}
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
              onClick={() => {
                onSave(form);
                onClose();
              }}
              style={{
                padding: "9px 20px",
                background: "#6366F1",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PDF Preview (exact screenshot layout) ───────────────
function QuotationPDFView({ quote, company }) {
  const addrLines = company.address.split("\n");

  const thStyle = {
    padding: "8px 6px",
    color: "#000",
    fontWeight: 800,
    fontSize: "10px",
    textAlign: "center",
    border: "2px solid #000",
    background: "#fff",
  };

  const tdStyle = {
    padding: "6px 8px",
    border: "2px solid #000",
    color: "#000",
    fontSize: "10.5px",
    fontWeight: 500,
  };

  return (
    <div
      style={{
        background: "#fff",
        fontFamily: "'Segoe UI', Arial, sans-serif",
        fontSize: 11,
      }}
    >
      {/* ── HEADER ── */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          border: "2px solid #000",
        }}
      >
        <tbody>
          <tr>
            {/* Left: Company */}
            <td
              style={{
                background: "#daeaf0",
                padding: "12px 16px",
                borderRight: "2px solid #000",
                verticalAlign: "top",
              }}
            >
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: "#000",
                  textTransform: "uppercase",
                }}
              >
                {company.name}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "#000",
                  marginTop: 4,
                  lineHeight: 1.6,
                  fontWeight: 500,
                }}
              >
                {addrLines.map((l, i) => (
                  <div key={i}>{l}</div>
                ))}
              </div>
            </td>
            {/* Right: Quotation box */}
            <td
              style={{
                background: "#2e7d9a",
                minWidth: 220,
                verticalAlign: "top",
              }}
            >
              <div
                style={{
                  color: "#fff",
                  textAlign: "center",
                  padding: "8px 12px",
                  fontWeight: 800,
                  fontSize: 14,
                  borderBottom: "2px solid #000",
                }}
              >
                Quotation
              </div>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  background: "#fff",
                }}
              >
                <tbody>
                  <tr style={{ borderBottom: "2px solid #000" }}>
                    <td
                      style={{
                        padding: "6px 12px",
                        fontWeight: 700,
                        color: "#000",
                        fontSize: 11.5,
                      }}
                    >
                      Quote No.:
                    </td>
                    <td
                      style={{
                        padding: "6px 12px",
                        fontWeight: 700,
                        color: "#000",
                        fontSize: 11.5,
                        textAlign: "right",
                      }}
                    >
                      {quote.quoteNo}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        padding: "6px 12px",
                        fontWeight: 700,
                        color: "#000",
                        fontSize: 11.5,
                      }}
                    >
                      Quote Date:
                    </td>
                    <td
                      style={{
                        padding: "6px 12px",
                        fontWeight: 700,
                        color: "#000",
                        fontSize: 11.5,
                        textAlign: "right",
                      }}
                    >
                      {quote.quoteDate}
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ── CUSTOMER BAR ── */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          borderLeft: "2px solid #000",
          borderRight: "2px solid #000",
          borderBottom: "2px solid #000",
        }}
      >
        <tbody>
          <tr>
            <td
              style={{
                background: "#2e7d9a",
                color: "#fff",
                padding: "8px 12px",
                fontWeight: 800,
                fontSize: 11.5,
                width: 120,
                borderRight: "2px solid #000",
                textTransform: "uppercase",
              }}
            >
              Customer
            </td>
            <td
              style={{
                background: "#daeaf0",
                color: "#000",
                padding: "8px 12px",
                fontWeight: 800,
                fontSize: 11.5,
              }}
            >
              {quote.customer}
            </td>
          </tr>
        </tbody>
      </table>

      {/* ── ITEMS TABLE ── */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: 10.5,
          borderLeft: "2px solid #000",
          borderRight: "2px solid #000",
        }}
      >
        <thead>
          <tr style={{ background: "#fff" }}>
            <th style={{ ...thStyle, width: 45 }}>Sl. No.</th>
            <th style={{ ...thStyle, textAlign: "left", minWidth: 220 }}>
              Interior Work with Material
            </th>
            <th style={{ ...thStyle, width: 45 }}>HSN</th>
            <th style={{ ...thStyle, width: 40 }}>GST</th>
            <th style={{ ...thStyle, width: 70 }}>Width in Feet</th>
            <th style={{ ...thStyle, width: 75 }}>Height/Length in Feet</th>
            <th style={{ ...thStyle, width: 70 }}>Total Area in SQFT</th>
            <th style={{ ...thStyle, width: 85 }}>Cost per SQFT</th>
            <th style={{ ...thStyle, width: 100 }}>Total Cost (Rs.)</th>
          </tr>
        </thead>
        <tbody>
          {quote.items.map((item) => (
            <tr key={item.id} style={{ background: "#fff" }}>
              <td style={{ ...tdStyle, textAlign: "center" }}>{item.slNo}</td>
              <td style={{ ...tdStyle, textAlign: "left", lineHeight: 1.5 }}>
                {item.description}
              </td>
              <td style={{ ...tdStyle, textAlign: "center" }}>{item.hsn}</td>
              <td style={{ ...tdStyle, textAlign: "center" }}>{item.gst}</td>
              <td style={{ ...tdStyle, textAlign: "center" }}>{item.width || ""}</td>
              <td style={{ ...tdStyle, textAlign: "center" }}>{item.height || ""}</td>
              <td style={{ ...tdStyle, textAlign: "center" }}>{item.area || ""}</td>
              <td style={{ ...tdStyle, textAlign: "right" }}>
                {item.costPerSqft
                  ? Number(item.costPerSqft).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })
                  : ""}
              </td>
              <td style={{ ...tdStyle, textAlign: "right", fontWeight: 700 }}>
                {Number(item.totalCost).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </td>
            </tr>
          ))}

          {/* TOTALS Rows */}
          <tr>
            <td
              colSpan={8}
              style={{
                padding: "8px 12px",
                fontSize: 11,
                fontWeight: 800,
                textAlign: "right",
                background: "#ffedd5",
                border: "2px solid #000",
                color: "#000",
                textTransform: "uppercase",
              }}
            >
              TOTALS excluding GST
            </td>
            <td
              style={{
                padding: "8px 10px",
                fontSize: 11.5,
                fontWeight: 800,
                textAlign: "right",
                background: "#ffedd5",
                border: "2px solid #000",
                color: "#000",
                whiteSpace: "nowrap",
              }}
            >
              {Number(quote.totalExclGST).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </td>
          </tr>
          <tr>
            <td
              colSpan={8}
              style={{
                padding: "8px 12px",
                fontSize: 11,
                fontWeight: 800,
                textAlign: "right",
                background: "#fed7aa",
                border: "2px solid #000",
                color: "#000",
                textTransform: "uppercase",
              }}
            >
              TOTALS including GST
            </td>
            <td
              style={{
                padding: "8px 10px",
                fontSize: 12,
                fontWeight: 800,
                textAlign: "right",
                background: "#fed7aa",
                border: "2px solid #000",
                color: "#000",
                whiteSpace: "nowrap",
              }}
            >
              {Number(quote.totalInclGST).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </td>
          </tr>
        </tbody>
      </table>

      {/* ── FOOTER: BANK + UPI + SIGNATURE ── */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          border: "2px solid #000",
          borderTop: "none",
          fontSize: 10.5,
        }}
      >
        <tbody>
          <tr>
            {/* Bank Details */}
            <td
              style={{
                padding: "10px 12px",
                borderRight: "2px solid #000",
                verticalAlign: "top",
                width: "45%",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  textDecoration: "underline",
                  marginBottom: 6,
                  color: "#000",
                }}
              >
                Bank Details:
              </div>
              <div style={{ lineHeight: 1.6, color: "#000" }}>
                <div>
                  <strong>Account Number :</strong> {company.bank}
                </div>
                <div>
                  <strong>Account Holder's Name :</strong>{" "}
                  {company.accountHolder}
                </div>
                <div>
                  <strong>IFSC Code :</strong> {company.ifsc}
                </div>
              </div>
            </td>

            {/* UPI */}
            <td
              style={{
                padding: "10px 12px",
                borderRight: "2px solid #000",
                verticalAlign: "top",
                width: "30%",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  textDecoration: "underline",
                  marginBottom: 6,
                  color: "#000",
                }}
              >
                Pay using UPI:
              </div>
              <div
                style={{
                  fontFamily: "monospace",
                  fontSize: 10,
                  background: "#f1f5f9",
                  border: "1px solid #ccc",
                  borderRadius: 4,
                  padding: "4px 7px",
                  display: "inline-block",
                  wordBreak: "break-all",
                  marginBottom: 6,
                  color: "#000",
                }}
              >
                {company.upi}
              </div>
              {company.qrDataUrl && (
                <div>
                  <img
                    src={company.qrDataUrl}
                    alt="QR"
                    style={{
                      maxWidth: 60,
                      maxHeight: 60,
                      border: "1px solid #ccc",
                      padding: 2,
                    }}
                  />
                </div>
              )}
            </td>

            {/* Signature */}
            <td
              style={{
                padding: "10px 12px",
                verticalAlign: "top",
                width: "25%",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  textDecoration: "underline",
                  marginBottom: 6,
                  color: "#000",
                  textAlign: "left",
                }}
              >
                Signature:
              </div>
              {company.sigDataUrl ? (
                <img
                  src={company.sigDataUrl}
                  alt="Signature"
                  style={{
                    maxWidth: 95,
                    maxHeight: 75,
                    border: "1px solid #ccc",
                    padding: 2,
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 80,
                    height: 60,
                    border: "1px dashed #bbb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 9,
                    color: "#999",
                    borderRadius: 4,
                    margin: "0 auto",
                  }}
                >
                  Stamp/Sign
                </div>
              )}
            </td>
          </tr>
        </tbody>
      </table>

      {/* ── PAYMENT SCHEDULE ── */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          border: "2px solid #000",
          borderTop: "none",
          fontSize: 10.5,
        }}
      >
        <tbody>
          <tr>
            <td style={{ padding: "10px 12px", verticalAlign: "top" }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  textDecoration: "underline",
                  marginBottom: 4,
                  color: "#000",
                }}
              >
                Payment Schedule:
              </div>
              <div style={{ lineHeight: 1.6, color: "#000" }}>
                <div>1) 50% advance payment is required at the start of the work</div>
                <div>2) 40% Upon completion</div>
                <div>3) 10% During handover</div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ── NOTE ── */}
      <div
        style={{
          background: "#fff",
          border: "2px solid #000",
          borderTop: "none",
          padding: "8px 12px",
          fontSize: 11,
          fontWeight: 700,
          color: "#000",
        }}
      >
        Note: Above mentioned charges are inclusive of Labour and Material cost.
      </div>
    </div>
  );
}

// ─── View Detail with PDF Download (Inline Page View) ──────
function QuotationViewDetail({ quote, company, onClose }) {
  const [downloading, setDownloading] = useState(false);
  const pdfRef = useRef(null);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await new Promise((resolve, reject) => {
        if (window.jspdf) return resolve();
        const s = document.createElement("script");
        s.src =
          "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
      });
      await new Promise((resolve, reject) => {
        if (window.html2canvas) return resolve();
        const s = document.createElement("script");
        s.src =
          "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
      });

      const element = pdfRef.current;
      const canvas = await window.html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();
      const imgH = (canvas.height * pdfW) / canvas.width;
      let yPos = 0,
        page = 0;
      while (yPos < imgH) {
        if (page > 0) pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, -yPos, pdfW, imgH);
        yPos += pdfH;
        page++;
      }
      pdf.save(`Quotation_${quote.quoteNo}_${quote.customer}.pdf`);
    } catch (err) {
      console.error("PDF error:", err);
      alert("PDF generation failed. Please try again.");
    }
    setDownloading(false);
  };

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        border: "1px solid #E2E8F0",
        boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
        display: "flex",
        flexDirection: "column",
        animation: "fadeIn 0.3s ease",
        overflow: "hidden",
      }}
    >
      {/* Header Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 24px",
          borderBottom: "1px solid #E2E8F0",
          background: "#F8FAFC",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={onClose}
            style={{
              background: "#fff",
              border: "1px solid #E2E8F0",
              cursor: "pointer",
              borderRadius: 8,
              padding: "7px 12px",
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: 13,
              fontWeight: 600,
              color: "#475569",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#F8FAFC";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#fff";
            }}
          >
            <ChevronLeft size={16} /> Back to List
          </button>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#0F172A" }}>
            Quotation #{quote.quoteNo} &mdash; {quote.customer}
          </span>
        </div>
        <div>
          <button
            onClick={handleDownload}
            disabled={downloading}
            style={{
              padding: "8px 18px",
              background: downloading ? "#94A3B8" : "#059669",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: downloading ? "not-allowed" : "pointer",
              fontSize: 13,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 6,
              transition: "background 0.2s",
            }}
          >
            <Download size={15} />
            {downloading ? "Generating PDF..." : "Download PDF"}
          </button>
        </div>
      </div>

      {/* Printable area */}
      <div
        style={{
          padding: "24px",
          overflowX: "auto",
          background: "#F1F5F9",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          ref={pdfRef}
          style={{
            background: "#fff",
            padding: "24px 32px",
            width: "100%",
            maxWidth: 1000,
            boxShadow: "0 4px 30px rgba(0,0,0,0.05)",
            boxSizing: "border-box",
          }}
        >
          <QuotationPDFView quote={quote} company={company} />
        </div>
      </div>
    </div>
  );
}

// ─── Create / Edit Form (Inline Page View) ────────────────
function QuotationFormView({ initial, onSave, onClose }) {
  const isEdit = !!initial;
  const blankItem = () => ({
    id: Date.now() + Math.random(),
    slNo: "",
    description: "",
    hsn: "9403",
    gst: "18%",
    width: 0,
    height: 0,
    area: 0,
    costPerSqft: 0,
    totalCost: 0,
  });

  const [quoteNo, setQuoteNo] = useState(initial?.quoteNo || "");
  const [quoteDate, setQuoteDate] = useState(
    initial?.quoteDate ||
      new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
  );
  const [customer, setCustomer] = useState(initial?.customer || "");
  const [items, setItems] = useState(
    initial?.items?.length ? initial.items : [blankItem()],
  );

  const iStyle = {
    width: "100%",
    padding: "9px 12px",
    border: "1px solid #E2E8F0",
    borderRadius: 8,
    fontSize: 13,
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
  };

  const updateItem = (id, field, value) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        if (field === "width" || field === "height") {
          updated.area = calcArea(
            field === "width" ? value : item.width,
            field === "height" ? value : item.height,
          );
          updated.totalCost = calcTotal(updated.area, updated.costPerSqft);
        }
        if (field === "costPerSqft")
          updated.totalCost = calcTotal(updated.area, value);
        if (field === "area")
          updated.totalCost = calcTotal(value, updated.costPerSqft);
        return updated;
      }),
    );
  };

  const totalExclGST = items.reduce(
    (s, i) => s + (parseFloat(i.totalCost) || 0),
    0,
  );
  const totalInclGST = parseFloat((totalExclGST * 1.18).toFixed(2));

  const handleSave = () => {
    if (!quoteNo || !customer) return;
    onSave({
      id: initial?.id || "QUO" + quoteNo,
      quoteNo,
      quoteDate,
      customer,
      items,
      totalExclGST: parseFloat(totalExclGST.toFixed(2)),
      totalInclGST,
    });
  };

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        border: "1px solid #E2E8F0",
        boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
        animation: "fadeIn 0.3s ease",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "16px 24px",
          borderBottom: "1px solid #E2E8F0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#F8FAFC",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={onClose}
            style={{
              background: "#fff",
              border: "1px solid #E2E8F0",
              cursor: "pointer",
              borderRadius: 8,
              padding: "7px 12px",
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: 13,
              fontWeight: 600,
              color: "#475569",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#F8FAFC";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#fff";
            }}
          >
            <ChevronLeft size={16} /> Back
          </button>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "#0F172A" }}>
            {isEdit ? "Edit Quotation" : "Create New Quotation"}
          </h2>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "#E2E8F0",
            border: "none",
            cursor: "pointer",
            width: 32,
            height: 32,
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#475569",
          }}
        >
          <X size={16} />
        </button>
      </div>

      <div style={{ padding: "24px" }}>
        {/* Meta */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 14,
            marginBottom: 20,
          }}
        >
          {[
            {
              label: "Quote No. *",
              value: quoteNo,
              setter: setQuoteNo,
              placeholder: "e.g. 360",
            },
            {
              label: "Quote Date",
              value: quoteDate,
              setter: setQuoteDate,
              placeholder: "27-May-2026",
            },
            {
              label: "Customer Name *",
              value: customer,
              setter: setCustomer,
              placeholder: "Customer name",
            },
          ].map(({ label, value, setter, placeholder }) => (
            <div key={label}>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  color: "#64748B",
                  marginBottom: 5,
                  fontWeight: 500,
                }}
              >
                {label}
              </label>
              <input
                value={value}
                onChange={(e) => setter(e.target.value)}
                placeholder={placeholder}
                style={iStyle}
              />
            </div>
          ))}
        </div>

        {/* Items Table */}
        <div
          style={{
            overflowX: "auto",
            border: "1px solid #E2E8F0",
            borderRadius: 10,
            marginBottom: 14,
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: 860,
            }}
          >
            <thead>
              <tr style={{ background: "#1E293B" }}>
                {[
                  "Sl. No.",
                  "Interior Work with Material",
                  "HSN",
                  "GST",
                  "Width in Feet",
                  "Height/Length in Feet",
                  "Total Area in SQFT",
                  "Cost per SQFT",
                  "Total Cost (Rs.)",
                  "",
                ].map((h, i) => (
                  <th
                    key={i}
                    style={{
                      padding: "10px 8px",
                      color: "#fff",
                      fontWeight: 600,
                      fontSize: 10,
                      textAlign: i === 1 ? "left" : "center",
                      borderRight: "1px solid #334155",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr
                  key={item.id}
                  style={{
                    background: idx % 2 === 0 ? "#fff" : "#F8FAFC",
                    borderBottom: "1px solid #E2E8F0",
                  }}
                >
                  <td style={{ padding: "6px 6px", textAlign: "center" }}>
                    <input
                      value={item.slNo}
                      onChange={(e) =>
                        updateItem(item.id, "slNo", e.target.value)
                      }
                      style={{
                        ...iStyle,
                        width: 48,
                        padding: "5px 4px",
                        textAlign: "center",
                      }}
                    />
                  </td>
                  <td style={{ padding: "6px 8px" }}>
                    <textarea
                      value={item.description}
                      onChange={(e) =>
                        updateItem(item.id, "description", e.target.value)
                      }
                      rows={2}
                      style={{
                        ...iStyle,
                        resize: "none",
                        fontSize: 12,
                        lineHeight: 1.5,
                      }}
                    />
                  </td>
                  <td style={{ padding: "6px" }}>
                    <input
                      value={item.hsn}
                      onChange={(e) =>
                        updateItem(item.id, "hsn", e.target.value)
                      }
                      style={{
                        ...iStyle,
                        width: 52,
                        padding: "5px 4px",
                        textAlign: "center",
                        fontSize: 12,
                      }}
                    />
                  </td>
                  <td style={{ padding: "6px" }}>
                    <input
                      value={item.gst}
                      onChange={(e) =>
                        updateItem(item.id, "gst", e.target.value)
                      }
                      style={{
                        ...iStyle,
                        width: 46,
                        padding: "5px 4px",
                        textAlign: "center",
                        fontSize: 12,
                      }}
                    />
                  </td>
                  {[
                    ["width", 56],
                    ["height", 56],
                    ["area", 64],
                  ].map(([field, w]) => (
                    <td key={field} style={{ padding: "6px" }}>
                      <input
                        type="number"
                        value={item[field] || ""}
                        onChange={(e) =>
                          updateItem(item.id, field, e.target.value)
                        }
                        style={{
                          ...iStyle,
                          width: w,
                          padding: "5px 4px",
                          textAlign: "center",
                          fontSize: 12,
                        }}
                      />
                    </td>
                  ))}
                  <td style={{ padding: "6px" }}>
                    <input
                      type="number"
                      value={item.costPerSqft || ""}
                      onChange={(e) =>
                        updateItem(item.id, "costPerSqft", e.target.value)
                      }
                      style={{
                        ...iStyle,
                        width: 74,
                        padding: "5px 4px",
                        textAlign: "center",
                        fontSize: 12,
                      }}
                    />
                  </td>
                  <td
                    style={{
                      padding: "6px 10px",
                      textAlign: "right",
                      fontWeight: 700,
                      fontSize: 12,
                      color: "#0F172A",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {Number(item.totalCost).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td style={{ padding: "6px", textAlign: "center" }}>
                    <button
                      onClick={() =>
                        setItems((p) => p.filter((i) => i.id !== item.id))
                      }
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#EF4444",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto",
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          onClick={() => setItems((p) => [...p, blankItem()])}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: "#6366F1",
            background: "#EEF2FF",
            border: "none",
            padding: "8px 14px",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: 600,
            fontSize: 13,
            marginBottom: 18,
          }}
        >
          <Plus size={15} /> Add Row
        </button>

        {/* Totals */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: 20,
          }}
        >
          <div style={{ minWidth: 280 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 12px",
                borderBottom: "1px solid #E2E8F0",
              }}
            >
              <span style={{ fontSize: 13, color: "#64748B" }}>
                TOTAL excluding GST
              </span>
              <span style={{ fontSize: 13, fontWeight: 700 }}>
                {fmtINR(totalExclGST)}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 12px",
                background: "#FFF7ED",
                borderRadius: 8,
                marginTop: 6,
                border: "1px solid #FED7AA",
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 700 }}>
                TOTAL including GST
              </span>
              <span
                style={{ fontSize: 14, fontWeight: 800, color: "#6366F1" }}
              >
                {fmtINR(totalInclGST)}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button
            onClick={onClose}
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
            onClick={handleSave}
            style={{
              padding: "9px 20px",
              background: "#6366F1",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {isEdit ? "Save Changes" : "Create Quotation"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────
function StatCard({ icon: Icon, iconBg, iconColor, label, value }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #E2E8F0",
        borderRadius: 14,
        padding: 18,
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          background: iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 12,
        }}
      >
        <Icon size={18} color={iconColor} />
      </div>
      <p style={{ fontSize: 13, color: "#64748B", marginBottom: 6 }}>{label}</p>
      <h2
        style={{ margin: 0, fontSize: 22, fontWeight: 600, color: "#0F172A" }}
      >
        {value}
      </h2>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────
const PAGE_SIZE = 5;

export default function QuotationPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const actionParam = searchParams.get("action");

  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState(() => {
    const saved = localStorage.getItem("companySettings");
    return saved ? JSON.parse(saved) : DEFAULT_COMPANY;
  });
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [activeView, setActiveView] = useState({ type: "list" });
  const [toasts, setToasts] = useState([]);
  const [page, setPage] = useState(1);

  // Sync URL parameter action with activeView
  useEffect(() => {
    if (actionParam === "create") {
      setActiveView({ type: "create" });
    } else {
      setActiveView({ type: "list" });
    }
  }, [actionParam]);

  // Fetch all quotations from API on mount
  useEffect(() => {
    setLoading(true);
    getQuotations()
      .then((res) => {
        setQuotations(res.data || []);
      })
      .catch((err) => {
        console.error("Failed to load quotations:", err);
        showToast("Failed to load quotations", "error");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    localStorage.setItem("companySettings", JSON.stringify(company));
  }, [company]);

  const showToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3000);
  };

  const filtered = quotations.filter((q) => {
    const s = search.toLowerCase();
    return (
      (q.quoteNo || "").toLowerCase().includes(s) ||
      (q.customer || "").toLowerCase().includes(s)
    );
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = {
    total: quotations.length,
    totalExcl: quotations.reduce((a, q) => a + (q.totalExclGST || 0), 0),
    totalIncl: quotations.reduce((a, q) => a + (q.totalInclGST || 0), 0),
    totalItems: quotations.reduce((a, q) => a + (q.items?.length || 0), 0),
  };

  const handleDelete = async () => {
    const id = modal.data._id;
    try {
      await deleteQuotation(id);
      setQuotations((p) => p.filter((q) => q._id !== id));
      showToast("Quotation deleted successfully", "error");
    } catch (err) {
      showToast(err.message || "Delete failed", "error");
    }
    setModal(null);
  };

  const handleSave = async (saved) => {
    try {
      if (activeView.type === "edit") {
        const res = await updateQuotation(activeView.data._id, saved);
        setQuotations((p) =>
          p.map((q) => (q._id === activeView.data._id ? res.data : q))
        );
        showToast("Quotation updated successfully");
      } else {
        const res = await createQuotation(saved);
        setQuotations((p) => [res.data, ...p]);
        showToast("Quotation created successfully");
      }
    } catch (err) {
      showToast(err.message || "Save failed", "error");
    }
    handleCloseView();
  };

  const handleCloseView = () => {
    if (actionParam) {
      // Clear query params to return to list view naturally via useEffect
      setSearchParams({});
    } else {
      setActiveView({ type: "list" });
    }
  };

  const td = { padding: "13px 16px", fontSize: 14, color: "#0F172A" };

  return (
    <DashboardLayout>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity:0; transform:translateX(30px) } to { opacity:1; transform:translateX(0) } }
        .quo-row:hover td { background:#FAFBFF; }
        .quo-action-btn:hover { background:#F1F5F9 !important; }
      `}</style>

      <div style={{ padding: 30, background: "#F8FAFC", minHeight: "100vh" }}>
        {/* RENDER INLINE VIEWS IF NOT IN LIST MODE */}
        {activeView.type === "view" && (
          <QuotationViewDetail
            quote={activeView.data}
            company={company}
            onClose={handleCloseView}
          />
        )}

        {(activeView.type === "create" || activeView.type === "edit") && (
          <QuotationFormView
            initial={activeView.type === "edit" ? activeView.data : null}
            onSave={handleSave}
            onClose={handleCloseView}
          />
        )}

        {/* LIST MODE */}
        {activeView.type === "list" && (
          <>
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 22,
              }}
            >
              <div>
                <h1
                  style={{
                    margin: 0,
                    fontSize: 26,
                    fontWeight: 700,
                    color: "#0F172A",
                  }}
                >
                  Quotations
                </h1>
                <p style={{ color: "#64748B", marginTop: 4 }}>
                  Manage and view all client quotations
                </p>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => setModal({ type: "settings" })}
                  style={{
                    background: "#fff",
                    color: "#374151",
                    border: "1px solid #E2E8F0",
                    padding: "10px 16px",
                    borderRadius: 10,
                    cursor: "pointer",
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    fontSize: 14,
                  }}
                >
                  <Settings size={15} /> Company Settings
                </button>
                <button
                  onClick={() => setModal({ type: "upload_excel" })}
                  style={{
                    background: "#10B981",
                    color: "#fff",
                    border: "none",
                    padding: "11px 20px",
                    borderRadius: 10,
                    cursor: "pointer",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 14,
                  }}
                >
                  <Upload size={16} /> Upload Excel BOQ
                </button>
                <button
                  onClick={() => setSearchParams({ action: "create" })}
                  style={{
                    background: "#6366F1",
                    color: "#fff",
                    border: "none",
                    padding: "11px 20px",
                    borderRadius: 10,
                    cursor: "pointer",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 14,
                  }}
                >
                  <Plus size={16} /> Create Quotation
                </button>
              </div>
            </div>

            {/* Stats */}
            {loading ? (
              <div style={{ textAlign: "center", padding: 40, color: "#94A3B8" }}>
                Loading quotations...
              </div>
            ) : (
              <>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
                    gap: 14,
                    marginBottom: 22,
                  }}
                >
                  <StatCard
                    icon={FileText}
                    iconBg="#EEF2FF"
                    iconColor="#6366F1"
                    label="Total Quotations"
                    value={stats.total}
                  />
                  <StatCard
                    icon={Receipt}
                    iconBg="#EEF2FF"
                    iconColor="#6366F1"
                    label="Total Line Items"
                    value={stats.totalItems}
                  />
                  <StatCard
                    icon={IndianRupee}
                    iconBg="#ECFDF5"
                    iconColor="#059669"
                    label="Total excl. GST"
                    value={fmtINR(stats.totalExcl)}
                  />
                  <StatCard
                    icon={IndianRupee}
                    iconBg="#FFFBEB"
                    iconColor="#B45309"
                    label="Total incl. GST"
                    value={fmtINR(stats.totalIncl)}
                  />
                </div>

                {/* Search */}
                <div
                  style={{
                    background: "#fff",
                    border: "1px solid #E2E8F0",
                    borderRadius: 14,
                    padding: "14px 18px",
                    marginBottom: 16,
                    display: "flex",
                    gap: 12,
                    alignItems: "center",
                  }}
                >
                  <div style={{ position: "relative", flex: 1 }}>
                    <Search
                      size={16}
                      style={{
                        position: "absolute",
                        left: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#94A3B8",
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Search by quote no., customer name..."
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                      }}
                      style={{
                        width: "100%",
                        padding: "9px 12px 9px 36px",
                        border: "1px solid #E2E8F0",
                        borderRadius: 8,
                        fontSize: 14,
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                  <span
                    style={{ fontSize: 13, color: "#94A3B8", whiteSpace: "nowrap" }}
                  >
                    {filtered.length} quotation{filtered.length !== 1 ? "s" : ""} found
                  </span>
                </div>

                {/* Table */}
                <div
                  style={{
                    background: "#fff",
                    border: "1px solid #E2E8F0",
                    borderRadius: 14,
                    overflowX: "auto",
                  }}
                >
                  <table
                    style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}
                  >
                    <thead>
                      <tr style={{ background: "#F8FAFC" }}>
                        {[
                          "Quote No.",
                          "Customer",
                          "Quote Date",
                          "Items",
                          "Total excl. GST",
                          "Total incl. GST",
                          "Actions",
                        ].map((h) => (
                          <th
                            key={h}
                            style={{
                              padding: "13px 16px",
                              textAlign: "left",
                              fontSize: 12,
                              fontWeight: 600,
                              color: "#64748B",
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                              borderBottom: "1px solid #E2E8F0",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paginated.length === 0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            style={{
                              padding: 48,
                              textAlign: "center",
                              color: "#94A3B8",
                              fontSize: 14,
                            }}
                          >
                            No quotations found
                          </td>
                        </tr>
                      ) : (
                        paginated.map((q) => (
                          <tr
                            key={q._id}
                            className="quo-row"
                            style={{ borderBottom: "1px solid #F1F5F9" }}
                          >
                            <td style={td}>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 10,
                                }}
                              >
                                <div
                                  style={{
                                    width: 34,
                                    height: 34,
                                    borderRadius: "50%",
                                    background:
                                      "linear-gradient(135deg,#2e7d9a,#1e5c7a)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                  }}
                                >
                                  <span
                                    style={{
                                      fontSize: 12,
                                      fontWeight: 700,
                                      color: "#fff",
                                    }}
                                  >
                                    #
                                  </span>
                                </div>
                                <span style={{ fontWeight: 600 }}>{q.quoteNo}</span>
                              </div>
                            </td>
                            <td style={td}>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 6,
                                }}
                              >
                                <User size={13} color="#94A3B8" />
                                {q.customer}
                              </div>
                            </td>
                            <td style={{ ...td, color: "#64748B", fontSize: 13 }}>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 6,
                                }}
                              >
                                <Calendar size={13} color="#94A3B8" />
                                {q.quoteDate}
                              </div>
                            </td>
                            <td style={{ ...td, textAlign: "center" }}>
                              <span
                                style={{
                                  background: "#EEF2FF",
                                  color: "#6366F1",
                                  padding: "4px 12px",
                                  borderRadius: 20,
                                  fontSize: 13,
                                  fontWeight: 600,
                                }}
                              >
                                {q.items?.length || 0}
                              </span>
                            </td>
                            <td style={{ ...td, fontWeight: 600 }}>
                              {fmtINR(q.totalExclGST)}
                            </td>
                            <td style={{ ...td, fontWeight: 700, color: "#059669" }}>
                              {fmtINR(q.totalInclGST)}
                            </td>
                            <td style={td}>
                              <div style={{ display: "flex", gap: 4 }}>
                                {[
                                  {
                                    Icon: Eye,
                                    color: "#6366F1",
                                    title: "View",
                                    onClick: () => setActiveView({ type: "view", data: q }),
                                  },
                                  {
                                    Icon: Pencil,
                                    color: "#059669",
                                    title: "Edit",
                                    onClick: () => setActiveView({ type: "edit", data: q }),
                                  },
                                  {
                                    Icon: Trash2,
                                    color: "#EF4444",
                                    title: "Delete",
                                    onClick: () =>
                                      setModal({ type: "delete", data: q }),
                                  },
                                ].map(({ Icon, color, title, onClick }) => (
                                  <button
                                    key={title}
                                    title={title}
                                    onClick={onClick}
                                    className="quo-action-btn"
                                    style={{
                                      background: "none",
                                      border: "none",
                                      cursor: "pointer",
                                      width: 30,
                                      height: 30,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      borderRadius: 6,
                                      transition: "background 0.15s",
                                    }}
                                  >
                                    <Icon size={15} color={color} />
                                  </button>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "12px 18px",
                        borderTop: "1px solid #F1F5F9",
                      }}
                    >
                      <span style={{ fontSize: 13, color: "#94A3B8" }}>
                        Showing {(page - 1) * PAGE_SIZE + 1}–
                        {Math.min(page * PAGE_SIZE, filtered.length)} of{" "}
                        {filtered.length}
                      </span>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() => setPage((p) => Math.max(p - 1, 1))}
                          disabled={page === 1}
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            border: "1px solid #E2E8F0",
                            background: page === 1 ? "#F8FAFC" : "#fff",
                            cursor: page === 1 ? "default" : "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: page === 1 ? "#CBD5E1" : "#374151",
                          }}
                        >
                          <ChevronLeft size={15} />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                          (n) => (
                            <button
                              key={n}
                              onClick={() => setPage(n)}
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: 8,
                                border: "1px solid #E2E8F0",
                                background: page === n ? "#6366F1" : "#fff",
                                color: page === n ? "#fff" : "#374151",
                                cursor: "pointer",
                                fontSize: 13,
                                fontWeight: 600,
                              }}
                            >
                              {n}
                            </button>
                          ),
                        )}
                        <button
                          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                          disabled={page === totalPages}
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            border: "1px solid #E2E8F0",
                            background: page === totalPages ? "#F8FAFC" : "#fff",
                            cursor: page === totalPages ? "default" : "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: page === totalPages ? "#CBD5E1" : "#374151",
                          }}
                        >
                          <ChevronRight size={15} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {modal?.type === "delete" && (
        <ConfirmDialog
          quote={modal.data}
          onConfirm={handleDelete}
          onCancel={() => setModal(null)}
        />
      )}
      {modal?.type === "settings" && (
        <SettingsModal
          company={company}
          onSave={setCompany}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === "upload_excel" && (
        <UploadExcelModal
          onClose={() => setModal(null)}
          onSave={(data) => {
            setModal(null);
            handleSave(data);
          }}
        />
      )}

      <Toast toasts={toasts} />
    </DashboardLayout>
  );
}
