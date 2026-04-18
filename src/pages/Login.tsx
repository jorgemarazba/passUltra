import { useState } from 'react';
import { Lock, ShieldCheck } from 'lucide-react';

interface LoginProps {
    onLoginSuccess: (masterKey: string) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
    const [password, setPassword] = useState('');

    function handleUnlock() {
        if (!password) return;
        // Aquí no validamos nada en React (Zero-Knowledge real). 
        // Se la mandamos al Cerebro (App.tsx) de forma temporal para que se la preste a Rust cuando la ocupe.
        onLoginSuccess(password);
    }

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white selection:bg-blue-500 relative overflow-hidden">

            {/* Efectos de luces cibernéticos de fondo */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20"></div>

            <div className="z-10 flex flex-col items-center bg-gray-800/50 p-12 rounded-3xl border border-gray-700 backdrop-blur-xl shadow-2xl">

                <div className="bg-blue-600/20 p-6 rounded-full mb-6 relative">
                    <ShieldCheck size={64} className="text-blue-500" />
                    <div className="absolute inset-0 bg-blue-500/10 rounded-full animate-ping"></div>
                </div>

                <h1 className="text-3xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 mb-2">
                    CIBER_VAULT
                </h1>
                <p className="text-gray-400 mb-8 font-mono text-sm uppercase">Protocolo Zero-Knowledge</p>

                <div className="w-full max-w-sm relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <Lock size={20} className="text-gray-500" />
                    </div>
                    <input
                        type="password"
                        placeholder="Ingresa la Llave Maestra..."
                        className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl pl-12 pr-4 py-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all font-mono tracking-widest text-center"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleUnlock() }}
                        autoFocus
                    />
                </div>

                <button
                    onClick={handleUnlock}
                    className="mt-6 w-full max-w-sm bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all uppercase tracking-widest text-sm"
                >
                    Descifrar Bóveda
                </button>
            </div>

            <p className="absolute bottom-6 text-gray-600 font-mono text-xs tracking-widest">AES-256-GCM MOTOR ACTIVO</p>
        </div>
    );
}

