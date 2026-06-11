import { useEffect, useState } from "react";
import { X, Printer, Loader } from "lucide-react";
import GstInvoice, { printGstInvoice } from "./GstInvoice";
import {
  generateInvoice,
  getInvoice,
  mapInvoiceToView,
} from "../services/invoice";

export default function GstInvoiceModal({
  open,
  onClose,
  title = "Tax Invoice",
  invoiceId = null,
  generatePayload = null,
  ...legacyProps
}) {
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const useApi = Boolean(invoiceId || generatePayload);
  const payloadKey = generatePayload ? JSON.stringify(generatePayload) : "";

  useEffect(() => {
    if (!open) {
      setInvoiceData(null);
      setError("");
      return;
    }

    if (!useApi) return;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = invoiceId
          ? await getInvoice(invoiceId)
          : await generateInvoice(generatePayload);
        setInvoiceData(mapInvoiceToView(res.data.invoice));
      } catch (err) {
        setError(err.message || "Failed to load invoice");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [open, invoiceId, payloadKey, useApi]);

  if (!open) return null;

  const viewProps = useApi ? invoiceData : legacyProps;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white rounded-xl w-full max-w-5xl max-h-[92vh] overflow-y-auto shadow-2xl"
        style={{ fontFamily: "Arial, sans-serif" }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 sticky top-0 bg-white z-10">
          <span className="font-semibold text-slate-800 text-sm">
            {title}
            {invoiceData?.invoiceNo ? ` — ${invoiceData.invoiceNo}` : ""}
          </span>
          <div className="flex gap-2">
            <button
              onClick={printGstInvoice}
              disabled={loading || !!error || !viewProps}
              className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-900 disabled:opacity-50"
            >
              <Printer size={15} /> Print / PDF
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="p-4 md:p-6">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-20 text-slate-500 text-sm">
              <Loader size={18} className="animate-spin" />
              Generating invoice from server...
            </div>
          )}

          {error && (
            <div className="text-center py-20 text-red-600 text-sm">{error}</div>
          )}

          {!loading && !error && viewProps && <GstInvoice {...viewProps} />}
        </div>
      </div>
    </div>
  );
}
