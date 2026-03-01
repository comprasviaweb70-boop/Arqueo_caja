
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';
import { Truck, PlusCircle, Trash2, Edit, Save } from 'lucide-react';
import { getProveedores, saveProveedores, savePago, getPagos, deletePago } from '@/lib/storage';

const RegistrarPagos = () => {
  const { toast } = useToast();
  const [pagos, setPagos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [nuevoProveedor, setNuevoProveedor] = useState('');
  const [filtroProveedor, setFiltroProveedor] = useState('');
  const [formData, setFormData] = useState({ fecha: new Date().toISOString().split('T')[0], cajero: '', proveedor: '', monto: '', metodoPago: 'caja' });

  useEffect(() => { setProveedores(getProveedores()); setPagos(getPagos()); }, []);

  const handleInputChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleGuardarPago = () => {
    if (!formData.cajero || !formData.proveedor || !formData.monto) {
      toast({ title: "Incompleto", description: "Completa todos los campos.", variant: "destructive" }); return;
    }
    savePago({ ...formData, id: Date.now() }); setPagos(getPagos());
    toast({ title: "✅ Pago Registrado", description: `$${formData.monto} a ${formData.proveedor}.`, className: 'bg-amber-500 text-slate-900 font-bold border-none' });
    setFormData(p => ({ ...p, proveedor: '', monto: '', metodoPago: 'caja' }));
  };

  const handleAddProveedor = () => {
    if (!nuevoProveedor.trim()) return;
    const up = nuevoProveedor.trim().toUpperCase();
    if (proveedores.includes(up)) { toast({ title: "Duplicado", variant: "destructive" }); return; }
    const updated = [...proveedores, up]; saveProveedores(updated); setProveedores(updated); setNuevoProveedor('');
    toast({ title: "Añadido", description: `"${up}" agregado.`, className: 'bg-slate-800 text-amber-500 border border-amber-500/30' });
  };

  const handleDeleteProveedor = (p) => {
    const updated = proveedores.filter(item => item !== p); saveProveedores(updated); setProveedores(updated);
  };
  const handleDeletePago = (id) => setPagos(deletePago(id));

  const proveedoresFiltrados = useMemo(() => !filtroProveedor ? proveedores : proveedores.filter(p => p.toLowerCase().startsWith(filtroProveedor.toLowerCase())), [filtroProveedor, proveedores]);
  
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card className="glass border-none">
            <CardHeader className="bg-slate-900/60 border-b border-amber-500/30 rounded-t-xl">
              <CardTitle className="flex items-center gap-3 text-xl text-white tracking-wide">
                <div className="p-2 bg-amber-500/10 rounded-lg"><PlusCircle className="w-5 h-5 text-amber-500" /></div>
                Nuevo Pago
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div>
                <Label className="text-slate-300 mb-1.5 block">Fecha</Label>
                <Input type="date" value={formData.fecha} onChange={(e) => handleInputChange('fecha', e.target.value)} className="glass-input" />
              </div>
              <div>
                <Label className="text-slate-300 mb-1.5 block">Caja / Cajero</Label>
                <Select value={formData.cajero} onValueChange={(v) => handleInputChange('cajero', v)}>
                  <SelectTrigger className="glass-input"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent className="glass bg-slate-900 text-white border-amber-500/30">
                    {['1', '2', '3', 'Reserva', 'Jacqueline', 'Gabriel', 'Alejandra', 'Julian', 'Irma'].map(c => <SelectItem key={c} value={c} className="focus:bg-amber-500/20 focus:text-amber-400">{c === '1'||c==='2'||c==='3'?`Caja ${c}`:c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-300 mb-1.5 block">Proveedor</Label>
                <Select value={formData.proveedor} onValueChange={(v) => handleInputChange('proveedor', v)}>
                  <SelectTrigger className="glass-input"><SelectValue placeholder="Seleccionar proveedor" /></SelectTrigger>
                  <SelectContent className="glass bg-slate-900 text-white border-amber-500/30">
                    {proveedores.map(p => <SelectItem key={p} value={p} className="focus:bg-amber-500/20 focus:text-amber-400">{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-300 mb-1.5 block">Monto ($)</Label>
                <Input type="number" placeholder="0" value={formData.monto} onChange={(e) => handleInputChange('monto', e.target.value)} className="glass-input font-bold text-amber-400" />
              </div>
              <div>
                <Label className="text-slate-300 mb-1.5 block">Método de Pago</Label>
                <Select value={formData.metodoPago} onValueChange={(v) => handleInputChange('metodoPago', v)}>
                  <SelectTrigger className="glass-input"><SelectValue /></SelectTrigger>
                  <SelectContent className="glass bg-slate-900 text-white border-amber-500/30">
                    <SelectItem value="caja" className="focus:bg-amber-500/20 focus:text-amber-400">Caja (Efectivo)</SelectItem>
                    <SelectItem value="cta-cte" className="focus:bg-amber-500/20 focus:text-amber-400">Cuenta Corriente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleGuardarPago} className="w-full gold-btn h-12 mt-2">
                <Save className="w-5 h-5 mr-2" /> GUARDAR PAGO
              </Button>
            </CardContent>
          </Card>
          
          <Card className="glass border-none">
            <CardHeader className="bg-slate-900/60 border-b border-amber-500/30 rounded-t-xl py-4">
                <CardTitle className="flex items-center gap-2 text-lg text-slate-200"><Edit className="w-4 h-4 text-amber-500" />Proveedores</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
                <div className="flex gap-2">
                    <Input placeholder="Filtrar o añadir..." value={nuevoProveedor} onChange={(e) => { setNuevoProveedor(e.target.value); setFiltroProveedor(e.target.value); }} className="glass-input h-10" />
                    <Button onClick={handleAddProveedor} size="icon" className="gold-btn w-10 h-10 shrink-0"><PlusCircle className="w-5 h-5"/></Button>
                </div>
                <div className="max-h-40 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
                    {proveedoresFiltrados.map(p => (
                        <div key={p} className="flex justify-between items-center bg-slate-800/50 border border-slate-700/50 p-2.5 rounded-lg">
                            <span className="text-sm font-semibold text-slate-200">{p}</span>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="w-8 h-8 text-red-400 hover:bg-red-500/20 hover:text-red-300"><Trash2 className="w-4 h-4"/></Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="glass border-amber-500/30">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="text-white">¿Eliminar proveedor?</AlertDialogTitle>
                                        <AlertDialogDescription className="text-slate-400">Eliminará "{p}" permanentemente.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel className="bg-slate-800 text-white border-none hover:bg-slate-700">Cancelar</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteProveedor(p)} className="bg-red-500 text-white hover:bg-red-600 font-bold border-none">Eliminar</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    ))}
                </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="glass border-none h-full">
            <CardHeader className="bg-slate-900/60 border-b border-amber-500/30 rounded-t-xl">
              <CardTitle className="flex items-center gap-3 text-xl text-white tracking-wide">
                <div className="p-2 bg-amber-500/10 rounded-lg"><Truck className="w-5 h-5 text-amber-500" /></div>
                Historial de Pagos
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[70vh] overflow-y-auto custom-scrollbar p-2">
                <table className="w-full text-left">
                  <thead className="sticky top-0 bg-slate-900/90 backdrop-blur-sm z-10">
                    <tr>
                      <th className="p-4 text-xs font-bold text-amber-500 uppercase tracking-widest border-b border-amber-500/20">Fecha</th>
                      <th className="p-4 text-xs font-bold text-amber-500 uppercase tracking-widest border-b border-amber-500/20">Caja</th>
                      <th className="p-4 text-xs font-bold text-amber-500 uppercase tracking-widest border-b border-amber-500/20">Proveedor</th>
                      <th className="p-4 text-xs font-bold text-amber-500 uppercase tracking-widest border-b border-amber-500/20 text-right">Monto</th>
                      <th className="p-4 text-xs font-bold text-amber-500 uppercase tracking-widest border-b border-amber-500/20">Método</th>
                      <th className="p-4 text-xs font-bold text-amber-500 uppercase tracking-widest border-b border-amber-500/20 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    <AnimatePresence>
                    {pagos.length > 0 ? pagos.map(p => (
                      <motion.tr layout key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hover:bg-slate-800/40">
                        <td className="p-4 text-sm text-slate-300">{p.fecha}</td>
                        <td className="p-4 text-sm text-white font-medium">{p.cajero}</td>
                        <td className="p-4 text-sm text-white font-semibold">{p.proveedor}</td>
                        <td className="p-4 text-right text-sm font-black text-amber-400">${parseInt(p.monto, 10).toLocaleString('es-CL')}</td>
                        <td className="p-4 text-sm">
                           <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider border ${p.metodoPago === 'caja' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                              {p.metodoPago === 'caja' ? 'Caja' : 'Cta. Cte.'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                           <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="w-8 h-8 text-red-400 hover:bg-red-500/20 hover:text-red-300"><Trash2 className="w-4 h-4"/></Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="glass border-amber-500/30">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="text-white">¿Eliminar este pago?</AlertDialogTitle>
                                        <AlertDialogDescription className="text-slate-400">Se eliminará el pago de ${parseInt(p.monto).toLocaleString('es-CL')}.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel className="bg-slate-800 text-white border-none">Cancelar</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeletePago(p.id)} className="bg-red-500 hover:bg-red-600 text-white font-bold border-none">Eliminar</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </td>
                      </motion.tr>
                    )) : (
                      <tr><td colSpan="6" className="text-center py-16 text-slate-500 font-medium tracking-wider">NO HAY PAGOS REGISTRADOS</td></tr>
                    )}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default RegistrarPagos;
