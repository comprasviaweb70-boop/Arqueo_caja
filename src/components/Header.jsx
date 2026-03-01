
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, User, LayoutDashboard, FileText } from 'lucide-react';

const Header = () => {
  const { currentUser, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  if (!currentUser) return null;

  const admin = isAdmin();

  return (
    <header className="glass sticky top-0 z-50 border-b border-amber-500/30 bg-slate-900/80 backdrop-blur-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => navigate(admin ? '/admin' : '/cajero')}
        >
          <img 
            src="https://horizons-cdn.hostinger.com/4a22c3cb-3261-4ae9-97cc-f3a655538152/56815a0a607b29916cf6e87f0c22ed57.png" 
            alt="ICIZ MARKET Logo" 
            className="w-20 md:w-28 h-auto object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]"
          />
          <div className="hidden sm:block border-l border-amber-500/30 pl-3">
            <h1 className="text-lg font-bold text-white tracking-wider">
              ARQUEO DE CAJA
            </h1>
            <p className="text-xs text-amber-400 font-medium uppercase">
              {admin ? 'Panel Administrativo' : 'Caja Operativa'}
            </p>
          </div>
        </div>

        <nav className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 border border-amber-500/20 rounded-full">
            <User className="w-4 h-4 text-amber-500" />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white leading-tight">
                {currentUser.nombre}
              </span>
              <span className="text-[10px] text-amber-400 uppercase font-bold tracking-wider">
                {currentUser.rol}
              </span>
            </div>
          </div>

          {admin && (
            <Link to="/admin">
              <Button variant="ghost" size="sm" className="gap-2 text-slate-300 hover:text-amber-500 hover:bg-slate-800 hidden md:flex">
                <LayoutDashboard className="w-4 h-4" />
                Panel
              </Button>
            </Link>
          )}

          <Link to="/cajero">
            <Button variant="ghost" size="sm" className="gap-2 text-slate-300 hover:text-amber-500 hover:bg-slate-800 hidden md:flex">
              <FileText className="w-4 h-4" />
              Arqueo
            </Button>
          </Link>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="gap-2 border-amber-500/30 text-amber-500 hover:bg-amber-500 hover:text-slate-900 bg-transparent transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Salir</span>
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
