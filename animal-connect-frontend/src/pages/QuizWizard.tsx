import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MatchService } from '../services/MatchService';
import type { MatchRequest, MatchResult } from '../services/MatchService';
import { ChevronRight, ChevronLeft, PawPrint, Home, Clock, Activity, Baby, Cat, Dog } from 'lucide-react';

export const QuizWizard: React.FC = () => {
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<MatchResult[] | null>(null);

    const [formData, setFormData] = useState<MatchRequest>({
        nivelActividad: 5,
        horasFuera: 4,
        tieneNinos: false,
        tienePerros: false,
        tieneGatos: false,
        tipoVivienda: 'Casa',
        presupuestoMensual: 5
    });

    const handleNext = () => {
        if (step < questions.length - 1) {
            setStep(step + 1);
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (step > 0) setStep(step - 1);
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const matches = await MatchService.calculateMatch(formData);
            setResults(matches);
            // Navigate to results or show inline? Let's show inline or navigate.
            // navigate('/match-results', { state: { matches } });
        } catch (error) {
            console.error(error);
            alert("Error calculando el match. Intenta nuevamente.");
        } finally {
            setLoading(false);
        }
    };

    const questions = [
        {
            id: 'vivienda',
            title: '¿Dónde viviría tu mascota?',
            icon: <Home className="w-12 h-12 text-blue-500" />,
            component: (
                <div className="flex gap-4 justify-center">
                    <button
                        onClick={() => setFormData({ ...formData, tipoVivienda: 'Casa' })}
                        className={`p-6 rounded-xl border-2 transition-all ${formData.tipoVivienda === 'Casa' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                    >
                        <Home className="w-8 h-8 mx-auto mb-2" />
                        <span className="block font-semibold">Casa</span>
                    </button>
                    <button
                        onClick={() => setFormData({ ...formData, tipoVivienda: 'Departamento' })}
                        className={`p-6 rounded-xl border-2 transition-all ${formData.tipoVivienda === 'Departamento' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                    >
                        <div className="w-8 h-8 mx-auto mb-2 bg-gray-200 rounded" />
                        <span className="block font-semibold">Depto</span>
                    </button>
                </div>
            )
        },
        {
            id: 'actividad',
            title: '¿Cuál es tu nivel de actividad?',
            subtitle: '1: Sofá y películas - 10: Maratón diaria',
            icon: <Activity className="w-12 h-12 text-orange-500" />,
            component: (
                <div className="w-full max-w-md mx-auto">
                    <input
                        type="range"
                        min="1"
                        max="10"
                        value={formData.nivelActividad}
                        onChange={(e) => setFormData({ ...formData, nivelActividad: parseInt(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                    <div className="flex justify-between mt-2 text-gray-500 font-medium">
                        <span>Relajado (1)</span>
                        <span className="text-orange-600 font-bold text-xl">{formData.nivelActividad}</span>
                        <span>Atleta (10)</span>
                    </div>
                </div>
            )
        },
        {
            id: 'tiempo',
            title: '¿Cuántas horas pasaría sola la mascota?',
            icon: <Clock className="w-12 h-12 text-purple-500" />,
            component: (
                <div className="w-full max-w-md mx-auto">
                    <input
                        type="range"
                        min="0"
                        max="12"
                        step="1"
                        value={formData.horasFuera}
                        onChange={(e) => setFormData({ ...formData, horasFuera: parseInt(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                    <div className="flex justify-between mt-2 text-gray-500 font-medium">
                        <span>Siempre acompañado (0h)</span>
                        <span className="text-purple-600 font-bold text-xl">{formData.horasFuera} h</span>
                        <span>Jornada completa (12h+)</span>
                    </div>
                </div>
            )
        },
        {
            id: 'convivencia',
            title: '¿Con quiénes conviviría?',
            icon: <PawPrint className="w-12 h-12 text-green-500" />,
            component: (
                <div className="space-y-4 max-w-xs mx-auto">
                    <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input type="checkbox" checked={formData.tieneNinos} onChange={(e) => setFormData({ ...formData, tieneNinos: e.target.checked })} className="w-5 h-5 accent-green-500" />
                        <Baby className="text-gray-600" />
                        <span className="font-medium">Niños pequeños</span>
                    </label>
                    <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input type="checkbox" checked={formData.tienePerros} onChange={(e) => setFormData({ ...formData, tienePerros: e.target.checked })} className="w-5 h-5 accent-green-500" />
                        <Dog className="text-gray-600" />
                        <span className="font-medium">Otros Perros</span>
                    </label>
                    <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input type="checkbox" checked={formData.tieneGatos} onChange={(e) => setFormData({ ...formData, tieneGatos: e.target.checked })} className="w-5 h-5 accent-green-500" />
                        <Cat className="text-gray-600" />
                        <span className="font-medium">Gatos</span>
                    </label>
                </div>
            )
        }
    ];

    if (results) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">¡Tus Compatibilidades!</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {results.map((match) => (
                        <div key={match.animal.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                            <div className="relative h-48 bg-gray-200">
                                {match.animal.imagenUrl ? (
                                    <img src={match.animal.imagenUrl} alt={match.animal.nombre} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400"><PawPrint size={48} /></div>
                                )}
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full shadow-sm">
                                    <span className={`font-bold ${match.matchPercentage > 80 ? 'text-green-600' : match.matchPercentage > 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                                        {match.matchPercentage}% Match
                                    </span>
                                </div>
                            </div>
                            <div className="p-6">
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">{match.animal.nombre}</h2>
                                <p className="text-gray-600 mb-4 line-clamp-2">{match.animal.descripcion}</p>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {match.etiquetas.map((tag, idx) => (
                                        <span key={idx} className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-medium">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                <button className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors">
                                    Ver Perfil Completo
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="text-center mt-12">
                    <button onClick={() => setResults(null)} className="text-gray-500 underline">Volver al Quiz</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-xl overflow-hidden min-h-[500px] flex flex-col">
                {/* Progress Bar */}
                <div className="bg-gray-100 h-2 w-full">
                    <motion.div
                        className="h-full bg-indigo-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${((step + 1) / questions.length) * 100}%` }}
                    />
                </div>

                <div className="flex-1 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.3 }}
                            className="w-full"
                        >
                            <div className="mb-6 flex justify-center">
                                <div className="p-4 bg-indigo-50 rounded-full">
                                    {questions[step].icon}
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">{questions[step].title}</h2>
                            {questions[step].subtitle && <p className="text-gray-500 mb-6">{questions[step].subtitle}</p>}

                            <div className="mt-8">
                                {questions[step].component}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="p-8 border-t bg-gray-50 flex justify-between items-center">
                    <button
                        onClick={handleBack}
                        disabled={step === 0}
                        className={`flex items-center text-gray-600 font-medium px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors ${step === 0 ? 'opacity-0 pointer-events-none' : ''}`}
                    >
                        <ChevronLeft size={20} className="mr-1" /> Anterior
                    </button>

                    <button
                        onClick={handleNext}
                        disabled={loading}
                        className="bg-black text-white px-8 py-3 rounded-xl font-bold flex items-center hover:bg-gray-800 transition-all transform hover:scale-105 shadow-lg shadow-indigo-200"
                    >
                        {loading ? 'Calculando...' : step === questions.length - 1 ? 'Ver Matches' : 'Siguiente'}
                        {!loading && step < questions.length - 1 && <ChevronRight size={20} className="ml-2" />}
                    </button>
                </div>
            </div>
        </div>
    );
};
