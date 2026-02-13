import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Save, Dog, Cat, Activity, Heart, AlertCircle } from 'lucide-react';

const API_URL = 'http://localhost:5269/api/Animales';

const AddPet = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Initial State with Bio-Tech Defaults
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        edadAproximada: 0,
        especieId: 1, // 1=Perro, 2=Gato
        estadoId: 1, // 1=Adopcion (But if it's My Pet, maybe it's not Adopcion? Or maybe "No Disponible"? Let's assume 3=Encontrado/Tenencia?)
        // Actually, if I add my pet, I might want to put it up for adoption OR just keep it. 
        // Let's default to a new status "4 = Con Dueño" if it exists, or just manage it locally. 
        // For now, let's use 1 and assume user can change it.
        usuarioId: 1, // Mock
        imagenUrl: '',

        // Bio-Tech
        nivelEnergia: 5,
        nivelSociabilidadNinos: 5,
        nivelSociabilidadPerros: 5,
        nivelSociabilidadGatos: 5,
        toleranciaSoledad: 5,
        nivelMantenimiento: 5,
        pesoActual: 0
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Need to convert to FormData if sending file, but here we just send JSON or simplistic form
            // The Backend expects [FromForm] so we must use FormData object
            const data = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                data.append(key, value.toString());
            });

            await axios.post(API_URL, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            navigate('/mis-mascotas');
        } catch (error) {
            console.error("Error creating pet", error);
            alert("Hubo un error al guardar.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white pb-20">
            {/* Header */}
            <div className="sticky top-0 bg-white/80 backdrop-blur border-b border-gray-100 z-10 px-6 py-4 flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft className="w-6 h-6 text-gray-700" />
                </button>
                <h1 className="text-xl font-bold text-gray-900">Nueva Mascota</h1>
            </div>

            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6 space-y-8">

                {/* 1. Datos Básicos */}
                <section>
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Heart className="text-red-500 w-5 h-5" /> Datos Básicos
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                            <input
                                required
                                type="text"
                                className="w-full p-4 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-black transition-all font-bold text-lg"
                                value={formData.nombre}
                                onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                                placeholder="Ej: Firulais"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Especie</label>
                                <div className="flex bg-gray-100 p-1 rounded-xl">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, especieId: 1 })}
                                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-all ${formData.especieId === 1 ? 'bg-white shadow text-black' : 'text-gray-400'}`}
                                    >
                                        <Dog size={18} /> Perro
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, especieId: 2 })}
                                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-all ${formData.especieId === 2 ? 'bg-white shadow text-black' : 'text-gray-400'}`}
                                    >
                                        <Cat size={18} /> Gato
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Edad (Aprox)</label>
                                <input
                                    type="number"
                                    className="w-full p-4 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-black transition-all"
                                    value={formData.edadAproximada}
                                    onChange={e => setFormData({ ...formData, edadAproximada: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                            <textarea
                                rows={3}
                                className="w-full p-4 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-black transition-all"
                                value={formData.descripcion}
                                onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                                placeholder="Color, señas particulares..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">URL Foto (Opcional)</label>
                            <input
                                type="text"
                                className="w-full p-4 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-black transition-all"
                                value={formData.imagenUrl}
                                onChange={e => setFormData({ ...formData, imagenUrl: e.target.value })}
                                placeholder="https://..."
                            />
                        </div>
                    </div>
                </section>

                {/* 2. Bio-Tech (Etograma) */}
                <section className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100">
                    <h2 className="text-lg font-bold text-blue-800 mb-2 flex items-center gap-2">
                        <Activity className="text-blue-600 w-5 h-5" /> Bio-Perfil (Etograma)
                    </h2>
                    <p className="text-sm text-blue-600/80 mb-6">Fundamental para el algoritmo de match.</p>

                    <div className="space-y-6">
                        <RangeSlider
                            label="Nivel de Energía"
                            minLabel="Sofá"
                            maxLabel="Atleta"
                            val={formData.nivelEnergia}
                            setVal={v => setFormData({ ...formData, nivelEnergia: v })}
                        />
                        <RangeSlider
                            label="Sociabilidad con Niños"
                            minLabel="No tolera"
                            maxLabel="Ama niños"
                            val={formData.nivelSociabilidadNinos}
                            setVal={v => setFormData({ ...formData, nivelSociabilidadNinos: v })}
                        />
                        <RangeSlider
                            label="Sociabilidad con Perros"
                            minLabel="Agresivo"
                            maxLabel="Juguetón"
                            val={formData.nivelSociabilidadPerros}
                            setVal={v => setFormData({ ...formData, nivelSociabilidadPerros: v })}
                        />
                        <RangeSlider
                            label="Sociabilidad con Gatos"
                            minLabel="Cazador"
                            maxLabel="Amigo"
                            val={formData.nivelSociabilidadGatos}
                            setVal={v => setFormData({ ...formData, nivelSociabilidadGatos: v })}
                        />
                        <RangeSlider
                            label="Tolerancia a Soledad"
                            minLabel="Ansioso"
                            maxLabel="Independiente"
                            val={formData.toleranciaSoledad}
                            setVal={v => setFormData({ ...formData, toleranciaSoledad: v })}
                        />
                    </div>
                </section>

                {/* 3. Salud Base */}
                <section>
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <AlertCircle className="text-green-500 w-5 h-5" /> Datos Clínicos
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg)</label>
                            <input
                                type="number"
                                className="w-full p-4 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-black transition-all"
                                value={formData.pesoActual}
                                onChange={e => setFormData({ ...formData, pesoActual: parseFloat(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Costo Mensual (Est. 1-10)</label>
                            <input
                                type="number"
                                max={10}
                                min={1}
                                className="w-full p-4 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-black transition-all"
                                value={formData.nivelMantenimiento}
                                onChange={e => setFormData({ ...formData, nivelMantenimiento: parseInt(e.target.value) })}
                            />
                        </div>
                    </div>
                </section>

                <div className="pt-6">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg shadow-xl hover:bg-gray-800 transition-transform active:scale-95 flex items-center justify-center gap-2"
                    >
                        {loading ? 'Guardando...' : <><Save size={20} /> Guardar Perfil</>}
                    </button>
                </div>
            </form>
        </div>
    );
};

// Helper Component
const RangeSlider = ({ label, minLabel, maxLabel, val, setVal }: { label: string, minLabel: string, maxLabel: string, val: number, setVal: (v: number) => void }) => (
    <div>
        <div className="flex justify-between mb-2">
            <label className="font-bold text-gray-700 text-sm">{label}</label>
            <span className="font-mono bg-blue-100 text-blue-700 px-2 rounded text-xs py-0.5">{val}/10</span>
        </div>
        <input
            type="range" min="1" max="10"
            value={val} onChange={e => setVal(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex justify-between mt-1 text-xs text-gray-400 font-medium">
            <span>{minLabel}</span>
            <span>{maxLabel}</span>
        </div>
    </div>
);

export default AddPet;
