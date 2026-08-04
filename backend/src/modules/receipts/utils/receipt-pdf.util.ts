import * as PDFDocument from 'pdfkit';
import { Receipt } from '../entities/receipt.entity';

export function buildReceiptPdf(receipt: Receipt): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A5', margin: 40 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(18).text('Recibo de Pago', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Recibo N°: ${receipt.receiptNumber}`);
    doc.text(`Fecha de emisión: ${receipt.issuedAt.toLocaleDateString('es-AR')}`);
    doc.moveDown();
    doc.fontSize(14).text(`Monto: $ ${Number(receipt.amount).toFixed(2)}`);
    doc.moveDown();
    if (receipt.paymentId) doc.fontSize(10).text(`Pago de cliente asociado: ${receipt.paymentId}`);
    if (receipt.supplierPaymentId) doc.fontSize(10).text(`Pago a proveedor asociado: ${receipt.supplierPaymentId}`);

    doc.end();
  });
}
