export default function PasswordRow() {
    return (
        <div className="flex justify-between items-center p-5 bg-white shadow-sm border-gray-100 rounded-xl mt-3 hover:shadow-md transition-shadow">
            <div>
                <h3 className="font-bold text-gray-800 text-lg">GitHub</h3>
                <span className="text-gray-500">usuario_dev@gmail.com</span>
            </div>
            <div>
                <button className="bg-blue-50 text-gray-600 font-semibold px-4 py-2 rounded-lg text-sm hover:bg-blue-100 transition mr-2">Copiar</button>
                <button className="bg-gray-50 text-gray-600 font-semibold px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition">editar</button>
            </div>
        </div>
    );
}