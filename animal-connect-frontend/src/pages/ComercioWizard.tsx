import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, MapPin, Check, ArrowRight, ArrowLeft, Loader2, Upload, Tag } from 'lucide-react';

import StepTracker from '../components/StepTracker';

// --- ICONS ---
const iconStore = L.divIcon({
    className: 'custom-pin',
    html: `<div style="
        background-color: #FF8A65; 
        width: 48px; height: 48px; 
        border-radius: 50%; 
        border: 4px solid white; 
        display: flex; align-items: center; justify-content: center; 
        box-shadow: 0 4px 12px rgba(255, 138, 101, 0.4);
    ">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/></svg>
    </div>`,
    iconSize: [48, 48],
    iconAnchor: [24, 48]
});

const LocationPicker = ({ coords, setCoords }: { coords: { lat: number, lng: number } | null, setCoords: (pos: { lat: number, lng: number }) => void }) => {
    useMapEvents({
        click(e) {
            setCoords(e.latlng);
        },
    });
    return coords ? <Marker position={coords} icon={iconStore} /> : null;
};

const ComercioWizard = () => {
    const navigate = useNavigate();
    const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');

    // Estados
    const [step, setStep] = useState(1);
    const [cargando, setCargando] = useState(false);

    // Form Data
    const [nombre, setNombre] = useState('');
    const [rubro, setRubro] = useState('');
    const [direccion, setDireccion] = useState('');
    const [logoUrl, setLogoUrl] = useState(''); // Por ahora input de texto o placeholder
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
        if (step === 1 && (!nombre || !rubro || !direccion)) return alert("Completa los datos básicos.");
        if (step === 2 && !coords) return alert("Marca la ubicación en el mapa.");
        setStep(step + 1);
    };

    const handleBack = () => setStep(step - 1);

    const handleSubmit = async () => {
        setCargando(true);
        try {
            const dto = {
                usuarioId: usuario.id,
                nombre,
                direccion,
                latitud: coords?.lat,
                longitud: coords?.lng,
                etiquetas: rubro, // Usamos 'etiquetas' para guardar el rubro principal por ahora
                logoUrl: logoUrl || "https://cdn-icons-png.flaticon.com/512/3081/3081559.png", // Default image
                esDestacado: false
            };

            const res = await fetch('http://localhost:5269/api/Comercios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dto)
            });

            if (res.ok) {
                alert("¡Comercio Creado Exitosamente!");
                navigate('/perfil'); // O al Dashboard del Comercio cuando exista
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
                            <h2 className="text-2xl font-heading font-extrabold text-tech">Datos del Negocio</h2>
                            <p className="text-gray-500">Publica tus productos y servicios.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Nombre del Comercio</label>
                                <div className="relative group">
                                    <Store className="absolute left-4 top-3.5 text-gray-400 w-5 h-5 group-focus-within:text-health transition-colors" />
                                    <input
                                        type="text" value={nombre} onChange={e => setNombre(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 focus:border-health focus:ring-4 focus:ring-health/10 outline-none transition-all font-medium"
                                        placeholder="Ej: PetShop Patitas" autoFocus
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Rubro Principal</label>
                                    <div className="relative group">
                                        <Tag className="absolute left-4 top-3.5 text-gray-400 w-5 h-5 group-focus-within:text-health transition-colors" />
                                        <select
                                            value={rubro} onChange={e => setRubro(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 focus:border-health focus:ring-4 focus:ring-health/10 outline-none transition-all font-medium bg-white"
                                        >
                                            <option value="">Selecciona...</option>
                                            <option value="PetShop">Pet Shop</option>
                                            <option value="Veterinaria">Veterinaria</option>
                                            <option value="Guarderia">Guardería</option>
                                            <option value="Peluqueria">Peluquería</option>
                                            <option value="Paseador">Paseador</option>
                                            <option value="BarFriendly">Bar/Resto Pet Friendly</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Dirección Visible</label>
                                    <div className="relative group">
                                        <MapPin className="absolute left-4 top-3.5 text-gray-400 w-5 h-5 group-focus-within:text-health transition-colors" />
                                        <input
                                            type="text" value={direccion} onChange={e => setDireccion(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 focus:border-health focus:ring-4 focus:ring-health/10 outline-none transition-all font-medium"
                                            placeholder="Calle y Altura"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">URL del Logo (Opcional)</label>
                                <div className="relative group">
                                    <Upload className="absolute left-4 top-3.5 text-gray-400 w-5 h-5 group-focus-within:text-health transition-colors" />
                                    <input
                                        type="text" value={logoUrl} onChange={e => setLogoUrl(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 focus:border-health focus:ring-4 focus:ring-health/10 outline-none transition-all font-medium"
                                        placeholder="https://..."
                                    />
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
                            <p className="text-gray-500">Mueve el mapa para que te encuentren.</p>
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
                                        👇 Toca dónde está tu local
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
                            <h2 className="text-2xl font-heading font-extrabold text-tech">Confirmar Alta</h2>
                            <p className="text-gray-500">Todo listo para despegar.</p>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center">
                                    {logoUrl ? <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" /> : <Store className="w-8 h-8 text-gray-400" />}
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase">{rubro}</p>
                                    <p className="font-bold text-xl text-tech">{nombre}</p>
                                    <p className="text-sm text-gray-500">{direccion}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 bg-nature/10 p-4 rounded-xl border border-nature/20 text-nature text-sm flex gap-3">
                            <Check className="w-5 h-5 flex-shrink-0" />
                            <p>Tu comercio aparecerá inmediatamente en el Marketplace de AnimalConnect.</p>
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
                        <div className="bg-orange-100 p-2.5 rounded-xl text-orange-600">
                            <Store className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-lg font-heading font-extrabold text-tech leading-none">Nuevo Comercio</h1>
                            <p className="text-xs text-gray-500 font-medium mt-1">Crea tu tienda digital</p>
                        </div>
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-4 py-8 max-w-2xl">
                <StepTracker currentStep={step} totalSteps={3} labels={['Negocio', 'Mapa', 'Confirmar']} />

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
                            {cargando ? <Loader2 className="w-6 h-6 animate-spin" /> : (step === 3 ? 'Crear Comercio' : 'Continuar')}
                            {!cargando && step !== 3 && <ArrowRight className="w-5 h-5" />}
                            {!cargando && step === 3 && <Check className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ComercioWizard;
