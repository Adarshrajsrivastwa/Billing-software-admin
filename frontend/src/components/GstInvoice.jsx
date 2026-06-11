import { numberToWords, amountWithPaiseWords } from "../utils/numberToWords";

const fmt = (n, decimals = 2) =>
  Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

const DEFAULT_COMPANY = {
  name: "S2 Urban Gaze Interiors",
  address:
    "2nd Floor No 203 Platinum City Apartment, Hmt Main Road Near Peenya Metro Station, Yeshwanthapura Bengaluru, Karnataka",
  gstin: "29ENVPR9277Q1Z4",
  state: "Karnataka",
  stateCode: "29",
  email: "admin@gmail.com",
  bankName: "Union Bank of India",
  accountNo: "139811100004818",
  ifsc: "UBIN0813982",
};

const cell = {
  border: "1px solid #000",
  padding: "4px 6px",
  fontSize: "11px",
  verticalAlign: "top",
};

const th = {
  ...cell,
  fontWeight: 600,
  textAlign: "center",
  background: "#fff",
};

export const buildGstInvoiceData = ({
  items = [],
  roundOff = true,
  gstType = "intra",
}) => {
  const lines = items.map((item, index) => {
    const qty = Number(item.quantity) || 1;
    const rate = Number(item.rate) || 0;
    const gross = qty * rate;
    const disc = gross * (Number(item.discount) || 0) / 100;
    const taxable = gross - disc;
    const gstRate = Number(item.gstRate ?? item.gst) || 18;
    const gstAmount = taxable * (gstRate / 100);

    return {
      slNo: index + 1,
      description: item.description || item.itemName || "—",
      hsn: item.hsn || "9954",
      quantity: qty,
      unit: item.unit || "nos",
      rate,
      amount: taxable,
      gstRate,
      gstAmount,
      discount: disc,
    };
  });

  const taxableTotal = lines.reduce((s, l) => s + l.amount, 0);
  const totalGst = lines.reduce((s, l) => s + l.gstAmount, 0);
  const cgst = gstType === "intra" ? totalGst / 2 : 0;
  const sgst = gstType === "intra" ? totalGst / 2 : 0;
  const igst = gstType === "inter" ? totalGst : 0;
  const rawGrand = taxableTotal + totalGst;
  const roundedGrand = roundOff ? Math.round(rawGrand) : rawGrand;
  const roundOffAmt = roundedGrand - rawGrand;
  const totalQty = lines.reduce((s, l) => s + l.quantity, 0);

  const taxMap = {};
  lines.forEach((line) => {
    const key = `${line.hsn}-${line.gstRate}`;
    if (!taxMap[key]) {
      taxMap[key] = {
        hsn: line.hsn,
        taxable: 0,
        gstRate: line.gstRate,
        cgst: 0,
        sgst: 0,
        igst: 0,
        totalTax: 0,
      };
    }
    taxMap[key].taxable += line.amount;
    const half = line.gstAmount / 2;
    if (gstType === "intra") {
      taxMap[key].cgst += half;
      taxMap[key].sgst += half;
    } else {
      taxMap[key].igst += line.gstAmount;
    }
    taxMap[key].totalTax += line.gstAmount;
  });

  return {
    lines,
    taxableTotal,
    cgst,
    sgst,
    igst,
    totalGst,
    roundOffAmt,
    grandTotal: roundedGrand,
    totalQty,
    taxRows: Object.values(taxMap),
  };
};

