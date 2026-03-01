
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';
import { Save, AlertTriangle, TrendingUp, DollarSign, Lock, Unlock, CheckCircle, XCircle } from 'lucide-react';
import { saveRegistro, getUltimaReserva, getPagos, getGastos, getArqueoPorFecha, getArqueoCajaPorFechaYCajero } from '@/lib/storage';

const RegistrarDia = () => {
  const { toast } = useToast();
  // ... state declarations ...
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [lockedFields, setLockedFields] = useState({ pagoFacturasCaja: false, pagoFacturasCtaCte: false, gastos: false, cierreCaja: false });
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0], cajero: '', saldoInicial: '', ventaEfectivo: '', redelcom: '', edenred: '', transferencias: '', credito: '', pagoFacturasCaja: '', pagoFacturasCtaCte: '', gastos: '', rrhh: '', otros: '', cierreCaja: '', ingresoReserva: '', retiroReserva: '', revisionSaldos: ''
  });
  const [arqueoGeneralDelDia, setArqueoGeneralDelDia] = useState(null);
  const [arqueoCajeroDelDia, setArqueoCajeroDelDia] = useState(null);

  const cargarEgresosYAjustes = useCallback(() => {
    if (!formData.fecha) return;
    if (formData.cajero) {
      const pagos = getPagos(); const gastosRegistrados = getGastos();
      const pagosDelDia = pagos.filter(p => p.cajero === formData.cajero && p.fecha === formData.fecha);
      const gastosDelDia = gastosRegistrados.filter(g => g.cajero === formData.cajero && g.fecha === formData.fecha);
      const totalPagosCaja = pagosDelDia.filter(p => p.metodoPago === 'caja').reduce((sum, p) => sum + (parseInt(p.monto, 10) || 0), 0);
      const totalPagosCtaCte = pagosDelDia.filter(p => p.metodoPago === 'cta-cte').reduce((sum, p) => sum + (parseInt(p.monto, 10) || 0), 0);
      const totalGastos = gastosDelDia.reduce((sum, g) => sum + (parseInt(g.monto, 10) || 0), 0);
      setFormData(prev => ({ ...prev, pagoFacturasCaja: totalPagosCaja.toString(), pagoFacturasCtaCte: totalPagosCtaCte.toString(), gastos: totalGastos.toString() }));
      setLockedFields(prev => ({ ...prev, pagoFacturasCaja: totalPagosCaja > 0, pagoFacturasCtaCte: totalPagosCtaCte > 0, gastos: totalGastos > 0 }));
    }
    const arqueoGeneral = getArqueoPorFecha(formData.fecha); setArqueoGeneralDelDia(arqueoGeneral);
    const arqueoCajero = getArqueoCajaPorFechaYCajero(formData.fecha, formData.cajero); setArqueoCajeroDelDia(arqueoCajero);
    if (arqueoCajero) {
        setFormData(prev => ({ ...prev, cierreCaja: arqueoCajero.totalGeneral.toString() }));
        setLockedFields(prev => ({ ...prev, cierreCaja: true }));
    } else { setLockedFields(prev => ({ ...prev, cierreCaja: false })); }
  }, [formData.cajero, formData.fecha]);

  useEffect(() => {
    const ultimaReserva = getUltimaReserva();
    if (ultimaReserva !== null) setFormData(prev => ({ ...prev, saldoInicial: Math.round(ultimaReserva).toString() }));
  }, []);

  useEffect(() => { cargarEgresosYAjustes(); }, [cargarEgresosYAjustes]);

  const handleInputChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
  const toggleLock = (field) => setLockedFields(prev => ({...prev, [field]: !prev[field]}));
  const parseNumber = value => parseInt(value, 10) || 0;
  
  const calcularTotalVentas = () => parseNumber(formData.ventaEfectivo) + parseNumber(formData.redelcom) + parseNumber(formData.edenred) + parseNumber(formData.transferencias) + parseNumber(formData.credito);
  const calcularTotalEgresos = () => parseNumber(formData.pagoFacturasCaja) + parseNumber(formData.pagoFacturasCtaCte) + parseNumber(formData.gastos) + parseNumber(formData.rrhh) + parseNumber(formData.otros);
  const calcularDiferenciaCaja = () => {
    const saldoContable = parseNumber(formData.saldoInicial) + parseNumber(formData.ventaEfectivo) + parseNumber(formData.retiroReserva) - parseNumber(formData.pagoFacturasCaja) - parseNumber(formData.gastos) - parseNumber(formData.rrhh) - parseNumber(formData.ingresoReserva);
    return parseNumber(formData.cierreCaja) - saldoContable;
  };
  const calcularReservaGeneral = () => arqueoGeneralDelDia ? arqueoGeneralDelDia.totalGeneral : getUltimaReserva() + parseNumber(formData.ingresoReserva) - parseNumber(formData.retiroReserva);
  
  const handleGuardar = () => {
    if (!formData.fecha || !formData.cajero) { toast({ title: "Campos requeridos", description: "Por favor completa la fecha y selecciona un cajero", variant: "destructive" }); return; }
    const diferencia = calcularDiferenciaCaja();
    if (Math.abs(diferencia) > 500) { setAlertMessage(`⚠️ ALERTA: Diferencia de caja de $${Math.round(diferencia)}. Supera el límite de $500.`); setShowAlertDialog(true); return; }
    if (diferencia < 0) { setAlertMessage(`⚠️ ALERTA: Diferencia negativa de caja de $${Math.round(diferencia)}.`); setShowAlertDialog(true); return; }
    setShowConfirmDialog(true);
  };
  const confirmarGuardado = () => {
    saveRegistro({ ...formData, totalVentas: calcularTotalVentas(), totalEgresos: calcularTotalEgresos(), diferenciaCaja: calcularDiferenciaCaja(), reservaGeneral: calcularReservaGeneral(), timestamp: new Date().toISOString() });
    toast({ title: "✅ Registro guardado", description: `Día cerrado exitosamente para ${formData.cajero}`, className: 'bg-amber-500 text-slate-900 border-none font-bold' });
    setFormData({ fecha: new Date().toISOString().split('T')[0], cajero: '', saldoInicial: Math.round(calcularReservaGeneral()).toString(), ventaEfectivo: '', redelcom: '', edenred: '', transferencias: '', credito: '', pagoFacturasCaja: '', pagoFacturasCtaCte: '', gastos: '', rrhh: '', otros: '', cierreCaja: '', ingresoReserva: '', retiroReserva: '', revisionSaldos: '' });
    setShowConfirmDialog(false);
  };

  const diferenciaArqueoCajero = arqueoCajeroDelDia ? parseNumber(formData.cierreCaja) - arqueoCajeroDelDia.totalGeneral : null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className="glass border-none">
        <CardHeader className="bg-slate-900/60 border-b border-amber-500/30 pb-6 rounded-t-xl">
          <CardTitle className="flex items-center gap-3 text-2xl font-bold text-white tracking-wide">
            <div className="p-2 bg-amber-500/10 rounded-lg"><DollarSign className="w-6 h-6 text-amber-500" /></div>
            Registro Diario de Operaciones
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="fecha" className="text-slate-300 font-medium mb-1.5 block">Fecha</Label>
              <Input id="fecha" type="date" value={formData.fecha} onChange={e => handleInputChange('fecha', e.target.value)} className="glass-input h-11" />
            </div>
            <div>
              <Label htmlFor="cajero" className="text-slate-300 font-medium mb-1.5 block">Cajero / Caja</Label>
              <Select value={formData.cajero} onValueChange={value => handleInputChange('cajero', value)}>
                <SelectTrigger className="glass-input h-11"><SelectValue placeholder="Seleccionar cajero" /></SelectTrigger>
                <SelectContent className="glass bg-slate-900 border-amber-500/30 text-white">
                  {['1', '2', '3', 'Reserva', 'Jacqueline', 'Gabriel', 'Alejandra', 'Julian', 'Irma'].map(c => <SelectItem key={c} value={c} className="hover:bg-slate-800 hover:text-amber-400 focus:bg-slate-800 focus:text-amber-400">{c === '1'||c==='2'||c==='3'?`Caja ${c}`:c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="saldoInicial" className="text-slate-300 font-medium mb-1.5 block">Saldo Inicial ($)</Label>
              <Input id="saldoInicial" type="number" value={formData.saldoInicial} onChange={e => handleInputChange('saldoInicial', e.target.value)} className="glass-input h-11 font-bold text-amber-400" />
            </div>
          </div>

          <div className="border-t border-amber-500/20 pt-6">
            <h3 className="text-lg font-bold mb-4 text-amber-500 flex items-center gap-2 uppercase tracking-wider">
              <TrendingUp className="w-5 h-5" /> Ventas por Medio de Pago
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                {id: 'ventaEfectivo', label: 'Efectivo'}, {id: 'redelcom', label: 'Mercado Pago'}, 
                {id: 'edenred', label: 'Edenred'}, {id: 'transferencias', label: 'Transferencias'}, 
                {id: 'credito', label: 'Crédito'}
              ].map(f => (
                <div key={f.id}>
                  <Label htmlFor={f.id} className="text-slate-300 font-medium mb-1.5 block">{f.label} ($)</Label>
                  <Input id={f.id} type="number" value={formData[f.id]} onChange={e => handleInputChange(f.id, e.target.value)} className="glass-input h-11" />
                </div>
              ))}
              <div className="flex items-end">
                <div className="w-full p-4 bg-slate-900/60 rounded-xl border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Ventas</p>
                  <p className="text-3xl font-black text-amber-400">${Math.round(calcularTotalVentas()).toLocaleString('es-CL')}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-amber-500/20 pt-6">
            <h3 className="text-lg font-bold mb-4 text-amber-500 uppercase tracking-wider">Egresos</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                {id: 'pagoFacturasCaja', label: 'Pago Facturas (Caja)'}, {id: 'pagoFacturasCtaCte', label: 'Pago Facturas (Cta. Cte.)'}, 
                {id: 'gastos', label: 'Gastos'}
              ].map(f => (
                <div className="relative" key={f.id}>
                  <Label htmlFor={f.id} className="text-slate-300 font-medium mb-1.5 block">{f.label} ($)</Label>
                  <Input id={f.id} type="number" value={formData[f.id]} onChange={e => handleInputChange(f.id, e.target.value)} className="glass-input h-11 pr-10" disabled={lockedFields[f.id]} />
                  <Button size="icon" variant="ghost" className="absolute top-8 right-1 text-slate-400 hover:text-amber-500 hover:bg-transparent" onClick={() => toggleLock(f.id)}>
                      {lockedFields[f.id] ? <Lock className="w-4 h-4"/> : <Unlock className="w-4 h-4"/>}
                  </Button>
                </div>
              ))}
              {[{id: 'rrhh', label: 'RRHH'}, {id: 'otros', label: 'Otros'}].map(f => (
                <div key={f.id}>
                  <Label htmlFor={f.id} className="text-slate-300 font-medium mb-1.5 block">{f.label} ($)</Label>
                  <Input id={f.id} type="number" value={formData[f.id]} onChange={e => handleInputChange(f.id, e.target.value)} className="glass-input h-11" />
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-amber-500/20 pt-6">
            <h3 className="text-lg font-bold mb-4 text-amber-500 uppercase tracking-wider">Cierre y Reserva</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="relative">
                <Label htmlFor="cierreCaja" className="text-slate-300 font-medium mb-1.5 block">Arqueo de Caja ($)</Label>
                <Input id="cierreCaja" type="number" value={formData.cierreCaja} onChange={e => handleInputChange('cierreCaja', e.target.value)} className="glass-input h-11 font-bold pr-10" disabled={lockedFields.cierreCaja} />
                {arqueoCajeroDelDia && (
                    <Button size="icon" variant="ghost" className="absolute top-8 right-1 text-amber-500 hover:bg-transparent" onClick={() => toggleLock('cierreCaja')}>
                        {lockedFields.cierreCaja ? <Lock className="w-4 h-4"/> : <Unlock className="w-4 h-4"/>}
                    </Button>
                )}
              </div>
              <div>
                <Label htmlFor="ingresoReserva" className="text-slate-300 font-medium mb-1.5 block">Ingreso Reserva ($)</Label>
                <Input id="ingresoReserva" type="number" value={formData.ingresoReserva} onChange={e => handleInputChange('ingresoReserva', e.target.value)} className="glass-input h-11" disabled={!!arqueoGeneralDelDia} />
              </div>
              <div>
                <Label htmlFor="retiroReserva" className="text-slate-300 font-medium mb-1.5 block">Retiro Reserva ($)</Label>
                <Input id="retiroReserva" type="number" value={formData.retiroReserva} onChange={e => handleInputChange('retiroReserva', e.target.value)} className="glass-input h-11" disabled={!!arqueoGeneralDelDia} />
              </div>
            </div>
             {arqueoCajeroDelDia && <p className="text-xs text-amber-500/70 mt-2 font-medium">Arqueo cargado automáticamente.</p>}
          </div>

          <div>
            <Label htmlFor="revisionSaldos" className="text-slate-300 font-medium mb-1.5 block">Revisión de Saldos / Notas</Label>
            <Textarea id="revisionSaldos" value={formData.revisionSaldos} onChange={e => handleInputChange('revisionSaldos', e.target.value)} placeholder="Observaciones..." className="glass-input min-h-[80px]" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 bg-slate-900/60 rounded-xl border border-amber-500/20">
            <div className={`p-4 rounded-xl border ${Math.abs(calcularDiferenciaCaja()) > 1000 || calcularDiferenciaCaja() < 0 ? 'bg-red-950/30 border-red-500/50' : 'bg-slate-800/50 border-amber-500/30'}`}>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Diferencia Caja</p>
              <p className={`text-2xl font-black mt-1 ${Math.abs(calcularDiferenciaCaja()) > 1000 || calcularDiferenciaCaja() < 0 ? 'text-red-400' : 'text-white'}`}>
                ${Math.round(calcularDiferenciaCaja()).toLocaleString('es-CL')}
              </p>
            </div>
             <div className="p-4 rounded-xl border border-amber-500/50 bg-amber-500/5 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
              <p className="text-xs font-bold uppercase tracking-widest text-amber-500/80">Reserva Calculada</p>
              <p className="text-2xl font-black mt-1 text-amber-500">
                ${Math.round(calcularReservaGeneral()).toLocaleString('es-CL')}
              </p>
            </div>
            {diferenciaArqueoCajero !== null && (
                <div className={`p-4 rounded-xl border ${Math.abs(diferenciaArqueoCajero) > 1000 ? 'bg-red-950/30 border-red-500/50' : 'bg-green-950/30 border-green-500/50'}`}>
                   <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Estado Físico</p>
                   {Math.abs(diferenciaArqueoCajero) > 1000 ?
                     <div className="flex items-center gap-2 text-lg font-bold text-red-400"><XCircle className="w-5 h-5"/> Descuadre</div> :
                     <div className="flex items-center gap-2 text-lg font-bold text-green-400"><CheckCircle className="w-5 h-5"/> Balanceado</div>
                   }
                </div>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleGuardar} className="gold-btn h-12 px-8 text-lg rounded-xl">
              <Save className="w-5 h-5 mr-2" /> GUARDAR REGISTRO
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="glass border-amber-500/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Confirmar Cierre</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300">
              ¿Guardar y cerrar el día para <span className="font-bold text-amber-500">{formData.cajero}</span>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmarGuardado} className="gold-btn">Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showAlertDialog} onOpenChange={setShowAlertDialog}>
        <AlertDialogContent className="glass border-red-500/50">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-6 h-6" /> Alerta de Diferencia
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300 text-base">{alertMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700">Revisar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { setShowAlertDialog(false); setShowConfirmDialog(true); }} className="bg-red-500 hover:bg-red-600 text-white font-bold">
              Continuar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};
export default RegistrarDia;
