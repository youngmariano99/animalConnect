import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Heart, Calendar, Syringe } from 'lucide-react';
import axios from 'axios';
import type { Animal } from '../types/Animal';

const API_URL = 'http://localhost:5269/api/Animales';

const MyPetsDashboard = () => {
    const navigate = useNavigate();
    const [mascotas, setMascotas] = useState<Animal[]>([]);
    const [loading, setLoading] = useState(true);

    // Mock user ID for now (until Auth is fully integrated)
    const usuarioId = 1;

    useEffect(() => {
        fetchMisMascotas();
    }, []);

    const fetchMisMascotas = async () => {
        try {
            const response = await axios.get(`${API_URL}/usuario/${usuarioId}`);
            setMascotas(response.data);
        } catch (error) {
            console.error("Error fetching pets", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 pb-24">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-heading font-black text-gray-800">Mis Mascotas</h1>
                    <p className="text-gray-500">Gestioná su salud y perfil</p>
                </div>
                <button
                    onClick={() => navigate('/add-pet')}
                    className="bg-black text-white p-3 rounded-full shadow-lg hover:scale-105 transition-transform"
                >
                    <Plus size={24} />
                </button>
            </header>

            {loading ? (
                <div className="text-center py-10">Cargando...</div>
            ) : mascotas.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl shadow-sm border border-gray-100">
                    <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Heart className="text-gray-400 w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Aún no tenés mascotas</h3>
                    <p className="text-gray-500 mb-6 max-w-xs mx-auto">Agrega a tu compañero para llevar su libreta sanitaria digital.</p>
                    <button
                        onClick={() => navigate('/add-pet')}
                        className="bg-black text-white px-6 py-3 rounded-xl font-bold"
                    >
                        Agregar Mascota
                    </button>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {mascotas.map((animal) => (
                        <div
                            key={animal.id}
                            onClick={() => navigate(`/pet/${animal.id}`)}
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow group"
                        >
                            <div className="h-48 overflow-hidden relative">
                                {animal.imagenUrl ? (
                                    <img src={animal.imagenUrl} alt={animal.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                                        <Heart size={48} />
                                    </div>
                                )}
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                                    {animal.especie?.nombre ?? 'Mascota'}
                                </div>
                            </div>
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-xl font-bold text-gray-800">{animal.nombre}</h3>
                                    {animal.vacunas && animal.vacunas.length > 0 && (
                                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1">
                                            <Syringe size={12} /> Al día
                                        </span>
                                    )}
                                </div>
                                <p className="text-gray-500 text-sm line-clamp-2 mb-4">{animal.descripcion}</p>

                                <div className="flex items-center gap-4 text-sm text-gray-500 border-t pt-4">
                                    <div className="flex items-center gap-1">
                                        <Calendar size={16} />
                                        <span>{new Date().getFullYear() - (animal.edadAproximada || 0)} Años</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyPetsDashboard;
