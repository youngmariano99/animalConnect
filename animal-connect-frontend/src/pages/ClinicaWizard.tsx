import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Hospital, MapPin, Clock, X, Phone, Building2, Check, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';

import StepTracker from '../components/StepTracker';

// --- CONFIGURACIÓN DE ÍCONO MAPA ---
const iconVet = L.divIcon({
    className: 'custom-pin',
    html: `<div style="
        background-color: #E27364; 
        width: 48px; height: 48px; 
        border-radius: 50%; 
        border: 4px solid white; 
        display: flex; align-items: center; justify-content: center; 
        box-shadow: 0 4px 12px rgba(226, 115, 100, 0.4);
    ">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6v4"/><path d="M14 14h-4"/><path d="M14 18h-4"/><path d="M14 8h-4"/><path d="M18 12h-4"/><path d="M6 12h4"/><path d="M22 12h-4"/><path d="M2 12h4"/></svg>
    </div>`,
    iconSize: [48, 48],
    iconAnchor: [24, 48]
});

// Componente para capturar clicks
const LocationPicker = ({ coords, setCoords }: { coords: { lat: number, lng: number } | null, setCoords: (pos: { lat: number, lng: number }) => void }) => {
    useMapEvents({
        click(e) {
            setCoords(e.latlng);
        },
    });
    return coords ? <Marker position={coords} icon={iconVet} /> : null;
};

