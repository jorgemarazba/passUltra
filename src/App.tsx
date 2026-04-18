import { useState, useEffect } from 'react';
import './App.css';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Auth from './pages/Auth';   // El Portal Nube (NUEVO)
import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';

export default function App() {
  // 1er Ciber-Candado: Sesión de Supabase (Identidad en Nube)
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // 2do Ciber-Candado: Llave Maestra (Local Zero Knowledge)
  const [globalMasterKey, setGlobalMasterKey] = useState<string | null>(null);

  // Observador de Red: Revisa si Supabase dice que ya iniciaste sesión antes.
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Queda a la espera en caso de que alguien inicie sesión
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="h-screen bg-gray-900 flex items-center justify-center font-mono tracking-widest text-emerald-400">INICIALIZANDO COMUNICACIONES SATELITALES...</div>;
  }

  // 🛑 FILTRO 1: Si Supabase no nos conoce, no dibujes absolutamente nada más que la pantalla de Nube (Auth)
  if (!session) {
    return <Auth />;
  }

  // 🛑 FILTRO 2: Si cruzaste la red, pero NO has tecleado tu LLave Gema Local... no dibujes la Bóveda. Dibuja el candado Negro.
  if (!globalMasterKey) {
    return (
      <div className="relative h-screen bg-gray-900">
        {/* Aviso chiquito arriba a la izquierda para decirte que cruzaste la Nube con tu correo */}
        <div className="absolute top-6 left-6 text-emerald-400 font-mono text-xs z-50 flex items-center gap-2 bg-gray-800/80 p-2 rounded-lg border border-emerald-900/50">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]"></span>
          LINK ESTABLECIDO: {session.user.email}
        </div>

        <Login onLoginSuccess={setGlobalMasterKey} />
      </div>
    );
  }

  // 🟢 ACCESO TOTAL: Bienvenido al Búnker interno.
  return <Dashboard masterKey={globalMasterKey} userEmail={session.user.email} />;
}


