
import { useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';

export const usePrintReceipt = () => {
  const { toast } = useToast();

  const handlePrint = useCallback(() => {
    try {
      window.print();
    } catch (error) {
      console.error("Error al imprimir:", error);
      toast({
        title: "Error de impresión",
        description: "Hubo un problema al intentar abrir el diálogo de impresión.",
        variant: "destructive"
      });
    }
  }, [toast]);

  return { handlePrint };
};
