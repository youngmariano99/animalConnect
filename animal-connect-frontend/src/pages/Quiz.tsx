import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Home, Clock, GraduationCap,
    ChevronRight, ArrowLeft, Wand2, Heart
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Quiz = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [answers, setAnswers] = useState<any>({
        tipoVivienda: 'Departamento',
        horasFuera: 4,
        nivelExperiencia: 1,
        telefono: '',
        preferencias: {} // For dynamic attributes if needed later
    });

    // Calculate availability label based on hours
    const getAvailabilityLabel = (hours: number) => {
        if (hours <= 4) return { text: "Alta Disponibilidad (Ideal cachorros)", color: "text-green-600" };
        if (hours <= 8) return { text: "Disponibilidad Media (Estándar)", color: "text-blue-600" };
        return { text: "Poca Disponibilidad (Adultos indep.)", color: "text-orange-600" };
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const user = JSON.parse(localStorage.getItem('usuario') || '{}');
            if (!user.id) {
                alert("Debes iniciar sesión para guardar tu perfil.");
                navigate('/login');
                return;
            }

            // Calculate logic for backend compatibility
            // 1: High Availability, 2: Medium, 3: Low
            const availabilityScore = answers.horasFuera > 9 ? 1 : (answers.horasFuera > 5 ? 2 : 3);

            const payload = {
                usuarioId: user.id,
                telefono: answers.telefono,
                tipoVivienda: answers.tipoVivienda,
                tienePatio: answers.tipoVivienda === 'CasaPatio' || answers.tipoVivienda === 'PH',
                horasFuera: availabilityScore,
                nivelExperiencia: parseInt(answers.nivelExperiencia),
                // Defaults for MVP
                nivelActividad: 2,
                tieneHijos: false,
                tieneOtrasMascotas: false,
                preferencias: []
            };

            const res = await fetch('http://localhost:5269/api/Perfil', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                // Update local user state
                user.tienePerfilMatch = true;
                localStorage.setItem('usuario', JSON.stringify(user));
                navigate('/adopcion'); // Redirect to matches
            } else {
                alert("Error al guardar perfil.");
            }
        } catch (error) {
            console.error(error);
            alert("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        {
            title: "Hogar y Entorno",
            icon: Home,
            content: (
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">¿Dónde viviría la mascota?</label>
                        <div className="grid grid-cols-1 gap-3">
                            {[
                                { val: 'Departamento', label: '🏢 Departamento (Sin patio)' },
                                { val: 'PH', label: '🏘️ PH / Duplex (Patio pequeño)' },
                                { val: 'Casa', label: '🏠 Casa Abierta (Sin cerco)' },
                                { val: 'CasaPatio', label: '🏡 Casa con Patio Cerrado' }
                            ].map((opt) => (
                                <button
                                    key={opt.val}
                                    onClick={() => setAnswers({ ...answers, tipoVivienda: opt.val })}
                                    className={`p-4 rounded-xl border text-left transition-all ${answers.tipoVivienda === opt.val
                                        ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-500'
                                        : 'border-gray-200 hover:border-orange-300'
                                        }`}
                                >
                                    <span className="font-bold text-gray-700">{opt.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "Tiempo y Rutina",
            icon: Clock,
            content: (
                <div className="space-y-8">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-4">
                            ¿Cuántas horas al día pasaría sola?
                        </label>
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                            <div className="flex justify-between items-end mb-4">
                                <span className="text-xs font-bold text-gray-400 uppercase">Todo el día</span>
                                <span className="text-4xl font-extrabold text-orange-600">{answers.horasFuera} hs</span>
                                <span className="text-xs font-bold text-gray-400 uppercase">Poco tiempo</span>
                            </div>
                            <input
                                type="range"
                                min="0" max="12" step="1"
                                value={answers.horasFuera}
                                onChange={(e) => setAnswers({ ...answers, horasFuera: parseInt(e.target.value) })}
                                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                            />
                            <p className={`text-center text-sm font-bold mt-4 ${getAvailabilityLabel(answers.horasFuera).color}`}>
                                {getAvailabilityLabel(answers.horasFuera).text}
                            </p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "Experiencia",
            icon: GraduationCap,
            content: (
                <div className="space-y-6">
                    <label className="block text-sm font-bold text-gray-700">¿Tienes experiencia con mascotas?</label>
                    <div className="grid grid-cols-1 gap-4">
                        {[
                            { val: 1, icon: '🌱', title: 'Principiante', desc: 'Primera mascota. Busco algo fácil.' },
                            { val: 2, icon: '⭐', title: 'Intermedio', desc: 'Ya he tenido mascotas antes.' },
                            { val: 3, icon: '🏆', title: 'Experto', desc: 'Manejo animales con necesidades especiales.' }
                        ].map((opt) => (
                            <button
                                key={opt.val}
                                onClick={() => setAnswers({ ...answers, nivelExperiencia: opt.val })}
                                className={`p-4 rounded-xl border flex items-center gap-4 transition-all ${answers.nivelExperiencia === opt.val
                                    ? 'border-purple-500 bg-purple-50 ring-1 ring-purple-500'
                                    : 'border-gray-200 hover:border-purple-300'
                                    }`}
                            >
                                <span className="text-2xl">{opt.icon}</span>
                                <div className="text-left">
                                    <div className="font-bold text-gray-800">{opt.title}</div>
                                    <div className="text-xs text-gray-500">{opt.desc}</div>
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                        <label className="block text-sm font-bold text-gray-700 mb-2">WhatsApp de Contacto</label>
                        <input
                            type="tel"
                            placeholder="Ej: 2922 123456"
                            value={answers.telefono}
                            onChange={(e) => setAnswers({ ...answers, telefono: e.target.value })}
                            className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
                        />
                    </div>
                </div>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Navbar */}
            <div className="bg-white p-4 shadow-sm sticky top-0 z-50 flex items-center justify-between">
                <button onClick={() => navigate(-1)} className="text-gray-500">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-orange-500 fill-orange-500" />
                    <span className="font-bold text-gray-800">Perfil de Adopción</span>
                </div>
                <div className="w-6"></div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-lg">
                {/* Progress Bar */}
                <div className="flex gap-2 mb-8">
                    {steps.map((_, i) => (
                        <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? 'bg-orange-500' : 'bg-gray-200'}`} />
                    ))}
                </div>

                {/* Step Content */}
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step === 0 ? 'bg-orange-100 text-orange-600' :
                                    step === 1 ? 'bg-blue-100 text-blue-600' :
                                        'bg-purple-100 text-purple-600'
                                    }`}>
                                    {React.createElement(steps[step].icon, { className: "w-5 h-5" })}
                                </div>
                                <h2 className="text-xl font-bold text-gray-800">{steps[step].title}</h2>
                            </div>

                            {steps[step].content}
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 p-4">
                    <div className="container mx-auto max-w-lg flex gap-3">
                        {step > 0 && (
                            <button
                                onClick={() => setStep(step - 1)}
                                className="px-6 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200"
                            >
                                Atrás
                            </button>
                        )}

                        {step < steps.length - 1 ? (
                            <button
                                onClick={() => setStep(step + 1)}
                                className="flex-1 bg-gray-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800"
                            >
                                Siguiente <ChevronRight className="w-5 h-5" />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={loading || !answers.telefono}
                                className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30 disabled:opacity-50"
                            >
                                {loading ? <Clock className="animate-spin" /> : <Wand2 className="w-5 h-5" />}
                                Calcular Compatibilidad
                            </button>
                        )}
                    </div>
                </div>

                {/* Helper Padding for fixed bottom */}
                <div className="h-20"></div>
            </div>
        </div>
    );
};

export default Quiz;
