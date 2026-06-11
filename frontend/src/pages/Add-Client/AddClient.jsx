import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { createClient } from "../../services/clients";
import {
  UserPlus,
  MapPin,
  FileText,
  MessageSquare,
  CheckCircle,
  X,
} from "lucide-react";

const COLORS = {
  primary: "#0F172A",
  accent: "#6366F1",
  border: "#E2E8F0",
  bg: "#F8FAFC",
  white: "#FFFFFF",
  muted: "#64748B",
};

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu & Kashmir",
  "Ladakh",
];

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
            background: t.type === "success" ? "#059669" : "#EF4444",
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
          {t.type === "success" ? <CheckCircle size={16} /> : <X size={16} />}
          {t.message}
        </div>
      ))}
    </div>
  );
}

export default function AddClient() {
  const navigate = useNavigate();
  const location = useLocation();
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    clientName: location.state?.prefilledName || "",
    companyName: "",
    mobile: "",
    altMobile: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    gst: "",
    pan: "",
    remarks: "",
  });

  const showToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3000);
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.clientName.trim() || !formData.mobile.trim()) {
      showToast(
        "Please fill required fields: Client Name, Mobile Number",
        "error",
      );
      return;
    }

    setLoading(true);
    try {
      await createClient(formData);
      showToast("Client saved successfully!");
      setTimeout(() => navigate("/clients/all"), 1500);
    } catch (err) {
      showToast(err.message || "Failed to save client", "error");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    border: `1px solid ${COLORS.border}`,
    borderRadius: "10px",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
    background: "#fff",
    color: COLORS.primary,
  };

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "16px",
  };

  const sectionStyle = {
    background: "#fff",
    borderRadius: "16px",
    padding: "24px",
    border: `1px solid ${COLORS.border}`,
    marginBottom: "20px",
  };

  const h2Style = {
    margin: "0 0 20px 0",
    fontSize: 17,
    fontWeight: 700,
    color: COLORS.primary,
    display: "flex",
    alignItems: "center",
    gap: 8,
  };

  const labelStyle = {
    display: "block",
    fontSize: 13,
    fontWeight: 500,
    color: COLORS.muted,
    marginBottom: 6,
  };

  const phonePrefix = (
    <span
      style={{
        display: "flex",
        alignItems: "center",
        background: "#EEF2FF",
        border: `1px solid ${COLORS.border}`,
        borderRight: "none",
        borderRadius: "10px 0 0 10px",
        padding: "12px 12px",
        fontSize: 13,
        fontWeight: 700,
        color: COLORS.accent,
        whiteSpace: "nowrap",
      }}
    >
      +91
    </span>
  );

  return (
    <DashboardLayout>
      <style>{`
        @keyframes slideIn { from{opacity:0;transform:translateX(30px)} to{opacity:1;transform:translateX(0)} }
        input:focus, select:focus, textarea:focus {
          border-color: #6366F1 !important;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.1) !important;
        }
        input[readonly]:focus { border-color: #E2E8F0 !important; box-shadow: none !important; }
      `}</style>

      <div
        style={{ background: COLORS.bg, minHeight: "100vh", padding: "30px" }}
      >
        {/* ── Header ── */}
        <div
          style={{
            background: COLORS.white,
            borderRadius: "16px",
            padding: "20px",
            border: `1px solid ${COLORS.border}`,
            marginBottom: "20px",
          }}
        >
          <h1
            style={{
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: 10,
              color: COLORS.primary,
            }}
          >
            <UserPlus size={28} color={COLORS.accent} />
            Add New Client
          </h1>
          <p style={{ marginTop: 6, color: COLORS.muted, margin: "6px 0 0" }}>
            Fill in the details below to register a new client.
          </p>
        </div>

        <form onSubmit={handleSave}>
          {/* ── Personal Details ── */}
          <div style={sectionStyle}>
            <h2 style={h2Style}>
              <UserPlus size={20} color={COLORS.accent} />
              Personal Details
            </h2>
            <div style={gridStyle}>
              <div>
                <label style={labelStyle}>Client Name *</label>
                <input
                  type="text"
                  name="clientName"
                  placeholder="Enter full name"
                  value={formData.clientName}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Company Name</label>
                <input
                  type="text"
                  name="companyName"
                  placeholder="Company / Firm name"
                  value={formData.companyName}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Mobile Number *</label>
                <div style={{ display: "flex" }}>
                  {phonePrefix}
                  <input
                    type="tel"
                    name="mobile"
                    maxLength={10}
                    placeholder="9876543210"
                    value={formData.mobile}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        mobile: e.target.value.replace(/\D/g, ""),
                      })
                    }
                    style={{
                      ...inputStyle,
                      borderRadius: "0 10px 10px 0",
                      flex: 1,
                    }}
                  />
                </div>
                <p
                  style={{ margin: "4px 0 0", fontSize: 11, color: "#94A3B8" }}
                >
                  Primary contact number
                </p>
              </div>

              <div>
                <label style={labelStyle}>Alternate Number</label>
                <div style={{ display: "flex" }}>
                  {phonePrefix}
                  <input
                    type="tel"
                    name="altMobile"
                    maxLength={10}
                    placeholder="Optional"
                    value={formData.altMobile}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        altMobile: e.target.value.replace(/\D/g, ""),
                      })
                    }
                    style={{
                      ...inputStyle,
                      borderRadius: "0 10px 10px 0",
                      flex: 1,
                    }}
                  />
                </div>
              </div>

              <div style={{ gridColumn: "span 2" }}>
                <label style={labelStyle}>Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="client@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* ── Address Details ── */}
          <div style={sectionStyle}>
            <h2 style={h2Style}>
              <MapPin size={20} color={COLORS.accent} />
              Address Details
            </h2>
            <div style={gridStyle}>
              <div style={{ gridColumn: "span 2" }}>
                <label style={labelStyle}>Address</label>
                <input
                  type="text"
                  name="address"
                  placeholder="Street, building, floor..."
                  value={formData.address}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>City</label>
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>State</label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  style={{
                    ...inputStyle,
                    cursor: "pointer",
                    appearance: "none",
                  }}
                >
                  <option value="">Select state</option>
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  maxLength={6}
                  placeholder="6-digit pincode"
                  value={formData.pincode}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pincode: e.target.value.replace(/\D/g, ""),
                    })
                  }
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* ── Tax Details ── */}
          <div style={sectionStyle}>
            <h2 style={h2Style}>
              <FileText size={20} color={COLORS.accent} />
              Tax Details
            </h2>
            <div style={gridStyle}>
              <div>
                <label style={labelStyle}>GST Number</label>
                <input
                  type="text"
                  name="gst"
                  maxLength={15}
                  placeholder="22AAAAA0000A1Z5"
                  value={formData.gst}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      gst: e.target.value.toUpperCase(),
                    })
                  }
                  style={{
                    ...inputStyle,
                    fontFamily: "'Courier New', monospace",
                    letterSpacing: 1,
                  }}
                />
                <p
                  style={{ margin: "4px 0 0", fontSize: 11, color: "#94A3B8" }}
                >
                  15-character GSTIN
                </p>
              </div>

              <div>
                <label style={labelStyle}>PAN Number</label>
                <input
                  type="text"
                  name="pan"
                  maxLength={10}
                  placeholder="ABCDE1234F"
                  value={formData.pan}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pan: e.target.value.toUpperCase(),
                    })
                  }
                  style={{
                    ...inputStyle,
                    fontFamily: "'Courier New', monospace",
                    letterSpacing: 1,
                  }}
                />
                <p
                  style={{ margin: "4px 0 0", fontSize: 11, color: "#94A3B8" }}
                >
                  10-character PAN
                </p>
              </div>
            </div>
          </div>

          {/* ── Additional Notes ── */}
          <div style={sectionStyle}>
            <h2 style={h2Style}>
              <MessageSquare size={20} color={COLORS.accent} />
              Additional Notes
            </h2>
            <div>
              <label style={labelStyle}>Remarks</label>
              <textarea
                name="remarks"
                rows={4}
                placeholder="Any special notes, project preferences, or additional information..."
                value={formData.remarks}
                onChange={handleChange}
                style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
              />
            </div>
          </div>

          {/* ── Buttons ── */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
            <button
              type="button"
              onClick={() => navigate("/clients/all")}
              style={{
                padding: "12px 24px",
                borderRadius: 10,
                border: `1px solid ${COLORS.border}`,
                background: "#fff",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 500,
                color: COLORS.muted,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "12px 24px",
                borderRadius: 10,
                border: "none",
                background: loading ? "#94A3B8" : COLORS.accent,
                color: "#fff",
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: 14,
                boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
              }}
            >
              {loading ? "Saving..." : "Save Client"}
            </button>
          </div>
        </form>
      </div>

      <Toast toasts={toasts} />
    </DashboardLayout>
  );
}
