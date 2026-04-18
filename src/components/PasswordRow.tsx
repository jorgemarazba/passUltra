import { useState } from 'react';
// IMPORTANTE: Sumamos el Lápiz (Pencil) a nuestra lista de magias
import { Eye, EyeOff, Copy, Trash2, Pencil } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';

interface PasswordRowProps {
    id: number;
    site: string;
    url: string;
    username: string;
    password_decrypted: string;
    onRefresh: () => void;
    // NUEVO CONECTOR: Le pasaremos los datos enteros al Lápiz cuando lo pinchen
    onEdit: (data: any) => void;
}

export default function PasswordRow({ id, site, url, username, password_decrypted, onRefresh, onEdit }: PasswordRowProps) {
    const domain = url.replace('https://', '').replace('http://', '').split('/')[0];
    const [isVisible, setIsVisible] = useState(false);

    function handleCopy() {
        navigator.clipboard.writeText(password_decrypted);
        alert("¡Contraseña copiada lista para pegar!");
    }

    async function handleDelete() {
        if (window.confirm(`¿Seguro que quieres quemar y destruir ${site} de tu bóveda para siempre?`)) {
            try {
                await invoke('delete_password', { id });
                onRefresh();
            } catch (error) {
                console.error("Error destruyendo la contraseña", error);
            }
        }
    }

    return (
        <div className="flex justify-between items-center p-5 bg-white shadow-sm border border-gray-100 rounded-xl mt-3 hover:shadow-md transition-shadow group">

            <div className="flex items-center gap-4">
                <img
                    src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
                    alt={site}
                    className="w-10 h-10 rounded-full bg-gray-50 p-1 border border-gray-200"
                    onError={(e) => e.currentTarget.src = 'https://cdn-icons-png.flaticon.com/512/2885/2885417.png'}
                />
                <div className="flex flex-col">
                    <h3 className="font-bold text-gray-800 text-lg">{site}</h3>
                    <a href={url} target="_blank" rel="noreferrer" className="text-blue-500 text-sm hover:underline">{domain}</a>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <span className="font-mono text-sm bg-gray-50 px-3 py-2 rounded border border-gray-100 tracking-widest w-40 text-center font-bold text-gray-600">
                    {isVisible ? password_decrypted : '••••••••••••'}
                </span>

                <button
                    onClick={() => setIsVisible(!isVisible)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title={isVisible ? "Ocultar Contraseña" : "Ver Contraseña"}
                >
                    {isVisible ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>

                <button
                    onClick={handleCopy}
                    className="bg-blue-50 text-blue-600 font-semibold px-4 py-2 rounded-lg text-sm hover:bg-blue-100 transition flex items-center gap-2 ml-2"
                >
                    <Copy size={16} /> Copiar
                </button>

                {/* NUEVO BOTON AZUL (EL LÁPIZ): Agarra todos su datos y se los avienta al Dashboard */}
                <button
                    onClick={() => onEdit({ id, site, url, username, password_decrypted })}
                    className="p-2 text-gray-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition ml-2 opacity-0 group-hover:opacity-100"
                    title="Editar Contraseña"
                >
                    <Pencil size={20} />
                </button>

                <button
                    onClick={handleDelete}
                    className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition ml-1 opacity-0 group-hover:opacity-100"
                    title="Destruir Permanente"
                >
                    <Trash2 size={20} />
                </button>
            </div>

        </div>
    );
}





