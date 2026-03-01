const REGISTRO_DIA_KEY = 'registro_caja_minimarket';
const RESERVA_KEY = 'reserva_general';
const PROVEEDORES_KEY = 'lista_proveedores';
const PAGOS_KEY = 'registro_pagos';
const GASTOS_ITEMS_KEY = 'lista_gastos_items';
const REGISTRO_GASTOS_KEY = 'registro_gastos';
const ARQUEO_EFECTIVO_KEY = 'registro_arqueo_efectivo'; // Para la reserva general
const ARQUEO_CAJA_KEY = 'registro_arqueo_caja'; // Para arqueos por cajero

// --- Registros Diarios ---
export const saveRegistro = (registro) => {
  const registros = getRegistros();
  registros.push(registro);
  localStorage.setItem(REGISTRO_DIA_KEY, JSON.stringify(registros));
  
  // Actualiza la reserva general solo si no hay un arqueo para ese día, 
  // ya que el arqueo tiene la última palabra.
  const arqueoDelDia = getArqueoPorFecha(registro.fecha);
  if (!arqueoDelDia) {
      localStorage.setItem(RESERVA_KEY, Math.round(registro.reservaGeneral).toString());
  }
};

export const getRegistros = () => {
  const data = localStorage.getItem(REGISTRO_DIA_KEY);
  return data ? JSON.parse(data) : [];
};

export const getUltimaReserva = () => {
  const reserva = localStorage.getItem(RESERVA_KEY);
  return reserva ? parseInt(reserva, 10) : 0;
};

export const clearRegistros = () => {
  localStorage.removeItem(REGISTRO_DIA_KEY);
  localStorage.removeItem(RESERVA_KEY);
  localStorage.removeItem(PAGOS_KEY);
  localStorage.removeItem(REGISTRO_GASTOS_KEY);
  localStorage.removeItem(ARQUEO_EFECTIVO_KEY);
  localStorage.removeItem(ARQUEO_CAJA_KEY);
};

// --- Proveedores ---
const initialProveedores = [
  "CIGARROS", "PAN LA ABUELA", "MERCADITO", "EMPANADA VIKYS", "EMPANADA LA OMA", "VARIOS", "HIPERKOR", 
  "MAYORISTA", "NORKOSHE", "PACEL", "SOBO", "SOPROLE", "ARCOR", "EVERCRISP", "ICB", "SCHWENCKE", 
  "CCU", "COCA COLA", "BREDENMASTER", "MINUTI VERDE", "DIMAK", "COLUN", "IDEAL", "MEDICAMENTOS", 
  "LLANQUIHUE", "AGROSUPER", "SAVORY", "HUEVOS", "RUNCA", "CUELLO NEGRO / BUNDOR", "HIELO", 
  "ESTRELLITA", "PF"
];

export const getProveedores = () => {
  const data = localStorage.getItem(PROVEEDORES_KEY);
  if (data) {
    return JSON.parse(data);
  } else {
    localStorage.setItem(PROVEEDORES_KEY, JSON.stringify(initialProveedores.sort()));
    return initialProveedores.sort();
  }
};

export const saveProveedores = (proveedores) => {
  localStorage.setItem(PROVEEDORES_KEY, JSON.stringify(proveedores.sort()));
};

// --- Pagos a Proveedores ---
export const savePago = (pago) => {
  const pagos = getPagos();
  pagos.push(pago);
  localStorage.setItem(PAGOS_KEY, JSON.stringify(pagos));
};

export const getPagos = () => {
  const data = localStorage.getItem(PAGOS_KEY);
  return data ? JSON.parse(data).sort((a, b) => new Date(b.fecha) - new Date(a.fecha) || b.id - a.id) : [];
};

export const deletePago = (pagoId) => {
  let pagos = getPagos();
  pagos = pagos.filter(p => p.id !== pagoId);
  localStorage.setItem(PAGOS_KEY, JSON.stringify(pagos));
  return pagos;
};

