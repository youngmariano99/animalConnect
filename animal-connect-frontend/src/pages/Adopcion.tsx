import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Importamos Link para el botón de login

interface Animal {
    id: number;
    nombre: string;
    descripcion: string;
    imagenUrl: string;
    edad: string;
    ubicacion: string;
    esPerro: boolean;
    sexo: 'Macho' | 'Hembra';
    matchPorcentaje?: number;
}

const Adopcion = () => {
    const [animales, setAnimales] = useState<Animal[]>([]);
    const [cargando, setCargando] = useState(true);
    
    // --- NUEVO: Estado para el Modal y el Usuario ---
    // Si es null, el modal está cerrado. Si tiene un animal, el modal se abre con sus datos.
    const [matchSeleccionado, setMatchSeleccionado] = useState<Animal | null>(null);
    
    // Leemos el usuario igual que en el Navbar (esto lo mejoraremos luego con Context)
    const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');

    

    useEffect(() => {
        const cargarDatos = () => {
            // Simulamos datos del backend
            const datosFalsos: Animal[] = [
                {
                    id: 1,
                    nombre: "Coco",
                    descripcion: "Un compañero fiel para salir a correr.",
                    imagenUrl: "https://images.unsplash.com/photo-1543466835-00a7907e9de1",
                    edad: "2 años",
                    ubicacion: "Av. Principal 123",
                    esPerro: true,
                    sexo: "Macho",
                    matchPorcentaje: 95
                },
                {
                    id: 2,
                    nombre: "Luna",
                    descripcion: "Tranquila y cariñosa, ideal para departamento.",
                    imagenUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba",
                    edad: "5 meses",
                    ubicacion: "Barrio Norte",
                    esPerro: false,
                    sexo: "Hembra",
                    matchPorcentaje: 80
                }
            ];
            
            setTimeout(() => {
                setAnimales(datosFalsos);
                setCargando(false);
            }, 1000);
        };
        cargarDatos();
    }, []);

    return (
        <div className="container mx-auto px-4 mt-8 pb-20 relative">
            
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Adopción Responsable</h1>
                    <p className="text-gray-500 text-sm">Estos animales buscan un hogar que se adapte a ellos.</p>
                </div>
            </div>

            {/* --- NUEVO: Banner de Login (Renderizado Condicional) --- */}
            {/* Si NO hay usuario (!usuario) Y (&&) mostramos el div */}
            {!usuario && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg mb-8 shadow-sm">
                    <h2 className="text-xl font-bold text-blue-800">
                        <i className="fa-solid fa-circle-info mr-2"></i>
                        ¿Buscas a tu compañero ideal?
                    </h2>
                    <p className="text-blue-700 mt-2">
                        Inicia sesión para ver el <strong>% de compatibilidad real</strong> basado en tu estilo de vida.
                    </p>
                    <div className="mt-4">
                        <Link to="/login" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition">
                            Iniciar Sesión
                        </Link>
                    </div>
                </div>
            )}

            {cargando ? (
                <div className="text-center py-20">
                    <i className="fa-solid fa-spinner fa-spin text-3xl text-orange-600"></i>
                    <p className="mt-2 text-gray-500">Buscando amigos peludos...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {animales.map((animal) => (
                        <div key={animal.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden border border-gray-100 group">
                            <div className="h-48 overflow-hidden relative">
                                <img src={animal.imagenUrl} alt={animal.nombre} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                                {/* Solo mostramos el badge si hay usuario logueado */}
                                {usuario && (
                                    <span className="absolute top-3 right-3 bg-white/90 px-2 py-1 rounded-lg text-xs font-bold text-green-700 shadow-sm">
                                        {animal.matchPorcentaje}% Match
                                    </span>
                                )}
                            </div>

                            <div className="p-4">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-lg text-gray-800">{animal.nombre}</h3>
                                    {animal.esPerro ? 
                                        <i className="fa-solid fa-dog text-blue-500 bg-blue-50 p-2 rounded-full"></i> : 
                                        <i className="fa-solid fa-cat text-purple-500 bg-purple-50 p-2 rounded-full"></i>
                                    }
                                </div>
                                <p className="text-gray-500 text-sm mt-1 line-clamp-2">{animal.descripcion}</p>
                                
                                <div className="mt-4 flex items-center text-xs text-gray-400 space-x-4">
                                    <span><i className="fa-solid fa-venus-mars mr-1"></i> {animal.sexo}</span>
                                    <span><i className="fa-solid fa-cake-candles mr-1"></i> {animal.edad}</span>
                                </div>

                                {/* --- NUEVO: Botón activa el estado del Modal --- */}
                                <button 
                                    onClick={() => setMatchSeleccionado(animal)}
                                    className="w-full mt-4 bg-orange-600 text-white py-2 rounded-xl font-bold hover:bg-orange-700 transition"
                                >
                                    Ver Detalles / Match
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* --- NUEVO: EL MODAL (Renderizado Condicional) --- */}
            {/* Solo se dibuja si matchSeleccionado NO es null */}
            {matchSeleccionado && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
                    {/* Contenido del Modal */}
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-[fadeIn_0.3s_ease-out]">
                        
                        {/* Header con Imagen */}
                        <div className="h-40 bg-gray-200 relative">
                            <img src={matchSeleccionado.imagenUrl} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                                <h2 className="text-white text-2xl font-bold">{matchSeleccionado.nombre}</h2>
                            </div>
                            {/* Botón de cerrar: Pone el estado en null */}
                            <button 
                                onClick={() => setMatchSeleccionado(null)}
                                className="absolute top-2 right-2 bg-black/50 text-white w-8 h-8 rounded-full hover:bg-black/80 flex items-center justify-center"
                            >
                                &times;
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <p className="text-sm text-gray-500 font-bold uppercase">Compatibilidad</p>
                                    <p className="text-xs text-gray-400">Basado en tu perfil</p>
                                </div>
                                <div className="text-2xl font-bold text-green-600 bg-green-50 px-4 py-2 rounded-lg">
                                    {matchSeleccionado.matchPorcentaje || '?'}%
                                </div>
                            </div>

                            <p className="text-gray-600 mb-6 text-sm">
                                {matchSeleccionado.descripcion}
                            </p>

                            <div className="space-y-3">
                                <button className="w-full bg-green-500 text-white py-3 rounded-xl font-bold hover:bg-green-600 transition shadow-md flex items-center justify-center">
                                    <i className="fa-brands fa-whatsapp text-xl mr-2"></i> Contactar ahora
                                </button>
                                <button 
                                    onClick={() => setMatchSeleccionado(null)}
                                    className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Adopcion;