
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { User, Lock, AlertCircle, ArrowRight } from 'lucide-react';

const LoginPage = () => {
  const [nombre, setNombre] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [mode, setMode] = useState('initial'); // 'initial', 'login', 'register'
  const [localError, setLocalError] = useState('');
  const [isChecking, setIsChecking] = useState(false);

  const { login, register, checkUserExists, currentUser, isLoading, error: authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (currentUser) {
      const from = location.state?.from?.pathname || (currentUser.rol === 'admin' ? '/admin' : '/cajero');
      navigate(from, { replace: true });
    }
  }, [currentUser, navigate, location]);

  useEffect(() => {
    if (authError) {
      setLocalError(authError);
    }
  }, [authError]);

  const handleNombreSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    
    if (!nombre.trim()) {
      setLocalError('Por favor, ingresa tu nombre de usuario.');
      return;
    }

    setIsChecking(true);
    try {
      const exists = await checkUserExists(nombre);
      if (exists) {
        setMode('login');
      } else {
        setMode('register');
      }
    } catch (err) {
      setLocalError('Error al verificar el usuario. Intenta de nuevo.');
    } finally {
      setIsChecking(false);
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!password) {
      setLocalError('La contraseña es requerida.');
      return;
    }

    if (mode === 'register') {
      if (password.length < 6) {
        setLocalError('La contraseña debe tener al menos 6 caracteres.');
        return;
      }
      if (password !== confirmPassword) {
        setLocalError('Las contraseñas no coinciden.');
        return;
      }

      const res = await register(nombre, password);
      if (res.success) {
        toast({
          title: '¡Registro exitoso!',
          description: `Bienvenido, ${res.user.nombre}`,
          className: 'bg-amber-500 text-slate-900 font-bold border-none',
        });
        navigate(res.user.rol === 'admin' ? '/admin' : '/cajero', { replace: true });
      }
    } else if (mode === 'login') {
      const res = await login(nombre, password);
      if (res.success) {
        toast({
          title: '¡Acceso correcto!',
          description: `Bienvenido de nuevo, ${res.user.nombre}`,
          className: 'bg-amber-500 text-slate-900 font-bold border-none',
        });
        navigate(res.user.rol === 'admin' ? '/admin' : '/cajero', { replace: true });
      }
    }
  };

  const resetFlow = () => {
    setMode('initial');
    setPassword('');
    setConfirmPassword('');
    setLocalError('');
  };

  return (
    <>
      <Helmet>
        <title>Acceso - ICIZ MARKET</title>
        <meta name="description" content="Acceso seguro al sistema Arqueo de Caja ICIZ MARKET." />
      </Helmet>

      <div className="min-h-screen flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-slate-950 px-4 py-12">
        
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <img 
            src="https://horizons-cdn.hostinger.com/4a22c3cb-3261-4ae9-97cc-f3a655538152/56815a0a607b29916cf6e87f0c22ed57.png" 
            alt="ICIZ MARKET Logo" 
            className="w-[250px] h-auto object-contain drop-shadow-[0_0_25px_rgba(245,158,11,0.4)]"
          />
        </div>

        <Card className="glass w-full max-w-md border-none">
          <CardHeader className="space-y-2 text-center pb-6 pt-8">
            <CardTitle className="text-2xl font-bold text-white tracking-widest text-uppercase">
              ARQUEO DE CAJA
            </CardTitle>
            <CardDescription className="text-amber-400/80 text-base font-medium">
              {mode === 'initial' && 'Ingresa tu usuario para acceder a ICIZ MARKET'}
              {mode === 'login' && 'Ingresa tu contraseña'}
              {mode === 'register' && 'Crea tu contraseña para registrarte'}
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 pb-8">
            {localError && (
              <div className="flex items-center gap-2 p-3 mb-6 bg-red-950/50 border border-red-500/50 rounded-lg animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-200 font-medium">{localError}</p>
              </div>
            )}

            {mode === 'initial' ? (
              <form onSubmit={handleNombreSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="nombre" className="text-slate-300 font-medium">
                    Nombre de Usuario
                  </Label>
                  <div className="relative group">
                    <User className="absolute left-3 top-3 h-5 w-5 text-amber-500/70 group-focus-within:text-amber-500 transition-colors" />
                    <Input
                      id="nombre"
                      type="text"
                      placeholder="Ej. Jacqueline"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      required
                      className="pl-10 h-12 glass-input text-lg"
                      disabled={isChecking}
                    />
                  </div>
                </div>
                
                <Button
                  type="submit"
                  className="w-full h-12 text-lg gap-2 gold-btn"
                  disabled={isChecking || !nombre.trim()}
                >
                  {isChecking ? (
                    <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>Continuar <ArrowRight className="w-5 h-5" /></>
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleAuthSubmit} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center justify-between bg-slate-800/60 p-3 rounded-lg border border-amber-500/20 mb-2">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <User className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <span className="font-medium text-white truncate">{nombre}</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={resetFlow}
                    className="text-xs font-bold text-amber-500 hover:text-amber-400 uppercase tracking-wider"
                  >
                    Cambiar
                  </button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-300 font-medium">
                    Contraseña
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-amber-500/70 group-focus-within:text-amber-500 transition-colors" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-10 h-12 glass-input text-lg tracking-widest"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {mode === 'register' && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-slate-300 font-medium">
                      Confirmar Contraseña
                    </Label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-amber-500/70 group-focus-within:text-amber-500 transition-colors" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="pl-10 h-12 glass-input text-lg tracking-widest"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 text-lg mt-6 gold-btn"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                      Procesando...
                    </div>
                  ) : (
                    mode === 'login' ? 'Ingresar' : 'Registrarse'
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default LoginPage;
