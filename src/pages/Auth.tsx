import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Cloud, UserPlus, LogIn } from 'lucide-react';

export default function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleAuth(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            } else {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                alert("¡Cuenta registrada con éxito en los rascacielos de Supabase!");
                setIsLogin(true); // Lo regresamos al login
            }
        } catch (err: any) {
            setError(err.message || "Error al conectar con la Nube");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-50 relative overflow-hidden font-sans">
            <div className="z-10 flex flex-col items-center bg-white p-12 rounded-3xl border border-gray-200 shadow-xl w-[400px]">

                <div className="bg-blue-100 p-6 rounded-full mb-6">
                    <Cloud size={48} className="text-blue-600" />
                </div>

                <h1 className="text-2xl font-bold text-gray-800 mb-2">SUPABASE CLOUD</h1>
                <p className="text-gray-500 mb-8 text-sm tracking-widest uppercase">Perímetro de Defensa</p>

                <form onSubmit={handleAuth} className="w-full flex flex-col gap-4">
                    <input
                        type="email"
                        placeholder="Correo de Identidad"
                        className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <input
                        type="password"
                        placeholder="Contraseña Universal"
                        className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-mono"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    {error && <p className="text-red-500 text-xs font-bold text-center mt-2">{error}</p>}

                    <button
                        disabled={loading}
                        type="submit"
                        className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] transition-all flex justify-center items-center gap-2"
                    >
                        {loading ? 'Conectando Antenas...' : isLogin ? <><LogIn size={18} /> Conectar</> : <><UserPlus size={18} /> Crear Identidad</>}
                    </button>
                </form>

                <p className="mt-6 text-sm text-gray-500">
                    {isLogin ? "¿Iniciando de cero?" : "¿Ya tienes credenciales?"}
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-blue-600 font-bold ml-1 hover:underline outline-none"
                    >
                        {isLogin ? "Regístrate" : "Entra"}
                    </button>
                </p>
            </div>
        </div>
    );
}
