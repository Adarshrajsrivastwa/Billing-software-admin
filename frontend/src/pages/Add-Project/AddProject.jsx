import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { createProject } from "../../services/projects";
import { getClients } from "../../services/clients";
import FinancialDetailsFields from "../../components/FinancialDetailsFields";
import {
  FolderPlus,
  MapPin,
  Calendar,
  IndianRupee,
  CheckCircle,
} from "lucide-react";

const COLORS = {
  primary: "#0F172A",
  accent: "#6366F1",
  border: "#E2E8F0",
  bg: "#F8FAFC",
  white: "#FFFFFF",
  muted: "#64748B",
};

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  border: `1px solid ${COLORS.border}`,
  borderRadius: "10px",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
};

// ─── Toast ────────────────────────────────────────────────
function Toast({ show, message }) {
  if (!show) return null;
  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        zIndex: 999,
        background: "#059669",
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
      <CheckCircle size={16} />
      {message}
    </div>
  );
}

// ─── Section Wrapper ──────────────────────────────────────
function Section({ children, title, icon: Icon }) {
  return (
    <div
      style={{
        background: COLORS.white,
        borderRadius: "16px",
        padding: "24px",
        border: `1px solid ${COLORS.border}`,
        marginBottom: "20px",
      }}
    >
      {title && (
        <h2
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "20px",
            fontSize: 16,
            color: COLORS.primary,
          }}
        >
          {Icon && <Icon size={20} color={COLORS.accent} />}
          {title}
        </h2>
      )}
      {children}
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div>
      {label && (
        <label
          style={{
            display: "block",
            fontSize: 13,
            color: COLORS.muted,
            marginBottom: 6,
            fontWeight: 500,
          }}
        >
          {label}
        </label>
      )}
      {children}
    </div>
  );
}

const GRID = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
  gap: "16px",
};

