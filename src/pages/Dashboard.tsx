import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import PasswordRow from '../components/PasswordRow';
import { Search, Plus, X } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';

interface PasswordData {
    id: number;
    site: string;
    url: string;
    username: string;
    password_decrypted: string;
}

export default function Dashboard() {
    const [passwords, setPasswords] = useState<PasswordData[]>([]);

    const [isModalOpen, setIsModalOpen] = useState(false);

    // NUESTRA MENTE: Para saber si estamos Creando o Editando (Si es null, es nueva)
    const [editId, setEditId] = useState<number | null>(null);

    const [newSite, setNewSite] = useState('');
    const [newUrl, setNewUrl] = useState('');
    const [newUser, setNewUser] = useState('');
    const [newPass, setNewPass] = useState('');

    async function fetchPasswords() {
        try {
            const data: PasswordData[] = await invoke('get_all_passwords');
            setPasswords(data);
        } catch (error) {
            console.error("Error al traer contraseñas:", error);
        }
    }

    useEffect(() => { fetchPasswords(); }, []);

    // NUEVA FUNCION: Abrir modal totalmente en blanco (Para Crear una nueva)
    function openNewModal() {
        setEditId(null);
        setNewSite(''); setNewUrl(''); setNewUser(''); setNewPass('');
        setIsModalOpen(true);
    }

    // NUEVA FUNCION: Atrapa la fila que pinchas con el lápiz y la pone en las cajas de texto
    function handleEditRequest(pass: any) {
        setEditId(pass.id);
        setNewSite(pass.site);
        setNewUrl(pass.url);
        setNewUser(pass.username);
        setNewPass(pass.password_decrypted);
        setIsModalOpen(true);
    }

    // NUESTRA SUPER FUNCIÓN CEREBRO (Sabe si guardar nueva o si actualizar la vieja)
    async function handleSave() {
        if (!newSite || !newUrl || !newUser || !newPass) {
            alert("Por favor llena todos los recuadritos primero");
            return;
        }

        try {
            if (editId !== null) {
                // MODIFICAR: Viaja por el comando update_password usando su ID escondido
                await invoke('update_password', {
                    id: editId,
                    site: newSite,
                    url: newUrl,
                    user: newUser,
                    rawPass: newPass
                });
            } else {
                // CREAR: Viaja por la ruta tradicional
                await invoke('encrypt_and_save', {
                    site: newSite,
                    url: newUrl,
                    user: newUser,
                    rawPass: newPass
                });
            }

            // Si ambos triunfan, cerramos todo en blanco
            setEditId(null);
            setNewSite(''); setNewUrl(''); setNewUser(''); setNewPass('');
            setIsModalOpen(false);
            fetchPasswords();
        } catch (error) {
            console.error("Fallo:", error);
        }
    }

    return (
        <div className="flex h-screen bg-gray-50 w-full overflow-hidden font-sans relative">
            <Sidebar />

            <main className="flex-1 p-10 overflow-y-auto">
                <header className="flex justify-between items-center mb-10">
                    <div className="relative w-96">
                        <input
                            type="text"
                            placeholder="Buscar en tu bóveda..."
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white shadow-sm"
                        />
                        <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
                    </div>

                    <button
                        onClick={openNewModal}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 flex items-center gap-2 transition hover:-translate-y-1">
                        <Plus size={20} />
                        Nueva Contraseña
                    </button>
                </header>

                <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 min-h-[60vh]">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">Últimas agregadas</h2>

                    <div className="grid gap-2">
                        {passwords.map((pass) => (
                            <PasswordRow
                                key={pass.id}
                                id={pass.id}
                                site={pass.site}
                                url={pass.url}
                                username={pass.username}
                                password_decrypted={pass.password_decrypted}
                                onRefresh={fetchPasswords}
                                onEdit={handleEditRequest} // <-- INYECTAMOS EL CONECTOR DEL LÁPIZ
                            />
                        ))}
                    </div>
                </section>
            </main>

            {isModalOpen && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl w-[450px] relative mt-10">

                        <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500">
                            <X size={24} />
                        </button>

                        {/* El Título cambia mágicamente si estás editando */}
                        <h2 className="text-2xl font-bold mb-6 text-gray-800">
                            {editId !== null ? '📝 Editar Contraseña' : 'Caja Fuerte 🔐'}
                        </h2>

                        <div className="flex flex-col gap-4">
                            <input type="text" placeholder="Nombre completo, Ej: Netflix" className="p-3 border rounded-xl outline-none focus:border-blue-500"
                                value={newSite} onChange={(e) => setNewSite(e.target.value)} />

                            <input type="text" placeholder="Link Oficial, Ej: https://netflix.com" className="p-3 border rounded-xl outline-none focus:border-blue-500"
                                value={newUrl} onChange={(e) => setNewUrl(e.target.value)} />

                            <input type="text" placeholder="Tu Usuario o Correo" className="p-3 border rounded-xl outline-none focus:border-blue-500"
                                value={newUser} onChange={(e) => setNewUser(e.target.value)} />

                            <input type="password" placeholder="Tu Contraseña Maestra" className="p-3 border rounded-xl outline-none focus:border-blue-500"
                                value={newPass} onChange={(e) => setNewPass(e.target.value)} />

                            <button onClick={handleSave} className="bg-blue-600 text-white font-bold p-3 mt-4 rounded-xl hover:bg-blue-700 shadow-md">
                                {editId !== null ? 'Sobreescribir Cambios' : 'Encriptar en Windows'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}


