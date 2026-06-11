import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import GstInvoiceModal from "../../components/GstInvoiceModal";
import GstInvoice, { downloadGstInvoice } from "../../components/GstInvoice";
import { getActiveProjects } from "../../services/projects";
import { getItems } from "../../services/items";
import { getCategories } from "../../services/categories";
import {
  generateInvoice,
  getNextInvoiceNumber,
  mapInvoiceToView,
  getInvoices,
  getInvoice,
  updateInvoice,
} from "../../services/invoice";
import {
  Receipt,
  Plus,
  Download,
  Trash2,
  FileText,
  CheckCircle,
  AlertCircle,
  Clock,
  Pencil,
} from "lucide-react";

// ─── Data ───────────────────────────────────────────────────────────────────

// ITEM_MASTER data is loaded dynamically from database.

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (n) =>
  Math.round(n).toLocaleString("en-IN", { minimumFractionDigits: 0 });

const calcRow = (row) => {
  const amt = Number(row.quantity) * Number(row.rate);
  const disc = amt * (Number(row.discount) / 100);
  const taxable = amt - disc;
  const gstAmt = taxable * (Number(row.gst) / 100);
  return { ...row, total: taxable + gstAmt };
};

const makeEmptyRow = () => ({
  id: Date.now() + Math.random(),
  category: "",
  itemName: "",
  description: "",
  hsn: "9954",
  unit: "",
  quantity: 1,
  rate: 0,
  discount: 0,
  gst: 18,
  total: 0,
});

const today = () => new Date().toISOString().split("T")[0];

// ─── Sub-components ───────────────────────────────────────────────────────────

function Toast({ message }) {
  if (!message) return null;
  return (
    <div className="fixed top-5 right-5 z-50 bg-slate-800 text-white px-5 py-3 rounded-xl shadow-xl text-sm flex items-center gap-2 animate-fade-in">
      <CheckCircle size={16} className="text-green-400" />
      {message}
    </div>
  );
}

