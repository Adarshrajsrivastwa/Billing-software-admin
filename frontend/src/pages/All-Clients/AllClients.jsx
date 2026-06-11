import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import {
  getClients,
  updateClient,
  deleteClient,
} from "../../services/clients";
import {
  Users,
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  X,
  CheckCircle,
  AlertTriangle,
  UserPlus,
  Phone,
  Mail,
  FolderOpen,
  IndianRupee,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const COLORS = {
  primary: "#0F172A",
  accent: "#6366F1",
  border: "#E2E8F0",
  bg: "#F8FAFC",
  white: "#FFFFFF",
  muted: "#64748B",
};

const fmt = (n) => "₹" + Number(n).toLocaleString("en-IN");
const PAGE_SIZE = 5;

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
function ConfirmDialog({ client, onConfirm, onCancel }) {
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
          Delete Client
        </h3>
        <p style={{ color: "#64748B", fontSize: 14, marginBottom: 24 }}>
          Are you sure you want to delete <strong>{client.clientName}</strong>?
          This action cannot be undone.
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

// ─── View Modal ───────────────────────────────────────────
function ViewModal({ client, onClose }) {
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
          width: "100%",
          maxWidth: 480,
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(135deg,#6366F1,#4F46E5)",
            padding: "22px 24px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>
                  {client.clientName.charAt(0)}
                </span>
              </div>
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#fff",
                  }}
                >
                  {client.clientName}
                </h2>
                <p
                  style={{
                    margin: "2px 0 0",
                    fontSize: 12,
                    color: "rgba(255,255,255,0.7)",
                  }}
                >
                  {client.id}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "rgba(255,255,255,0.2)",
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
              <X size={16} color="#fff" />
            </button>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 10,
              marginTop: 18,
            }}
          >
            {[
              { label: "Total Projects", value: client.totalProjects },
              { label: "Total Billing", value: fmt(client.totalBilling) },
              {
                label: "Pending",
                value:
                  client.pendingAmount > 0 ? fmt(client.pendingAmount) : "Nil",
              },
            ].map(({ label, value }) => (
              <div
                key={label}
                style={{
                  background: "rgba(255,255,255,0.15)",
                  borderRadius: 10,
                  padding: "10px 12px",
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: 10,
                    color: "rgba(255,255,255,0.7)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {label}
                </p>
                <p
                  style={{
                    margin: "4px 0 0",
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#fff",
                  }}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 24px" }}>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            {[
              { label: "Company", value: client.company || "—" },
              { label: "Mobile", value: "+91 " + client.mobile },
              { label: "Email", value: client.email || "—" },
              { label: "Client ID", value: client.id },
              ...(client.city ? [{ label: "City", value: client.city }] : []),
              ...(client.state
                ? [{ label: "State", value: client.state }]
                : []),
              ...(client.gst ? [{ label: "GST", value: client.gst }] : []),
              ...(client.pan ? [{ label: "PAN", value: client.pan }] : []),
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
                    fontSize: 13,
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
          {client.remarks && (
            <div
              style={{
                background: "#F8FAFC",
                borderRadius: 10,
                padding: "12px 14px",
                marginTop: 12,
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
                Remarks
              </p>
              <p style={{ fontSize: 13, fontWeight: 500, margin: 0 }}>
                {client.remarks}
              </p>
            </div>
          )}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: 18,
            }}
          >
            <button
              onClick={onClose}
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
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Modal ───────────────────────────────────────────
function EditModal({ client, onSave, onClose }) {
  const normalize = (v) => (v === "—" ? "" : v || "");
  const [form, setForm] = useState({
    ...client,
    company: normalize(client.company),
    email: normalize(client.email),
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const iStyle = {
    width: "100%",
    padding: "9px 12px",
    border: "1px solid #E2E8F0",
    borderRadius: 8,
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
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
          maxWidth: 500,
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
            Edit Client
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
              label: "Client Name *",
              key: "clientName",
              placeholder: "Full name",
            },
            { label: "Company", key: "company", placeholder: "Company name" },
            {
              label: "Mobile *",
              key: "mobile",
              placeholder: "10-digit number",
            },
            { label: "Email", key: "email", placeholder: "email@example.com" },
          ].map(({ label, key, placeholder }) => (
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
                value={form[key] || ""}
                onChange={set(key)}
                placeholder={placeholder}
                style={iStyle}
              />
            </div>
          ))}
        </div>
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
            onClick={() => onSave(form)}
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
            Save Changes
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

// ─── Main ────────────────────────────────────────────────
export default function AllClients() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const showToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3000);
  };

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getClients();
      setClients(data);
    } catch (err) {
      showToast(err.message || "Failed to load clients", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.clientName.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q) ||
      c.mobile.includes(q) ||
      (c.email || "").toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = {
    total: clients.length,
    projects: clients.reduce((a, c) => a + (c.totalProjects || 0), 0),
    billing: clients.reduce((a, c) => a + (c.totalBilling || 0), 0),
    pending: clients.reduce((a, c) => a + (c.pendingAmount || 0), 0),
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await deleteClient(modal.data._id);
      setClients((prev) => prev.filter((c) => c._id !== modal.data._id));
      showToast("Client deleted successfully", "error");
      setModal(null);
    } catch (err) {
      showToast(err.message || "Failed to delete client", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = async (updated) => {
    if (!updated.clientName?.trim() || !updated.mobile?.trim()) {
      showToast("Client name and mobile are required", "error");
      return;
    }

    setActionLoading(true);
    try {
      const saved = await updateClient(modal.data._id, updated);
      setClients((prev) =>
        prev.map((c) => (c._id === saved._id ? saved : c)),
      );
      showToast("Client updated successfully");
      setModal(null);
    } catch (err) {
      showToast(err.message || "Failed to update client", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const td = { padding: "13px 16px", fontSize: 14, color: "#0F172A" };

  return (
    <DashboardLayout>
      <style>{`
        @keyframes slideIn{from{opacity:0;transform:translateX(30px)}to{opacity:1;transform:translateX(0)}}
        .ac-row:hover td { background:#FAFBFF; }
        .ac-action-btn:hover { background:#F1F5F9 !important; }
      `}</style>

      <div style={{ padding: 30, background: "#F8FAFC", minHeight: "100vh" }}>
        {/* ── Header ── */}
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
              All Clients
            </h1>
            <p style={{ color: "#64748B", marginTop: 4 }}>
              Manage and view all registered clients
            </p>
          </div>
          <button
            onClick={() => navigate("/clients/add")}
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
            <UserPlus size={16} /> Add Client
          </button>
        </div>

        {/* ── Stats ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
            gap: 14,
            marginBottom: 22,
          }}
        >
          <StatCard
            icon={Users}
            iconBg="#EEF2FF"
            iconColor="#6366F1"
            label="Total Clients"
            value={stats.total}
          />
          <StatCard
            icon={FolderOpen}
            iconBg="#EEF2FF"
            iconColor="#6366F1"
            label="Total Projects"
            value={stats.projects}
          />
          <StatCard
            icon={IndianRupee}
            iconBg="#ECFDF5"
            iconColor="#059669"
            label="Total Billing"
            value={fmt(stats.billing)}
          />
          <StatCard
            icon={IndianRupee}
            iconBg="#FFFBEB"
            iconColor="#B45309"
            label="Pending Amount"
            value={fmt(stats.pending)}
          />
        </div>

        {/* ── Search bar ── */}
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
              placeholder="Search by name, ID, mobile, or email…"
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
            {filtered.length} client{filtered.length !== 1 ? "s" : ""} found
          </span>
        </div>

        {/* ── Table ── */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #E2E8F0",
            borderRadius: 14,
            overflowX: "auto",
          }}
        >
          <table
            style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}
          >
            <thead>
              <tr style={{ background: "#F8FAFC" }}>
                {[
                  "Client ID",
                  "Client Name",
                  "Mobile Number",
                  "Email",
                  "Total Projects",
                  "Total Billing",
                  "Pending Amount",
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
                    Loading clients...
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
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
                    No clients found
                  </td>
                </tr>
              ) : (
                paginated.map((c) => (
                  <tr
                    key={c._id}
                    className="ac-row"
                    style={{
                      borderBottom: "1px solid #F1F5F9",
                      cursor: "default",
                    }}
                  >
                    <td style={td}>
                      <span
                        style={{
                          fontSize: 12,
                          color: "#94A3B8",
                          fontFamily: "monospace",
                        }}
                      >
                        {c.id}
                      </span>
                    </td>
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
                              "linear-gradient(135deg,#6366F1,#4F46E5)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 700,
                              color: "#fff",
                            }}
                          >
                            {c.clientName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p
                            style={{ margin: 0, fontWeight: 600, fontSize: 14 }}
                          >
                            {c.clientName}
                          </p>
                          <p
                            style={{
                              margin: 0,
                              fontSize: 11,
                              color: "#94A3B8",
                            }}
                          >
                            {c.company}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td style={td}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                        }}
                      >
                        <Phone size={12} color="#94A3B8" />
                        <span>+91 {c.mobile}</span>
                      </div>
                    </td>
                    <td style={{ ...td, fontSize: 13, color: "#64748B" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                        }}
                      >
                        <Mail size={12} color="#94A3B8" />
                        <span>{c.email}</span>
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
                        {c.totalProjects || 0}
                      </span>
                    </td>
                    <td style={{ ...td, fontWeight: 600 }}>
                      {fmt(c.totalBilling || 0)}
                    </td>
                    <td
                      style={{
                        ...td,
                        color:
                          (c.pendingAmount || 0) > 0 ? "#EF4444" : "#94A3B8",
                        fontWeight: (c.pendingAmount || 0) > 0 ? 600 : 400,
                      }}
                    >
                      {(c.pendingAmount || 0) > 0 ? fmt(c.pendingAmount) : "—"}
                    </td>
                    <td style={td}>
                      <div style={{ display: "flex", gap: 4 }}>
                        {[
                          {
                            Icon: Eye,
                            color: "#6366F1",
                            title: "View",
                            onClick: () => setModal({ type: "view", data: c }),
                          },
                          {
                            Icon: Pencil,
                            color: "#059669",
                            title: "Edit",
                            onClick: () => setModal({ type: "edit", data: c }),
                          },
                          {
                            Icon: Trash2,
                            color: "#EF4444",
                            title: "Delete",
                            onClick: () =>
                              setModal({ type: "delete", data: c }),
                          },
                        ].map(({ Icon, color, title, onClick }) => (
                          <button
                            key={title}
                            title={title}
                            onClick={onClick}
                            className="ac-action-btn"
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
      </div>

      {/* Modals */}
      {modal?.type === "view" && (
        <ViewModal client={modal.data} onClose={() => setModal(null)} />
      )}
      {modal?.type === "edit" && (
        <EditModal
          client={modal.data}
          onSave={handleEdit}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === "delete" && (
        <ConfirmDialog
          client={modal.data}
          onConfirm={actionLoading ? undefined : handleDelete}
          onCancel={() => !actionLoading && setModal(null)}
        />
      )}

      <Toast toasts={toasts} />
    </DashboardLayout>
  );
}
