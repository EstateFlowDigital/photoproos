"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/toast";

interface ExportData {
  monthlyBreakdown: Array<{
    month: string;
    invoiceCount: number;
    revenue: number;
    tax: number;
    rate: number;
  }>;
  summary: {
    thisMonthTax: number;
    thisQuarterTax: number;
    ytdTax: number;
    effectiveRate: number;
    year: number;
  };
  taxByClient: Array<{
    clientName: string;
    email: string;
    taxCollected: number;
    totalBilled: number;
  }>;
}

interface ExportButtonsProps {
  data: ExportData;
}

export function ExportButtons({ data }: ExportButtonsProps) {
  const { showToast } = useToast();
  const [isExporting, setIsExporting] = useState<"csv" | "pdf" | null>(null);

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(cents / 100);
  };

  const handleExportCSV = async () => {
    setIsExporting("csv");
    try {
      // Build CSV content
      const lines: string[] = [];

      // Header
      lines.push(`Tax Report - ${data.summary.year}`);
      lines.push("");

      // Summary section
      lines.push("SUMMARY");
      lines.push(`This Month Tax,${formatCurrency(data.summary.thisMonthTax)}`);
      lines.push(`This Quarter Tax,${formatCurrency(data.summary.thisQuarterTax)}`);
      lines.push(`Year to Date Tax,${formatCurrency(data.summary.ytdTax)}`);
      lines.push(`Effective Tax Rate,${data.summary.effectiveRate.toFixed(2)}%`);
      lines.push("");

      // Monthly breakdown
      lines.push("MONTHLY BREAKDOWN");
      lines.push("Month,Invoices Paid,Revenue,Tax Collected,Effective Rate");
      for (const row of data.monthlyBreakdown) {
        lines.push(`${row.month},${row.invoiceCount},${formatCurrency(row.revenue)},${formatCurrency(row.tax)},${row.rate.toFixed(2)}%`);
      }

      // Total row
      const totalInvoices = data.monthlyBreakdown.reduce((sum, row) => sum + row.invoiceCount, 0);
      const totalRevenue = data.monthlyBreakdown.reduce((sum, row) => sum + row.revenue, 0);
      const totalTax = data.monthlyBreakdown.reduce((sum, row) => sum + row.tax, 0);
      lines.push(`Total,${totalInvoices},${formatCurrency(totalRevenue)},${formatCurrency(totalTax)},—`);
      lines.push("");

      // Tax by client
      if (data.taxByClient.length > 0) {
        lines.push("TAX BY CLIENT");
        lines.push("Client Name,Email,Tax Collected,Total Billed");
        for (const client of data.taxByClient) {
          // Escape commas in client names
          const escapedName = client.clientName.includes(",") ? `"${client.clientName}"` : client.clientName;
          lines.push(`${escapedName},${client.email},${formatCurrency(client.taxCollected)},${formatCurrency(client.totalBilled)}`);
        }
      }

      // Create and download file
      const csvContent = lines.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `tax-report-${data.summary.year}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast("Tax report exported to CSV", "success");
    } catch (error) {
      console.error("Export error:", error);
      showToast("Failed to export CSV", "error");
    } finally {
      setIsExporting(null);
    }
  };

  const handleExportPDF = async () => {
    setIsExporting("pdf");
    try {
      // Generate HTML content for PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Tax Report ${data.summary.year}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
            h1 { color: #1a1a1a; margin-bottom: 8px; }
            .subtitle { color: #666; margin-bottom: 24px; }
            .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
            .summary-card { background: #f5f5f5; border-radius: 8px; padding: 16px; }
            .summary-label { font-size: 12px; color: #666; margin-bottom: 4px; }
            .summary-value { font-size: 24px; font-weight: bold; }
            h2 { margin-top: 32px; margin-bottom: 16px; color: #1a1a1a; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
            th { background: #f5f5f5; padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase; color: #666; }
            td { padding: 12px; border-bottom: 1px solid #eee; }
            tfoot td { background: #f5f5f5; font-weight: bold; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <h1>Tax Report</h1>
          <p class="subtitle">Year ${data.summary.year} - Generated on ${new Date().toLocaleDateString()}</p>

          <div class="summary-grid">
            <div class="summary-card">
              <div class="summary-label">This Month Tax</div>
              <div class="summary-value">${formatCurrency(data.summary.thisMonthTax)}</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">This Quarter Tax</div>
              <div class="summary-value">${formatCurrency(data.summary.thisQuarterTax)}</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Year to Date Tax</div>
              <div class="summary-value">${formatCurrency(data.summary.ytdTax)}</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Effective Tax Rate</div>
              <div class="summary-value">${data.summary.effectiveRate.toFixed(2)}%</div>
            </div>
          </div>

          <h2>Monthly Breakdown</h2>
          <table>
            <thead>
              <tr>
                <th>Month</th>
                <th>Invoices Paid</th>
                <th>Revenue</th>
                <th>Tax Collected</th>
                <th>Effective Rate</th>
              </tr>
            </thead>
            <tbody>
              ${data.monthlyBreakdown.map(row => `
                <tr>
                  <td>${row.month}</td>
                  <td>${row.invoiceCount}</td>
                  <td>${formatCurrency(row.revenue)}</td>
                  <td>${formatCurrency(row.tax)}</td>
                  <td>${row.rate.toFixed(2)}%</td>
                </tr>
              `).join("")}
            </tbody>
            <tfoot>
              <tr>
                <td>Total</td>
                <td>${totalInvoices}</td>
                <td>${formatCurrency(totalRevenue)}</td>
                <td>${formatCurrency(totalTax)}</td>
                <td>—</td>
              </tr>
            </tfoot>
          </table>

          ${data.taxByClient.length > 0 ? `
            <h2>Tax by Client</h2>
            <table>
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Email</th>
                  <th>Tax Collected</th>
                  <th>Total Billed</th>
                </tr>
              </thead>
              <tbody>
                ${data.taxByClient.map(client => `
                  <tr>
                    <td>${client.clientName}</td>
                    <td>${client.email}</td>
                    <td>${formatCurrency(client.taxCollected)}</td>
                    <td>${formatCurrency(client.totalBilled)}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          ` : ""}

          <div class="footer">
            <p>This report was generated automatically. For questions, contact your accountant.</p>
          </div>
        </body>
        </html>
      `;

      // Open print dialog
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();
        // Give the browser time to render the content
        setTimeout(() => {
          printWindow.print();
        }, 250);
        showToast("Print dialog opened for PDF export", "success");
      } else {
        showToast("Please allow popups to export PDF", "error");
      }
    } catch (error) {
      console.error("Export error:", error);
      showToast("Failed to export PDF", "error");
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleExportCSV}
        disabled={isExporting !== null}
        className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-secondary)] disabled:opacity-50"
      >
        <span className="flex items-center gap-2">
          <DownloadIcon className="h-4 w-4" />
          {isExporting === "csv" ? "Exporting..." : "Export CSV"}
        </span>
      </button>
      <button
        onClick={handleExportPDF}
        disabled={isExporting !== null}
        className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-secondary)] disabled:opacity-50"
      >
        <span className="flex items-center gap-2">
          <DocumentIcon className="h-4 w-4" />
          {isExporting === "pdf" ? "Exporting..." : "Export PDF"}
        </span>
      </button>
    </div>
  );
}

// Icons
function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
      <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
    </svg>
  );
}

function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path
        fillRule="evenodd"
        d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5V7.621a1.5 1.5 0 0 0-.44-1.06l-4.12-4.122A1.5 1.5 0 0 0 11.378 2H4.5Zm2.25 8.5a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Zm0 3a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
