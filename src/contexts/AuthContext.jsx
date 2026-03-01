
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import bcrypt from 'bcryptjs';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('custom_auth_user');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error parsing stored user', e);
      }
    }
    setIsLoading(false);
  }, []);

  const checkUserExists = async (nombre) => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('id, nombre, rol')
        .ilike('nombre', nombre.trim())
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    } catch (err) {
      console.error('Error checking user:', err);
      throw err;
    }
  };

  const register = async (nombre, contraseña) => {
    setIsLoading(true);
    setError(null);
    try {
      if (!nombre || !nombre.trim()) throw new Error('El nombre de usuario es requerido');
      if (!contraseña || contraseña.length < 6) throw new Error('La contraseña debe tener al menos 6 caracteres');

      const formattedNombre = nombre.trim();
      const exists = await checkUserExists(formattedNombre);
      if (exists) {
        throw new Error('El nombre de usuario ya está registrado');
      }

      const rol = formattedNombre.toLowerCase() === 'jsanz' ? 'admin' : 'cajero';
      const salt = bcrypt.genSaltSync(10);
      const contraseña_hash = bcrypt.hashSync(contraseña, salt);

      const { data, error: insertError } = await supabase
        .from('usuarios')
        .insert([{ 
          nombre: formattedNombre, 
          contraseña_hash,
          rol,
          ultimo_acceso: new Date().toISOString()
        }])
        .select('id, nombre, rol')
        .single();

      if (insertError) throw insertError;

      const user = { id: data.id, nombre: data.nombre, rol: data.rol };
      setCurrentUser(user);
      localStorage.setItem('custom_auth_user', JSON.stringify(user));
      
      return { success: true, user };
    } catch (err) {
      console.error('Register error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (nombre, contraseña) => {
    setIsLoading(true);
    setError(null);
    try {
      if (!nombre || !contraseña) {
        throw new Error('Nombre de usuario y contraseña son requeridos');
      }

      const formattedNombre = nombre.trim();

      const { data: usuario, error: fetchError } = await supabase
        .from('usuarios')
        .select('*')
        .ilike('nombre', formattedNombre)
        .maybeSingle();

      if (fetchError) throw fetchError;
      if (!usuario) {
        throw new Error('Credenciales incorrectas (Usuario no encontrado)');
      }

      const isMatch = bcrypt.compareSync(contraseña, usuario.contraseña_hash);
      if (!isMatch) {
        throw new Error('Credenciales incorrectas (Contraseña inválida)');
      }

      await supabase
        .from('usuarios')
        .update({ ultimo_acceso: new Date().toISOString() })
        .eq('id', usuario.id);

      const user = { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol };
      setCurrentUser(user);
      localStorage.setItem('custom_auth_user', JSON.stringify(user));

      return { success: true, user };
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('custom_auth_user');
  };

  const isAdmin = () => {
    return currentUser?.rol === 'admin';
  };

  const value = {
    currentUser,
    isLoading,
    error,
    login,
    register,
    checkUserExists,
    logout,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
