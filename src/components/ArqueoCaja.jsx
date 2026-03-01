
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Save, Trash2, Banknote, Download } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { saveArqueoCaja, getArqueosCaja, getArqueoCajaPorFechaYCajero, deleteArqueoCaja } from '@/lib/storage';
import { exportarArqueoACSV } from '@/lib/export';

const denominaciones = [10000, 5000, 2000, 1000, 500, 100, 50, 10];

const DenominacionInput = ({ tipo, den, value, onChange }) => (
    <div className="flex items-center justify-between">
        <Label htmlFor={`${tipo}_${den}`}>${den.toLocaleString('es-CL')}</Label>
        <Input
            id={`${tipo}_${den}`}
            type="number"
            className="w-24 text-right"
            value={value}
            onChange={(e) => onChange(tipo, den, e.target.value)}
            placeholder="0"
        />
    </div>
);

const ArqueoCaja = () => {
    const { toast } = useToast();
    const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
    const [cajero, setCajero] = useState('');
    const [reservaMontoMayor, setReservaMontoMayor] = useState('');
    const [reserva, setReserva] = useState(denominaciones.reduce((acc, den) => ({ ...acc, [`reserva_${den}`]: '' }), {}));
    const [cajaChica, setCajaChica] = useState(denominaciones.reduce((acc, den) => ({ ...acc, [`cajaChica_${den}`]: '' }), {}));
    const [arqueos, setArqueos] = useState([]);

    const loadArqueoForDate = useCallback((date, cjr) => {
        if (!cjr) {
            setReservaMontoMayor('');
            setReserva(denominaciones.reduce((acc, den) => ({ ...acc, [`reserva_${den}`]: '' }), {}));
            setCajaChica(denominaciones.reduce((acc, den) => ({ ...acc, [`cajaChica_${den}`]: '' }), {}));
            return;
        }
        const arqueoExistente = getArqueoCajaPorFechaYCajero(date, cjr);
        if (arqueoExistente) {
            setReservaMontoMayor(arqueoExistente.reservaMontoMayor);
            setReserva(arqueoExistente.reserva);
            setCajaChica(arqueoExistente.cajaChica);
        } else {
            setReservaMontoMayor('');
            setReserva(denominaciones.reduce((acc, den) => ({ ...acc, [`reserva_${den}`]: '' }), {}));
            setCajaChica(denominaciones.reduce((acc, den) => ({ ...acc, [`cajaChica_${den}`]: '' }), {}));
        }
    }, []);

    useEffect(() => {
        setArqueos(getArqueosCaja());
        loadArqueoForDate(fecha, cajero);
    }, [fecha, cajero, loadArqueoForDate]);

    const handleDenominacionChange = (tipo, den, value) => {
        const setter = tipo === 'reserva' ? setReserva : setCajaChica;
        setter(prev => ({ ...prev, [`${tipo}_${den}`]: value }));
    };

    const calcularTotal = (state) => {
        return denominaciones.reduce((total, den) => {
            const key = `${Object.keys(state)[0].split('_')[0]}_${den}`;
            return total + (parseInt(state[key], 10) || 0) * den;
        }, 0);
    };

    const totalReserva = useMemo(() => calcularTotal(reserva), [reserva]);
    const totalCajaChica = useMemo(() => calcularTotal(cajaChica), [cajaChica]);
    const totalGeneral = (parseInt(reservaMontoMayor, 10) || 0) + totalReserva + totalCajaChica;
    
    const handleSaveArqueo = () => {
        if (!cajero) {
            toast({
                title: "❌ Cajero no seleccionado",
                description: "Por favor, selecciona un cajero antes de guardar.",
                variant: "destructive"
            });
            return;
        }

        const nuevoArqueo = {
            fecha,
            cajero,
            reservaMontoMayor,
            reserva,
            cajaChica,
            totalReserva: totalReserva + (parseInt(reservaMontoMayor, 10) || 0),
            totalCajaChica,
            totalGeneral
        };

        saveArqueoCaja(nuevoArqueo);
        setArqueos(getArqueosCaja());

        toast({
            title: "✅ Arqueo Guardado",
            description: `Se guardó el arqueo para ${cajero} el día ${fecha}.`,
        });
    };

    const handleDeleteArqueo = (fechaToDelete, cajeroToDelete) => {
        const updatedArqueos = deleteArqueoCaja(fechaToDelete, cajeroToDelete);
        setArqueos(updatedArqueos);
        if(fecha === fechaToDelete && cajero === cajeroToDelete) {
             loadArqueoForDate(fecha, cajero);
        }
        toast({
            title: "🗑️ Arqueo Eliminado",
            description: `Se eliminó el arqueo de ${cajeroToDelete} del día ${fechaToDelete}.`,
            variant: "destructive"
        });
    };
    
    const handleExport = () => {
        if(arqueos.length === 0) {
            toast({ title: "Sin Datos", description: "No hay arqueos de caja para exportar.", variant: "destructive" });
            return;
        }
        exportarArqueoACSV(arqueos, 'caja');
        toast({ title: "🚀 Exportación Exitosa", description: "Se ha descargado el archivo CSV con los arqueos de caja." });
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <Card className="bg-white dark:bg-slate-800 shadow-xl">
                        <CardHeader className="bg-gradient-to-r from-sky-500 to-indigo-500 text-white rounded-t-lg">
                            <CardTitle className="flex items-center gap-2"><Banknote className="w-6 h-6" /> Arqueo de Caja</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className='grid grid-cols-2 gap-4'>
                                <div>
                                    <Label htmlFor="arqueo-caja-fecha">Fecha</Label>
                                    <Input id="arqueo-caja-fecha" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="mt-1" />
                                </div>
                                <div>
                                    <Label htmlFor="arqueo-caja-cajero">Cajero</Label>
                                    <Select value={cajero} onValueChange={setCajero}>
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Seleccionar" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">Caja 1</SelectItem>
                                            <SelectItem value="2">Caja 2</SelectItem>
                                            <SelectItem value="3">Caja 3</SelectItem>
                                            <SelectItem value="Reserva">Reserva</SelectItem>
                                            <SelectItem value="Jacqueline">Jacqueline</SelectItem>
                                            <SelectItem value="Gabriel">Gabriel</SelectItem>
                                            <SelectItem value="Alejandra">Alejandra</SelectItem>
                                            <SelectItem value="Julian">Julián</SelectItem>
                                            <SelectItem value="Irma">Irma</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>


                            <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                <h4 className="font-semibold text-slate-800 dark:text-slate-200">Reserva</h4>
                                <div>
                                    <Label htmlFor="reservaMontoMayorCaja">Monto Mayor ($)</Label>
                                    <Input id="reservaMontoMayorCaja" type="number" placeholder="0" value={reservaMontoMayor} onChange={e => setReservaMontoMayor(e.target.value)} className="mt-1" />
                                </div>
                                {denominaciones.map(den => (
                                    <DenominacionInput key={`reserva_${den}`} tipo="reserva" den={den} value={reserva[`reserva_${den}`]} onChange={handleDenominacionChange} />
                                ))}
                            </div>

                            <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                <h4 className="font-semibold text-slate-800 dark:text-slate-200">Caja Chica</h4>
                                {denominaciones.map(den => (
                                    <DenominacionInput key={`cajaChica_${den}`} tipo="cajaChica" den={den} value={cajaChica[`cajaChica_${den}`]} onChange={handleDenominacionChange} />
                                ))}
                            </div>
                            
                            <div className="grid grid-cols-1 gap-2 pt-4 border-t">
                               <div className="flex justify-between items-center text-sm font-medium"><span className="text-slate-500">Total Reserva:</span><span className="text-slate-800 dark:text-slate-200">${(totalReserva + (parseInt(reservaMontoMayor, 10) || 0)).toLocaleString('es-CL')}</span></div>
                               <div className="flex justify-between items-center text-sm font-medium"><span className="text-slate-500">Total Caja Chica:</span><span className="text-slate-800 dark:text-slate-200">${totalCajaChica.toLocaleString('es-CL')}</span></div>
                               <div className="flex justify-between items-center text-lg font-bold mt-2"><span className="text-sky-600 dark:text-sky-400">Total General:</span><span className="text-sky-600 dark:text-sky-400">${totalGeneral.toLocaleString('es-CL')}</span></div>
                            </div>


                            <Button onClick={handleSaveArqueo} className="w-full bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600 text-white">
                                <Save className="w-4 h-4 mr-2" /> Guardar Arqueo de Caja
                            </Button>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2">
                    <Card className="bg-white dark:bg-slate-800 shadow-xl">
                        <CardHeader className="bg-gradient-to-r from-slate-700 to-slate-900 text-white rounded-t-lg flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2">Historial de Arqueos de Caja</CardTitle>
                            <Button onClick={handleExport} variant="outline" size="sm" className="bg-transparent text-white hover:bg-white/20 border-white/50">
                                <Download className="w-4 h-4 mr-2" /> Exportar CSV
                            </Button>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="max-h-[70vh] overflow-y-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b-2 border-slate-200 dark:border-slate-700">
                                            <th className="text-left p-3">Fecha</th>
                                            <th className="text-left p-3">Cajero</th>
                                            <th className="text-right p-3">Total General</th>
                                            <th className="text-right p-3">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <AnimatePresence>
                                            {arqueos.length > 0 ? arqueos.map(a => (
                                                <motion.tr layout key={`${a.fecha}-${a.cajero}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -20 }} className="border-b border-slate-100 dark:border-slate-800">
                                                    <td className="p-3 font-semibold">{a.fecha}</td>
                                                    <td className="p-3">{a.cajero}</td>
                                                    <td className="p-3 text-right font-bold text-sky-500">${a.totalGeneral.toLocaleString('es-CL')}</td>
                                                    <td className="p-3 text-right">
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50"><Trash2 className="w-4 h-4" /></Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>¿Eliminar arqueo?</AlertDialogTitle>
                                                                    <AlertDialogDescription>Esta acción eliminará permanentemente el arqueo de {a.cajero} del día {a.fecha}.</AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => handleDeleteArqueo(a.fecha, a.cajero)} className="bg-red-600 hover:bg-red-700">Eliminar</AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </td>
                                                </motion.tr>
                                            )) : (
                                                <tr><td colSpan="4" className="text-center py-12 text-slate-500">No hay arqueos de caja registrados.</td></tr>
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

export default ArqueoCaja;