const ClinicaWizard = () => {
    const navigate = useNavigate();
    const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');

    // Estados
    const [step, setStep] = useState(1);
    const [cargando, setCargando] = useState(false);

    // Datos Form
    const [nombre, setNombre] = useState('');
    const [telefono, setTelefono] = useState('');
    const [direccion, setDireccion] = useState('');
    const [coords, setCoords] = useState<{ lat: number, lng: number } | null>(null);

    // Datos Horario
    const [horarioConfig, setHorarioConfig] = useState({
        dias: 'Lun a Vie',
        tipo: 'cortado',
        m1: '09:00', m2: '13:00',
        t1: '16:00', t2: '20:00'
    });

    const [mapCenter, setMapCenter] = useState<{ lat: number, lng: number }>({ lat: -34.6037, lng: -58.3816 });

    useEffect(() => {
        if (!usuario || usuario.rol !== 'Veterinario') {
            alert("Acceso denegado. Debes ser Veterinario.");
            navigate('/');
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => setMapCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            () => console.warn("GPS no disponible")
        );
    }, []);

    const getHorarioPreview = () => {
        let texto = `${horarioConfig.dias}: ${horarioConfig.m1} - ${horarioConfig.m2}hs`;
        if (horarioConfig.tipo === 'cortado') texto += ` / ${horarioConfig.t1} - ${horarioConfig.t2}hs`;
        else texto += " (Corrido)";
        return texto;
    };

    const handleNext = () => {
        if (step === 1 && (!nombre || !telefono || !direccion)) return alert("Por favor completa todos los campos.");
        if (step === 2 && !coords) return alert("Por favor marca la ubicación en el mapa.");
        setStep(step + 1);
    };

    const handleBack = () => setStep(step - 1);

    const handleSubmit = async () => {
        setCargando(true);
        try {
            const dto = {
                usuarioId: usuario.id,
                nombre, telefono, direccion,
                latitud: coords?.lat,
                longitud: coords?.lng,
                horarios: getHorarioPreview()
            };

            const res = await fetch('http://localhost:5269/api/Clinicas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dto)
            });

            if (res.ok) {
                alert("¡Clínica creada exitosamente!");
                navigate('/perfil');
            } else {
                const txt = await res.text();
                alert("Error: " + txt);
            }
        } catch (error) {
            console.error(error);
            alert("Error de conexión");
        } finally {
            setCargando(false);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} key="step1">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-heading font-extrabold text-tech">Datos del Consultorio</h2>
                            <p className="text-gray-500">Información pública visible para los dueños.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Nombre de Fantasía</label>
                                <div className="relative group">
                                    <Building2 className="absolute left-4 top-3.5 text-gray-400 w-5 h-5 group-focus-within:text-health transition-colors" />
                                    <input
                                        type="text" value={nombre} onChange={e => setNombre(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 focus:border-health focus:ring-4 focus:ring-health/10 outline-none transition-all font-medium"
                                        placeholder="Ej: Veterinaria San Roque" autoFocus
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Teléfono / WhatsApp</label>
                                    <div className="relative group">
                                        <Phone className="absolute left-4 top-3.5 text-gray-400 w-5 h-5 group-focus-within:text-health transition-colors" />
                                        <input
                                            type="tel" value={telefono} onChange={e => setTelefono(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 focus:border-health focus:ring-4 focus:ring-health/10 outline-none transition-all font-medium"
                                            placeholder="Ej: 2923..."
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Dirección</label>
                                    <div className="relative group">
                                        <MapPin className="absolute left-4 top-3.5 text-gray-400 w-5 h-5 group-focus-within:text-health transition-colors" />
                                        <input
                                            type="text" value={direccion} onChange={e => setDireccion(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 focus:border-health focus:ring-4 focus:ring-health/10 outline-none transition-all font-medium"
                                            placeholder="Calle y Número"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );
            case 2:
                return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} key="step2">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-heading font-extrabold text-tech">Ubicación Exacta</h2>
                            <p className="text-gray-500">Mueve el mapa y toca donde está la entrada.</p>
                        </div>

                        <div className="h-[400px] w-full rounded-2xl overflow-hidden border-2 border-gray-100 shadow-inner relative z-0">
                            <MapContainer
                                center={coords || mapCenter}
                                zoom={15}
                                style={{ height: "100%", width: "100%" }}
                                key={step}
                            >
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <LocationPicker coords={coords} setCoords={setCoords} />
                            </MapContainer>

                            {!coords && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/10 pointer-events-none z-[1000]">
                                    <div className="bg-white/90 px-4 py-2 rounded-full shadow-lg text-sm font-bold text-gray-600 animate-bounce">
                                        👇 Toca el mapa para marcar
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                );
            case 3:
                return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} key="step3">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-heading font-extrabold text-tech">Disponibilidad</h2>
                            <p className="text-gray-500">Configura tus horarios de atención.</p>
                        </div>

                        <div className="bg-canvas p-6 rounded-2xl border border-gray-100">
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Días</label>
                                    <select
                                        value={horarioConfig.dias}
                                        onChange={e => setHorarioConfig({ ...horarioConfig, dias: e.target.value })}
                                        className="w-full bg-white border border-gray-200 rounded-xl p-3 font-medium outline-none focus:border-health"
                                    >
                                        <option value="Lun a Vie">Lunes a Viernes</option>
                                        <option value="Lun a Sab">Lunes a Sábado</option>
                                        <option value="Todos los días">Todos los días</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Modalidad</label>
                                    <select
                                        value={horarioConfig.tipo}
                                        onChange={e => setHorarioConfig({ ...horarioConfig, tipo: e.target.value as 'corrido' | 'cortado' })}
                                        className="w-full bg-white border border-gray-200 rounded-xl p-3 font-medium outline-none focus:border-health"
                                    >
                                        <option value="corrido">Horario Corrido</option>
                                        <option value="cortado">Horario Cortado</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between">
                                    <span className="text-sm font-bold text-tech flex items-center"><Clock className="w-4 h-4 mr-2 text-health" /> Mañana</span>
                                    <div className="flex items-center gap-2">
                                        <input type="time" value={horarioConfig.m1} onChange={e => setHorarioConfig({ ...horarioConfig, m1: e.target.value })} className="bg-gray-50 border rounded-lg p-2 text-sm font-bold font-mono text-center w-24" />
                                        <span className="text-gray-300">-</span>
                                        <input type="time" value={horarioConfig.m2} onChange={e => setHorarioConfig({ ...horarioConfig, m2: e.target.value })} className="bg-gray-50 border rounded-lg p-2 text-sm font-bold font-mono text-center w-24" />
                                    </div>
                                </div>

                                {horarioConfig.tipo === 'cortado' && (
                                    <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between">
                                        <span className="text-sm font-bold text-tech flex items-center"><Clock className="w-4 h-4 mr-2 text-tech" /> Tarde</span>
                                        <div className="flex items-center gap-2">
                                            <input type="time" value={horarioConfig.t1} onChange={e => setHorarioConfig({ ...horarioConfig, t1: e.target.value })} className="bg-gray-50 border rounded-lg p-2 text-sm font-bold font-mono text-center w-24" />
                                            <span className="text-gray-300">-</span>
                                            <input type="time" value={horarioConfig.t2} onChange={e => setHorarioConfig({ ...horarioConfig, t2: e.target.value })} className="bg-gray-50 border rounded-lg p-2 text-sm font-bold font-mono text-center w-24" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                                <p className="text-xs text-gray-400 uppercase font-bold mb-2">Vista Previa</p>
                                <span className="inline-block bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100 font-bold text-health">
                                    {getHorarioPreview()}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                );
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-canvas font-sans text-tech pb-20">
            {/* --- HEADER --- */}
            <div className="bg-white/80 backdrop-blur-md sticky top-0 z-[100] border-b border-gray-100">
                <div className="container mx-auto px-4 h-20 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-love/10 p-2.5 rounded-xl text-love">
                            <Hospital className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-lg font-heading font-extrabold text-tech leading-none">Alta de Clínica</h1>
                            <p className="text-xs text-gray-500 font-medium mt-1">Configuración del consultorio</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/perfil')}
                        className="bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600 p-2 rounded-full transition"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
            </div>

            <main className="container mx-auto px-4 py-8 max-w-2xl">

                {/* --- STEPS --- */}
                <StepTracker currentStep={step} totalSteps={3} labels={['Datos', 'Ubicación', 'Horarios']} />

                {/* --- CONTENT --- */}
                <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-white p-8 relative min-h-[400px]">
                    <AnimatePresence mode="wait">
                        {renderStep()}
                    </AnimatePresence>
                </div>

                {/* --- FOOTER --- */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 flex items-center justify-center z-50 md:static md:bg-transparent md:border-none md:p-0 md:mt-8">
                    <div className="flex gap-4 w-full max-w-2xl">
                        {step > 1 && (
                            <button
                                onClick={handleBack}
                                className="flex-1 py-4 rounded-xl font-bold text-gray-500 hover:bg-white hover:shadow-lg transition-all flex items-center justify-center gap-2"
                            >
                                <ArrowLeft className="w-5 h-5" /> Volver
                            </button>
                        )}
                        <button
                            onClick={step === 3 ? handleSubmit : handleNext}
                            disabled={cargando}
                            className="flex-[2] py-4 rounded-xl font-bold text-white bg-tech hover:bg-tech/90 shadow-lg shadow-tech/30 transition-all flex items-center justify-center gap-2 transform active:scale-95"
                        >
                            {cargando ? <Loader2 className="w-6 h-6 animate-spin" /> : (step === 3 ? 'Confirmar Alta' : 'Continuar')}
                            {!cargando && step !== 3 && <ArrowRight className="w-5 h-5" />}
                            {!cargando && step === 3 && <Check className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ClinicaWizard;