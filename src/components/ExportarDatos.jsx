import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Download, FileSpreadsheet, Calendar } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { getRegistros } from '@/lib/storage';
import { exportarACSV, exportarResumenMensual } from '@/lib/export';

const ExportarDatos = () => {
  const { toast } = useToast();
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [mesResumen, setMesResumen] = useState(new Date().toISOString().slice(0, 7));

  const handleExportarCSV = () => {
    const registros = getRegistros();
    
    let registrosFiltrados = registros;
    if (fechaInicio && fechaFin) {
      registrosFiltrados = registros.filter(r => 
        r.fecha >= fechaInicio && r.fecha <= fechaFin
      );
    }

    if (registrosFiltrados.length === 0) {
      toast({
        title: "Sin datos",
        description: "No hay registros en el rango de fechas seleccionado",
        variant: "destructive"
      });
      return;
    }

    exportarACSV(registrosFiltrados);
    
    toast({
      title: "✅ Exportación exitosa",
      description: `Se exportaron ${registrosFiltrados.length} registros a CSV`,
    });
  };

  const handleExportarResumenMensual = () => {
    const registros = getRegistros();
    const [año, mes] = mesResumen.split('-');
    
    const registrosMes = registros.filter(r => {
      const [añoReg, mesReg] = r.fecha.split('-');
      return añoReg === año && mesReg === mes;
    });

    if (registrosMes.length === 0) {
      toast({
        title: "Sin datos",
        description: "No hay registros para el mes seleccionado",
        variant: "destructive"
      });
      return;
    }

    exportarResumenMensual(registrosMes, mesResumen);
    
    toast({
      title: "✅ Resumen generado",
      description: `Resumen mensual de ${registrosMes.length} registros descargado`,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Card className="bg-white dark:bg-slate-800 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6" />
            Exportar Datos Completos (CSV)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <p className="text-slate-600 dark:text-slate-400">
            Exporta todos los registros o filtra por rango de fechas. El archivo CSV usa punto y coma (;) como separador.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fechaInicio">Fecha Inicio (opcional)</Label>
              <Input
                id="fechaInicio"
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="fechaFin">Fecha Fin (opcional)</Label>
              <Input
                id="fechaFin"
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <Button
            onClick={handleExportarCSV}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Descargar CSV
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-slate-800 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            Resumen Mensual
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <p className="text-slate-600 dark:text-slate-400">
            Genera un resumen consolidado de todo el mes con totales y estadísticas.
          </p>
          
          <div>
            <Label htmlFor="mesResumen">Seleccionar Mes</Label>
            <Input
              id="mesResumen"
              type="month"
              value={mesResumen}
              onChange={(e) => setMesResumen(e.target.value)}
              className="mt-1"
            />
          </div>

          <Button
            onClick={handleExportarResumenMensual}
            className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Descargar Resumen Mensual
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-200 dark:border-amber-800">
        <CardContent className="p-6">
          <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
            💡 Información sobre exportación
          </h3>
          <ul className="space-y-2 text-sm text-amber-700 dark:text-amber-300">
            <li>• Los archivos CSV usan punto y coma (;) como separador de columnas</li>
            <li>• Puedes abrir los archivos CSV directamente en Excel o Google Sheets</li>
            <li>• El resumen mensual incluye totales consolidados y estadísticas del período</li>
            <li>• Los datos se mantienen almacenados localmente en tu navegador</li>
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ExportarDatos;