export default function AddProject() {
  const generateCode = () => `PRJ-${Date.now().toString().slice(-5)}`;

  const emptyForm = {
    projectName: "",
    projectCode: generateCode(),
    clientName: "",
    projectType: "Residential",
    projectStatus: "Pending",
    siteAddress: "",
    city: "",
    state: "",
    pincode: "",
    startDate: "",
    completionDate: "",
    budget: "",
    advanceAmount: "",
    notes: "",
    phone: "",
    email: "",
  };

  const [formData, setFormData] = useState(emptyForm);
  const [financialDetails, setFinancialDetails] = useState([]);
  const [toast, setToast] = useState(false);
  const [toastError, setToastError] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const list = await getClients();
        setClients(list);
      } catch (err) {
        console.error("Failed to fetch clients:", err);
      }
    };
    fetchClients();
  }, []);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const typedClient = formData.clientName.trim().toLowerCase();
  const clientSuggestions = clients.filter((c) =>
    c.clientName.toLowerCase().includes(typedClient)
  );
  const exactClientMatch = clients.some(
    (c) => c.clientName.toLowerCase() === typedClient
  );

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: false }));
    }
  };

  const validate = () => {
    const e = {};
    if (!formData.projectName.trim()) e.projectName = true;
    if (!formData.clientName.trim()) e.clientName = true;
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }

    setLoading(true);
    setToastError("");

    try {
      await createProject({ ...formData, financialDetails });
      setToast(true);
      setTimeout(() => navigate("/projects/all"), 1500);
    } catch (err) {
      setToastError(err.message || "Failed to save project");
    } finally {
      setLoading(false);
    }
  };

  const errBorder = (key) =>
    errors[key] ? { ...inputStyle, borderColor: "#EF4444" } : inputStyle;

  return (
    <DashboardLayout>
      <style>{`@keyframes slideIn{from{opacity:0;transform:translateX(30px)}to{opacity:1;transform:translateX(0)}}`}</style>
      <Toast
        show={toast}
        message="Project saved successfully! Check All Projects."
      />
      {toastError && (
        <div
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 999,
            background: "#EF4444",
            color: "#fff",
            padding: "12px 20px",
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 500,
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          }}
        >
          {toastError}
        </div>
      )}

      <div
        style={{
          background: COLORS.bg,
          minHeight: "100vh",
          padding: "30px",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: COLORS.white,
            borderRadius: "16px",
            padding: "20px 24px",
            border: `1px solid ${COLORS.border}`,
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              background: "#EEF2FF",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FolderPlus size={22} color={COLORS.accent} />
          </div>
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 20,
                fontWeight: 700,
                color: COLORS.primary,
              }}
            >
              Add New Project
            </h1>
            <p
              style={{
                margin: 0,
                marginTop: 2,
                color: COLORS.muted,
                fontSize: 13,
              }}
            >
              Create and manage interior design projects.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Project Information */}
          <Section title="Project Information" icon={FolderPlus}>
            <div style={GRID}>
              <Field label="Project Name *">
                <input
                  type="text"
                  name="projectName"
                  value={formData.projectName}
                  style={errBorder("projectName")}
                  onChange={handleChange}
                  placeholder="e.g. Luxury Villa"
                />
                {errors.projectName && (
                  <p style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>
                    Project name is required
                  </p>
                )}
              </Field>

              <Field label="Project Code">
                <input
                  value={formData.projectCode}
                  readOnly
                  style={{
                    ...inputStyle,
                    background: "#F1F5F9",
                    color: COLORS.muted,
                  }}
                />
              </Field>

              <Field label="Client Name *">
                <div style={{ position: "relative" }} ref={dropdownRef}>
                  <input
                    type="text"
                    name="clientName"
                    value={formData.clientName}
                    style={errBorder("clientName")}
                    onChange={(e) => {
                      handleChange(e);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="e.g. Rahul Sharma"
                    autoComplete="off"
                  />
                  {showSuggestions && (formData.clientName.trim() !== "" || clientSuggestions.length > 0) && (
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        zIndex: 10,
                        background: COLORS.white,
                        border: `1px solid ${COLORS.border}`,
                        borderRadius: "10px",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                        marginTop: "4px",
                        maxHeight: "200px",
                        overflowY: "auto",
                      }}
                    >
                      {clientSuggestions.map((c) => (
                        <div
                          key={c._id}
                          onClick={() => {
                            setFormData({
                              ...formData,
                              clientName: c.clientName,
                              phone: c.mobile || formData.phone,
                              email: c.email && c.email !== "—" ? c.email : formData.email,
                            });
                            setShowSuggestions(false);
                          }}
                          style={{
                            padding: "10px 14px",
                            cursor: "pointer",
                            fontSize: "14px",
                            color: COLORS.primary,
                            borderBottom: `1px solid ${COLORS.bg}`,
                            transition: "background 0.2s",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = COLORS.bg)}
                          onMouseLeave={(e) => (e.currentTarget.style.background = COLORS.white)}
                        >
                          <div style={{ fontWeight: 600 }}>{c.clientName}</div>
                          {c.company && c.company !== "—" && (
                            <div style={{ fontSize: "11px", color: COLORS.muted }}>{c.company}</div>
                          )}
                        </div>
                      ))}
                      {!exactClientMatch && formData.clientName.trim() !== "" && (
                        <div
                          onClick={() => {
                            navigate("/clients/add", {
                              state: { prefilledName: formData.clientName.trim() },
                            });
                          }}
                          style={{
                            padding: "12px 14px",
                            cursor: "pointer",
                            fontSize: "13px",
                            fontWeight: "600",
                            color: COLORS.accent,
                            background: "#EEF2FF",
                            textAlign: "center",
                            borderTop: `1px solid ${COLORS.border}`,
                          }}
                        >
                          + Add "{formData.clientName}" as a new client
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {errors.clientName && (
                  <p style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>
                    Client name is required
                  </p>
                )}
              </Field>

              <Field label="Phone">
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  style={inputStyle}
                  onChange={handleChange}
                  placeholder="9876543210"
                />
              </Field>

              <Field label="Email">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  style={inputStyle}
                  onChange={handleChange}
                  placeholder="client@email.com"
                />
              </Field>

              <Field label="Project Type">
                <select
                  name="projectType"
                  value={formData.projectType}
                  style={inputStyle}
                  onChange={handleChange}
                >
                  <option>Residential</option>
                  <option>Commercial</option>
                  <option>Office</option>
                  <option>Industrial</option>
                  <option>Renovation</option>
                </select>
              </Field>

              <Field label="Project Status">
                <select
                  name="projectStatus"
                  value={formData.projectStatus}
                  style={inputStyle}
                  onChange={handleChange}
                >
                  <option>Pending</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                  <option>Cancelled</option>
                </select>
              </Field>
            </div>
          </Section>

          {/* Location Details */}
          <Section title="Location Details" icon={MapPin}>
            <div style={GRID}>
              <Field label="Site Address">
                <input
                  name="siteAddress"
                  value={formData.siteAddress}
                  placeholder="House / Building No., Street"
                  style={inputStyle}
                  onChange={handleChange}
                />
              </Field>
              <Field label="City">
                <input
                  name="city"
                  value={formData.city}
                  placeholder="City"
                  style={inputStyle}
                  onChange={handleChange}
                />
              </Field>
              <Field label="State">
                <input
                  name="state"
                  value={formData.state}
                  placeholder="State"
                  style={inputStyle}
                  onChange={handleChange}
                />
              </Field>
              <Field label="Pincode">
                <input
                  name="pincode"
                  value={formData.pincode}
                  placeholder="800001"
                  style={inputStyle}
                  onChange={handleChange}
                />
              </Field>
            </div>
          </Section>

          {/* Timeline */}
          <Section title="Timeline" icon={Calendar}>
            <div style={GRID}>
              <Field label="Start Date">
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  style={inputStyle}
                  onChange={handleChange}
                />
              </Field>
              <Field label="Expected Completion Date">
                <input
                  type="date"
                  name="completionDate"
                  value={formData.completionDate}
                  style={inputStyle}
                  onChange={handleChange}
                />
              </Field>
            </div>
          </Section>

          {/* Financial Details */}
          <Section title="Financial Details" icon={IndianRupee}>
            <div style={GRID}>
              <Field label="Estimated Budget (₹)">
                <input
                  name="budget"
                  value={formData.budget}
                  placeholder="2500000"
                  type="number"
                  style={inputStyle}
                  onChange={handleChange}
                />
              </Field>
              <Field label="Advance Amount (₹)">
                <input
                  name="advanceAmount"
                  value={formData.advanceAmount}
                  placeholder="500000"
                  type="number"
                  style={inputStyle}
                  onChange={handleChange}
                />
              </Field>
            </div>
            <div style={{ marginTop: 16 }}>
              <Field label="Notes">
                <textarea
                  name="notes"
                  value={formData.notes}
                  placeholder="Any special instructions or notes…"
                  rows="4"
                  style={{ ...inputStyle, resize: "vertical" }}
                  onChange={handleChange}
                />
              </Field>
            </div>

            <FinancialDetailsFields
              financialDetails={financialDetails}
              onChange={setFinancialDetails}
              inputStyle={inputStyle}
              accentColor={COLORS.accent}
            />
          </Section>

          {/* Documents */}
          <Section title="Documents">
            <div style={GRID}>
              <Field label="Upload Images">
                <input type="file" multiple accept="image/*" />
              </Field>
              <Field label="Upload Drawings">
                <input type="file" multiple accept=".pdf,.dwg,.dxf" />
              </Field>
              <Field label="Upload Documents">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                />
              </Field>
            </div>
          </Section>

          {/* Buttons */}
          <div
            style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}
          >
            <button
              type="button"
              onClick={() => {
                setFormData({ ...emptyForm, projectCode: generateCode() });
                setFinancialDetails([]);
                setErrors({});
              }}
              style={{
                padding: "12px 24px",
                borderRadius: "10px",
                border: `1px solid ${COLORS.border}`,
                background: "#fff",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "12px 28px",
                borderRadius: "10px",
                border: "none",
                background: COLORS.accent,
                color: "#fff",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: 14,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Saving..." : "Save Project"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
