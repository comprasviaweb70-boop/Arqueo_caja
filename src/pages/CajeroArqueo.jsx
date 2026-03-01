
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Calculator, Save, DollarSign, Printer } from 'lucide-react';
import Header from '@/components/Header';
import { usePrintReceipt } from '@/hooks/usePrintReceipt';
import PrintReceipt from '@/components/PrintReceipt';

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

const CajeroArqueo = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const { handlePrint } = usePrintReceipt();
  const [loading, setLoading] = useState(false);
  const [cambios, setCambios] = useState('');
  
  const [unidades, setUnidades] = useState(
    DENOMINACIONES.reduce((acc, d) => ({ ...acc, [d.valor]: 0 }), {})
  );

  // Refs for keyboard navigation
  const inputRefs = useRef([]);
  const textareaRef = useRef(null);
  const submitBtnRef = useRef(null);

  const calcularMonto = useCallback((valor, cantidad) => {
    return valor * (parseInt(cantidad) || 0);
  }, []);

  const calcularTotal = useCallback(() => {
    return DENOMINACIONES.reduce((total, d) => {
      return total + calcularMonto(d.valor, unidades[d.valor]);
    }, 0);
  }, [unidades, calcularMonto]);

  const total = calcularTotal();

  const handleUnidadChange = (valor, cantidad) => {
    setUnidades(prev => ({
      ...prev,
      [valor]: cantidad === '' ? '' : Math.max(0, parseInt(cantidad) || 0)
    }));
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (index < DENOMINACIONES.length - 1) {
        inputRefs.current[index + 1]?.focus();
      } else {
        textareaRef.current?.focus();
      }
    }
  };

  const handleTextareaKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitBtnRef.current?.focus();
    }
  };

  const performSave = async (isAutoSave = false) => {
    if (total === 0) {
      if (!isAutoSave) {
        toast({
          title: 'Error de Validación',
          description: 'El total del arqueo no puede ser cero.',
          variant: 'destructive',
        });
      }
      return;
    }

    if (!isAutoSave) {
      setLoading(true);
    }

    const denominacionesData = DENOMINACIONES.reduce((acc, d) => {
      const cantidad = parseInt(unidades[d.valor]) || 0;
      return {
        ...acc,
        [`d_${d.valor}`]: cantidad,
        [`monto_${d.valor}`]: calcularMonto(d.valor, cantidad)
      };
    }, {});

    try {
      const now = new Date().toISOString();
      const { error } = await supabase.from('arqueos').insert({
        cajero: currentUser?.nombre || 'Usuario Desconocido',
        denominaciones: denominacionesData,
        total: total,
        cambios: cambios || null,
        fecha: now,
        saved_at: now,
        auto_saved: isAutoSave
      });

      if (error) throw error;

      // Only perform these actions if it's a MANUAL save
      if (!isAutoSave) {
        toast({
          title: '¡Arqueo guardado exitosamente!',
          description: `Total de $${total.toLocaleString('es-CL')} ha sido enviado.`,
          className: 'bg-amber-500 text-slate-900 border-none font-bold',
        });

        // Clear all form fields
        setUnidades(DENOMINACIONES.reduce((acc, d) => ({ ...acc, [d.valor]: 0 }), {}));
        setCambios('');
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      if (!isAutoSave) {
        console.error('Error al guardar arqueo:', error);
        toast({
          title: 'Error al guardar arqueo',
          description: `Fallo la inserción: ${error.message}`,
          variant: 'destructive',
        });
      }
    } finally {
      if (!isAutoSave) {
        setLoading(false);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    performSave(false);
  };

  // Auto-save logic (60-second inactivity timer)
  // This resets the timer whenever the user types something (unidades or cambios change)
  useEffect(() => {
    if (total === 0) return;

    const timer = setTimeout(() => {
      performSave(true);
    }, 60000); // 60 seconds of inactivity

    // Clear timeout on unmount or when dependencies change (user input)
    return () => clearTimeout(timer);
  }, [unidades, cambios, total]);

  const receiptData = {
    cajero: currentUser?.nombre,
    fecha: new Date().toISOString(),
    unidades,
    total,
    cambios
  };

  return (
    <>
      <Helmet>
        <title>Arqueo de Caja - ICIZ MARKET</title>
        <meta name="description" content="Registro diario de arqueo de caja para el sistema ICIZ MARKET." />
      </Helmet>

      <div className="min-h-screen bg-transparent pb-12 print:hidden">
        <Header />

        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white tracking-wide">
              NUEVO ARQUEO ICIZ MARKET
            </h2>
            <p className="text-slate-300 mt-1">
              Ingresa las cantidades de efectivo al cierre de tu turno, <span className="text-amber-400 font-semibold">{currentUser?.nombre}</span>.
            </p>
          </div>

          <Card className="glass overflow-hidden border-none">
            <CardHeader className="bg-slate-900/50 border-b border-amber-500/20 pb-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/30">
                    <Calculator className="w-8 h-8 text-amber-500" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-white">Conteo de Efectivo</CardTitle>
                    <CardDescription className="text-slate-400">
                      Registra billetes y monedas
                    </CardDescription>
                  </div>
                </div>
                
                <Button 
                  type="button" 
                  onClick={handlePrint} 
                  variant="outline" 
                  className="gap-2 border-amber-500/30 text-amber-500 hover:bg-amber-500/10 bg-transparent transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span className="hidden sm:inline font-semibold">Imprimir Recibo</span>
                </Button>
              </div>
            </CardHeader>

            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-slate-900/40 p-4 sm:p-6 rounded-xl border border-amber-500/20">
                  <div className="grid grid-cols-3 gap-4 mb-4 font-bold text-amber-500 border-b border-amber-500/20 pb-2 text-sm uppercase tracking-wider">
                    <div>Denominación</div>
                    <div className="text-center">Cantidad</div>
                    <div className="text-right">Subtotal</div>
                  </div>

                  <div className="space-y-3">
                    {DENOMINACIONES.map((denom, index) => {
                      const monto = calcularMonto(denom.valor, unidades[denom.valor]);
                      return (
                        <div
                          key={denom.valor}
                          className="grid grid-cols-3 gap-4 items-center py-2 hover:bg-slate-800/50 transition-colors rounded-lg px-3 -mx-3 border border-transparent hover:border-amber-500/10"
                        >
                          <div className="font-semibold text-slate-200">
                            {denom.label}
                          </div>
                          <div>
                            <Input
                              ref={el => inputRefs.current[index] = el}
                              type="number"
                              min="0"
                              value={unidades[denom.valor] === 0 ? '' : unidades[denom.valor]}
                              onChange={(e) => handleUnidadChange(denom.valor, e.target.value)}
                              onKeyDown={(e) => handleKeyDown(e, index)}
                              placeholder="0"
                              className="text-center h-11 glass-input font-bold text-lg"
                              disabled={loading}
                            />
                          </div>
                          <div className="text-right font-bold text-amber-400 text-lg tracking-wide">
                            ${monto.toLocaleString('es-CL')}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center mt-6 pt-6 border-t border-amber-500/30">
                    <div className="text-lg text-slate-300 font-bold uppercase tracking-wider hidden sm:block">
                      Total Recaudado
                    </div>
                    <div className="flex justify-end w-full">
                      <div className="flex items-center gap-3 bg-slate-900/80 text-amber-400 px-6 py-4 rounded-xl border border-amber-500/50 w-full sm:w-auto shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                        <DollarSign className="w-8 h-8" />
                        <span className="text-3xl font-black tracking-widest">
                          {total.toLocaleString('es-CL')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cambios" className="text-slate-200 font-medium">
                    Observaciones / Faltantes / Sobrantes (Opcional)
                  </Label>
                  <Textarea
                    ref={textareaRef}
                    id="cambios"
                    value={cambios}
                    onChange={(e) => setCambios(e.target.value)}
                    onKeyDown={handleTextareaKeyDown}
                    placeholder="Escribe aquí cualquier observación relevante..."
                    className="min-h-[100px] resize-none glass-input"
                    disabled={loading}
                  />
                </div>

                <Button
                  ref={submitBtnRef}
                  type="submit"
                  className="w-full h-14 text-lg rounded-xl gold-btn mt-4"
                  disabled={loading || total === 0}
                >
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                      Guardando...
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Save className="w-6 h-6" />
                      GUARDAR Y FINALIZAR ARQUEO
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <PrintReceipt data={receiptData} />
    </>
  );
};

export default CajeroArqueo;
