import type { Item, Location } from "@shared/schema";

export interface ExportOptions {
  format: 'csv' | 'pdf';
  includeImages?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export function exportToCSV(items: Item[], locations: Location[]): string {
  const locationMap = new Map(locations.map(l => [l.id, l]));
  
  const headers = [
    'Name',
    'Description', 
    'Barcode',
    'Value',
    'Purchase Date',
    'Warranty End Date',
    'Location',
    'Notes',
    'Created Date'
  ];

  const rows = items.map(item => {
    const location = item.locationId ? locationMap.get(item.locationId) : null;
    
    return [
      escapeCSV(item.name),
      escapeCSV(item.description || ''),
      escapeCSV(item.barcode || ''),
      item.value || '',
      item.purchaseDate ? formatDate(item.purchaseDate) : '',
      item.warrantyEndDate ? formatDate(item.warrantyEndDate) : '',
      escapeCSV(location ? location.path : ''),
      escapeCSV(item.notes || ''),
      formatDate(item.createdAt)
    ];
  });

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  return csvContent;
}

export function downloadCSV(csvContent: string, filename: string = 'inventory.csv') {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export async function exportToPDF(items: Item[], locations: Location[]): Promise<Blob> {
  // This would integrate with a PDF library like jsPDF or PDFKit
  // For now, we'll create a simple HTML-to-PDF conversion
  
  const locationMap = new Map(locations.map(l => [l.id, l]));
  
  const htmlContent = `
    <html>
      <head>
        <title>Inventory Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f8f9fa; font-weight: bold; }
          tr:nth-child(even) { background-color: #f8f9fa; }
          .summary { background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <h1>Vault Inventory Report</h1>
        <div class="summary">
          <p><strong>Total Items:</strong> ${items.length}</p>
          <p><strong>Total Value:</strong> $${items.reduce((sum, item) => sum + (parseFloat(item.value || '0') || 0), 0).toLocaleString()}</p>
          <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Location</th>
              <th>Value</th>
              <th>Purchase Date</th>
              <th>Warranty End</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(item => {
              const location = item.locationId ? locationMap.get(item.locationId) : null;
              return `
                <tr>
                  <td>${escapeHTML(item.name)}</td>
                  <td>${escapeHTML(location ? location.path : 'No location')}</td>
                  <td>${item.value ? '$' + parseFloat(item.value).toLocaleString() : ''}</td>
                  <td>${item.purchaseDate ? formatDate(item.purchaseDate) : ''}</td>
                  <td>${item.warrantyEndDate ? formatDate(item.warrantyEndDate) : ''}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;

  // Convert HTML to PDF (would need a proper PDF library in production)
  const blob = new Blob([htmlContent], { type: 'text/html' });
  return blob;
}

function escapeCSV(str: string): string {
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function escapeHTML(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString();
}