function StatusBadge({ paid, grand }) {
  if (grand === 0)
    return (
      <span className="flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-500 font-medium">
        <Clock size={12} /> Draft
      </span>
    );
  if (paid >= grand)
    return (
      <span className="flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-green-100 text-green-700 font-medium">
        <CheckCircle size={12} /> Paid
      </span>
    );
  if (paid > 0)
    return (
      <span className="flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-amber-100 text-amber-700 font-medium">
        <AlertCircle size={12} /> Partial
      </span>
    );
  return (
    <span className="flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-red-100 text-red-600 font-medium">
      <AlertCircle size={12} /> Pending
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProjectBilling() {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [downloadInvoice, setDownloadInvoice] = useState(null);
  const [invoiceDate, setInvoiceDate] = useState(today());
  const [items, setItems] = useState([makeEmptyRow()]);
  const [paidAmount, setPaidAmount] = useState(0);
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [toast, setToast] = useState("");
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceNo, setInvoiceNo] = useState("");
  const [loadingInvoiceNo, setLoadingInvoiceNo] = useState(true);
  const [categories, setCategories] = useState([]);
  const [catalogItems, setCatalogItems] = useState([]);
  const [projectInvoices, setProjectInvoices] = useState([]);
  const [viewInvoiceId, setViewInvoiceId] = useState(null);
  const [editingInvoiceId, setEditingInvoiceId] = useState(null);
  const [editingInvoiceNo, setEditingInvoiceNo] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  const selectedProject = projects.find((p) => p._id === selectedProjectId);

  const loadInvoiceForEdit = async (invId) => {
    try {
      const res = await getInvoice(invId);
      const inv = res.data.invoice;
      setEditingInvoiceId(inv._id);
      setEditingInvoiceNo(inv.invoiceNo);
      setSelectedProjectId(inv.projectId || "");
      setInvoiceDate(inv.invoiceDate?.split("T")[0] || today());
      setPaidAmount(inv.paidAmount || 0);
      setPaymentMode(inv.meta?.paymentMode || "Cash");
      
      const parsedItems = inv.items.map((item) => {
        let itemName = item.description;
        let desc = "";
        if (item.description && item.description.includes(" — ")) {
          const parts = item.description.split(" — ");
          itemName = parts[0];
          desc = parts.slice(1).join(" — ");
        }
        
        const foundInCatalog = catalogItems.find((ci) => ci.name === itemName);
        
        return {
          id: Date.now() + Math.random(),
          category: foundInCatalog ? foundInCatalog.category : "",
          itemName,
          description: desc,
          unit: item.unit || "",
          quantity: item.quantity || 1,
          rate: item.rate || 0,
          discount: item.discount || 0,
          gst: item.gstRate || 18,
          total: item.amount + (item.gstAmount || 0),
        };
      });

      setItems(parsedItems);
      showToast(`Loaded Invoice ${inv.invoiceNo} for editing`);
    } catch (err) {
      showToast(err.message || "Failed to load invoice for editing");
    }
  };

  useEffect(() => {
    const editInvoiceId = location.state?.editInvoiceId;
    if (editInvoiceId && catalogItems.length > 0) {
      loadInvoiceForEdit(editInvoiceId);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, catalogItems]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const refreshInvoiceNo = async () => {
    try {
      setLoadingInvoiceNo(true);
      const res = await getNextInvoiceNumber();
      setInvoiceNo(res.data.nextInvoiceNo);
    } catch (err) {
      setInvoiceNo("");
      showToast(err.message || "Failed to load invoice number");
    } finally {
      setLoadingInvoiceNo(false);
    }
  };

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoadingProjects(true);
        const data = await getActiveProjects();
        setProjects(data);
        if (data.length > 0) {
          setSelectedProjectId(data[0]._id);
        }
      } catch (err) {
        showToast(err.message || "Failed to load projects");
      } finally {
        setLoadingProjects(false);
      }
    };

    const loadBillingData = async () => {
      try {
        const [catsData, itemsData] = await Promise.all([
          getCategories(),
          getItems(),
        ]);
        setCategories(catsData.filter((c) => c.status === "Active"));
        setCatalogItems(itemsData.filter((i) => i.status === "Active"));
      } catch (err) {
        showToast(err.message || "Failed to load category/item data");
      }
    };

    loadProjects();
    loadBillingData();
    refreshInvoiceNo();
  }, []);

  const fetchInvoices = async () => {
    if (!selectedProjectId) return;
    try {
      const res = await getInvoices({ projectId: selectedProjectId });
      setProjectInvoices(res.data.invoices || []);
    } catch (err) {
      showToast(err.message || "Failed to load project invoices");
    }
  };

  useEffect(() => {
    if (selectedProjectId) {
      fetchInvoices();
    } else {
      setProjectInvoices([]);
    }
  }, [selectedProjectId]);

  const handleDownloadExistingPdf = (inv) => {
    const mapped = mapInvoiceToView(inv);
    setDownloadInvoice(mapped);
    showToast(`Downloading PDF: ${mapped.invoiceNo}`);
  };

  // ── Row handlers ──
  const handleRowChange = (id, field, value) => {
    setItems((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;
        let updated = { ...row, [field]: value };
        if (field === "category") {
          // Reset item selection when category changes
          updated.itemName = "";
          updated.unit = "";
          updated.rate = 0;
        } else if (field === "itemName") {
          const found = catalogItems.find(
            (m) => m.name === value && m.category === row.category,
          );
          if (found) {
            updated.unit = found.unit;
            updated.rate = found.rate;
            updated.gst = found.gst;
          } else {
            updated.unit = "";
            updated.rate = 0;
          }
        }
        return calcRow(updated);
      }),
    );
  };

  const addRow = () => setItems((prev) => [...prev, makeEmptyRow()]);

  const deleteRow = (id) => {
    if (items.length === 1) {
      showToast("Kam se kam ek row honi chahiye");
      return;
    }
    setItems((prev) => prev.filter((r) => r.id !== id));
  };

  const buildInvoiceItems = () =>
    items
      .filter((r) => r.itemName)
      .map((r) => ({
        description: r.description
          ? `${r.itemName} — ${r.description}`
          : r.itemName,
        hsn: r.hsn || "9954",
        quantity: r.quantity,
        unit: r.unit || "nos",
        rate: r.rate,
        discount: r.discount,
        gst: r.gst,
      }));

  const buildInvoicePayload = () => ({
    projectId: selectedProjectId,
    invoiceDate,
    paidAmount,
    meta: {
      paymentMode,
      destination: selectedProject?.address,
      reference: selectedProject?.projectCode,
    },
    items: buildInvoiceItems(),
  });

  // ── Computed totals ──
  const subtotal = items.reduce(
    (s, r) => s + Number(r.quantity) * Number(r.rate),
    0,
  );
  const discAmt = items.reduce(
    (s, r) =>
      s + (Number(r.quantity) * Number(r.rate) * Number(r.discount)) / 100,
    0,
  );
  const taxable = subtotal - discAmt;
  const gstAmt = items.reduce((s, r) => {
    const a = Number(r.quantity) * Number(r.rate);
    const t = a - (a * Number(r.discount)) / 100;
    return s + (t * Number(r.gst)) / 100;
  }, 0);
  const grand = taxable + gstAmt;


  const validateBeforeInvoice = () => {
    if (!selectedProjectId) {
      showToast("Koi active project select karein!");
      return false;
    }
    if (!items.some((r) => r.itemName)) {
      showToast("Pehle koi item add karein!");
      return false;
    }
    return true;
  };

  useEffect(() => {
    if (!downloadInvoice) return;

    const timer = setTimeout(() => {
      downloadGstInvoice(downloadInvoice.invoiceNo);
      setDownloadInvoice(null);
    }, 150);

    return () => clearTimeout(timer);
  }, [downloadInvoice]);

  const handleGenerateInvoice = async () => {
    if (!validateBeforeInvoice()) return;

    if (editingInvoiceId) {
      try {
        setDownloading(true);
        const res = await updateInvoice(editingInvoiceId, buildInvoicePayload());
        showToast("Invoice updated successfully!");
        setEditingInvoiceId(null);
        setEditingInvoiceNo("");
        setItems([makeEmptyRow()]);
        await fetchInvoices();
        await refreshInvoiceNo();
        setViewInvoiceId(res.data.invoice._id);
      } catch (err) {
        showToast(err.message || "Failed to update invoice");
      } finally {
        setDownloading(false);
      }
    } else {
      setShowInvoice(true);
    }
  };

  const handleDownloadPdf = async () => {
    if (!validateBeforeInvoice()) return;

    try {
      setDownloading(true);
      let invoice;
      if (editingInvoiceId) {
        const res = await updateInvoice(editingInvoiceId, buildInvoicePayload());
        invoice = mapInvoiceToView(res.data.invoice);
        setEditingInvoiceId(null);
        setEditingInvoiceNo("");
        setItems([makeEmptyRow()]);
      } else {
        const res = await generateInvoice(buildInvoicePayload());
        invoice = mapInvoiceToView(res.data.invoice);
      }
      setInvoiceNo(invoice.invoiceNo);
      setDownloadInvoice(invoice);
      await refreshInvoiceNo();
      await fetchInvoices();
      showToast(`PDF ready: ${invoice.invoiceNo}`);
    } catch (err) {
      showToast(err.message || "PDF action failed");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-100 p-4 md:p-6">
        <Toast message={toast} />

        <GstInvoiceModal
          open={showInvoice}
          onClose={() => {
            setShowInvoice(false);
            refreshInvoiceNo();
            fetchInvoices();
          }}
          title={`Original Invoice — ${selectedProject?.projectName || "Project Billing"}`}
          generatePayload={buildInvoicePayload()}
        />

        {viewInvoiceId && (
          <GstInvoiceModal
            open={Boolean(viewInvoiceId)}
            onClose={() => setViewInvoiceId(null)}
            title="View Invoice"
            invoiceId={viewInvoiceId}
          />
        )}

        {downloadInvoice && (
          <div className="fixed left-[-9999px] top-0 opacity-0 pointer-events-none">
            <GstInvoice {...downloadInvoice} />
          </div>
        )}

        <div className="max-w-7xl mx-auto flex flex-col gap-5">
          {/* ── Header ── */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                  <Receipt className="text-indigo-600" size={22} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-800">
                    {editingInvoiceId ? `Edit Invoice — ${editingInvoiceNo}` : "Project Billing"}
                  </h1>
                  <p className="text-slate-400 text-sm">
                    {editingInvoiceId ? "Modify existing invoice details" : "Generate Project Invoice"}
                  </p>
                </div>
              </div>
              <StatusBadge paid={paidAmount} grand={grand} />
            </div>
          </div>

          {/* ── Project Details ── */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-semibold text-slate-700 mb-4 text-base">
              Project Details
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-500 font-medium">
                  Select Project
                </label>
                <select
                  className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white disabled:bg-slate-50"
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  disabled={loadingProjects || projects.length === 0}
                >
                  {loadingProjects ? (
                    <option value="">Loading projects...</option>
                  ) : projects.length === 0 ? (
                    <option value="">No active projects found</option>
                  ) : (
                    projects.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.projectName} ({p.id}) — {p.status}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-500 font-medium">
                  Invoice Number
                </label>
                <input
                  className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-50 text-slate-700 font-medium"
                  value={
                    loadingInvoiceNo
                      ? "Generating..."
                      : invoiceNo || "—"
                  }
                  readOnly
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-500 font-medium">
                  Invoice Date
                </label>
                <input
                  type="date"
                  className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-500 font-medium">
                  Client Name
                </label>
                <input
                  className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-50 text-slate-500"
                  value={selectedProject?.clientName || "—"}
                  readOnly
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-500 font-medium">
                  Mobile Number
                </label>
                <input
                  className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-50 text-slate-500"
                  value={selectedProject?.phone || "—"}
                  readOnly
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-500 font-medium">
                  Site Address
                </label>
                <input
                  className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-50 text-slate-500"
                  value={selectedProject?.address || "—"}
                  readOnly
                />
              </div>
            </div>
          </div>

          {/* ── Billing Items ── */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-700 text-base">
                Billing Items
              </h2>
              <button
                onClick={addRow}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <Plus size={16} /> Add Item
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead>
                  <tr className="bg-slate-50 rounded-lg">
                    {[
                      "#",
                      "Category",
                      "Item",
                      "Description",
                      "Unit",
                      "Qty",
                      "Rate (₹)",
                      "Disc %",
                      "GST %",
                      "Total (₹)",
                      "",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 first:pl-4"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((row, index) => (
                    <tr
                      key={row.id}
                      className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-3 py-2 text-slate-400 text-xs pl-4">
                        {index + 1}
                      </td>

                      <td className="px-2 py-2">
                        <select
                          className="w-40 border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                          value={row.category}
                          onChange={(e) =>
                            handleRowChange(row.id, "category", e.target.value)
                          }
                        >
                          <option value="">-- Select Category --</option>
                          {categories.map((c) => (
                            <option key={c._id} value={c.name}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="px-2 py-2">
                        <select
                          disabled={!row.category}
                          className="w-40 border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white disabled:bg-slate-50"
                          value={row.itemName}
                          onChange={(e) =>
                            handleRowChange(row.id, "itemName", e.target.value)
                          }
                        >
                          <option value="">-- Select Item --</option>
                          {catalogItems
                            .filter((m) => m.category === row.category)
                            .map((m) => (
                              <option key={m._id} value={m.name}>
                                {m.name}
                              </option>
                            ))}
                        </select>
                      </td>

                      <td className="px-2 py-2">
                        <input
                          className="w-36 border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                          placeholder="Optional..."
                          value={row.description}
                          onChange={(e) =>
                            handleRowChange(
                              row.id,
                              "description",
                              e.target.value,
                            )
                          }
                        />
                      </td>

                      <td className="px-2 py-2 text-slate-500 text-sm">
                        {row.unit || "—"}
                      </td>

                      <td className="px-2 py-2">
                        <input
                          type="number"
                          min="0"
                          className="w-20 border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                          value={row.quantity}
                          onChange={(e) =>
                            handleRowChange(row.id, "quantity", e.target.value)
                          }
                        />
                      </td>

                      <td className="px-2 py-2">
                        <input
                          type="number"
                          min="0"
                          className="w-24 border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                          value={row.rate}
                          onChange={(e) =>
                            handleRowChange(row.id, "rate", e.target.value)
                          }
                        />
                      </td>

                      <td className="px-2 py-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          className="w-16 border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                          value={row.discount}
                          onChange={(e) =>
                            handleRowChange(row.id, "discount", e.target.value)
                          }
                        />
                      </td>

                      <td className="px-2 py-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          className="w-16 border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                          value={row.gst}
                          onChange={(e) =>
                            handleRowChange(row.id, "gst", e.target.value)
                          }
                        />
                      </td>

                      <td className="px-2 py-2 font-semibold text-slate-800 text-sm whitespace-nowrap">
                        ₹{fmt(row.total)}
                      </td>

                      <td className="px-2 py-2">
                        <button
                          onClick={() => deleteRow(row.id)}
                          className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                          title="Delete row"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Summary ── */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-semibold text-slate-700 mb-4 text-base">
              Bill Summary
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Totals */}
              <div className="space-y-1">
                {[
                  {
                    label: "Subtotal",
                    value: `₹${fmt(subtotal)}`,
                    color: "text-slate-700",
                  },
                  {
                    label: "Discount",
                    value: `-₹${fmt(discAmt)}`,
                    color: "text-green-600",
                  },
                  {
                    label: "Taxable Amount",
                    value: `₹${fmt(taxable)}`,
                    color: "text-slate-700",
                  },
                  {
                    label: "GST",
                    value: `₹${fmt(gstAmt)}`,
                    color: "text-slate-700",
                  },
                ].map(({ label, value, color }) => (
                  <div
                    key={label}
                    className="flex justify-between py-2 border-b border-slate-50 text-sm"
                  >
                    <span className="text-slate-500">{label}</span>
                    <span className={`font-medium ${color}`}>{value}</span>
                  </div>
                ))}
                <div className="flex justify-between py-3 text-lg font-bold text-indigo-600">
                  <span>Grand Total</span>
                  <span>₹{fmt(grand)}</span>
                </div>
              </div>

              {/* Payment */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-500 font-medium block mb-1.5">
                    Paid Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 font-medium block mb-1.5">
                    Payment Mode
                  </label>
                  <select
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                  >
                    {["Cash", "UPI", "Bank Transfer", "Cheque", "Card"].map(
                      (m) => (
                        <option key={m}>{m}</option>
                      ),
                    )}
                  </select>
                </div>


              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mt-6 pt-5 border-t border-slate-100">
              <button
                onClick={handleGenerateInvoice}
                disabled={!selectedProjectId || downloading}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-60"
              >
                <FileText size={16} /> {editingInvoiceId ? "Update Invoice" : "Generate Invoice"}
              </button>
              <button
                onClick={handleDownloadPdf}
                disabled={!selectedProjectId || downloading}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-60"
              >
                <Download size={16} />{" "}
                {downloading ? "Preparing PDF..." : (editingInvoiceId ? "Update & Download PDF" : "Download PDF")}
              </button>
              {editingInvoiceId && (
                <button
                  onClick={() => {
                    setEditingInvoiceId(null);
                    setEditingInvoiceNo("");
                    setItems([makeEmptyRow()]);
                    refreshInvoiceNo();
                  }}
                  className="bg-slate-500 hover:bg-slate-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </div>

          {/* ── Project Invoices List ── */}
          {selectedProjectId && (
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-slate-700 text-base">
                  Project Invoices ({projectInvoices.length})
                </h2>
              </div>

              {projectInvoices.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  Is project ke liye koi invoice nahi mila.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="bg-slate-50 rounded-lg">
                        {["Invoice No", "Date", "Client", "Grand Total (₹)", "Paid (₹)", "Pending (₹)", "Actions"].map((h) => (
                          <th
                            key={h}
                            className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 first:pl-4"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {projectInvoices.map((inv) => {
                        const dateStr = inv.invoiceDate?.split("T")[0] || inv.invoiceDate;
                        const grandTotal = inv.calculation?.grandTotal || inv.grandTotal || 0;
                        const paid = inv.paidAmount || 0;
                        const pending = grandTotal - paid;
                        return (
                          <tr
                            key={inv._id}
                            className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                          >
                            <td className="px-3 py-3 font-semibold text-slate-700 text-sm pl-4">
                              {inv.invoiceNo}
                            </td>
                            <td className="px-3 py-3 text-slate-500 text-sm">
                              {dateStr}
                            </td>
                            <td className="px-3 py-3 text-slate-500 text-sm">
                              {inv.buyer?.name || "—"}
                            </td>
                            <td className="px-3 py-3 font-medium text-slate-800 text-sm">
                              ₹{fmt(grandTotal)}
                            </td>
                            <td className="px-3 py-3 text-green-600 font-medium text-sm">
                              ₹{fmt(paid)}
                            </td>
                            <td className="px-3 py-3 text-red-600 font-medium text-sm">
                              ₹{fmt(pending < 0 ? 0 : pending)}
                            </td>
                            <td className="px-3 py-3">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setViewInvoiceId(inv._id)}
                                  className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                                >
                                  <FileText size={13} /> View
                                </button>
                                <button
                                  onClick={() => loadInvoiceForEdit(inv._id)}
                                  className="text-emerald-600 hover:text-emerald-800 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                                >
                                  <Pencil size={13} /> Edit
                                </button>
                                <button
                                  onClick={() => handleDownloadExistingPdf(inv)}
                                  className="text-orange-600 hover:text-orange-800 text-xs font-semibold bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                                >
                                  <Download size={13} /> Download
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
            </div>
          )}

        </div>
      </div>
    </DashboardLayout>
  );
}
