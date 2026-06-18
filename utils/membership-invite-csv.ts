export type ParsedInviteRow = {
  email?: string;
  invitedName?: string;
  invitedPhone?: string;
};

/**
 * Parse CSV/text bulk invite input.
 * Supported columns (header optional): email, name, phone
 */
export function parseMembershipInviteCsv(text: string): ParsedInviteRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (!lines.length) return [];

  const firstCells = splitCsvLine(lines[0]);
  const hasHeader = firstCells.some((cell) => /^(email|correo|name|nombre|phone|tel[eé]fono)$/i.test(cell));
  const dataLines = hasHeader ? lines.slice(1) : lines;

  return dataLines.map((line) => {
    const cells = splitCsvLine(line);
    if (hasHeader) {
      const header = firstCells.map((h) => h.toLowerCase());
      const row: ParsedInviteRow = {};
      header.forEach((key, index) => {
        const value = cells[index]?.trim();
        if (!value) return;
        if (key === 'email' || key === 'correo') row.email = value.toLowerCase();
        if (key === 'name' || key === 'nombre') row.invitedName = value;
        if (key === 'phone' || key === 'telefono' || key === 'teléfono') row.invitedPhone = value;
      });
      return row;
    }

    return {
      email: cells[0]?.trim().toLowerCase() || undefined,
      invitedName: cells[1]?.trim() || undefined,
      invitedPhone: cells[2]?.trim() || undefined,
    };
  }).filter((row) => row.email || row.invitedName);
}

function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === ',' && !inQuotes) {
      cells.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }
  cells.push(current.trim());
  return cells;
}
