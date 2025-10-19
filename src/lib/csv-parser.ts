export interface CSVRow {
  [key: string]: string;
}

export interface ParsedMemberData {
  phone: string;
  name?: string;
  [key: string]: string | undefined;
}

/**
 * Parses a CSV file and extracts phone numbers
 * Assumes the CSV has a header row and contains a phone number column
 */
export const parseCSV = (csvContent: string): ParsedMemberData[] => {
  const lines = csvContent.trim().split('\n');
  
  if (lines.length < 2) {
    throw new Error('CSV file must contain at least a header row and one data row');
  }

  // Parse header row
  const headers = parseCSVLine(lines[0]);
  
  // Find phone number column (look for common variations)
  const phoneColumnIndex = findPhoneColumn(headers);
  if (phoneColumnIndex === -1) {
    throw new Error('No phone number column found. Please ensure your CSV contains a column with phone numbers.');
  }

  // Parse data rows
  const results: ParsedMemberData[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVLine(lines[i]);
    if (row.length !== headers.length) {
      console.warn(`Row ${i + 1} has ${row.length} columns but header has ${headers.length}. Skipping.`);
      continue;
    }

    const phone = cleanPhoneNumber(row[phoneColumnIndex]);
    if (!phone) {
      console.warn(`Row ${i + 1} has invalid phone number. Skipping.`);
      continue;
    }

    // Create object with all columns
    const memberData: ParsedMemberData = { phone };
    
    headers.forEach((header, index) => {
      const cleanHeader = header.trim().toLowerCase();
      if (cleanHeader.includes('name') || cleanHeader.includes('navn')) {
        memberData.name = row[index];
      }
      memberData[header.trim()] = row[index];
    });

    results.push(memberData);
  }

  return results;
};

/**
 * Parses a single CSV line, handling quoted fields
 */
const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
};

/**
 * Finds the index of the phone number column
 */
const findPhoneColumn = (headers: string[]): number => {
  const phoneKeywords = ['phone', 'telefon', 'mobil', 'mobile', 'tlf', 'nummer'];
  
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i].toLowerCase();
    if (phoneKeywords.some(keyword => header.includes(keyword))) {
      return i;
    }
  }
  
  return -1;
};

/**
 * Cleans and validates phone number
 */
const cleanPhoneNumber = (phone: string): string | null => {
  if (!phone) return null;
  
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // Handle Norwegian phone numbers
  if (cleaned.startsWith('+47')) {
    return cleaned;
  } else if (cleaned.startsWith('47') && cleaned.length >= 10) {
    return '+' + cleaned;
  } else if (cleaned.length === 8 && /^[2-9]\d{7}$/.test(cleaned)) {
    return '+47' + cleaned;
  } else if (cleaned.length >= 10) {
    // Assume it's a valid international number
    return '+' + cleaned.replace(/^47/, '');
  }
  
  return null;
};
