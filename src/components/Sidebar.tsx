export default function Sidebar() {
    return (
        <aside className="w-64 bg-gray-900 text-white h-full p-6 shadow-2xl">
            <h2 className="text-2xl font-bold mb-10 text-blue-500">SecurityPass</h2>
            <nav>
                <ul className="space-y-4 text-gray-300 font-medium tracking-wide">
                    <li className="p-3 bg-gray-800 rounded-lg cursor-pointer text-white">🔐 Mi Boveda</li>
                    <li className="p-3 hover:bg-gray-800 rounded-lg cursor-pointer transition">💳 Tarjetas</li>
                    <li className="p-3 hover:bg-gray-800 rounded-lg cursor-pointer transition">⚙️ Configuracion</li>
                </ul>
            </nav>
        </aside>
    );
}