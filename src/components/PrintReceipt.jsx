
import React from 'react';

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

const PrintReceipt = ({ data }) => {
  if (!data) return null;

  const { cajero, unidades, total, cambios, fecha } = data;
  const dateObj = fecha ? new Date(fecha) : new Date();

  return (
    <div className="print-thermal-receipt">
      <style dangerouslySetInnerHTML={{ __html: `
        @media screen {
          .print-thermal-receipt { display: none; }
        }
        @media print {
          @page { margin: 0; size: 80mm auto; }
          html, body, #root, [class*="min-h-screen"], main, div {
            background: #fff !important;
            background-color: #fff !important;
            background-image: none !important;
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            min-height: 0 !important;
            color: #000 !important;
            font-weight: normal !important;
          }
          
          /* Esconder todo lo demás con DISPLAY NONE */
          body > *:not(.print-thermal-receipt):not(script):not(style) {
            display: none !important;
          }
          
          /* Asegurar que el contenedor del recibo esté visible y limpio */
          .print-thermal-receipt {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 80mm !important;
            padding: 4mm !important;
            background: #fff !important;
            color: #000 !important;
            font-family: "Arial Black", Arial, sans-serif !important;
            font-size: 14px !important;
            line-height: 1.3 !important;
            text-align: left !important;
          }

          .print-thermal-receipt * {
            color: #000 !important;
            background: transparent !important;
            font-weight: 900 !important;
            -webkit-text-stroke: 0.8px #000;
          }

          .print-thermal-receipt h1 { font-size: 20px !important; margin-bottom: 8px !important; text-align: center !important; }
          .print-thermal-receipt h3 { font-size: 16px !important; margin-top: 10px !important; margin-bottom: 5px !important; }
          
          .print-border-dashed { border-bottom: 2px dashed #000 !important; margin: 8px 0 !important; }
          .print-border-top-dashed { border-top: 2px dashed #000 !important; margin: 8px 0 !important; padding-top: 8px !important; }
        }
      `}} />

      <div className="text-center mb-3">
        <h1 className="font-bold text-xl uppercase tracking-widest mb-1">ARQUEO DE CAJA IM</h1>
      </div>
      
      <div className="mb-3 print-border-dashed pb-2 text-sm space-y-1">
        <div className="flex justify-between">
          <span>Fecha:</span>
          <span>{dateObj.toLocaleDateString('es-CL')}</span>
        </div>
        <div className="flex justify-between">
          <span>Hora:</span>
          <span>{dateObj.toLocaleTimeString('es-CL')}</span>
        </div>
        <div className="flex justify-between mt-1">
          <span>Cajero:</span>
          <span className="font-bold uppercase">{cajero || 'N/A'}</span>
        </div>
      </div>

      <div className="mb-3 text-sm">
        <h3 className="font-bold mb-2 print-border-dashed pb-1 uppercase">Detalle Efectivo</h3>
        <div className="space-y-1">
          {DENOMINACIONES.map(d => {
            const cantidad = unidades?.[d.valor] || 0;
            if (cantidad === 0) return null;
            const subtotal = d.valor * cantidad;
            return (
              <div key={d.valor} className="flex justify-between">
                <span>{d.label} <span className="mx-1">x</span> {cantidad}</span>
                <span>${subtotal.toLocaleString('es-CL')}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mb-3 print-border-top-dashed pt-2">
        <div className="flex justify-between font-bold text-base">
          <span>TOTAL GENERAL:</span>
          <span>${total?.toLocaleString('es-CL') || 0}</span>
        </div>
      </div>

      {cambios && (
        <div className="mb-3 print-border-top-dashed pt-2 text-sm">
          <h3 className="font-bold mb-1 uppercase">Observaciones:</h3>
          <p className="whitespace-pre-wrap">{cambios}</p>
        </div>
      )}

      <div className="text-center mt-8 mb-2">
        <div className="border-t border-black w-[80%] mx-auto mb-1"></div>
        <p className="text-xs font-bold uppercase tracking-wider">Firma Cajero</p>
      </div>
      
      <div className="text-center text-xs mt-4 mb-0">
        <p>*** COMPROBANTE INTERNO ***</p>
      </div>
    </div>
  );
};

export default PrintReceipt;
