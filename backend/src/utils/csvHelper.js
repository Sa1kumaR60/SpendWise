/**
 * Escape a single CSV cell according to RFC 4180
 * Values containing commas, double quotes, or newlines are quoted,
 * and internal double quotes are escaped by doubling them ("").
 */
const escapeCsvCell = (val) => {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
};

/**
 * Convert an array of transaction documents/objects to CSV string
 */
const transactionsToCsv = (transactions) => {
  const headers = [
    'Date',
    'Type',
    'Category',
    'Description',
    'Amount',
    'Notes',
    'Created At',
  ];

  const headerRow = headers.map(escapeCsvCell).join(',');

  const rows = transactions.map((t) => {
    const formattedDate = t.date ? new Date(t.date).toISOString().split('T')[0] : '';
    const categoryName = t.category ? (t.category.name || t.category) : 'Uncategorized';
    const createdAt = t.createdAt ? new Date(t.createdAt).toISOString() : '';

    return [
      escapeCsvCell(formattedDate),
      escapeCsvCell(t.type),
      escapeCsvCell(categoryName),
      escapeCsvCell(t.description),
      escapeCsvCell(t.amount.toFixed(2)),
      escapeCsvCell(t.notes || ''),
      escapeCsvCell(createdAt),
    ].join(',');
  });

  return [headerRow, ...rows].join('\r\n');
};

module.exports = {
  escapeCsvCell,
  transactionsToCsv,
};
