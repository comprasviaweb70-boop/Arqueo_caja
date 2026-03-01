
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Save, Trash2, Banknote, Download, PieChart } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Tooltip } from 'recharts';
import { saveArqueo, getArqueos, getArqueoPorFecha, deleteArqueo } from '@/lib/storage';
import { exportarArqueoACSV } from '@/lib/export';

const denominaciones = [10000, 5000, 2000, 1000, 500, 100, 50, 10];
const COLORS = ['#F59E0B', '#3b82f6']; // Gold and Blue

const DenominacionInput = ({ tipo, den, value, onChange }) => (
    <div className="flex items-center justify-between group hover:bg-slate-800/40 p-1 -mx-1 rounded transition-colors">
        <Label htmlFor={`${tipo}_${den}`} className="text-slate-300 font-semibold group-hover:text-amber-400 transition-colors">${den.toLocaleString('es-CL')}</Label>
        <Input
            id={`${tipo}_${den}`}
            type="number"
            className="w-24 text-right glass-input h-9"
            value={value}
            onChange={(e) => onChange(tipo, den, e.target.value)}
            placeholder="0"
        />
    </div>
);

const RegistroEfectivo = () => {
    const { toast } = useToast();
    const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
    const [reservaMontoMayor, setReservaMontoMayor] = useState('');
    const [reserva, setReserva] = useState(denominaciones.reduce((acc, den) => ({ ...acc, [`reserva_${den}`]: '' }), {}));
    const [cajaChica, setCajaChica] = useState(denominaciones.reduce((acc, den) => ({ ...acc, [`cajaChica_${den}`]: '' }), {}));
    const [arqueos, setArqueos] = useState([]);

    const loadArqueoForDate = useCallback((date) => {
        const arqueoExistente = getArqueoPorFecha(date);
        if (arqueoExistente) {
            setReservaMontoMayor(arqueoExistente.reservaMontoMayor); setReserva(arqueoExistente.reserva); setCajaChica(arqueoExistente.cajaChica);
        } else {
            setReservaMontoMayor(''); setReserva(denominaciones.reduce((acc, den) => ({ ...acc, [`reserva_${den}`]: '' }), {})); setCajaChica(denominaciones.reduce((acc, den) => ({ ...acc, [`cajaChica_${den}`]: '' }), {}));
        }
    }, []);

    useEffect(() => { setArqueos(getArqueos()); loadArqueoForDate(fecha); }, [fecha, loadArqueoForDate]);

    const handleDenominacionChange = (tipo, den, value) => {
        const setter = tipo === 'reserva' ? setReserva : setCajaChica;
        setter(prev => ({ ...prev, [`${tipo}_${den}`]: value }));
    };

    const calcularTotal = (state) => denominaciones.reduce((t, den) => t + (parseInt(state[`${Object.keys(state)[0].split('_')[0]}_${den}`], 10) || 0) * den, 0);

    const totalReserva = useMemo(() => calcularTotal(reserva) + (parseInt(reservaMontoMayor, 10) || 0), [reserva, reservaMontoMayor]);
    const totalCajaChica = useMemo(() => calcularTotal(cajaChica), [cajaChica]);
    const totalGeneral = totalReserva + totalCajaChica;
    
    const chartData = useMemo(() => [{ name: 'Reserva', value: totalReserva }, { name: 'Caja Chica', value: totalCajaChica }].filter(i => i.value > 0), [totalReserva, totalCajaChica]);

    const handleSaveArqueo = () => {
        saveArqueo({ fecha, reservaMontoMayor, reserva, cajaChica, totalReserva, totalCajaChica, totalGeneral });
        setArqueos(getArqueos());
        toast({ title: "✅ Arqueo Guardado", description: `Arqueo del día ${fecha} guardado.`, className: 'bg-amber-500 text-slate-900 font-bold border-none' });
    };

    const handleDeleteArqueo = (f) => {
        setArqueos(deleteArqueo(f)); if(fecha === f) loadArqueoForDate(fecha);
        toast({ title: "🗑️ Eliminado", description: `Arqueo del ${f} eliminado.`, variant: "destructive" });
    };

    const handleExport = () => {
        if(arqueos.length === 0) { toast({ title: "Vacío", variant: "destructive" }); return; }
        exportarArqueoACSV(arqueos, 'general');
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <Card className="glass border-none">
                        <CardHeader className="bg-slate-900/60 border-b border-amber-500/30 rounded-t-xl">
                            <CardTitle className="flex items-center gap-3 text-xl text-white tracking-wide">
                                <div className="p-2 bg-amber-500/10 rounded-lg"><Banknote className="w-5 h-5 text-amber-500" /></div>
                                Arqueo General
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-5">
                            <div>
                                <Label className="text-slate-300 mb-1.5 block">Fecha</Label>
                                <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="glass-input h-11" />
                            </div>

                            <div className="space-y-3 p-4 bg-slate-900/40 border border-amber-500/20 rounded-xl">
                                <h4 className="font-bold text-amber-500 uppercase tracking-widest text-sm border-b border-amber-500/20 pb-2 mb-3">Reserva</h4>
                                <div className="flex items-center justify-between mb-2">
                                    <Label className="text-slate-300 font-semibold">Monto Mayor</Label>
                                    <Input type="number" placeholder="0" value={reservaMontoMayor} onChange={e => setReservaMontoMayor(e.target.value)} className="w-24 text-right glass-input h-9" />
                                </div>
                                {denominaciones.map(den => <DenominacionInput key={`res_g_${den}`} tipo="reserva" den={den} value={reserva[`reserva_${den}`]} onChange={handleDenominacionChange} />)}
                            </div>

                            <div className="space-y-3 p-4 bg-slate-900/40 border border-amber-500/20 rounded-xl">
                                <h4 className="font-bold text-blue-400 uppercase tracking-widest text-sm border-b border-blue-500/20 pb-2 mb-3">Caja Chica</h4>
                                {denominaciones.map(den => <DenominacionInput key={`caj_g_${den}`} tipo="cajaChica" den={den} value={cajaChica[`cajaChica_${den}`]} onChange={handleDenominacionChange} />)}
                            </div>
                            
                            <Button onClick={handleSaveArqueo} className="w-full gold-btn h-12">
                                <Save className="w-5 h-5 mr-2" /> GUARDAR ARQUEO
                            </Button>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2 space-y-6">
                     <Card className="glass border-none">
                        <CardHeader className="bg-slate-900/60 border-b border-amber-500/30 rounded-t-xl">
                            <CardTitle className="flex items-center gap-2 text-white"><PieChart className="w-5 h-5 text-amber-500" /> Distribución</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
                            <div className="w-full md:w-1/2 h-48">
                                {totalGeneral > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RechartsPieChart>
                                            <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                                                {chartData.map((e, i) => <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />)}
                                            </Pie>
                                            <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#f59e0b', color: '#fff'}} itemStyle={{color: '#f59e0b'}} formatter={(v) => `$${v.toLocaleString('es-CL')}`} />
                                        </RechartsPieChart>
                                    </ResponsiveContainer>
                                ) : <div className="flex items-center justify-center h-full text-slate-500 text-sm font-medium tracking-widest">SIN DATOS</div>}
                            </div>
                            <div className="w-full md:w-1/2 space-y-4">
                               <div className="p-3 bg-slate-900/50 rounded-lg border-l-4 border-amber-500 flex justify-between items-center">
                                   <span className="text-slate-300 font-medium">Reserva</span>
                                   <span className="text-white font-bold">${totalReserva.toLocaleString('es-CL')}</span>
                               </div>
                               <div className="p-3 bg-slate-900/50 rounded-lg border-l-4 border-blue-500 flex justify-between items-center">
                                   <span className="text-slate-300 font-medium">Caja Chica</span>
                                   <span className="text-white font-bold">${totalCajaChica.toLocaleString('es-CL')}</span>
                               </div>
                               <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/30 flex justify-between items-center mt-4 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                                   <span className="text-amber-500 font-bold uppercase tracking-widest text-sm">Total General</span>
                                   <span className="text-amber-400 font-black text-xl">${totalGeneral.toLocaleString('es-CL')}</span>
                               </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="glass border-none">
                        <CardHeader className="bg-slate-900/60 border-b border-amber-500/30 rounded-t-xl flex flex-row items-center justify-between py-4">
                            <CardTitle className="text-lg text-white">Historial</CardTitle>
                            <Button onClick={handleExport} variant="outline" size="sm" className="border-amber-500/30 text-amber-500 hover:bg-amber-500/10">
                                <Download className="w-4 h-4 mr-2" /> CSV
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="max-h-[40vh] overflow-y-auto custom-scrollbar p-2">
                                <table className="w-full text-left">
                                    <thead className="sticky top-0 bg-slate-900/90 backdrop-blur-sm z-10">
                                        <tr>
                                            <th className="p-4 text-xs font-bold text-amber-500 uppercase tracking-widest border-b border-amber-500/20">Fecha</th>
                                            <th className="p-4 text-xs font-bold text-amber-500 uppercase tracking-widest border-b border-amber-500/20 text-right">Reserva</th>
                                            <th className="p-4 text-xs font-bold text-amber-500 uppercase tracking-widest border-b border-amber-500/20 text-right">C. Chica</th>
                                            <th className="p-4 text-xs font-bold text-amber-500 uppercase tracking-widest border-b border-amber-500/20 text-right">Total</th>
                                            <th className="p-4 text-xs font-bold text-amber-500 uppercase tracking-widest border-b border-amber-500/20"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/50">
                                        <AnimatePresence>
                                            {arqueos.length > 0 ? arqueos.map(a => (
                                                <motion.tr layout key={a.fecha} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hover:bg-slate-800/40">
                                                    <td className="p-4 text-sm text-slate-300 font-medium">{a.fecha}</td>
                                                    <td className="p-4 text-right text-sm text-white">${a.totalReserva.toLocaleString('es-CL')}</td>
                                                    <td className="p-4 text-right text-sm text-white">${a.totalCajaChica.toLocaleString('es-CL')}</td>
                                                    <td className="p-4 text-right text-sm font-bold text-amber-400">${a.totalGeneral.toLocaleString('es-CL')}</td>
                                                    <td className="p-4 text-right">
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="w-8 h-8 text-red-400 hover:bg-red-500/20 hover:text-red-300"><Trash2 className="w-4 h-4" /></Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent className="glass border-amber-500/30">
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle className="text-white">¿Eliminar arqueo?</AlertDialogTitle>
                                                                    <AlertDialogDescription className="text-slate-400">Eliminará el arqueo del {a.fecha}.</AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel className="bg-slate-800 text-white border-none">Cancelar</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => handleDeleteArqueo(a.fecha)} className="bg-red-500 hover:bg-red-600 text-white font-bold border-none">Eliminar</AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </td>
                                                </motion.tr>
                                            )) : (
                                                <tr><td colSpan="5" className="text-center py-12 text-slate-500 tracking-widest font-medium">NO HAY REGISTROS</td></tr>
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

export default RegistroEfectivo;
