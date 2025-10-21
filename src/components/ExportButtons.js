import React from 'react';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

const ExportButtons = ({ tables }) => {
  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return new Date(timeString).toLocaleString();
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Table Support - Management Report', 20, 20);
    
    // Add date
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 30);
    
    // Add table data
    let yPosition = 50;
    const pageHeight = doc.internal.pageSize.height;
    const lineHeight = 7;
    
    // Headers
    doc.setFontSize(10);
    doc.text('Table #', 20, yPosition);
    doc.text('Customer', 40, yPosition);
    doc.text('Beer', 80, yPosition);
    doc.text('Status', 120, yPosition);
    doc.text('Payment', 150, yPosition);
    doc.text('Handled By', 180, yPosition);
    doc.text('Order Time', 220, yPosition);
    
    yPosition += lineHeight;
    
    // Draw line under headers
    doc.line(20, yPosition - 2, 200, yPosition - 2);
    
    // Table data
    tables.forEach(table => {
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.text(table.tableNumber.toString(), 20, yPosition);
      doc.text(table.customerName || 'Available', 40, yPosition);
      doc.text(table.beerOrdered || 'N/A', 80, yPosition);
      doc.text(table.isOccupied ? 'Occupied' : 'Available', 120, yPosition);
      doc.text(table.paymentStatus || 'N/A', 150, yPosition);
      doc.text(table.handledByName || 'N/A', 180, yPosition);
      doc.text(formatTime(table.timeOfOrder), 220, yPosition);
      
      yPosition += lineHeight;
    });
    
    // Add summary
    const occupiedTables = tables.filter(table => table.isOccupied).length;
    const unpaidTables = tables.filter(table => table.isOccupied && table.paymentStatus === 'unpaid').length;
    
    yPosition += 10;
    doc.setFontSize(12);
    doc.text('Summary:', 20, yPosition);
    yPosition += lineHeight;
    doc.text(`Total Tables: 15`, 20, yPosition);
    yPosition += lineHeight;
    doc.text(`Occupied Tables: ${occupiedTables}`, 20, yPosition);
    yPosition += lineHeight;
    doc.text(`Available Tables: ${15 - occupiedTables}`, 20, yPosition);
    yPosition += lineHeight;
    doc.text(`Unpaid Orders: ${unpaidTables}`, 20, yPosition);
    
    doc.save('shooter-sports-bar-report.pdf');
  };

  const exportToExcel = () => {
    // Prepare data for Excel
    const excelData = tables.map(table => ({
      'Table Number': table.tableNumber,
      'Customer Name': table.customerName || 'Available',
      'Beer Ordered': table.beerOrdered || 'N/A',
      'Status': table.isOccupied ? 'Occupied' : 'Available',
      'Payment Status': table.paymentStatus || 'N/A',
      'Handled By': table.handledByName || 'N/A',
      'Order Time': formatTime(table.timeOfOrder),
      'Finished Time': formatTime(table.timeFinished)
    }));

    // Add summary data
    const summaryData = [
      {},
      { 'Table Number': 'SUMMARY', 'Customer Name': '', 'Beer Ordered': '', 'Status': '', 'Payment Status': '', 'Order Time': '', 'Finished Time': '' },
      { 'Table Number': 'Total Tables', 'Customer Name': '15', 'Beer Ordered': '', 'Status': '', 'Payment Status': '', 'Order Time': '', 'Finished Time': '' },
      { 'Table Number': 'Occupied Tables', 'Customer Name': tables.filter(t => t.isOccupied).length.toString(), 'Beer Ordered': '', 'Status': '', 'Payment Status': '', 'Order Time': '', 'Finished Time': '' },
      { 'Table Number': 'Available Tables', 'Customer Name': (15 - tables.filter(t => t.isOccupied).length).toString(), 'Beer Ordered': '', 'Status': '', 'Payment Status': '', 'Order Time': '', 'Finished Time': '' },
      { 'Table Number': 'Unpaid Orders', 'Customer Name': tables.filter(t => t.isOccupied && t.paymentStatus === 'unpaid').length.toString(), 'Beer Ordered': '', 'Status': '', 'Payment Status': '', 'Order Time': '', 'Finished Time': '' }
    ];

    const allData = [...excelData, ...summaryData];

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(allData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Table Management');

    // Save file
    XLSX.writeFile(wb, 'table-support-tables.xlsx');
  };

  return (
    <div style={{ 
      background: 'rgba(255, 255, 255, 0.95)', 
      backdropFilter: 'blur(10px)', 
      borderRadius: '15px', 
      padding: '20px', 
      marginBottom: '30px', 
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      textAlign: 'center'
    }}>
      <h3 style={{ color: '#2c3e50', marginBottom: '15px' }}>📊 Export Data</h3>
      <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button onClick={exportToPDF} className="btn btn-danger">
          📄 Export PDF
        </button>
        <button onClick={exportToExcel} className="btn btn-success">
          📊 Export Excel
        </button>
      </div>
    </div>
  );
};

export default ExportButtons;
