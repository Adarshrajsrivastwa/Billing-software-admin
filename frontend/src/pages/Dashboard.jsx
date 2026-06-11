import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import {
  FolderOpen,
  CheckCircle,
  Users,
  TrendingUp,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Briefcase,
  Receipt,
  UserCheck,
  RefreshCw,
  FileText,
  Plus,
  Eye,
  IndianRupee,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { getProjects } from "../services/projects";
import { getClients } from "../services/clients";
import { getInvoices } from "../services/invoice";
import { getQuotations } from "../services/quotations";

const C = {
  primary: "#0F172A",
  accent: "#6366F1",
  accentLight: "#EEF2FF",
  purple: "#7C3AED",
  purpleLight: "#EDE9FE",
  success: "#10B981",
  successLight: "#D1FAE5",
  warning: "#F59E0B",
  warningLight: "#FEF3C7",
  danger: "#EF4444",
  dangerLight: "#FEE2E2",
  muted: "#64748B",
  border: "#E2E8F0",
  bg: "#F8FAFC",
  white: "#FFFFFF",
};

const INR = (n) =>
  "₹" + Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });

const INR_K = (n) => {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
  return INR(n);
};

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function getInitials(name = "") {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

const AVATAR_COLORS = ["#6366F1","#10B981","#F59E0B","#EF4444","#0EA5E9","#8B5CF6","#EC4899"];
const avatarColor = (i) => AVATAR_COLORS[i % AVATAR_COLORS.length];

/* ── StatCard ────────────────────────────────────────────── */
function StatCard({ title, value, sub, icon: Icon, accent, loading }) {
  return (
    <div
      style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: "22px 24px", display: "flex", flexDirection: "column", gap: 14, transition: "box-shadow 0.2s, transform 0.2s" }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 28px rgba(99,102,241,0.10)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ width: 46, height: 46, borderRadius: 12, background: accent + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={22} color={accent} />
        </div>
        {sub && (
          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: sub.positive ? C.success : C.danger, background: sub.positive ? C.successLight : C.dangerLight, padding: "4px 10px", borderRadius: 20 }}>
            {sub.positive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            {sub.label}
          </span>
        )}
      </div>
      <div>
        <p style={{ margin: 0, fontSize: 13, color: C.muted, fontWeight: 500, marginBottom: 4 }}>{title}</p>
        <p style={{ margin: 0, fontSize: 28, fontWeight: 700, color: C.primary, letterSpacing: "-0.5px" }}>
          {loading ? <span style={{ color: C.border }}>—</span> : value}
        </p>
      </div>
    </div>
  );
}

/* ── StatusBadge ─────────────────────────────────────────── */
function StatusBadge({ status }) {
  const map = {
    Planning:    { bg: "#EEF2FF",  color: "#6366F1" },
    Active:      { bg: "#EEF2FF",  color: "#6366F1" },
    "In Progress":{ bg: "#DBEAFE", color: "#2563EB" },
    Completed:   { bg: "#D1FAE5",  color: "#059669" },
    "On Hold":   { bg: "#FEF3C7",  color: "#D97706" },
    Cancelled:   { bg: "#FEE2E2",  color: "#DC2626" },
    Paid:        { bg: "#D1FAE5",  color: "#059669" },
    Pending:     { bg: "#FEF3C7",  color: "#D97706" },
    Overdue:     { bg: "#FEE2E2",  color: "#DC2626" },
  };
  const s = map[status] || { bg: "#F1F5F9", color: "#64748B" };
  return <span style={{ background: s.bg, color: s.color, fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20 }}>{status}</span>;
}

/* ── ProgressBar ─────────────────────────────────────────── */
function ProgressBar({ value = 0 }) {
  const pct = Math.min(100, Math.max(0, value));
  const color = pct === 100 ? C.success : pct >= 60 ? C.accent : pct >= 30 ? C.warning : C.danger;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ flex: 1, height: 6, background: "#F1F5F9", borderRadius: 99 }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 99, transition: "width 0.4s" }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color: C.muted, minWidth: 32 }}>{pct}%</span>
    </div>
  );
}

