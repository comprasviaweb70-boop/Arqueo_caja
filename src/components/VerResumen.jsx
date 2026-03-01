
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { BarChart3, Filter, Calendar, Users } from 'lucide-react';
import { getRegistros } from '@/lib/storage';

const VerResumen = () => {
  const [registros, setRegistros] = useState([]);
  const [filtroFecha, setFiltroFecha] = useState('');
  const [cajerosDisponibles, setCajerosDisponibles] = useState([]);
  const [cajerosSeleccionados, setCajerosSeleccionados] = useState([]);

  useEffect(() => {
    const data = getRegistros(); setRegistros(data);
    const cu = [...new Set(data.map(r => r.cajero))].sort();
    setCajerosDisponibles(cu); setCajerosSeleccionados(cu);
  }, []);

  const handleCajeroChange = (c) => setCajerosSeleccionados(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c]);
  const handleSelectAll = (c) => setCajerosSeleccionados(c ? cajerosDisponibles : []);

  const fRegs = registros.filter(r => (!filtroFecha || r.fecha === filtroFecha) && cajerosSeleccionados.includes(r.cajero));
  
  const totales = fRegs.reduce((acc, reg) => ({
    v: acc.v + (parseInt(reg.totalVentas, 10) || 0),
    e: acc.e + (parseInt(reg.totalEgresos, 10) || 0),
    d: acc.d + (parseInt(reg.diferenciaCaja, 10) || 0)
  }), { v: 0, e: 0, d: 0 });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
      <Card className="glass border-none">
        <CardHeader className="bg-slate-900/60 border-b border-amber-500/30 rounded-t-xl py-4">
          <CardTitle className="flex items-center gap-2 text-white text-lg">
            <Filter className="w-5 h-5 text-amber-500" /> Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="flex items-center gap-2 mb-2 text-slate-300"><Calendar className="w-4 h-4 text-amber-500"/>Fecha</Label>
            <Input type="date" value={filtroFecha} onChange={(e) => setFiltroFecha(e.target.value)} className="glass-input h-11" />
          </div>
          <div>
            <Label className="flex items-center gap-2 mb-2 text-slate-300"><Users className="w-4 h-4 text-amber-500"/>Cajeros</Label>
            <div className="p-4 border border-amber-500/20 rounded-xl max-h-48 overflow-y-auto bg-slate-900/40 custom-scrollbar">
              <div className="flex items-center space-x-3 pb-3 border-b border-slate-700/50 mb-3">
                <Checkbox id="all" checked={cajerosSeleccionados.length === cajerosDisponibles.length} onCheckedChange={handleSelectAll} className="border-amber-500/50 data-[state=checked]:bg-amber-500 data-[state=checked]:text-slate-900" />
                <Label htmlFor="all" className="font-bold text-amber-500 uppercase tracking-widest text-xs">Seleccionar Todos</Label>
              </div>
              {cajerosDisponibles.map(c => (
                <div key={c} className="flex items-center space-x-3 mt-2">
                  <Checkbox id={`c-${c}`} checked={cajerosSeleccionados.includes(c)} onCheckedChange={() => handleCajeroChange(c)} className="border-slate-500 data-[state=checked]:bg-amber-500 data-[state=checked]:text-slate-900 data-[state=checked]:border-amber-500" />
                  <Label htmlFor={`c-${c}`} className="text-slate-300">{c}</Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
            {l: 'Ventas', v: totales.v, c: 'text-amber-400', b: 'border-amber-500/30', bg: 'bg-amber-500/5'},
            {l: 'Egresos', v: totales.e, c: 'text-red-400', b: 'border-red-500/30', bg: 'bg-red-500/5'},
            {l: 'Diferencia', v: totales.d, c: totales.d < 0 ? 'text-red-400' : 'text-blue-400', b: totales.d < 0 ? 'border-red-500/30' : 'border-blue-500/30', bg: totales.d < 0 ? 'bg-red-500/5' : 'bg-blue-500/5'}
        ].map((item, i) => (
            <Card key={i} className={`glass border-none shadow-lg ${item.bg}`}>
                <CardContent className={`p-6 border border-transparent border-t-4 ${item.b} rounded-xl h-full`}>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Total {item.l}</p>
                    <p className={`text-3xl font-black ${item.c}`}>${item.v.toLocaleString('es-CL')}</p>
                </CardContent>
            </Card>
        ))}
      </div>

      <Card className="glass border-none">
        <CardHeader className="bg-slate-900/60 border-b border-amber-500/30 rounded-t-xl py-4">
          <CardTitle className="flex items-center gap-2 text-white text-lg">
            <BarChart3 className="w-5 h-5 text-amber-500" /> Registros ({fRegs.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {fRegs.length === 0 ? (
            <div className="text-center py-16">
              <Calendar className="w-12 h-12 mx-auto text-slate-600 mb-4" />
              <p className="text-slate-400 font-medium tracking-widest">SIN RESULTADOS</p>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar p-2">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-slate-900/90 backdrop-blur-sm z-10">
                  <tr>
                    <th className="p-4 text-xs font-bold text-amber-500 uppercase tracking-widest border-b border-amber-500/20">Fecha</th>
                    <th className="p-4 text-xs font-bold text-amber-500 uppercase tracking-widest border-b border-amber-500/20">Cajero</th>
                    <th className="p-4 text-xs font-bold text-amber-500 uppercase tracking-widest border-b border-amber-500/20 text-right">Inicial</th>
                    <th className="p-4 text-xs font-bold text-amber-500 uppercase tracking-widest border-b border-amber-500/20 text-right">Ventas</th>
                    <th className="p-4 text-xs font-bold text-amber-500 uppercase tracking-widest border-b border-amber-500/20 text-right">Egresos</th>
                    <th className="p-4 text-xs font-bold text-amber-500 uppercase tracking-widest border-b border-amber-500/20 text-right">Cierre</th>
                    <th className="p-4 text-xs font-bold text-amber-500 uppercase tracking-widest border-b border-amber-500/20 text-right">Dif.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {fRegs.map((r, i) => (
                    <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="hover:bg-slate-800/40">
                      <td className="p-4 text-sm text-slate-300">{r.fecha}</td>
                      <td className="p-4 text-sm font-semibold text-white">{r.cajero}</td>
                      <td className="p-4 text-right text-sm text-slate-400">${(parseInt(r.saldoInicial)||0).toLocaleString('es-CL')}</td>
                      <td className="p-4 text-right text-sm font-bold text-amber-400">${(parseInt(r.totalVentas)||0).toLocaleString('es-CL')}</td>
                      <td className="p-4 text-right text-sm font-bold text-red-400">${(parseInt(r.totalEgresos)||0).toLocaleString('es-CL')}</td>
                      <td className="p-4 text-right text-sm text-slate-300 font-medium">${(parseInt(r.cierreCaja)||0).toLocaleString('es-CL')}</td>
                      <td className={`p-4 text-right text-sm font-black ${(parseInt(r.diferenciaCaja)||0) < 0 ? 'text-red-400' : 'text-blue-400'}`}>
                        ${(parseInt(r.diferenciaCaja)||0).toLocaleString('es-CL')}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default VerResumen;
