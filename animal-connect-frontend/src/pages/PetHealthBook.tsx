import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Syringe, Weight, Activity, Plus } from 'lucide-react';
import type { Animal } from '../types/Animal';

const API_URL = 'http://localhost:5269/api/Animales';

const PetHealthBook = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [animal, setAnimal] = useState<Animal | null>(null);
    const [loading, setLoading] = useState(true);
    const [showVaccineForm, setShowVaccineForm] = useState(false);

    const [newVaccine, setNewVaccine] = useState({
        nombre: '',
        fechaAplicacion: new Date().toISOString().split('T')[0],
        veterinario: ''
    });

    useEffect(() => {
        if (id) fetchAnimal(id);
    }, [id]);

    const fetchAnimal = async (animalId: string) => {
        try {
            const response = await axios.get(`${API_URL}/${animalId}`);
            setAnimal(response.data);
        } catch (error) {
            console.error("Error fetching animal", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddVaccine = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/${id}/vacunas`, newVaccine);
            setShowVaccineForm(false);
            if (id) fetchAnimal(id); // Reload to see new vaccine
            setNewVaccine({ nombre: '', fechaAplicacion: new Date().toISOString().split('T')[0], veterinario: '' });
        } catch (error) {
            console.error("Error adding vaccine", error);
            alert("Error al agregar vacuna");
        }
    };

    if (loading) return <div className="p-10 text-center">Cargando libreta...</div>;
    if (!animal) return <div className="p-10 text-center">No se encontró la mascota.</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header with Image Background */}
            <div className="relative h-64 bg-gray-900">
                {animal.imagenUrl ? (
                    <img src={animal.imagenUrl} alt={animal.nombre} className="w-full h-full object-cover opacity-60" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">Sin Foto</div>
                )}
                <div className="absolute top-0 left-0 right-0 p-4 flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 bg-white/20 backdrop-blur rounded-full hover:bg-white/40 text-white">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                    <h1 className="text-4xl font-black text-white">{animal.nombre}</h1>
                    <p className="text-white/80 font-medium">{animal.especie?.nombre} • {animal.edadAproximada} Años</p>
                </div>
            </div>

            <div className="p-6 max-w-4xl mx-auto -mt-6 relative z-10">

                {/* 1. Bio-Resumen */}
                <div className="bg-white rounded-3xl shadow-lg p-6 mb-6 flex justify-around text-center">
                    <div>
                        <div className="text-gray-400 text-xs font-bold uppercase mb-1">Peso</div>
                        <div className="text-2xl font-black text-gray-800 flex items-center justify-center gap-1">
                            <Weight className="w-5 h-5 text-blue-500" />
                            {animal.pesoActual || '-'} <span className="text-sm text-gray-400">kg</span>
                        </div>
                    </div>
                    <div className="w-px bg-gray-100"></div>
                    <div>
                        <div className="text-gray-400 text-xs font-bold uppercase mb-1">Energía</div>
                        <div className="text-2xl font-black text-gray-800 flex items-center justify-center gap-1">
                            <Activity className="w-5 h-5 text-orange-500" />
                            {animal.nivelEnergia}/10
                        </div>
                    </div>
                </div>

                {/* 2. Libreta Sanitaria (Vacunas) */}
                <section>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <Syringe className="text-green-600" /> Libreta Sanitaria
                        </h2>
                        <button
                            onClick={() => setShowVaccineForm(!showVaccineForm)}
                            className="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1 hover:bg-green-200 transition-colors"
                        >
                            <Plus size={16} /> Agregar
                        </button>
                    </div>

                    {showVaccineForm && (
                        <div className="bg-green-50 p-4 rounded-2xl mb-6 border border-green-100 animate-in fade-in slide-in-from-top-4">
                            <h3 className="font-bold text-green-800 mb-2">Nueva Vacuna / Evento</h3>
                            <form onSubmit={handleAddVaccine} className="space-y-3">
                                <input
                                    className="w-full p-3 rounded-xl border-none focus:ring-2 focus:ring-green-500"
                                    placeholder="Nombre (ej: Séxtuple, Anti-rábica)"
                                    required
                                    value={newVaccine.nombre}
                                    onChange={e => setNewVaccine({ ...newVaccine, nombre: e.target.value })}
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="date"
                                        className="w-full p-3 rounded-xl border-none focus:ring-2 focus:ring-green-500"
                                        required
                                        value={newVaccine.fechaAplicacion}
                                        onChange={e => setNewVaccine({ ...newVaccine, fechaAplicacion: e.target.value })}
                                    />
                                    <input
                                        className="w-full p-3 rounded-xl border-none focus:ring-2 focus:ring-green-500"
                                        placeholder="Veterinario (Opcional)"
                                        value={newVaccine.veterinario}
                                        onChange={e => setNewVaccine({ ...newVaccine, veterinario: e.target.value })}
                                    />
                                </div>
                                <button type="submit" className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700">
                                    Registrar en Libreta
                                </button>
                            </form>
                        </div>
                    )}

                    <div className="space-y-3">
                        {animal.vacunas && animal.vacunas.length > 0 ? (
                            animal.vacunas.map((vacuna) => (
                                <div key={vacuna.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center">
                                    <div>
                                        <h4 className="font-bold text-gray-800">{vacuna.nombre}</h4>
                                        <p className="text-xs text-gray-500">Vet: {vacuna.veterinario || 'Desconocido'}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-green-700">{new Date(vacuna.fechaAplicacion).toLocaleDateString()}</div>
                                        {/* <div className="text-xs text-orange-500">Vence: 12/12/2026</div> */}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 bg-white rounded-2xl border border-dashed border-gray-300">
                                <p className="text-gray-400">Sin registros de vacunación.</p>
                            </div>
                        )}
                    </div>
                </section>

            </div>
        </div>
    );
};

export default PetHealthBook;
