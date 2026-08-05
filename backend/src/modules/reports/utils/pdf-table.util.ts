import * as PDFDocument from 'pdfkit';

export interface PdfColumn {
  header: string;
  key: string;
  width?: number;
}

export function buildPdfTable(
  title: string,
  rows: Record<string, unknown>[],
  columns: PdfColumn[],
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 40, layout: 'landscape' });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(16).text(title, { align: 'center' });
    doc.moveDown();
    doc.fontSize(9).text(`Generado: ${new Date().toLocaleString('es-AR')}`, { align: 'right' });
    doc.moveDown();

    const colWidth = columns.reduce((s, c) => s + (c.width ?? 100), 0);
    let y = doc.y;

    doc.fontSize(10).font('Helvetica-Bold');
    let x = doc.page.margins.left;
    for (const col of columns) {
      doc.text(col.header, x, y, { width: col.width ?? 100 });
      x += col.width ?? 100;
    }
    doc.font('Helvetica');
    y += 18;

    for (const row of rows) {
      if (y > doc.page.height - doc.page.margins.bottom) {
        doc.addPage({ size: 'A4', margin: 40, layout: 'landscape' });
        y = doc.page.margins.top;
      }
      x = doc.page.margins.left;
      for (const col of columns) {
        const value = row[col.key];
        doc.text(value === null || value === undefined ? '' : String(value), x, y, { width: col.width ?? 100 });
        x += col.width ?? 100;
      }
      y += 16;
    }

    if (!rows.length) {
      doc.text('Sin datos para el período seleccionado.', doc.page.margins.left, y);
    }

    void colWidth;
    doc.end();
  });
}
