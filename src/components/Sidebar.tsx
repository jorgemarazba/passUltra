import { UserCircle, LogOut } from 'lucide-react';

interface SidebarProps {
    userEmail: string;
    onLogout: () => void;
}

export default function Sidebar({ userEmail, onLogout }: SidebarProps) {
    return (
        <aside className="w-64 bg-gray-900 text-white h-full p-6 shadow-2xl flex flex-col">
            <div>
                <h2 className="text-2xl font-bold mb-10 text-blue-500">SecurityPass</h2>
                <nav>
                    <ul className="space-y-4 text-gray-300 font-medium tracking-wide">
                        <li className="p-3 bg-gray-800 rounded-lg cursor-pointer text-white">🔐 Mi Boveda</li>
                        <li className="p-3 hover:bg-gray-800 rounded-lg cursor-pointer transition">💳 Tarjetas</li>
                        <li className="p-3 hover:bg-gray-800 rounded-lg cursor-pointer transition">⚙️ Configuracion</li>
                    </ul>
                </nav>
            </div>
            
            <div className="mt-auto border-t border-gray-800 pt-6">
                <div className="flex items-center gap-3 mb-4">
                    <UserCircle size={28} className="text-emerald-400" />
                    <span className="text-xs font-mono text-gray-400 truncate" title={userEmail}>
                        {userEmail}
                    </span>
                </div>
                
                <button 
                    onClick={onLogout}
                    className="w-full flex items-center justify-center gap-2 p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm group"
                >
                    <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-bold text-sm tracking-wide">Desconectar</span>
                </button>
            </div>
        </aside>
    );
}