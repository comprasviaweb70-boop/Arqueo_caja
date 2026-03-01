
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Download, RefreshCw, Calendar, User, DollarSign, FileText, Eye, Calculator } from 'lucide-react';
import Header from '@/components/Header';

const AdminDashboard = () => {
  const [arqueos, setArqueos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArqueo, setSelectedArqueo] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const fetchArqueos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('arqueos')
        .select('*')
        .order('fecha', { ascending: false });

      if (error) {
        throw new Error(error.message || error.details || 'Error al obtener los arqueos');
      }

      setArqueos(data || []);
    } catch (error) {
      toast({
        title: 'Error al cargar datos',
        description: `No se pudieron cargar los arqueos: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArqueos();
  }, []);

  const exportarACSV = () => {
    if (arqueos.length === 0) {
      toast({ title: 'No hay datos', description: 'No existen arqueos registrados', variant: 'destructive' });
      return;
    }
    const cabeceras = ['Fecha', 'Cajero', 'Total', 'Observaciones', 'Billetes $20.000', 'Billetes $10.000', 'Billetes $5.000', 'Billetes $2.000', 'Billetes $1.000', 'Monedas $500', 'Monedas $100', 'Monedas $50', 'Monedas $10'];
    const filas = arqueos.map(a => {
      const d = a.denominaciones || {};
      return [new Date(a.fecha).toLocaleString('es-CL'), a.cajero || 'Desconocido', a.total || 0, (a.cambios || '').replace(/;/g, ','), d.d_20000 || 0, d.d_10000 || 0, d.d_5000 || 0, d.d_2000 || 0, d.d_1000 || 0, d.d_500 || 0, d.d_100 || 0, d.d_50 || 0, d.d_10 || 0].join(';');
    });
    const blob = new Blob([`\uFEFF${[cabeceras.join(';'), ...filas].join('\n')}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a'); enlace.href = url; enlace.download = `arqueos_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(enlace); enlace.click(); document.body.removeChild(enlace);
    toast({ title: 'Exportación exitosa', className: 'bg-amber-500 text-slate-900 font-bold border-none' });
  };

  const formatearDenominaciones = (denom) => {
    const totalBilletes = (denom.d_20000 || 0) + (denom.d_10000 || 0) + (denom.d_5000 || 0) + (denom.d_2000 || 0) + (denom.d_1000 || 0);
    const totalMonedas = (denom.d_500 || 0) + (denom.d_100 || 0) + (denom.d_50 || 0) + (denom.d_10 || 0);
    return `${totalBilletes} billetes, ${totalMonedas} monedas`;
  };

  const openDetails = (arqueo) => { setSelectedArqueo(arqueo); setIsModalOpen(true); };
  const totalGeneral = arqueos.reduce((sum, a) => sum + (parseFloat(a.total) || 0), 0);

  return (
    <>
      <Helmet>
        <title>Dashboard - ICIZ MARKET</title>
        <meta name="description" content="Dashboard administrativo del sistema Arqueo de Caja ICIZ MARKET." />
      </Helmet>

      <div className="min-h-screen bg-transparent pb-12">
        <Header />

        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-wide">HISTORIAL DE ARQUEOS</h2>
              <p className="text-slate-400 mt-1 text-sm">Gestiona y exporta todos los registros de caja de ICIZ MARKET</p>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <Button onClick={fetchArqueos} variant="outline" className="gap-2 flex-1 sm:flex-none glass border-amber-500/30 text-amber-500 hover:bg-amber-500/10" disabled={loading}>
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Actualizar
              </Button>
              <Button onClick={exportarACSV} className="gap-2 gold-btn flex-1 sm:flex-none" disabled={arqueos.length === 0}>
                <Download className="w-4 h-4" /> CSV
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <Card className="glass border-none">
              <CardHeader className="pb-2"><CardDescription className="text-slate-400 font-medium uppercase text-xs tracking-wider">Total Registros</CardDescription></CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/10 rounded-lg"><FileText className="w-6 h-6 text-amber-500" /></div>
                  <span className="text-3xl font-black text-white">{arqueos.length}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-none">
              <CardHeader className="pb-2"><CardDescription className="text-slate-400 font-medium uppercase text-xs tracking-wider">Monto Acumulado</CardDescription></CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/10 rounded-lg"><DollarSign className="w-6 h-6 text-amber-500" /></div>
                  <span className="text-3xl font-black text-white">${totalGeneral.toLocaleString('es-CL')}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-none">
              <CardHeader className="pb-2"><CardDescription className="text-slate-400 font-medium uppercase text-xs tracking-wider">Último Arqueo</CardDescription></CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/10 rounded-lg"><Calendar className="w-6 h-6 text-amber-500" /></div>
                  <span className="text-xl font-bold text-white">{arqueos.length > 0 ? new Date(arqueos[0].fecha).toLocaleDateString('es-CL') : 'N/A'}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="glass overflow-hidden border-none">
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-slate-400 font-medium tracking-widest">CARGANDO DATOS...</p>
                </div>
              ) : arqueos.length === 0 ? (
                <div className="text-center py-16">
                  <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 text-lg">No hay arqueos registrados en la base de datos</p>
                </div>
              ) : (
                <table className="w-full min-w-[700px]">
                  <thead className="bg-slate-900/60 border-b border-amber-500/30">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-amber-500 uppercase tracking-widest">Fecha / Hora</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-amber-500 uppercase tracking-widest">Cajero</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-amber-500 uppercase tracking-widest">Resumen Conteo</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-amber-500 uppercase tracking-widest">Total General</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-amber-500 uppercase tracking-widest">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50 bg-slate-900/20">
                    {arqueos.map((arqueo) => (
                      <tr key={arqueo.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300 font-medium">
                          {new Date(arqueo.fecha).toLocaleString('es-CL')}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-amber-500" />
                            <span className="font-bold text-white">{arqueo.cajero}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs text-slate-300 bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-full font-medium tracking-wide">
                            {formatearDenominaciones(arqueo.denominaciones || {})}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="inline-flex items-center gap-1 font-black text-amber-400 text-lg tracking-wide">
                            ${parseFloat(arqueo.total).toLocaleString('es-CL')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Button variant="ghost" size="sm" onClick={() => openDetails(arqueo)} className="text-amber-500 hover:text-slate-900 hover:bg-amber-500 font-bold transition-colors">
                            <Eye className="w-4 h-4 mr-2" /> Detalles
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </Card>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md glass border-amber-500/30 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl text-amber-500 font-bold tracking-wide">
              <Calculator className="w-6 h-6" /> Detalle de Arqueo
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {selectedArqueo && new Date(selectedArqueo.fecha).toLocaleString('es-CL')}
            </DialogDescription>
          </DialogHeader>

          {selectedArqueo && (
            <div className="space-y-4 py-4">
              <div className="flex justify-between items-center bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
                <span className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Cajero</span>
                <span className="font-bold text-white flex items-center gap-2 text-lg">
                  <User className="w-5 h-5 text-amber-500" /> {selectedArqueo.cajero}
                </span>
              </div>

              <div className="border border-slate-700/50 bg-slate-900/30 rounded-lg p-5 space-y-3">
                <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-4">Desglose de Efectivo</h4>
                {[
                  { k: 'd_20000', label: '$20.000', v: 20000 }, { k: 'd_10000', label: '$10.000', v: 10000 },
                  { k: 'd_5000', label: '$5.000', v: 5000 }, { k: 'd_2000', label: '$2.000', v: 2000 },
                  { k: 'd_1000', label: '$1.000', v: 1000 }, { k: 'd_500', label: '$500', v: 500 },
                  { k: 'd_100', label: '$100', v: 100 }, { k: 'd_50', label: '$50', v: 50 }, { k: 'd_10', label: '$10', v: 10 }
                ].map(denom => {
                  const cant = selectedArqueo.denominaciones?.[denom.k] || 0;
                  if (cant === 0) return null;
                  return (
                    <div key={denom.k} className="flex justify-between items-center text-sm border-b border-slate-800 pb-2">
                      <span className="text-slate-300 font-medium">{denom.label} <span className="text-slate-500 mx-2">x</span> <span className="text-amber-500 font-bold">{cant}</span></span>
                      <span className="font-bold text-white tracking-wide">${(cant * denom.v).toLocaleString('es-CL')}</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between items-center bg-amber-500/10 p-5 rounded-lg border border-amber-500/30">
                <span className="font-bold text-amber-500 uppercase tracking-widest text-sm">Total Recaudado</span>
                <span className="text-2xl font-black text-amber-400 tracking-wider">
                  ${parseFloat(selectedArqueo.total).toLocaleString('es-CL')}
                </span>
              </div>

              {selectedArqueo.cambios && (
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Observaciones</span>
                  <p className="text-sm text-slate-200 italic">{selectedArqueo.cambios}</p>
                </div>
              )}
            </div>
          )}
          
          <div className="flex justify-end mt-2">
            <Button onClick={() => setIsModalOpen(false)} className="gold-btn">Cerrar Detalle</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminDashboard;