// --- Items de Gastos ---
const initialGastosItems = ["PART TIME", "SUELDOS", "HIPERLIMPIO"];

export const getGastosItems = () => {
  const data = localStorage.getItem(GASTOS_ITEMS_KEY);
  if (data) {
    return JSON.parse(data);
  } else {
    localStorage.setItem(GASTOS_ITEMS_KEY, JSON.stringify(initialGastosItems.sort()));
    return initialGastosItems.sort();
  }
};

export const saveGastosItems = (items) => {
  localStorage.setItem(GASTOS_ITEMS_KEY, JSON.stringify(items.sort()));
};

// --- Registro de Gastos ---
export const saveGasto = (gasto) => {
  const gastos = getGastos();
  gastos.push(gasto);
  localStorage.setItem(REGISTRO_GASTOS_KEY, JSON.stringify(gastos));
};

export const getGastos = () => {
  const data = localStorage.getItem(REGISTRO_GASTOS_KEY);
  return data ? JSON.parse(data).sort((a, b) => new Date(b.fecha) - new Date(a.fecha) || b.id - a.id) : [];
};

export const deleteGasto = (gastoId) => {
  let gastos = getGastos();
  gastos = gastos.filter(g => g.id !== gastoId);
  localStorage.setItem(REGISTRO_GASTOS_KEY, JSON.stringify(gastos));
  return gastos;
};

// --- Arqueo de Efectivo (Reserva General) ---
export const saveArqueo = (arqueo) => {
  const arqueos = getArqueos();
  const existingIndex = arqueos.findIndex(a => a.fecha === arqueo.fecha);
  if (existingIndex > -1) {
    arqueos[existingIndex] = arqueo;
  } else {
    arqueos.push(arqueo);
  }
  localStorage.setItem(ARQUEO_EFECTIVO_KEY, JSON.stringify(arqueos));
  localStorage.setItem(RESERVA_KEY, Math.round(arqueo.totalGeneral).toString());
};

export const getArqueos = () => {
  const data = localStorage.getItem(ARQUEO_EFECTIVO_KEY);
  return data ? JSON.parse(data).sort((a, b) => new Date(b.fecha) - new Date(a.fecha)) : [];
};

export const getArqueoPorFecha = (fecha) => {
    const arqueos = getArqueos();
    return arqueos.find(a => a.fecha === fecha);
};

export const deleteArqueo = (fecha) => {
    let arqueos = getArqueos();
    arqueos = arqueos.filter(a => a.fecha !== fecha);
    localStorage.setItem(ARQUEO_EFECTIVO_KEY, JSON.stringify(arqueos));
    return arqueos;
};

// --- Arqueo de Caja (Por Cajero) ---
export const saveArqueoCaja = (arqueo) => {
  const arqueos = getArqueosCaja();
  const existingIndex = arqueos.findIndex(a => a.fecha === arqueo.fecha && a.cajero === arqueo.cajero);
  if (existingIndex > -1) {
    arqueos[existingIndex] = arqueo;
  } else {
    arqueos.push(arqueo);
  }
  localStorage.setItem(ARQUEO_CAJA_KEY, JSON.stringify(arqueos));
};

export const getArqueosCaja = () => {
  const data = localStorage.getItem(ARQUEO_CAJA_KEY);
  return data ? JSON.parse(data).sort((a, b) => new Date(b.fecha) - new Date(a.fecha)) : [];
};

export const getArqueoCajaPorFechaYCajero = (fecha, cajero) => {
    const arqueos = getArqueosCaja();
    return arqueos.find(a => a.fecha === fecha && a.cajero === cajero);
};

export const deleteArqueoCaja = (fecha, cajero) => {
    let arqueos = getArqueosCaja();
    arqueos = arqueos.filter(a => !(a.fecha === fecha && a.cajero === cajero));
    localStorage.setItem(ARQUEO_CAJA_KEY, JSON.stringify(arqueos));
    return arqueos;
};