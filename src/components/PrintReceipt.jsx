
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
    <div className="hidden print:block print-thermal-receipt">
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
