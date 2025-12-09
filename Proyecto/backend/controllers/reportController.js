// controllers/reportController.js
const PDFDocument = require('pdfkit');
const Sale = require('../models/Sale');

const generateSalesReportPDF = async (req, res) => {
  try {
    const { viewMode } = req.query;
    const { user } = req;

    // Obtener datos de ventas
    let sales = [];
    let title = '';
    let subtitle = '';

    if (viewMode === 'today' || !viewMode) {
      // Ventas del día
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const query = user.rol === 'Admin'
        ? { fecha: { $gte: today, $lt: tomorrow } }
        : { fecha: { $gte: today, $lt: tomorrow }, usuario: user.nombre };

      sales = await Sale.find(query).sort({ fecha: -1 });
      title = user.rol === 'Admin' ? 'REPORTE DE VENTAS DEL DÍA' : 'MIS VENTAS DEL DÍA';
      subtitle = `Fecha: ${today.toLocaleDateString('es-ES')}`;
    } else {
      // Todas las ventas (solo admin)
      if (user.rol !== 'Admin') {
        return res.status(403).json({ msg: 'No autorizado' });
      }

      sales = await Sale.find().sort({ fecha: -1 });
      title = 'REPORTE COMPLETO DE VENTAS';
      subtitle = `Generado el ${new Date().toLocaleString('es-ES')}`;
    }

    // Crear documento PDF
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50
    });

    // Configurar headers de respuesta
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="reporte-ventas-${viewMode || 'today'}-${new Date().toISOString().split('T')[0]}.pdf"`);

    // Pipe del PDF a la respuesta
    doc.pipe(res);

    // Encabezado
    doc.fontSize(20).font('Helvetica-Bold').text('PASTELERÍA DELICIOSA', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(16).text(title, { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(12).font('Helvetica').text(subtitle, { align: 'center' });
    doc.moveDown(1);

    // Información del generador
    doc.fontSize(10).text(`Generado por: ${user.nombre} (${user.rol})`, { align: 'right' });
    doc.moveDown(1);

    if (sales.length === 0) {
      doc.fontSize(14).text('No se encontraron ventas para el período seleccionado.', { align: 'center' });
    } else {
      // Estadísticas generales
      const totalVentas = sales.reduce((sum, sale) => sum + (sale.total || 0), 0);
      const totalTransacciones = sales.length;
      const promedioVenta = totalTransacciones > 0 ? totalVentas / totalTransacciones : 0;

      doc.fontSize(12).font('Helvetica-Bold').text('RESUMEN GENERAL:');
      doc.moveDown(0.5);
      doc.font('Helvetica').fontSize(10);
      doc.text(`Total de Ventas: Bs. ${totalVentas.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`);
      doc.text(`Número de Transacciones: ${totalTransacciones}`);
      doc.text(`Promedio por Venta: Bs. ${promedioVenta.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`);
      doc.moveDown(1);

      // Tabla de ventas
      const tableTop = doc.y;
      const tableLeft = 50;
      const rowHeight = 20;
      let currentY = tableTop;

      // Encabezados de tabla
      const headers = ['Fecha/Hora', 'Cliente', 'Método', 'Total', 'Productos'];
      const colWidths = [80, 80, 60, 60, 150];

      doc.font('Helvetica-Bold').fontSize(9);

      // Dibujar encabezados
      headers.forEach((header, i) => {
        const x = tableLeft + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
        doc.text(header, x, currentY, { width: colWidths[i], align: 'left' });
      });

      // Línea separadora
      doc.moveTo(tableLeft, currentY + 15).lineTo(tableLeft + colWidths.reduce((a, b) => a + b, 0), currentY + 15).stroke();
      currentY += rowHeight;

      // Filas de datos
      doc.font('Helvetica').fontSize(8);

      sales.forEach((sale, index) => {
        // Verificar si necesitamos nueva página
        if (currentY > 700) {
          doc.addPage();
          currentY = 50;

          // Repetir encabezados en nueva página
          doc.font('Helvetica-Bold').fontSize(9);
          headers.forEach((header, i) => {
            const x = tableLeft + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
            doc.text(header, x, currentY, { width: colWidths[i], align: 'left' });
          });
          doc.moveTo(tableLeft, currentY + 15).lineTo(tableLeft + colWidths.reduce((a, b) => a + b, 0), currentY + 15).stroke();
          currentY += rowHeight;
          doc.font('Helvetica').fontSize(8);
        }

        const fecha = new Date(sale.fecha || sale.createdAt).toLocaleString('es-ES');
        const cliente = sale.cliente?.nombre || 'Cliente General';
        const metodo = sale.metodoPago || 'Efectivo';
        const total = `Bs. ${Number(sale.total || 0).toFixed(2)}`;

        // Productos (resumidos)
        const productos = (sale.items || []).map(item =>
          `${item.nombre} (${item.cantidad})`
        ).join(', ');

        // Dibujar fila
        const rowData = [fecha, cliente, metodo, total, productos];

        rowData.forEach((data, i) => {
          const x = tableLeft + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
          const maxWidth = colWidths[i] - 5;

          if (data.length > 30 && i === 4) { // Columna de productos
            doc.text(data.substring(0, 30) + '...', x, currentY, { width: maxWidth });
          } else {
            doc.text(data, x, currentY, { width: maxWidth });
          }
        });

        currentY += rowHeight;

        // Línea separadora cada 5 filas
        if ((index + 1) % 5 === 0) {
          doc.moveTo(tableLeft, currentY - 5).lineTo(tableLeft + colWidths.reduce((a, b) => a + b, 0), currentY - 5).stroke();
        }
      });

      // Pie de página
      doc.fontSize(8).font('Helvetica').text(
        `Reporte generado el ${new Date().toLocaleString('es-ES')} - Pastelería Java`,
        50,
        750,
        { align: 'center' }
      );
    }

    // Finalizar documento
    doc.end();

  } catch (err) {
    console.error('Error al generar PDF de ventas:', err);
    return res.status(500).json({ msg: 'Error al generar reporte de ventas' });
  }
};

module.exports = { generateSalesReportPDF };