export default function GstInvoice({
  invoiceNo,
  invoiceDate,
  company = DEFAULT_COMPANY,
  buyer,
  items = [],
  meta = {},
  gstType = "intra",
  calculation = null,
}) {
  const data = calculation || buildGstInvoiceData({ items, gstType });
  const formattedDate = invoiceDate
    ? new Date(invoiceDate).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "2-digit",
      })
    : new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "2-digit",
      });

  const metaRows = [
    ["Invoice No.", invoiceNo],
    ["Dated", formattedDate],
    ["Delivery Note", meta.deliveryNote || ""],
    ["Mode/Terms of Payment", meta.paymentMode || ""],
    ["Reference No. & Date.", meta.reference || ""],
    ["Other References", meta.otherReferences || ""],
    ["Buyer's Order No.", meta.buyerOrderNo || ""],
    ["Dated", meta.orderDate || ""],
    ["Dispatch Doc No.", meta.dispatchDocNo || ""],
    ["Delivery Note Date", meta.deliveryNoteDate || ""],
    ["Dispatched through", meta.dispatchedThrough || ""],
    ["Destination", meta.destination || buyer?.state || ""],
    ["Terms of Delivery", meta.termsOfDelivery || ""],
  ];

  return (
    <div
      id="gst-invoice-print"
      style={{
        fontFamily: "Arial, sans-serif",
        color: "#000",
        fontSize: "11px",
        lineHeight: 1.35,
        background: "#fff",
      }}
    >
      <style>{`
        @media print {
          #gst-invoice-print { padding: 0 !important; }
        }
      `}</style>

      <div style={{ textAlign: "center", fontWeight: 700, fontSize: 13, marginBottom: 6 }}>
        Original Invoice
      </div>

      {/* Header */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          <tr>
            <td style={{ ...cell, width: "55%" }} rowSpan={2}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{company.name}</div>
              <div>{company.address}</div>
              <div>GSTIN/UIN: {company.gstin}</div>
              <div>
                State Name: {company.state}, Code: {company.stateCode}
              </div>
              <div>E-Mail: {company.email}</div>
            </td>
            <td style={{ ...cell, width: "45%", padding: 0 }} colSpan={2}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  {metaRows.slice(0, 4).map(([label, value]) => (
                    <tr key={label}>
                      <td style={{ ...cell, width: "50%" }}>{label}</td>
                      <td style={{ ...cell, width: "50%" }}>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </td>
          </tr>
          <tr>
            <td style={{ ...cell, padding: 0 }} colSpan={2}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  {metaRows.slice(4).map(([label, value]) => (
                    <tr key={`${label}-2`}>
                      <td style={{ ...cell, width: "50%" }}>{label}</td>
                      <td style={{ ...cell, width: "50%" }}>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Consignee & Buyer */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: -1 }}>
        <tbody>
          <tr>
            <td style={{ ...cell, width: "50%" }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>Consignee (Ship to)</div>
              <div style={{ fontWeight: 600 }}>{buyer?.name}</div>
              <div>{buyer?.address}</div>
              {buyer?.gstin && <div>GSTIN/UIN: {buyer.gstin}</div>}
              <div>
                State Name: {buyer?.state || "—"}, Code: {buyer?.stateCode || "—"}
              </div>
            </td>
            <td style={{ ...cell, width: "50%" }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>Buyer (Bill to)</div>
              <div style={{ fontWeight: 600 }}>{buyer?.name}</div>
              <div>{buyer?.address}</div>
              {buyer?.gstin && <div>GSTIN/UIN: {buyer.gstin}</div>}
              <div>
                State Name: {buyer?.state || "—"}, Code: {buyer?.stateCode || "—"}
              </div>
              <div style={{ marginTop: 4 }}>
                Place of Supply: {buyer?.placeOfSupply || buyer?.state || "—"}
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Items */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: -1 }}>
        <thead>
          <tr>
            {[
              "Sl No.",
              "Description of Goods",
              "HSN/SAC",
              "Quantity",
              "Rate",
              "per",
              "Amount",
            ].map((h) => (
              <th key={h} style={th}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.lines.map((line) => (
            <tr key={line.slNo}>
              <td style={{ ...cell, textAlign: "center", width: 40 }}>{line.slNo}</td>
              <td style={{ ...cell, minWidth: 180 }}>{line.description}</td>
              <td style={{ ...cell, textAlign: "center", width: 55 }}>{line.hsn}</td>
              <td style={{ ...cell, textAlign: "right", width: 70 }}>
                {line.quantity} {line.unit}
              </td>
              <td style={{ ...cell, textAlign: "right", width: 80 }}>{fmt(line.rate)}</td>
              <td style={{ ...cell, textAlign: "center", width: 35 }}>{line.unit}</td>
              <td style={{ ...cell, textAlign: "right", width: 90 }}>{fmt(line.amount)}</td>
            </tr>
          ))}

          {/* Empty rows for spacing */}
          {data.lines.length < 3 &&
            Array.from({ length: 3 - data.lines.length }).map((_, i) => (
              <tr key={`empty-${i}`}>
                <td style={{ ...cell, height: 18 }} colSpan={7}>&nbsp;</td>
              </tr>
            ))}

          <tr>
            <td style={cell} colSpan={6} />
            <td style={{ ...cell, textAlign: "right", fontWeight: 600 }}>
              {fmt(data.taxableTotal)}
            </td>
          </tr>
          {gstType === "intra" && (
            <>
              <tr>
                <td style={cell} colSpan={5} />
                <td style={{ ...cell, textAlign: "right" }}>CGST</td>
                <td style={{ ...cell, textAlign: "right" }}>{fmt(data.cgst)}</td>
              </tr>
              <tr>
                <td style={cell} colSpan={5} />
                <td style={{ ...cell, textAlign: "right" }}>SGST</td>
                <td style={{ ...cell, textAlign: "right" }}>{fmt(data.sgst)}</td>
              </tr>
            </>
          )}
          {gstType === "inter" && (
            <tr>
              <td style={cell} colSpan={5} />
              <td style={{ ...cell, textAlign: "right" }}>IGST</td>
              <td style={{ ...cell, textAlign: "right" }}>{fmt(data.igst)}</td>
            </tr>
          )}
          {Math.abs(data.roundOffAmt) >= 0.01 && (
            <tr>
              <td style={cell} colSpan={5} />
              <td style={{ ...cell, textAlign: "right" }}>Less: ROUND OFF</td>
              <td style={{ ...cell, textAlign: "right" }}>
                ({data.roundOffAmt < 0 ? "-" : ""}){fmt(Math.abs(data.roundOffAmt))}
              </td>
            </tr>
          )}
          <tr>
            <td style={{ ...cell, fontWeight: 700 }} colSpan={3}>
              Total
            </td>
            <td style={{ ...cell, textAlign: "right", fontWeight: 700 }} colSpan={2}>
              {data.totalQty} {data.lines[0]?.unit || "nos"}
            </td>
            <td style={cell} />
            <td style={{ ...cell, textAlign: "right", fontWeight: 700, fontSize: 12 }}>
              ₹ {fmt(data.grandTotal, 2)}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Amount in words */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: -1 }}>
        <tbody>
          <tr>
            <td style={cell}>
              <span style={{ fontWeight: 600 }}>Amount Chargeable (in words)</span>
              <div style={{ marginTop: 4 }}>{numberToWords(data.grandTotal)}</div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Tax summary */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: -1 }}>
        <thead>
          <tr>
            <th style={th} rowSpan={2}>HSN/SAC</th>
            <th style={th} rowSpan={2}>Taxable Value</th>
            <th style={th} colSpan={2}>Central Tax</th>
            <th style={th} colSpan={2}>State Tax</th>
            <th style={th} rowSpan={2}>Total Tax Amount</th>
          </tr>
          <tr>
            <th style={th}>Rate</th>
            <th style={th}>Amount</th>
            <th style={th}>Rate</th>
            <th style={th}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {data.taxRows.map((row) => (
            <tr key={`${row.hsn}-${row.gstRate}`}>
              <td style={{ ...cell, textAlign: "center" }}>{row.hsn}</td>
              <td style={{ ...cell, textAlign: "right" }}>{fmt(row.taxable)}</td>
              <td style={{ ...cell, textAlign: "center" }}>
                {gstType === "intra" ? `${row.gstRate / 2}%` : "—"}
              </td>
              <td style={{ ...cell, textAlign: "right" }}>
                {gstType === "intra" ? fmt(row.cgst) : "—"}
              </td>
              <td style={{ ...cell, textAlign: "center" }}>
                {gstType === "intra" ? `${row.gstRate / 2}%` : "—"}
              </td>
              <td style={{ ...cell, textAlign: "right" }}>
                {gstType === "intra" ? fmt(row.sgst) : "—"}
              </td>
              <td style={{ ...cell, textAlign: "right" }}>{fmt(row.totalTax)}</td>
            </tr>
          ))}
          <tr>
            <td style={{ ...cell, fontWeight: 700 }}>Total</td>
            <td style={{ ...cell, textAlign: "right", fontWeight: 700 }}>
              {fmt(data.taxableTotal)}
            </td>
            <td style={cell} />
            <td style={{ ...cell, textAlign: "right", fontWeight: 700 }}>
              {gstType === "intra" ? fmt(data.cgst) : "—"}
            </td>
            <td style={cell} />
            <td style={{ ...cell, textAlign: "right", fontWeight: 700 }}>
              {gstType === "intra" ? fmt(data.sgst) : "—"}
            </td>
            <td style={{ ...cell, textAlign: "right", fontWeight: 700 }}>
              {fmt(data.totalGst)}
            </td>
          </tr>
        </tbody>
      </table>

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: -1 }}>
        <tbody>
          <tr>
            <td style={cell}>
              Tax Amount (in words):{" "}
              <strong>{amountWithPaiseWords(data.totalGst)}</strong>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Footer */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: -1 }}>
        <tbody>
          <tr>
            <td style={{ ...cell, width: "55%" }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>
                Company&apos;s Bank Details
              </div>
              <div>Bank Name: {company.bankName}</div>
              <div>A/c No.: {company.accountNo}</div>
              <div>Branch &amp; IFS Code: {company.ifsc}</div>
            </td>
            <td style={{ ...cell, width: "45%" }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Declaration</div>
              <div style={{ fontSize: 10 }}>
                {company.declaration ||
                  "We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct."}
              </div>
              <div style={{ marginTop: 40, textAlign: "right" }}>
                for <strong>{company.name}</strong>
              </div>
              <div style={{ marginTop: 30, textAlign: "right", fontSize: 10 }}>
                Authorised Signatory
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div style={{ textAlign: "center", marginTop: 10, fontSize: 10, fontWeight: 600 }}>
        SUBJECT TO {(company.jurisdiction || company.state || "KARNATAKA").toUpperCase()} JURISDICTION
      </div>
      <div style={{ textAlign: "center", marginTop: 4, fontSize: 10 }}>
        This is a Computer Generated Invoice
      </div>
    </div>
  );
}

const openInvoicePrintWindow = (filename = "Tax Invoice") => {
  const content = document.getElementById("gst-invoice-print")?.innerHTML;
  if (!content) return false;

  const win = window.open("", "_blank");
  win.document.write(`
    <html>
      <head>
        <title>${filename}</title>
        <style>
          * { box-sizing: border-box; }
          body { margin: 0; padding: 16px; font-family: Arial, sans-serif; }
          table { border-collapse: collapse; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>${content}</body>
    </html>
  `);
  win.document.close();
  win.focus();
  win.print();
  return true;
};

export const printGstInvoice = () => openInvoicePrintWindow("Tax Invoice");

export const downloadGstInvoice = (invoiceNo = "Invoice") =>
  openInvoicePrintWindow(`Invoice-${invoiceNo}`);
