'use client';

import React from 'react';

interface PrintableBillProps {
  bill: any;
  settings?: any;
  locale?: string;
  formatCurrency?: (amount: number) => string;
}

export const printBill = (elementId: string) => {
  const printContent = document.getElementById(elementId);
  if (!printContent) return;

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Print Receipt</title>
        <style>
          @page { 
            size: 80mm auto; 
            margin: 0; 
          }
          * { 
            margin: 0; 
            padding: 0; 
            box-sizing: border-box; 
          }
          body { 
            font-family: 'Courier New', monospace; 
            font-size: 12px; 
            line-height: 1.4;
            padding: 8px;
            width: 80mm;
          }
          .receipt { 
            width: 100%; 
          }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .font-bold { font-weight: bold; }
          .text-lg { font-size: 14px; }
          .text-sm { font-size: 10px; }
          .text-xs { font-size: 9px; }
          .mt-2 { margin-top: 8px; }
          .mt-4 { margin-top: 16px; }
          .mb-2 { margin-bottom: 8px; }
          .mb-4 { margin-bottom: 16px; }
          .py-2 { padding-top: 8px; padding-bottom: 8px; }
          .border-t { border-top: 1px dashed #000; }
          .border-b { border-bottom: 1px dashed #000; }
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 4px 0; text-align: left; }
          th:last-child, td:last-child { text-align: right; }
          .total-row { font-weight: bold; font-size: 14px; }
          .divider { border-top: 1px dashed #000; margin: 8px 0; }
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
};

export default function PrintableBill({ bill, settings, locale = 'en', formatCurrency }: PrintableBillProps) {
  const format = formatCurrency || ((amount: number) => `${amount.toLocaleString()} ₭`);
  const isLao = locale === 'lo';

  return (
    <div className="receipt" style={{ fontFamily: "'Courier New', monospace", fontSize: '12px', width: '100%', maxWidth: '280px' }}>
      {/* Header */}
      <div className="text-center mb-4">
        <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{settings?.shop_name || 'Beauty Center'}</div>
        <div style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>{settings?.address || ''}</div>
        <div style={{ fontSize: '10px', color: '#666' }}>{settings?.phone || ''}</div>
      </div>

      {/* Receipt Title */}
      <div className="text-center mb-4" style={{ fontSize: '14px', fontWeight: 'bold', letterSpacing: '2px' }}>
        *** {isLao ? 'ໃບບິນ' : 'RECEIPT'} ***
      </div>

      {/* Bill Info */}
      <div className="divider" />
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
        <span style={{ fontSize: '10px', color: '#666' }}>{isLao ? 'ເລກບິນ' : 'Bill No'}:</span>
        <span style={{ fontWeight: 'bold' }}>{bill.bill_number}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px' }}>
        <span style={{ fontSize: '10px', color: '#666' }}>{isLao ? 'ວັນທີ' : 'Date'}:</span>
        <span>{bill.created_at}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px' }}>
        <span style={{ fontSize: '10px', color: '#666' }}>{isLao ? 'ລູກຄ້າ' : 'Customer'}:</span>
        <span>{bill.customer_name}</span>
      </div>
      <div className="divider" />

      {/* Items */}
      <table style={{ width: '100%', margin: '8px 0' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #ddd' }}>
            <th style={{ textAlign: 'left', fontSize: '10px', padding: '4px 0' }}>{isLao ? 'ລາຍການ' : 'Item'}</th>
            <th style={{ textAlign: 'right', fontSize: '10px', padding: '4px 0' }}>{isLao ? 'ລາຄາ' : 'Price'}</th>
          </tr>
        </thead>
        <tbody>
          {bill.items ? bill.items.map((item: any, index: number) => (
            <tr key={index}>
              <td style={{ padding: '4px 0' }}>{item.name}</td>
              <td style={{ textAlign: 'right', padding: '4px 0' }}>{format(item.price)}</td>
            </tr>
          )) : (
            <tr>
              <td style={{ padding: '4px 0' }}>{bill.service_name || (isLao ? 'ບໍລິການ' : 'Service')}</td>
              <td style={{ textAlign: 'right', padding: '4px 0' }}>{format(bill.subtotal || bill.grand_total || 0)}</td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="divider" />

      {/* Totals */}
      <div style={{ padding: '8px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
          <span>{isLao ? 'ຍອດລວມ' : 'Subtotal'}</span>
          <span>{format(bill.subtotal || bill.grand_total || 0)}</span>
        </div>
        {bill.discount_amount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', color: '#dc2626' }}>
            <span>{isLao ? 'ສ່ວນຫຼຸດ' : 'Discount'}</span>
            <span>-{format(bill.discount_amount)}</span>
          </div>
        )}
        {bill.tax_amount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
            <span>{isLao ? 'ອາກອນ' : 'Tax'}</span>
            <span>{format(bill.tax_amount)}</span>
          </div>
        )}
      </div>

      <div className="divider" />

      {/* Grand Total */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '16px', fontWeight: 'bold' }}>
        <span>{isLao ? 'ຍອດສຸດທິ' : 'TOTAL'}</span>
        <span>{format(bill.grand_total || bill.total_amount || 0)}</span>
      </div>

      {/* Payment Method */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '10px' }}>
        <span>{isLao ? 'ຊຳລະໂດຍ' : 'Payment'}</span>
        <span style={{ textTransform: 'capitalize' }}>{bill.payment_method}</span>
      </div>

      <div className="divider" />

      {/* Footer */}
      <div className="text-center mt-4">
        <div style={{ fontSize: '11px' }}>✨ {isLao ? 'ຂອບໃຈທີ່ໃຊ້ບໍລິການ' : 'Thank you for your visit!'} ✨</div>
        <div style={{ fontSize: '9px', color: '#666', marginTop: '4px' }}>
          {isLao ? 'ຍິນດີຕ້ອນຮັບທ່ານກັບມາໃໝ່' : 'We look forward to seeing you again'}
        </div>
      </div>

      {/* QR or barcode placeholder */}
      <div className="text-center mt-4" style={{ fontSize: '8px', color: '#999' }}>
        ════════════════════════════
      </div>
    </div>
  );
}
