import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Building, MapPin, Phone, Check, ArrowRight, ArrowLeft, Loader2, FileText, Heart } from 'lucide-react';

import StepTracker from '../components/StepTracker';

// --- CONFIGURACIÓN DE ÍCONO MAPA ---
const iconONG = L.divIcon({
    className: 'custom-pin',
    html: `<div style="
        background-color: #E27364; 
        width: 48px; height: 48px; 
        border-radius: 50%; 
        border: 4px solid white; 
        display: flex; align-items: center; justify-content: center; 
        box-shadow: 0 4px 12px rgba(226, 115, 100, 0.4);
    ">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
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
    return coords ? <Marker position={coords} icon={iconONG} /> : null;
};

const ONGWizard = () => {
    const navigate = useNavigate();
    const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');

    // Estados
    const [step, setStep] = useState(1);
    const [cargando, setCargando] = useState(false);

    // Datos Form
    const [nombre, setNombre] = useState('');
    const [razonSocial, setRazonSocial] = useState('');
    const [telefono, setTelefono] = useState('');
    const [direccion, setDireccion] = useState('');
    const [coords, setCoords] = useState<{ lat: number, lng: number } | null>(null);

    const [mapCenter, setMapCenter] = useState<{ lat: number, lng: number }>({ lat: -34.6037, lng: -58.3816 });

    useEffect(() => {
        if (!usuario) {
            navigate('/login');
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => setMapCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            () => console.warn("GPS no disponible")
        );
    }, []);

    const handleNext = () => {
        if (step === 1 && (!nombre || !razonSocial || !telefono || !direccion)) return alert("Por favor completa todos los campos.");
        if (step === 2 && !coords) return alert("Por favor marca la ubicación en el mapa.");
        setStep(step + 1);
    };

    const handleBack = () => setStep(step - 1);

    const handleSubmit = async () => {
        setCargando(true);
        try {
            const dto = {
                usuarioId: usuario.id,
                nombre: nombre,
                descripcion: razonSocial, // Mapping Razon Social to Descripcion
                telefono: telefono,
                email: usuario.email || "", // Fallback if user email is missing
                redes: "",
                barrio: "",
                ciudad: direccion, // Using Address as City/Location for now
                latitud: coords?.lat,
                longitud: coords?.lng
            };

            const res = await fetch('http://localhost:5269/api/Organizaciones/crear', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dto)
            });

            if (res.ok) {
                alert("¡ONG Registrada EXITOSAMENTE!");

                // Actualizar rol localmente para UX inmediata
                const updatedUser = { ...usuario, rol: 'ONG' };
                localStorage.setItem('usuario', JSON.stringify(updatedUser));

                navigate('/ong-dashboard');
            } else {
                const txt = await res.text();
                alert("Error al registrar: " + txt);
            }
        } catch (error) {
            console.error(error);
            alert("Error de conexión con el servidor.");
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
                            <h2 className="text-2xl font-heading font-extrabold text-tech">Registro de ONG</h2>
                            <p className="text-gray-500">Únete a la red de protección animal.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Nombre de la Organización</label>
                                <div className="relative group">
                                    <Heart className="absolute left-4 top-3.5 text-gray-400 w-5 h-5 group-focus-within:text-health transition-colors" />
                                    <input
                                        type="text" value={nombre} onChange={e => setNombre(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 focus:border-health focus:ring-4 focus:ring-health/10 outline-none transition-all font-medium"
                                        placeholder="Ej: Patitas al Rescate" autoFocus
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Razón Social / Personería</label>
                                <div className="relative group">
                                    <FileText className="absolute left-4 top-3.5 text-gray-400 w-5 h-5 group-focus-within:text-health transition-colors" />
                                    <input
                                        type="text" value={razonSocial} onChange={e => setRazonSocial(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 focus:border-health focus:ring-4 focus:ring-health/10 outline-none transition-all font-medium"
                                        placeholder="Ej: Asociación Civil..."
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Teléfono Público</label>
                                    <div className="relative group">
                                        <Phone className="absolute left-4 top-3.5 text-gray-400 w-5 h-5 group-focus-within:text-health transition-colors" />
                                        <input
                                            type="tel" value={telefono} onChange={e => setTelefono(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 focus:border-health focus:ring-4 focus:ring-health/10 outline-none transition-all font-medium"
                                            placeholder="Ej: 11 1234 5678"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Dirección Sede</label>
                                    <div className="relative group">
                                        <MapPin className="absolute left-4 top-3.5 text-gray-400 w-5 h-5 group-focus-within:text-health transition-colors" />
                                        <input
                                            type="text" value={direccion} onChange={e => setDireccion(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 focus:border-health focus:ring-4 focus:ring-health/10 outline-none transition-all font-medium"
                                            placeholder="Calle y Número (si aplica)"
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
                            <h2 className="text-2xl font-heading font-extrabold text-tech">Ubicación de Referencia</h2>
                            <p className="text-gray-500">Para que la gente encuentre tu sede.</p>
                        </div>

                        <div className="h-[400px] w-full rounded-2xl overflow-hidden border-2 border-gray-100 shadow-inner relative z-0">
                            <MapContainer
                                center={coords || mapCenter}
                                zoom={13}
                                style={{ height: "100%", width: "100%" }}
                                key={step}
                            >
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <LocationPicker coords={coords} setCoords={setCoords} />
                            </MapContainer>
                            {!coords && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/10 pointer-events-none z-[1000]">
                                    <div className="bg-white/90 px-4 py-2 rounded-full shadow-lg text-sm font-bold text-gray-600 animate-bounce">
                                        👇 Marca la ubicación
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
                            <h2 className="text-2xl font-heading font-extrabold text-tech">Confirmación</h2>
                            <p className="text-gray-500">Revisa los datos antes de crear la cuenta.</p>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="bg-love/10 p-3 rounded-full text-love"><Heart className="w-6 h-6" /></div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase">Organización</p>
                                    <p className="font-bold text-lg text-tech">{nombre}</p>
                                    <p className="text-sm text-gray-500">{razonSocial}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="bg-health/10 p-3 rounded-full text-health"><MapPin className="w-6 h-6" /></div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase">Ubicación</p>
                                    <p className="font-bold text-gray-800">{direccion}</p>
                                    <p className="text-xs text-gray-400 mt-1">Lat: {coords?.lat.toFixed(4)}, Lng: {coords?.lng.toFixed(4)}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="bg-blue-50 p-3 rounded-full text-blue-500"><Phone className="w-6 h-6" /></div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase">Contacto</p>
                                    <p className="font-bold text-gray-800">{telefono}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 bg-yellow-50 p-4 rounded-xl border border-yellow-100 text-yellow-800 text-sm flex gap-3">
                            <Check className="w-5 h-5 flex-shrink-0" />
                            <p>Al confirmar, tu organización aparecerá en el mapa público y podrás gestionar hogares de tránsito.</p>
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
                            <Building className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-lg font-heading font-extrabold text-tech leading-none">Alta de ONG</h1>
                            <p className="text-xs text-gray-500 font-medium mt-1">Súmate a la red</p>
                        </div>
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-4 py-8 max-w-2xl">
                <StepTracker currentStep={step} totalSteps={3} labels={['Datos', 'Ubicación', 'Confirmar']} />

                <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-white p-8 relative min-h-[400px]">
                    <AnimatePresence mode="wait">
                        {renderStep()}
                    </AnimatePresence>
                </div>

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
                            {cargando ? <Loader2 className="w-6 h-6 animate-spin" /> : (step === 3 ? 'Registrar ONG' : 'Continuar')}
                            {!cargando && step !== 3 && <ArrowRight className="w-5 h-5" />}
                            {!cargando && step === 3 && <Check className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ONGWizard;
