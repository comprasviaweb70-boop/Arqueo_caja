
import React from 'react';
import ReactDOM from 'react-dom';

const DENOMINACIONES = [
  { valor: 20000, label: '$20.000' },
  { valor: 10000, label: '$10.000' },
  { valor: 5000, label: '$5.000' },
  { valor: 2000, label: '$2.000' },
  { valor: 1000, label: '$1.000' },
  { valor: 500, label: '$500' },
  { valor: 100, label: '$100' },
  { valor: 50, label: '$50' },
  { valor: 10, label: '$10' },
];

const PRINT_STYLES = `
  @media screen {
    .print-receipt-portal { display: none !important; }
  }
  @media print {
    @page { margin: 3mm 6mm 3mm 3mm; size: 80mm auto; }

    html, body {
      background: #fff !important;
      background-color: #fff !important;
      background-image: none !important;
      margin: 0 !important;
      padding: 0 !important;
      height: auto !important;
      min-height: 0 !important;
    }

    /* Hide the entire React app */
    #root {
      display: none !important;
    }

    /* Show only the portal receipt (direct child of body) */
    .print-receipt-portal {
      display: block !important;
      width: 80mm !important;
      margin: 0 !important;
      padding: 2mm !important;
      background: #fff !important;
      color: #000 !important;
      font-family: "Arial Black", Arial, Helvetica, sans-serif !important;
      font-size: 14px !important;
      font-weight: 900 !important;
      line-height: 1.4 !important;
    }

    .print-receipt-portal * {
      color: #000 !important;
      background: transparent !important;
      background-color: transparent !important;
      font-weight: 900 !important;
      text-shadow: none !important;
      box-shadow: none !important;
    }

    .print-receipt-portal .receipt-title {
      text-align: center;
      font-size: 18px;
      font-weight: 900;
      margin-bottom: 6px;
      letter-spacing: 2px;
    }
    .print-receipt-portal .receipt-divider {
      border-top: 2px dashed #000;
      margin: 6px 0;
    }
    .print-receipt-portal .receipt-row {
      display: flex;
      justify-content: space-between;
      margin: 3px 0;
    }
    .print-receipt-portal .receipt-total {
      font-size: 16px;
      font-weight: 900;
      border-top: 2px solid #000;
      padding-top: 6px;
      margin-top: 6px;
    }
    .print-receipt-portal .receipt-signature {
      text-align: center;
      margin-top: 20px;
      border-top: 1px solid #000;
      width: 70%;
      margin-left: auto;
      margin-right: auto;
      padding-top: 4px;
      font-size: 12px;
    }
    .print-receipt-portal .receipt-footer {
      text-align: center;
      margin-top: 8px;
      font-size: 11px;
    }
  }
`;

const PrintReceipt = ({ data }) => {
  if (!data) return null;

  const { cajero, unidades, total, cambios, fecha } = data;
  const dateObj = fecha ? new Date(fecha) : new Date();

  const receipt = (
    <div className="print-receipt-portal">
      <style dangerouslySetInnerHTML={{ __html: PRINT_STYLES }} />

      <div className="receipt-title">ARQUEO DE CAJA IM</div>
      <div className="receipt-divider" />

      <div className="receipt-row"><span>Fecha:</span><span>{dateObj.toLocaleDateString('es-CL')}</span></div>
      <div className="receipt-row"><span>Hora:</span><span>{dateObj.toLocaleTimeString('es-CL')}</span></div>
      <div className="receipt-row"><span>Cajero:</span><span>{cajero || 'N/A'}</span></div>

      <div className="receipt-divider" />
      <div style={{ fontWeight: 900, marginBottom: '4px' }}>DETALLE EFECTIVO</div>
      <div className="receipt-divider" />

      {DENOMINACIONES.map(d => {
        const cantidad = unidades?.[d.valor] || 0;
        if (cantidad === 0) return null;
        const subtotal = d.valor * cantidad;
        return (
          <div key={d.valor} className="receipt-row">
            <span>{d.label} x {cantidad}</span>
            <span>${subtotal.toLocaleString('es-CL')}</span>
          </div>
        );
      })}

      <div className="receipt-row receipt-total">
        <span>TOTAL GENERAL:</span>
        <span>${total?.toLocaleString('es-CL') || 0}</span>
      </div>

      {cambios && (
        <>
          <div className="receipt-divider" />
          <div style={{ fontWeight: 900, marginBottom: '4px' }}>OBSERVACIONES:</div>
          <div>{cambios}</div>
        </>
      )}

      <div className="receipt-signature">FIRMA CAJERO</div>
      <div className="receipt-footer">*** COMPROBANTE INTERNO ***</div>
    </div>
  );

  // Render directly into body, bypassing the dark app background
  return ReactDOM.createPortal(receipt, document.body);
};

export default PrintReceipt;
