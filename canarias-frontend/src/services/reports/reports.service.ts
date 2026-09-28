import { useAuthStore } from "@/store/auth.store";
import { apiFetch } from "../apiFetch.service";
import { ReportDateRange } from "@/types/reports/report.types";

function getToken() {
  const token = useAuthStore.getState().accessToken;

  if (!token) {
    throw new Error("NO_TOKEN");
  }

  return token;
}

async function getErrorMessage(response: Response, fallback: string) {
  const text = await response.text();

  if (!text) {
    return fallback;
  }

  try {
    const json = JSON.parse(text);

    if (Array.isArray(json.message)) {
      return json.message.join(", ");
    }

    return json.message || fallback;
  } catch {
    return fallback;
  }
}

function buildDateRangeQuery(range?: ReportDateRange) {
  const params = new URLSearchParams();

  if (range?.from) params.append("from", range.from);
  if (range?.to) params.append("to", range.to);

  const queryString = params.toString();

  return queryString ? `?${queryString}` : "";
}

async function downloadReport(endpoint: string, filename: string) {
  const token = getToken();

  const response = await apiFetch(endpoint, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Error generando el reporte"),
    );
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

export async function downloadCollectionsExcel(
  range?: ReportDateRange,
): Promise<void> {
  await downloadReport(
    `/reports/collections/excel${buildDateRangeQuery(range)}`,
    "cobranzas.xlsx",
  );
}

export async function downloadPendingInstallmentsExcel(): Promise<void> {
  await downloadReport(
    "/reports/installments/pending/excel",
    "cuotas-pendientes.xlsx",
  );
}

export async function downloadFailedVisitsPdf(): Promise<void> {
  await downloadReport("/reports/failed-visits/pdf", "visitas-fallidas.pdf");
}

export async function downloadCashMovementsExcel(
  range?: ReportDateRange,
): Promise<void> {
  await downloadReport(
    `/reports/cash-movements/excel${buildDateRangeQuery(range)}`,
    "movimientos-caja.xlsx",
  );
}
