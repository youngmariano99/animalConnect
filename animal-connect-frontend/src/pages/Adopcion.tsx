import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, AlertCircle, CheckCircle2, Percent, Ban, ArrowRight, Heart, X, Wand2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PetCard from '../components/PetCard';

// Dummy interfaces pending full Types
interface MatchResult {
    animal: any;
    porcentajeMatch: number;
    razonesMatch: string[];
}

const Adopcion = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [matches, setMatches] = useState<MatchResult[]>([]);
    const [filter, setFilter] = useState<'estricto' | 'flexible' | 'todos'>('estricto');
    const [selectedMatch, setSelectedMatch] = useState<MatchResult | null>(null);

    const user = JSON.parse(localStorage.getItem('zoonosis_user') || '{}');

    useEffect(() => {
        // Simulate API fetch delay
        fetchMatches();
    }, []);

    const fetchMatches = async () => {
        try {
            if (!user.id || !user.tienePerfilMatch) {
                setLoading(false);
                return;
            }

            // Mock coordinates for now
            const lat = -38.0;
            const lng = -61.0;

            const res = await fetch(`http://localhost:5269/api/Match/${user.id}?lat=${lat}&lng=${lng}&radio=100`);
            if (res.ok) {
                const data = await res.json();
                setMatches(data);
            }
        } catch (error) {
            console.error("Error fetching matches:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredMatches = matches.filter(m => {
        if (filter === 'estricto') return m.porcentajeMatch >= 80;
        if (filter === 'flexible') return m.porcentajeMatch >= 50;
        return true;
    });

    const getBadges = (score: number) => {
        if (score >= 80) return { bg: 'bg-green-100', text: 'text-green-700', label: 'Excelente Match' };
        if (score >= 50) return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Bueno' };
        return { bg: 'bg-red-50', text: 'text-red-500', label: 'Bajo' };
    };

    if (!user.id || !user.tienePerfilMatch) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
                <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <Heart className="w-12 h-12 text-orange-500" />
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Encuentra tu compañero ideal</h1>
                <p className="text-gray-500 mb-8 max-w-xs mx-auto">Nuestro algoritmo analiza tu estilo de vida para sugerirte mascotas compatibles.</p>
                <button
                    onClick={() => navigate(user.id ? '/quiz' : '/login')}
                    className="bg-gray-900 text-white px-8 py-3 rounded-full font-bold shadow-xl hover:scale-105 transition-transform flex items-center gap-2"
                >
                    {user.id ? 'Comenzar Test' : 'Iniciar Sesión'} <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white p-4 sticky top-0 z-40 border-b border-gray-100 flex items-center justify-between">
                <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <span className="bg-orange-100 p-1.5 rounded-lg text-orange-600"><Percent className="w-5 h-5" /></span>
                    Compatibilidad
                </h1>
            </div>

            {/* Filters */}
            <div className="p-4 flex gap-2 overflow-x-auto">
                {[
                    { id: 'estricto', label: 'Compatibles (+80%)', icon: CheckCircle2 },
                    { id: 'flexible', label: 'Flexibles (+50%)', icon: Filter },
                    { id: 'todos', label: 'Ver Todos', icon: Heart },
                ].map(btn => (
                    <button
                        key={btn.id}
                        onClick={() => setFilter(btn.id as any)}
                        className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-colors ${filter === btn.id
                                ? 'bg-gray-800 text-white shadow-lg'
                                : 'bg-white text-gray-600 border border-gray-200'
                            }`}
                    >
                        {React.createElement(btn.icon, { className: "w-4 h-4" })}
                        {btn.label}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="px-4 pb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                    <div className="col-span-full py-20 text-center text-gray-400">
                        <Heart className="w-12 h-12 mx-auto animate-bounce mb-4 text-gray-300" />
                        <p>Buscando matches perfectos...</p>
                    </div>
                ) : filteredMatches.length === 0 ? (
                    <div className="col-span-full py-10 text-center bg-white rounded-2xl border border-dashed border-gray-300">
                        <Filter className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                        <p className="text-gray-500">No hay mascotas con este nivel de compatibilidad.</p>
                        <button onClick={() => setFilter('todos')} className="text-blue-500 font-bold mt-2 hover:underline">Ver todas las mascotas</button>
                    </div>
                ) : (
                    filteredMatches.map((match, idx) => (
                        <div key={idx} className="relative group">
                            <PetCard
                                animal={match.animal}
                                onClick={() => setSelectedMatch(match)}
                            />
                            {/* Overlay Badge */}
                            <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold shadow-md z-10 flex items-center gap-1 ${getBadges(match.porcentajeMatch).bg} ${getBadges(match.porcentajeMatch).text}`}>
                                <Percent className="w-3 h-3" />
                                {match.porcentajeMatch}% Match
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Match Details Modal */}
            <AnimatePresence>
                {selectedMatch && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
                        onClick={() => setSelectedMatch(null)}
                    >
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="relative h-60">
                                <img src={selectedMatch.animal.imagenUrl || 'https://via.placeholder.com/400'} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
                                    <div>
                                        <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold mb-2 ${getBadges(selectedMatch.porcentajeMatch).bg} ${getBadges(selectedMatch.porcentajeMatch).text}`}>
                                            <Percent className="w-3 h-3" /> {selectedMatch.porcentajeMatch}% Compatible
                                        </div>
                                        <h2 className="text-3xl font-extrabold text-white">{selectedMatch.animal.nombre}</h2>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedMatch(null)} className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 p-2 rounded-full text-white backdrop-blur-md transition">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="p-6">
                                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <Wand2 className="w-5 h-5 text-purple-500" />
                                    Análisis del Algoritmo
                                </h3>

                                <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                                    {selectedMatch.razonesMatch?.map((razon, i) => {
                                        const isNegative = razon.includes('❌') || razon.includes('⚠️');
                                        return (
                                            <div key={i} className={`p-3 rounded-xl border flex gap-3 items-start ${isNegative ? 'bg-orange-50 border-orange-100' : 'bg-green-50 border-green-100'}`}>
                                                <div className={`mt-0.5 ${isNegative ? 'text-orange-500' : 'text-green-500'}`}>
                                                    {isNegative ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                                                </div>
                                                <p className="text-sm text-gray-700 leading-snug">{razon.replace(/✅|❌|⚠️/g, '')}</p>
                                            </div>
                                        )
                                    })}
                                </div>

                                <a
                                    href={`https://wa.me/549${selectedMatch.animal.telefonoContacto || ''}`}
                                    target="_blank"
                                    className="block w-full bg-green-500 text-white text-center py-4 rounded-xl font-bold hover:bg-green-600 transition shadow-lg shadow-green-500/20"
                                >
                                    ¡Quiero Adoptarlo!
                                </a>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Adopcion;