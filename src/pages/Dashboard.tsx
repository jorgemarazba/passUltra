// src/assets/pages vivira LA PANTALLA COMPLETA PRINCAL//

import Sidebar from '../components/Sidebar';
import PasswordRow from '../components/PasswordRow';
// Lucide nos regala los mejores íconos del mercado
import { Search, Plus } from 'lucide-react';

export default function Dashboard() {
    return (
        <div className="flex h-screen bg-gray-50 w-full overflow-hidden font-sans">

            {/* 1. Nuestra nueva Barra Lateral */}
            <Sidebar />

            {/* 2. Todo el Contenido Principal a la derecha */}
            <main className="flex-1 p-10 overflow-y-auto">

                {/* Cabecera: Buscador y Botón Nuevo */}
                <header className="flex justify-between items-center mb-10">
                    <div className="relative w-1/2 max-w-lg">
                        {/* Ícono de lupa posicionado sobre el input */}
                        <Search className="absolute left-4 top-3 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar en tu bóveda..."
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm transition"
                        />
                    </div>

                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 flex items-center gap-2 transition hover:-translate-y-1">
                        <Plus size={20} />
                        Nueva Contraseña
                    </button>
                </header>

                {/* 3. La zona de la Lista de Contraseñas */}
                <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[500px]">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">Últimas agregadas</h2>

                    <div className="grid gap-2">
                        {/* Aquí repetimos tu pieza de Lego 3 veces para hacer pruebas */}
                        <PasswordRow />
                        <PasswordRow />
                        <PasswordRow />
                    </div>
                </section>

            </main>
        </div>
    );
}
