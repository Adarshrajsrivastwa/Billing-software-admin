import { apiRequest } from "./api";

export const getInvoiceSettings = () => apiRequest("/invoices/settings");

export const getNextInvoiceNumber = () => apiRequest("/invoices/next-number");

export const generateInvoice = (payload) =>
  apiRequest("/invoices", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const getInvoice = (id) => apiRequest(`/invoices/${id}`);
export const updateInvoice = (id, payload) =>
  apiRequest(`/invoices/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

export const getInvoices = (params = {}) => {
  const query = new URLSearchParams();
  if (params.projectId) query.set("projectId", params.projectId);
  const qs = query.toString();
  return apiRequest(`/invoices${qs ? `?${qs}` : ""}`);
};

export const mapInvoiceToView = (invoice) => ({
  invoiceNo: invoice.invoiceNo,
  invoiceDate: invoice.invoiceDate?.split("T")[0] || invoice.invoiceDate,
  company: invoice.company,
  buyer: invoice.buyer,
  meta: invoice.meta || {},
  gstType: invoice.gstType || "intra",
  calculation: invoice.calculation,
  items: invoice.items?.map((item) => ({
    description: item.description,
    hsn: item.hsn,
    quantity: item.quantity,
    unit: item.unit,
    rate: item.rate,
    discount: 0,
    gst: item.gstRate,
  })),
});
