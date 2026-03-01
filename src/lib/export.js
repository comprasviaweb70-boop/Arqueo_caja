function convertirAFormatoCSV(data) {
    const cabeceras = [
        "fecha", "cajero", "saldoInicial", "ventaEfectivo", "redelcom", "edenred", 
        "transferencias", "credito", "pagoFacturasCaja", "pagoFacturasCtaCte", "gastos", "rrhh", 
        "otros", "cierreCaja", "ingresoReserva", "retiroReserva", "revisionSaldos",
        "totalVentas", "totalEgresos", "diferenciaCaja", "reservaGeneral"
    ];

    const filas = data.map(registro => 
        cabeceras.map(c => {
            let valor = registro[c] || 0;
            // Asegurarse que el valor sea un string y reemplazar puntos por comas para decimales si es necesario
            let valorStr = String(valor).replace(/\./g, ',');
            // Envolver en comillas dobles si contiene el separador (;) o comillas
            if (valorStr.includes(';') || valorStr.includes('"') || valorStr.includes('\n')) {
                valorStr = `"${valorStr.replace(/"/g, '""')}"`;
            }
            return valorStr;
        }).join(';')
    );

    return [cabeceras.join(';'), ...filas].join('\n');
}


export const exportarACSV = (registros) => {
    const contenidoCSV = convertirAFormatoCSV(registros);
    const blob = new Blob([`\uFEFF${contenidoCSV}`], { type: 'text/csv;charset=utf-8;' });
    const enlace = document.createElement("a");
    const url = URL.createObjectURL(blob);
    enlace.setAttribute("href", url);
    enlace.setAttribute("download", `export_registros_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
};


export const exportarResumenMensual = (registrosMes, mes) => {
    const [año, mesStr] = mes.split('-');
    
    // Sumatorias
    const totales = registrosMes.reduce((acc, r) => {
        acc.totalVentas += parseInt(r.totalVentas, 10) || 0;
        acc.totalEgresos += parseInt(r.totalEgresos, 10) || 0;
        acc.ventaEfectivo += parseInt(r.ventaEfectivo, 10) || 0;
        acc.redelcom += parseInt(r.redelcom, 10) || 0;
        acc.edenred += parseInt(r.edenred, 10) || 0;
        acc.transferencias += parseInt(r.transferencias, 10) || 0;
        acc.credito += parseInt(r.credito, 10) || 0;
        acc.pagoFacturasCaja += parseInt(r.pagoFacturasCaja, 10) || 0;
        acc.pagoFacturasCtaCte += parseInt(r.pagoFacturasCtaCte, 10) || 0;
        acc.gastos += parseInt(r.gastos, 10) || 0;
        acc.rrhh += parseInt(r.rrhh, 10) || 0;
        acc.otros += parseInt(r.otros, 10) || 0;
        acc.diferenciaCaja += parseInt(r.diferenciaCaja, 10) || 0;
        return acc;
    }, { 
        totalVentas: 0, totalEgresos: 0, ventaEfectivo: 0, redelcom: 0, edenred: 0, 
        transferencias: 0, credito: 0, pagoFacturasCaja: 0, pagoFacturasCtaCte: 0, gastos: 0, 
        rrhh: 0, otros: 0, diferenciaCaja: 0
    });

    const contenido = `
Resumen Mensual de Caja - ${mesStr}/${año}
=================================================

RESUMEN GENERAL
---------------------------------
Total Ventas del Mes: $${totales.totalVentas.toFixed(0)}
Total Egresos del Mes: $${totales.totalEgresos.toFixed(0)}
Suma de Diferencias de Caja: $${totales.diferenciaCaja.toFixed(0)}

DESGLOSE DE VENTAS
---------------------------------
Venta en Efectivo: $${totales.ventaEfectivo.toFixed(0)}
Mercado Pago: $${totales.redelcom.toFixed(0)}
Edenred: $${totales.edenred.toFixed(0)}
Transferencias: $${totales.transferencias.toFixed(0)}
Crédito: $${totales.credito.toFixed(0)}

DESGLOSE DE EGRESOS
---------------------------------
Pago Facturas (Caja): $${totales.pagoFacturasCaja.toFixed(0)}
Pago Facturas (Cta. Cte.): $${totales.pagoFacturasCtaCte.toFixed(0)}
Gastos: $${totales.gastos.toFixed(0)}
RRHH: $${totales.rrhh.toFixed(0)}
Otros: $${totales.otros.toFixed(0)}

=================================================
Reporte generado el ${new Date().toLocaleString()}
`;

    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
    const enlace = document.createElement("a");
    const url = URL.createObjectURL(blob);
    enlace.setAttribute("href", url);
    enlace.setAttribute("download", `resumen_mensual_${mes}.txt`);
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
};

export const exportarArqueoACSV = (arqueos, type = 'general') => {
    const isCajaArqueo = type === 'caja';
    const cabeceras = [
        "fecha",
        ...(isCajaArqueo ? ["cajero"] : []),
        "reservaMontoMayor", "reserva_10000", "reserva_5000", "reserva_2000", "reserva_1000",
        "reserva_500", "reserva_100", "reserva_50", "reserva_10", "totalReserva",
        "cajaChica_10000", "cajaChica_5000", "cajaChica_2000", "cajaChica_1000",
        "cajaChica_500", "cajaChica_100", "cajaChica_50", "cajaChica_10", "totalCajaChica",
        "totalGeneral"
    ];

    const filas = arqueos.map(arqueo => {
        const fila = {
            fecha: arqueo.fecha,
            ...(isCajaArqueo && { cajero: arqueo.cajero }),
            reservaMontoMayor: arqueo.reservaMontoMayor,
            ...arqueo.reserva,
            totalReserva: arqueo.totalReserva,
            ...arqueo.cajaChica,
            totalCajaChica: arqueo.totalCajaChica,
            totalGeneral: arqueo.totalGeneral
        };

        const valoresFila = cabeceras.map(c => {
             // Construye las claves para buscar en el objeto `arqueo`
            const keyReserva = `reserva_${c.split('_')[1]}`;
            const keyCajaChica = `cajaChica_${c.split('_')[1]}`;
            
            let valor;
            if (c.startsWith('reserva_')) valor = arqueo.reserva[keyReserva];
            else if (c.startsWith('cajaChica_')) valor = arqueo.cajaChica[keyCajaChica];
            else valor = fila[c];

            valor = valor !== undefined ? valor : 0;
            let valorStr = String(valor).replace(/\./g, ',');
            if (valorStr.includes(';') || valorStr.includes('"') || valorStr.includes('\n')) {
                valorStr = `"${valorStr.replace(/"/g, '""')}"`;
            }
            return valorStr;
        });
        return valoresFila.join(';');
    });

    const contenidoCSV = [cabeceras.join(';'), ...filas].join('\n');
    const blob = new Blob([`\uFEFF${contenidoCSV}`], { type: 'text/csv;charset=utf-8;' });
    const enlace = document.createElement("a");
    const url = URL.createObjectURL(blob);
    enlace.setAttribute("download", `export_arqueos_${type}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
};