/* ── Skeleton ────────────────────────────────────────────── */
function Skeleton({ h = 20, w = "100%", r = 8 }) {
  return <div style={{ height: h, width: w, borderRadius: r, background: "linear-gradient(90deg,#F1F5F9 25%,#E2E8F0 50%,#F1F5F9 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" }} />;
}


/* ════════════════════════════════════════════════════════════
   MAIN DASHBOARD
════════════════════════════════════════════════════════════ */
export default function Dashboard() {
  const navigate = useNavigate();
  const [projects,   setProjects]   = useState([]);
  const [clients,    setClients]    = useState([]);
  const [invoices,   setInvoices]   = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  useEffect(() => {
    setLoading(true);
    Promise.allSettled([
      getProjects(),
      getClients(),
      getInvoices(),
      getQuotations().then(r => r.data || []),
    ]).then(([pRes, cRes, iRes, qRes]) => {
      setProjects(pRes.status   === "fulfilled" ? pRes.value : []);
      setClients(cRes.status    === "fulfilled" ? cRes.value : []);
      setInvoices(iRes.status   === "fulfilled" ? (iRes.value?.data?.invoices || iRes.value?.data || []) : []);
      setQuotations(qRes.status === "fulfilled" ? qRes.value : []);
    }).finally(() => setLoading(false));
  }, [lastRefresh]);

  /* ── stats ── */
  const totalProjects  = projects.length;
  const activeProjects = projects.filter(p => ["Active","In Progress","Planning"].includes(p.status)).length;
  const completedProjs = projects.filter(p => p.status === "Completed").length;
  const onHoldProjs    = projects.filter(p => p.status === "On Hold").length;
  const cancelledProjs = projects.filter(p => p.status === "Cancelled").length;
  const totalClients   = clients.length;
  const totalRevenue   = invoices.reduce((s, i) => s + (i.grandTotal || 0), 0);
  const totalPaid      = invoices.reduce((s, i) => s + (i.paidAmount || 0), 0);
  const totalPending   = totalRevenue - totalPaid;

  /* ── quotation stats ── */
  const totalQuotations  = quotations.length;
  const totalQuoteValue  = quotations.reduce((s, q) => s + (q.totalInclGST || 0), 0);
  const recentQuotations = [...quotations]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5);

  /* ── monthly chart ── */
  const monthlyMap = {};
  invoices.forEach(inv => {
    const d = new Date(inv.invoiceDate || inv.createdAt);
    if (isNaN(d)) return;
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!monthlyMap[key]) monthlyMap[key] = { month: MONTH_NAMES[d.getMonth()], revenue: 0, paid: 0, sort: d.getFullYear() * 12 + d.getMonth() };
    monthlyMap[key].revenue += (inv.grandTotal || 0);
    monthlyMap[key].paid    += (inv.paidAmount || 0);
  });
  const revenueData = Object.values(monthlyMap).sort((a, b) => a.sort - b.sort).slice(-8);

  /* ── donut data ── */
  const projectStatusData = [
    { name: "Active",    value: activeProjects, color: "#6366F1" },
    { name: "Completed", value: completedProjs, color: "#10B981" },
    { name: "On Hold",   value: onHoldProjs,    color: "#F59E0B" },
    { name: "Cancelled", value: cancelledProjs, color: "#EF4444" },
  ].filter(d => d.value > 0);

  const recentProjects  = [...projects].sort((a, b) => new Date(b.startDate || 0) - new Date(a.startDate || 0)).slice(0, 5);
  const recentClients   = [...clients].slice(0, 5);
  const latestInvoices  = [...invoices].sort((a, b) => new Date(b.invoiceDate || b.createdAt) - new Date(a.invoiceDate || a.createdAt)).slice(0, 5);
  const pendingInvoices = invoices.filter(i => (i.grandTotal || 0) > (i.paidAmount || 0));

  const statusProgress = (s) => {
    if (s === "Completed") return 100;
    if (s === "Active" || s === "In Progress") return 60;
    if (s === "Planning") return 20;
    if (s === "On Hold") return 30;
    return 0;
  };

  const invStatus = (inv) => {
    const total = inv.grandTotal || inv.totalAmount || 0;
    const paid  = inv.paidAmount || 0;
    if (paid >= total && total > 0) return "Paid";
    if (paid > 0) return "Partial";
    const invDate = new Date(inv.invoiceDate || inv.createdAt);
    if (!isNaN(invDate) && new Date() - invDate > 30 * 86400000) return "Overdue";
    return "Pending";
  };

  /* ── th style helper ── */
  const th = { padding: "10px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" };

  return (
    <DashboardLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes fadeIn  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .dash-row:hover td { background:#F8FAFC !important; }
        .quo-row:hover td  { background:#FAFAFF !important; }
      `}</style>

      <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", padding: "28px 32px" }}>

        {/* ── HEADER ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: C.primary, letterSpacing: "-0.5px" }}>Dashboard</h1>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: C.muted }}>Live overview — projects, billing, quotations & clients</p>
          </div>
          <button
            onClick={() => setLastRefresh(Date.now())}
            style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 18px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.white, cursor: "pointer", fontSize: 14, fontWeight: 600, color: C.muted, transition: "border-color 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = C.accent}
            onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
          >
            <RefreshCw size={15} />
            Refresh
          </button>
        </div>


        {/* ── STAT CARDS ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24, animation: "fadeIn 0.4s ease" }}>
          <StatCard title="Total Projects"    value={totalProjects}        icon={FolderOpen}  accent="#6366F1" loading={loading} />
          <StatCard title="Active Projects"   value={activeProjects}       icon={Briefcase}   accent="#10B981" loading={loading} />
          <StatCard title="Total Clients"     value={totalClients}         icon={Users}       accent="#F59E0B" loading={loading} />
          <StatCard title="Total Billed"      value={INR_K(totalRevenue)}  icon={TrendingUp}  accent="#10B981" loading={loading} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
          <StatCard title="Completed Projects" value={completedProjs}       icon={CheckCircle} accent="#0EA5E9" loading={loading} />
          <StatCard title="Pending Payments"   value={INR_K(totalPending)}  icon={AlertCircle} accent="#EF4444" loading={loading} />
          <StatCard title="Total Quotations"   value={totalQuotations}      icon={FileText}    accent="#7C3AED" loading={loading} />
          <StatCard title="Quotation Value"    value={INR_K(totalQuoteValue)} icon={IndianRupee} accent="#7C3AED" loading={loading} />
        </div>

        {/* ── CHARTS ROW ── */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 24 }}>

          {/* Revenue Chart */}
          <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.primary }}>Invoice Revenue</h2>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: C.muted }}>Billed vs Paid — by month</p>
              </div>
              <div style={{ display: "flex", gap: 16, fontSize: 13 }}>
                {[{ label: "Billed", color: C.accent }, { label: "Paid", color: C.success }].map(l => (
                  <span key={l.label} style={{ display: "flex", alignItems: "center", gap: 6, color: C.muted }}>
                    <span style={{ width: 10, height: 10, borderRadius: 2, background: l.color, display: "inline-block" }} />
                    {l.label}
                  </span>
                ))}
              </div>
            </div>
            {loading ? <Skeleton h={240} r={10} /> : revenueData.length === 0 ? (
              <div style={{ height: 240, display: "flex", alignItems: "center", justifyContent: "center", color: C.muted, fontSize: 14 }}>No invoice data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={revenueData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} style={{ fontSize: 12, fill: C.muted }} />
                  <YAxis axisLine={false} tickLine={false} style={{ fontSize: 12, fill: C.muted }} tickFormatter={v => INR_K(v)} />
                  <Tooltip formatter={(v, n) => [INR(v), n === "revenue" ? "Billed" : "Paid"]} contentStyle={{ borderRadius: 12, border: `1px solid ${C.border}`, fontSize: 13, boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }} />
                  <Bar dataKey="revenue" fill={C.accent} radius={[6,6,0,0]} />
                  <Bar dataKey="paid"    fill={C.success} radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Project Status Donut */}
          <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: 24 }}>
            <h2 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700, color: C.primary }}>Project Status</h2>
            <p style={{ margin: "0 0 16px", fontSize: 13, color: C.muted }}>Distribution by status</p>
            {loading ? <Skeleton h={160} r={80} w={160} /> : projectStatusData.length === 0 ? (
              <div style={{ height: 160, display: "flex", alignItems: "center", justifyContent: "center", color: C.muted, fontSize: 14 }}>No projects yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={projectStatusData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value" strokeWidth={0}>
                    {projectStatusData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 13 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
              {projectStatusData.map((d, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: d.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: C.muted }}>{d.name}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.primary, marginLeft: "auto" }}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RECENT QUOTATIONS ── */}
        <div style={{ background: C.white, borderRadius: 16, border: `1.5px solid ${C.purple}30`, padding: 24, marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "#EDE9FE", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <FileText size={20} color="#7C3AED" />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.primary }}>Recent Quotations</h2>
                <p style={{ margin: "2px 0 0", fontSize: 13, color: C.muted }}>Latest {recentQuotations.length} quotations from database</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => navigate("/quotation")}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 10, border: `1.5px solid #7C3AED30`, background: "#EDE9FE", color: "#7C3AED", cursor: "pointer", fontSize: 13, fontWeight: 600 }}
                onMouseEnter={e => e.currentTarget.style.background = "#DDD6FE"}
                onMouseLeave={e => e.currentTarget.style.background = "#EDE9FE"}
              >
                <Eye size={14} /> View All
              </button>
              <button
                onClick={() => navigate("/quotation")}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 10, border: "none", background: "#7C3AED", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600, boxShadow: "0 4px 14px #7C3AED40" }}
                onMouseEnter={e => e.currentTarget.style.background = "#6D28D9"}
                onMouseLeave={e => e.currentTarget.style.background = "#7C3AED"}
              >
                <Plus size={14} /> Create Quotation
              </button>
            </div>
          </div>

          {/* Quotation Summary Chips */}
          <div style={{ display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
            {[
              { label: "Total Quotations", value: totalQuotations, bg: "#EDE9FE", color: "#7C3AED" },
              { label: "Total Excl. GST",  value: INR_K(quotations.reduce((s,q)=>s+(q.totalExclGST||0),0)), bg: "#ECFDF5", color: "#059669" },
              { label: "Total Incl. GST",  value: INR_K(totalQuoteValue), bg: "#FFF7ED", color: "#D97706" },
              { label: "Total Line Items", value: quotations.reduce((s,q)=>s+(q.items?.length||0),0), bg: "#EFF6FF", color: "#2563EB" },
            ].map(chip => (
              <div key={chip.label} style={{ background: chip.bg, borderRadius: 10, padding: "8px 16px", display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontSize: 11, color: chip.color, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{chip.label}</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: chip.color }}>{loading ? "—" : chip.value}</span>
              </div>
            ))}
          </div>

          {/* Quotation Table */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.border}`, background: "#FAFAFF" }}>
                  {["Quote No.","Customer","Date","Items","Total excl. GST","Total incl. GST"].map(h => (
                    <th key={h} style={th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: 6 }).map((__, j) => <td key={j} style={{ padding: "14px 16px" }}><Skeleton h={16} /></td>)}</tr>
                  ))
                ) : recentQuotations.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: "40px 16px", textAlign: "center" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 56, height: 56, borderRadius: 16, background: "#EDE9FE", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <FileText size={26} color="#7C3AED" />
                        </div>
                        <p style={{ margin: 0, fontSize: 14, color: C.muted, fontWeight: 500 }}>No quotations yet</p>
                        <button
                          onClick={() => navigate("/quotation")}
                          style={{ padding: "9px 20px", borderRadius: 10, border: "none", background: "#7C3AED", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600 }}
                        >
                          + Create First Quotation
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  recentQuotations.map((q, i) => (
                    <tr key={q._id} className="quo-row" style={{ borderBottom: "1px solid #F5F3FF", transition: "background 0.15s" }}>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#7C3AED,#6D28D9)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>#</span>
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#7C3AED" }}>{q.quoteNo}</span>
                        </div>
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 600, color: C.primary }}>{q.customer}</td>
                      <td style={{ padding: "14px 16px", fontSize: 13, color: C.muted }}>{q.quoteDate || "—"}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ background: "#EDE9FE", color: "#7C3AED", padding: "4px 12px", borderRadius: 20, fontSize: 13, fontWeight: 600 }}>
                          {q.items?.length || 0}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 600, color: C.primary }}>{INR(q.totalExclGST)}</td>
                      <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 700, color: "#059669" }}>{INR(q.totalInclGST)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {recentQuotations.length > 0 && (
            <div style={{ textAlign: "center", marginTop: 16 }}>
              <button
                onClick={() => navigate("/quotation")}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 20px", borderRadius: 10, border: `1.5px solid #7C3AED30`, background: "#EDE9FE", color: "#7C3AED", cursor: "pointer", fontSize: 13, fontWeight: 600 }}
              >
                View All {totalQuotations} Quotations <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>

        {/* ── RECENT PROJECTS TABLE ── */}
        <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: 24, marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.primary }}>Recent Projects</h2>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: C.muted }}>Latest {recentProjects.length} projects</p>
            </div>
            <button onClick={() => navigate("/projects/all")} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 600, color: C.accent, background: C.accentLight, border: "none", padding: "8px 16px", borderRadius: 8, cursor: "pointer" }}>
              View All <ChevronRight size={14} />
            </button>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                  {["Project ID","Name","Client","Budget","Progress","Status"].map(h => <th key={h} style={th}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: 6 }).map((__, j) => <td key={j} style={{ padding: "14px 16px" }}><Skeleton h={16} /></td>)}</tr>
                  ))
                ) : recentProjects.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: "40px 16px", textAlign: "center", color: C.muted, fontSize: 14 }}>No projects found</td></tr>
                ) : (
                  recentProjects.map((p, i) => (
                    <tr key={p._id} className="dash-row" style={{ borderBottom: "1px solid #F8FAFC", transition: "background 0.15s" }}>
                      <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 600, color: C.accent }}>{p.projectCode || p.id || `#${i+1}`}</td>
                      <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 600, color: C.primary, maxWidth: 180, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.projectName}</td>
                      <td style={{ padding: "14px 16px", fontSize: 13, color: C.muted }}>{p.clientName}</td>
                      <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 700, color: C.primary }}>{INR(p.budget)}</td>
                      <td style={{ padding: "14px 16px", minWidth: 140 }}><ProgressBar value={statusProgress(p.status)} /></td>
                      <td style={{ padding: "14px 16px" }}><StatusBadge status={p.status} /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── BOTTOM ROW: Clients + Invoices + Pending ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>

          {/* Recent Clients */}
          <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.primary }}>Recent Clients</h2>
                <p style={{ margin: "3px 0 0", fontSize: 12, color: C.muted }}>Top accounts</p>
              </div>
              <UserCheck size={18} color={C.muted} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {loading ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} h={56} r={10} />) :
               recentClients.length === 0 ? <p style={{ color: C.muted, fontSize: 13, textAlign: "center", marginTop: 20 }}>No clients yet</p> :
               recentClients.map((c, i) => (
                <div key={c._id} style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, borderRadius: 12, background: "#FAFAFA", border: `1px solid ${C.border}` }}>
                  <div style={{ width: 38, height: 38, borderRadius: "50%", background: avatarColor(i) + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: avatarColor(i), flexShrink: 0 }}>
                    {getInitials(c.clientName)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: C.primary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.clientName}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: C.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.company && c.company !== "—" ? c.company : c.mobile || "—"}</p>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.primary }}>{INR_K(c.totalBilling || 0)}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 11, color: C.muted }}>{c.totalProjects || 0} projects</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Latest Invoices */}
          <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.primary }}>Latest Invoices</h2>
                <p style={{ margin: "3px 0 0", fontSize: 12, color: C.muted }}>Recent billing</p>
              </div>
              <Receipt size={18} color={C.muted} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {loading ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} h={48} r={10} />) :
               latestInvoices.length === 0 ? <p style={{ color: C.muted, fontSize: 13, textAlign: "center", marginTop: 20 }}>No invoices yet</p> :
               latestInvoices.map(inv => {
                const status = invStatus(inv);
                return (
                  <div key={inv._id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.border}` }}>
                    <div>
                      <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: C.accent }}>{inv.invoiceNo}</p>
                      <p style={{ margin: "2px 0 0", fontSize: 12, color: C.muted, maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{inv.buyer?.name || "—"}</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.primary }}>{INR(inv.grandTotal || inv.totalAmount)}</p>
                      <StatusBadge status={status} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pending Dues */}
          <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.primary }}>Pending Dues</h2>
                <p style={{ margin: "3px 0 0", fontSize: 12, color: C.muted }}>Awaiting payment</p>
              </div>
              <AlertCircle size={18} color={C.danger} />
            </div>
            <div style={{ background: "#FEF2F2", borderRadius: 12, padding: "12px 16px", marginBottom: 14, border: "1px solid #FECACA" }}>
              <p style={{ margin: 0, fontSize: 13, color: "#DC2626", fontWeight: 600 }}>Total Outstanding</p>
              <p style={{ margin: "4px 0 0", fontSize: 26, fontWeight: 700, color: "#DC2626", letterSpacing: "-0.5px" }}>{loading ? "—" : INR(totalPending)}</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {loading ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} h={64} r={10} />) :
               pendingInvoices.length === 0 ? (
                <div style={{ padding: "20px 0", textAlign: "center" }}>
                  <CheckCircle size={28} color={C.success} style={{ margin: "0 auto 8px" }} />
                  <p style={{ margin: 0, fontSize: 13, color: C.success, fontWeight: 600 }}>All payments received!</p>
                </div>
               ) : (
                pendingInvoices.slice(0, 4).map(inv => {
                  const due     = (inv.grandTotal || 0) - (inv.paidAmount || 0);
                  const daysOld = Math.floor((Date.now() - new Date(inv.invoiceDate || inv.createdAt)) / 86400000);
                  const overdue = daysOld > 30;
                  return (
                    <div key={inv._id} style={{ padding: 12, borderRadius: 10, background: "#FAFAFA", border: `1px solid ${C.border}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: C.primary, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{inv.buyer?.name || inv.invoiceNo}</p>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.danger }}>{INR(due)}</p>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                        <p style={{ margin: 0, fontSize: 12, color: C.muted }}>{inv.invoiceNo}</p>
                        <span style={{ fontSize: 11, fontWeight: 600, color: overdue ? "#DC2626" : "#D97706", background: overdue ? "#FEE2E2" : "#FEF3C7", padding: "2px 8px", borderRadius: 20 }}>
                          {overdue ? `${daysOld}d overdue` : "Due soon"}
                        </span>
                      </div>
                    </div>
                  );
                })
               )}
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
