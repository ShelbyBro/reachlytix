
import { parse } from "csv-parse/sync";

// All CSV row typing, validation, and parsing util functions
export interface CsvRow {
  [key: string]: string | boolean | undefined;
  name: string;
  email: string;
  phone: string;
  source: string;
  isValid: boolean;
  invalidReason?: string;
}

// Parse and validate CSV file text
export function parseCSV(
  text: string,
  selectedSource: string,
  selectedCampaign: string
): CsvRow[] {
  const lines = text.split('\n');
  const headers = lines[0].split(',').map(header => header.trim().toLowerCase());
  const rows: CsvRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const values = lines[i].split(',').map(value => value.trim());
    const row: Partial<CsvRow> = {};

    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });

    // Validate row
    const isValid = Boolean(row.email && row.phone);
    let invalidReason = '';
    if (!row.email && !row.phone) invalidReason = 'Missing both email and phone';
    else if (!row.email) invalidReason = 'Missing email';
    else if (!row.phone) invalidReason = 'Missing phone';

    rows.push({
      name: row.name || '',
      email: row.email || '',
      phone: row.phone || '',
      source: selectedSource || row.source || '',
      isValid,
      invalidReason
    });
  }

  return rows;
}

export function validateHeaders(headers: string[]): string[] {
  const requiredHeaders = ['name', 'email', 'phone'];
  return requiredHeaders.filter(h => !headers.includes(h));
}
