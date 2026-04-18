import { useEffect, useState, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import PasswordRow from '../components/PasswordRow';
import { Search, Plus, X, LogOut, UserCircle, Upload } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { supabase } from '../lib/supabase';
import Papa from 'papaparse';

interface PasswordData {
    id: number;
    site: string;
    url: string;
    username: string;
    password_decrypted: string;
}

// 1. NUESTRA NUEVA REGLA: El Dashboard no entra a menos que le paguen con la "masterKey"
interface DashboardProps {
    masterKey: string;
    userEmail: string; // Recibimos tu identidad de la Nube
}

export default function Dashboard({ masterKey, userEmail }: DashboardProps) {
    const [passwords, setPasswords] = useState<PasswordData[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);

    const [newSite, setNewSite] = useState('');
    const [newUrl, setNewUrl] = useState('');
    const [newUser, setNewUser] = useState('');
    const [newPass, setNewPass] = useState('');

    // La Referencia para el Input Fantasma (Para importar el CSV)
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 2. Modificamos la carga de inicio para inyectarle la masterKey
    async function fetchPasswords() {
        try {
            const data: PasswordData[] = await invoke('get_all_passwords', { masterPass: masterKey });
            setPasswords(data);
        } catch (error) {
            console.error("Error al traer contraseñas:", error);
            // 🚨 SISTEMA DE DEFENSA: Si Rust rechaza la llave, botamos al usuario a patadas
            if (error === "Clave Maestra Incorrecta") {
                alert("🚨 ALARMA DE INTRUSO: La Clave Maestra es Incorrecta. Bloqueando Sistema...");
                window.location.reload(); // Recarga la app regresándote al candado negro
            }
        }
    }

    useEffect(() => { fetchPasswords(); }, []);

    // 4. Mecanismo de Abandono de Búnker
    async function handleLogout() {
        await supabase.auth.signOut();
        window.location.reload(); // Recarga y nos expulsa hacia el inicio
    }

    // 5. Succión Masiva de Archivo CSV (Soporta Google Chrome, Edge o Bitwarden export)
    function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async function(results) {
                // Iteramos a toda velocidad sobre el arreglo de contraseñas de CSV
                for (const row of results.data as any[]) {
                    // Los navegadores por defecto exponen 4 columnas principales
                    if (row.name && row.password) {
                        try {
                            await invoke('encrypt_and_save', {
                                site: row.name,
                                url: row.url || 'http://',
                                user: row.username || 'Sin Usuario',
                                rawPass: row.password,
                                masterPass: masterKey // <--- Le inyectamos tu llave Gema
                            });
                        } catch (err) {
                            console.error("Fallo insertando fila", err);
                        }
                    }
                }
                
                alert(`¡Bóveda Reforzada! Se migraron ${results.data.length} contraseñas exitosamente al núcleo encriptado de Rust.`);
                fetchPasswords(); // Recarga y dibuja todo de golpe en la pantalla
            }
        });

        // Limpia la memoria del botón Fantasma
        if (fileInputRef.current) fileInputRef.current.value = '';
    }

    function openNewModal() {
        setEditId(null);
        setNewSite(''); setNewUrl(''); setNewUser(''); setNewPass('');
        setIsModalOpen(true);
    }

    function handleEditRequest(pass: any) {
        setEditId(pass.id);
        setNewSite(pass.site);
        setNewUrl(pass.url);
        setNewUser(pass.username);
        setNewPass(pass.password_decrypted);
        setIsModalOpen(true);
    }

    // 3. Modificamos el guardado para inyectarle la masterKey 
    async function handleSave() {
        if (!newSite || !newUrl || !newUser || !newPass) {
            alert("Por favor llena todos los recuadritos primero");
            return;
        }

        try {
            if (editId !== null) {
                await invoke('update_password', {
                    id: editId,
                    site: newSite,
                    url: newUrl,
                    user: newUser,
                    rawPass: newPass,
                    masterPass: masterKey // <-- El Pasaporte Criptográfico Privado
                });
            } else {
                await invoke('encrypt_and_save', {
                    site: newSite,
                    url: newUrl,
                    user: newUser,
                    rawPass: newPass,
                    masterPass: masterKey // <-- El Pasaporte Criptográfico Privado
                });
            }

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
            <Sidebar userEmail={userEmail} onLogout={handleLogout} />

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

                    <div className="flex gap-4">
                        {/* El Input Fantasma */}
                        <input
                            type="file"
                            accept=".csv"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            className="hidden"
                        />

                        {/* El Gatillo que tú ves en la pantalla */}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-200 flex items-center gap-2 transition hover:-translate-y-1">
                            <Upload size={20} />
                            Subir CSV
                        </button>

                        <button
                            onClick={openNewModal}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 flex items-center gap-2 transition hover:-translate-y-1">
                            <Plus size={20} />
                            Nueva Contraseña
                        </button>
                    </div>
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
                                onEdit={handleEditRequest}
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
