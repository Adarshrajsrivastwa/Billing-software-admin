import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import {
  getProjects,
  updateProject,
  deleteProject,
  createProject,
} from "../../services/projects";
import FinancialDetailsFields from "../../components/FinancialDetailsFields";
import GstInvoiceModal from "../../components/GstInvoiceModal";
import { getInvoices, mapInvoiceToView } from "../../services/invoice";
import GstInvoice, { downloadGstInvoice } from "../../components/GstInvoice";
import {
  Eye,
  Pencil,
  Trash2,
  Receipt,
  Search,
  Plus,
  X,
  LayoutGrid,
  Loader,
  CheckCircle,
  IndianRupee,
  AlertTriangle,
} from "lucide-react";

// ─── Helpers ─────────────────────────────────────────────
const emptyForm = {
  projectName: "",
  clientName: "",
  type: "Residential",
  startDate: "",
  budget: "",
  advanceAmount: "",
  status: "In Progress",
  pendingAmount: "",
  phone: "",
  email: "",
  address: "",
  notes: "",
  financialDetails: [],
};

const fmt = (n) => "₹" + Number(n).toLocaleString("en-IN");

const statusStyle = {
  "In Progress": { background: "#EEF2FF", color: "#4F46E5" },
  Completed: { background: "#ECFDF5", color: "#059669" },
  Pending: { background: "#FFFBEB", color: "#B45309" },
  Cancelled: { background: "#FEF2F2", color: "#EF4444" },
};

// ─── Toast ───────────────────────────────────────────────
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

