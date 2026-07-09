/** Client-side CSV validation before anything is sent to the API. */

export const REQUIRED_COLUMNS = ["date", "store_nbr", "onpromotion", "sales"] as const;
export const MAX_FILE_MB = 50;

export interface CsvValidationResult {
  ok: boolean;
  error?: string;
  rowEstimate?: number;
  columns?: string[];
}

export async function validateCsvFile(file: File): Promise<CsvValidationResult> {
  if (!file.name.toLowerCase().endsWith(".csv")) {
    return { ok: false, error: "Only .csv files are supported." };
  }
  if (file.size === 0) {
    return { ok: false, error: "This file is empty." };
  }
  if (file.size > MAX_FILE_MB * 1024 * 1024) {
    return { ok: false, error: `File is too large (max ${MAX_FILE_MB} MB).` };
  }

  // Only the first chunk is needed to inspect the header row.
  const headText = await file.slice(0, 64 * 1024).text();
  const firstLine = headText.split(/\r?\n/)[0]?.trim();
  if (!firstLine) {
    return { ok: false, error: "Could not read a header row from this file." };
  }

  const columns = firstLine.split(",").map((c) => c.trim().replace(/^"|"$/g, "").toLowerCase());
  const missing = REQUIRED_COLUMNS.filter((c) => !columns.includes(c));
  if (missing.length > 0) {
    return {
      ok: false,
      error: `Missing required column${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}. Expected: date, store_nbr, onpromotion, sales.`,
      columns,
    };
  }

  const linesInHead = headText.split(/\r?\n/).filter((l) => l.trim()).length;
  if (linesInHead < 2 && file.size <= 64 * 1024) {
    return { ok: false, error: "The CSV has a header but no data rows." };
  }

  const avgLineBytes = headText.length / linesInHead;
  return { ok: true, columns, rowEstimate: Math.max(1, Math.round(file.size / avgLineBytes) - 1) };
}