// ─── Confirm Dialog ───────────────────────────────────────
function ConfirmDialog({ message, onConfirm, onCancel }) {
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
          Delete Project
        </h3>
        <p style={{ color: "#64748B", fontSize: 14, marginBottom: 24 }}>
          {message}
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: "10px",
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
              padding: "10px",
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

// ─── View Modal ───────────────────────────────────────────
function ViewModal({ project, onClose }) {
  const paid =
    project.totalReceived ?? Math.max(0, project.budget - project.pendingAmount);
  const paidPct =
    project.budget > 0 ? Math.round((paid / project.budget) * 100) : 0;
  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        zIndex: 100,
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
          maxWidth: 520,
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
              {project.projectName}
            </h2>
            <span style={{ fontSize: 12, color: "#94A3B8" }}>{project.id}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                ...(statusStyle[project.status] || statusStyle["Pending"]),
                padding: "5px 14px",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {project.status}
            </span>
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
        </div>

        {/* Progress */}
        <div
          style={{
            background: "#F8FAFC",
            borderRadius: 12,
            padding: 16,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <span style={{ fontSize: 13, color: "#64748B" }}>
              Payment Progress
            </span>
            <span style={{ fontSize: 13, fontWeight: 600 }}>{paidPct}%</span>
          </div>
          <div style={{ height: 8, background: "#E2E8F0", borderRadius: 999 }}>
            <div
              style={{
                height: 8,
                width: `${paidPct}%`,
                background: paidPct === 100 ? "#059669" : "#6366F1",
                borderRadius: 999,
                transition: "width 0.5s",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 10,
              fontSize: 13,
            }}
          >
            <span style={{ color: "#059669", fontWeight: 600 }}>
              Paid: {fmt(paid)}
            </span>
            <span style={{ color: "#EF4444", fontWeight: 600 }}>
              Pending: {fmt(project.pendingAmount)}
            </span>
          </div>
        </div>

        {/* Details */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 14,
            marginBottom: 16,
          }}
        >
          {[
            { label: "Client Name", value: project.clientName },
            { label: "Project Type", value: project.type },
            { label: "Start Date", value: project.startDate },
            { label: "Total Budget", value: fmt(project.budget) },
            { label: "Phone", value: project.phone || "—" },
            { label: "Email", value: project.email || "—" },
          ].map(({ label, value }) => (
            <div
              key={label}
              style={{
                background: "#F8FAFC",
                borderRadius: 10,
                padding: "12px 14px",
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  color: "#94A3B8",
                  marginBottom: 4,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {label}
              </p>
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  margin: 0,
                  wordBreak: "break-all",
                }}
              >
                {value}
              </p>
            </div>
          ))}
        </div>
        {project.address && (
          <div
            style={{
              background: "#F8FAFC",
              borderRadius: 10,
              padding: "12px 14px",
            }}
          >
            <p
              style={{
                fontSize: 11,
                color: "#94A3B8",
                marginBottom: 4,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Address
            </p>
            <p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>
              {project.address}
            </p>
          </div>
        )}
        {project.notes && (
          <div
            style={{
              background: "#F8FAFC",
              borderRadius: 10,
              padding: "12px 14px",
              marginTop: 14,
            }}
          >
            <p
              style={{
                fontSize: 11,
                color: "#94A3B8",
                marginBottom: 4,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Notes
            </p>
            <p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>
              {project.notes}
            </p>
          </div>
        )}

        {(project.financialDetails?.length > 0 ||
          project.advanceAmount > 0 ||
          project.budget > 0) && (
          <div style={{ marginTop: 16 }}>
            <p
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#334155",
                marginBottom: 10,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Financial Details
            </p>
            <div
              style={{
                border: "1px solid #E2E8F0",
                borderRadius: 10,
                overflow: "hidden",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#F8FAFC" }}>
                    {["Title", "Type", "Amount"].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "10px 12px",
                          textAlign: "left",
                          fontSize: 11,
                          color: "#64748B",
                          fontWeight: 600,
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {project.budget > 0 && (
                    <tr>
                      <td style={finTd}>Total Budget</td>
                      <td style={finTd}>Budget</td>
                      <td style={finTd}>{fmt(project.budget)}</td>
                    </tr>
                  )}
                  {project.advanceAmount > 0 && (
                    <tr>
                      <td style={finTd}>Advance Amount</td>
                      <td style={finTd}>Advance</td>
                      <td style={finTd}>{fmt(project.advanceAmount)}</td>
                    </tr>
                  )}
                  {(project.financialDetails || []).map((item, idx) => (
                    <tr key={item._id || idx}>
                      <td style={finTd}>{item.title}</td>
                      <td style={finTd}>{item.type}</td>
                      <td style={finTd}>{fmt(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {project.totalExpenses > 0 && (
              <p
                style={{
                  marginTop: 10,
                  fontSize: 13,
                  color: "#64748B",
                }}
              >
                Total Expenses:{" "}
                <strong style={{ color: "#EF4444" }}>
                  {fmt(project.totalExpenses)}
                </strong>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const finTd = {
  padding: "10px 12px",
  fontSize: 13,
  borderTop: "1px solid #F1F5F9",
};


// ─── Add/Edit Modal ───────────────────────────────────────
function FormModal({ editId, form, setForm, onSave, onClose }) {
  const handleChange = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        zIndex: 100,
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
          maxWidth: 520,
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 22,
          }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>
            {editId ? "Edit Project" : "Add New Project"}
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
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
        >
          {[
            {
              label: "Project Name *",
              key: "projectName",
              placeholder: "e.g. Luxury Villa",
            },
            {
              label: "Client Name *",
              key: "clientName",
              placeholder: "e.g. Rahul Sharma",
            },
            {
              label: "Start Date",
              key: "startDate",
              placeholder: "01-Jan-2026",
            },
            {
              label: "Budget (₹)",
              key: "budget",
              placeholder: "2500000",
              type: "number",
            },
            {
              label: "Advance Amount (₹)",
              key: "advanceAmount",
              placeholder: "500000",
              type: "number",
            },
            {
              label: "Pending Amount (₹)",
              key: "pendingAmount",
              placeholder: "0",
              type: "number",
            },
            { label: "Phone", key: "phone", placeholder: "9876543210" },
            { label: "Email", key: "email", placeholder: "client@email.com" },
          ].map(({ label, key, placeholder, type = "text" }) => (
            <div key={key}>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  color: "#64748B",
                  marginBottom: 5,
                }}
              >
                {label}
              </label>
              <input
                type={type}
                value={form[key]}
                onChange={(e) => handleChange(key, e.target.value)}
                placeholder={placeholder}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  border: "1px solid #E2E8F0",
                  borderRadius: 8,
                  fontSize: 14,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
          ))}
          <div>
            <label
              style={{
                display: "block",
                fontSize: 13,
                color: "#64748B",
                marginBottom: 5,
              }}
            >
              Project Type
            </label>
            <select
              value={form.type}
              onChange={(e) => handleChange("type", e.target.value)}
              style={{
                width: "100%",
                padding: "9px 12px",
                border: "1px solid #E2E8F0",
                borderRadius: 8,
                fontSize: 14,
              }}
            >
              {["Residential", "Office", "Commercial", "Industrial"].map(
                (t) => (
                  <option key={t}>{t}</option>
                ),
              )}
            </select>
          </div>
          <div>
            <label
              style={{
                display: "block",
                fontSize: 13,
                color: "#64748B",
                marginBottom: 5,
              }}
            >
              Status
            </label>
            <select
              value={form.status}
              onChange={(e) => handleChange("status", e.target.value)}
              style={{
                width: "100%",
                padding: "9px 12px",
                border: "1px solid #E2E8F0",
                borderRadius: 8,
                fontSize: 14,
              }}
            >
              {["In Progress", "Completed", "Pending", "Cancelled"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <label
            style={{
              display: "block",
              fontSize: 13,
              color: "#64748B",
              marginBottom: 5,
            }}
          >
            Address
          </label>
          <input
            value={form.address}
            onChange={(e) => handleChange("address", e.target.value)}
            placeholder="City, State"
            style={{
              width: "100%",
              padding: "9px 12px",
              border: "1px solid #E2E8F0",
              borderRadius: 8,
              fontSize: 14,
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        <FinancialDetailsFields
          financialDetails={form.financialDetails || []}
          onChange={(items) =>
            setForm((prev) => ({ ...prev, financialDetails: items }))
          }
          inputStyle={{
            width: "100%",
            padding: "9px 12px",
            border: "1px solid #E2E8F0",
            borderRadius: 8,
            fontSize: 14,
            outline: "none",
            boxSizing: "border-box",
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            marginTop: 22,
          }}
        >
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
            onClick={onSave}
            style={{
              padding: "9px 18px",
              background: "#6366F1",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {editId ? "Save Changes" : "Add Project"}
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

// ─── Project Invoices Modal ───────────────────────────────
function ProjectInvoicesModal({ project, onClose }) {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewInvoiceId, setViewInvoiceId] = useState(null);
  const [downloadInvoice, setDownloadInvoice] = useState(null);

  useEffect(() => {
    const loadInvoices = async () => {
      try {
        setLoading(true);
        const res = await getInvoices({ projectId: project._id });
        setInvoices(res.data.invoices || []);
      } catch (err) {
        console.error("Failed to load invoices", err);
      } finally {
        setLoading(false);
      }
    };
    loadInvoices();
  }, [project._id]);

  useEffect(() => {
    if (!downloadInvoice) return;
    const timer = setTimeout(() => {
      downloadGstInvoice(downloadInvoice.invoiceNo);
      setDownloadInvoice(null);
    }, 150);
    return () => clearTimeout(timer);
  }, [downloadInvoice]);

  const handleDownloadPdf = (inv) => {
    setDownloadInvoice(mapInvoiceToView(inv));
  };

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        zIndex: 100,
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
          maxWidth: 720,
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
              Project Invoices — {project.projectName}
            </h2>
            <span style={{ fontSize: 12, color: "#94A3B8" }}>{project.id}</span>
          </div>
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

        {downloadInvoice && (
          <div className="fixed left-[-9999px] top-0 opacity-0 pointer-events-none">
            <GstInvoice {...downloadInvoice} />
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#64748B" }}>
            <Loader size={20} style={{ display: "inline", marginRight: 8 }} className="animate-spin" />
            Loading invoices...
          </div>
        ) : invoices.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#94A3B8" }}>
            Is project ke liye koi invoice nahi mila.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#F8FAFC" }}>
                  {["Invoice No", "Date", "Grand Total", "Paid", "Pending", "Actions"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 12px",
                        textAlign: "left",
                        fontSize: 11,
                        color: "#64748B",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        borderBottom: "1px solid #E2E8F0",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => {
                  const dateStr = inv.invoiceDate?.split("T")[0] || inv.invoiceDate;
                  const grandTotal = inv.calculation?.grandTotal || inv.grandTotal || 0;
                  const paid = inv.paidAmount || 0;
                  const pending = grandTotal - paid;

                  return (
                    <tr key={inv._id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                      <td style={{ padding: "12px", fontSize: 13, fontWeight: 600, color: "#334155" }}>
                        {inv.invoiceNo}
                      </td>
                      <td style={{ padding: "12px", fontSize: 13, color: "#64748B" }}>
                        {dateStr}
                      </td>
                      <td style={{ padding: "12px", fontSize: 13, fontWeight: 500, color: "#1E293B" }}>
                        {fmt(grandTotal)}
                      </td>
                      <td style={{ padding: "12px", fontSize: 13, color: "#059669", fontWeight: 500 }}>
                        {fmt(paid)}
                      </td>
                      <td style={{ padding: "12px", fontSize: 13, color: "#EF4444", fontWeight: 500 }}>
                        {fmt(pending < 0 ? 0 : pending)}
                      </td>
                      <td style={{ padding: "12px" }}>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            onClick={() => setViewInvoiceId(inv._id)}
                            style={{
                              padding: "6px 12px",
                              background: "#EEF2FF",
                              color: "#4F46E5",
                              border: "none",
                              borderRadius: 6,
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            View
                          </button>
                          <button
                            onClick={() => {
                              onClose();
                              navigate("/projects/billing", { state: { editInvoiceId: inv._id } });
                            }}
                            style={{
                              padding: "6px 12px",
                              background: "#ECFDF5",
                              color: "#059669",
                              border: "none",
                              borderRadius: 6,
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDownloadPdf(inv)}
                            style={{
                              padding: "6px 12px",
                              background: "#FFF7ED",
                              color: "#EA580C",
                              border: "none",
                              borderRadius: 6,
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            Download
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {viewInvoiceId && (
          <GstInvoiceModal
            open={Boolean(viewInvoiceId)}
            onClose={() => setViewInvoiceId(null)}
            title="View Invoice"
            invoiceId={viewInvoiceId}
          />
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────
export default function AllProjects() {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const showToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      3000,
    );
  };

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getProjects();
      setProjects(data);
    } catch (err) {
      showToast(err.message || "Failed to load projects", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const filtered = projects.filter((p) => {
    const q = search.toLowerCase();
    return (
      (p.projectName.toLowerCase().includes(q) ||
        p.clientName.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q)) &&
      (filterStatus === "All" || p.status === filterStatus)
    );
  });

  const stats = {
    total: projects.length,
    inProgress: projects.filter((p) => p.status === "In Progress").length,
    completed: projects.filter((p) => p.status === "Completed").length,
    pending: projects.reduce((a, p) => a + Number(p.pendingAmount), 0),
  };

  const openAdd = () => {
    setForm(emptyForm);
    setModal({ type: "add" });
  };
  const openEdit = (p) => {
    setForm({
      ...p,
      budget: String(p.budget),
      advanceAmount: String(p.advanceAmount || 0),
      pendingAmount: String(p.pendingAmount),
      financialDetails: (p.financialDetails || []).map((item) => ({
        ...item,
        amount: String(item.amount),
      })),
    });
    setModal({ type: "edit", data: p });
  };
  const openView = (p) => setModal({ type: "view", data: p });
  const openInvoice = (p) => setModal({ type: "invoice", data: p });
  const openDelete = (p) => setModal({ type: "delete", data: p });

  const confirmDelete = async () => {
    try {
      setSaving(true);
      await deleteProject(modal.data._id);
      setProjects((prev) => prev.filter((p) => p._id !== modal.data._id));
      showToast("Project deleted successfully", "error");
      setModal(null);
    } catch (err) {
      showToast(err.message || "Failed to delete project", "error");
    } finally {
      setSaving(false);
    }
  };

  const saveProject = async () => {
    if (!form.projectName.trim() || !form.clientName.trim()) {
      showToast("Please fill required fields", "warning");
      return;
    }

    try {
      setSaving(true);

      if (modal.type === "edit") {
        const updated = await updateProject(modal.data._id, form);
        setProjects((prev) =>
          prev.map((p) => (p._id === updated._id ? updated : p)),
        );
        showToast("Project updated successfully");
      } else {
        const created = await createProject({
          ...form,
          projectType: form.type,
          projectStatus: form.status,
          projectCode: `PRJ-${Date.now().toString().slice(-5)}`,
          financialDetails: form.financialDetails || [],
        });
        setProjects((prev) => [created, ...prev]);
        showToast("Project added successfully");
      }

      setModal(null);
    } catch (err) {
      showToast(err.message || "Failed to save project", "error");
    } finally {
      setSaving(false);
    }
  };

  const td = { padding: "13px 16px", fontSize: 14 };

  return (
    <DashboardLayout>
      <style>{`@keyframes slideIn{from{opacity:0;transform:translateX(30px)}to{opacity:1;transform:translateX(0)}}`}</style>
      <div style={{ padding: 30, background: "#F8FAFC", minHeight: "100vh" }}>
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
              All Projects
            </h1>
            <p style={{ color: "#64748B", marginTop: 4 }}>
              Manage and track all running projects
            </p>
          </div>
          <button
            onClick={openAdd}
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
            }}
          >
            <Plus size={16} /> Add Project
          </button>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
            gap: 14,
            marginBottom: 22,
          }}
        >
          <StatCard
            icon={LayoutGrid}
            iconBg="#EEF2FF"
            iconColor="#6366F1"
            label="Total Projects"
            value={stats.total}
          />
          <StatCard
            icon={Loader}
            iconBg="#EEF2FF"
            iconColor="#6366F1"
            label="In Progress"
            value={stats.inProgress}
          />
          <StatCard
            icon={CheckCircle}
            iconBg="#ECFDF5"
            iconColor="#059669"
            label="Completed"
            value={stats.completed}
          />
          <StatCard
            icon={IndianRupee}
            iconBg="#FFFBEB"
            iconColor="#B45309"
            label="Pending Amount"
            value={fmt(stats.pending)}
          />
        </div>

        {/* Toolbar */}
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
            flexWrap: "wrap",
          }}
        >
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
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
              placeholder="Search by project, client, or ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 12px 9px 36px",
                border: "1px solid #E2E8F0",
                borderRadius: 8,
                fontSize: 14,
                outline: "none",
              }}
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: "9px 14px",
              border: "1px solid #E2E8F0",
              borderRadius: 8,
              fontSize: 14,
              background: "#fff",
              cursor: "pointer",
            }}
          >
            {["All", "In Progress", "Completed", "Pending", "Cancelled"].map(
              (s) => (
                <option key={s}>{s}</option>
              ),
            )}
          </select>
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
                  "Project ID",
                  "Project Name",
                  "Client Name",
                  "Type",
                  "Start Date",
                  "Budget",
                  "Status",
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
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    style={{
                      padding: 48,
                      textAlign: "center",
                      color: "#94A3B8",
                      fontSize: 14,
                    }}
                  >
                    <Loader
                      size={20}
                      style={{ display: "inline", marginRight: 8 }}
                    />
                    Loading projects...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    style={{
                      padding: 48,
                      textAlign: "center",
                      color: "#94A3B8",
                      fontSize: 14,
                    }}
                  >
                    No projects found
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr
                    key={p._id || p.id}
                    style={{
                      borderBottom: "1px solid #F1F5F9",
                      cursor: "default",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#FAFBFF")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <td style={td}>
                      <span style={{ color: "#94A3B8", fontSize: 12 }}>
                        {p.id}
                      </span>
                    </td>
                    <td style={{ ...td, fontWeight: 600 }}>{p.projectName}</td>
                    <td style={td}>{p.clientName}</td>
                    <td style={td}>{p.type}</td>
                    <td style={td}>{p.startDate}</td>
                    <td style={td}>{fmt(p.budget)}</td>
                    <td style={td}>
                      <span
                        style={{
                          ...(statusStyle[p.status] || statusStyle["Pending"]),
                          padding: "5px 12px",
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td style={td}>
                      <div style={{ display: "flex", gap: 4 }}>
                        {[
                          {
                            Icon: Eye,
                            color: "#6366F1",
                            title: "View Details",
                            onClick: () => openView(p),
                          },
                          {
                            Icon: Pencil,
                            color: "#059669",
                            title: "Edit",
                            onClick: () => openEdit(p),
                          },
                          {
                            Icon: Trash2,
                            color: "#EF4444",
                            title: "Delete",
                            onClick: () => openDelete(p),
                          },
                          {
                            Icon: Receipt,
                            color: "#B45309",
                            title: "Invoice",
                            onClick: () => openInvoice(p),
                          },
                        ].map(({ Icon, color, title, onClick }) => (
                          <button
                            key={title}
                            title={title}
                            onClick={onClick}
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
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background = "#F1F5F9")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background = "none")
                            }
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
        </div>
      </div>

      {/* Modals */}
      {(modal?.type === "add" || modal?.type === "edit") && (
        <FormModal
          editId={modal.type === "edit" ? modal.data?.id : null}
          form={form}
          setForm={setForm}
          onSave={saveProject}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === "view" && (
        <ViewModal project={modal.data} onClose={() => setModal(null)} />
      )}
      {modal?.type === "invoice" && (
        <ProjectInvoicesModal
          project={modal.data}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === "delete" && (
        <ConfirmDialog
          message={`Are you sure you want to delete "${modal.data.projectName}"? This action cannot be undone.`}
          onConfirm={confirmDelete}
          onCancel={() => setModal(null)}
        />
      )}

      <Toast toasts={toasts} />
    </DashboardLayout>
  );
}
