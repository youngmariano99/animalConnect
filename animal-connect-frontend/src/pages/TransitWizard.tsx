import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, MapPin, Maximize, Phone, Check, ArrowRight, ArrowLeft, Loader2, Dog, Cat } from 'lucide-react';

import StepTracker from '../components/StepTracker';

// --- CONFIGURACIÓN DE ÍCONO MAPA ---
const iconTransit = L.divIcon({
    className: 'custom-pin',
    html: `<div style="
        background-color: #5B9279; 
        width: 48px; height: 48px; 
        border-radius: 50%; 
        border: 4px solid white; 
        display: flex; align-items: center; justify-content: center; 
        box-shadow: 0 4px 12px rgba(91, 146, 121, 0.4);
    ">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
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
    return coords ? <Marker position={coords} icon={iconTransit} /> : null;
};

const TransitWizard = () => {
    const navigate = useNavigate();
    const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');

    // Estados
    const [step, setStep] = useState(1);
    const [cargando, setCargando] = useState(false);

    // Datos Form
    const [telefono, setTelefono] = useState('');
    const [direccion, setDireccion] = useState('');
    const [tipoVivienda, setTipoVivienda] = useState('Casa');
    const [patio, setPatio] = useState(false);
    const [aceptaPerros, setAceptaPerros] = useState(true);
    const [aceptaGatos, setAceptaGatos] = useState(true);

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
        if (step === 1 && (!telefono || !direccion)) return alert("Por favor completa los campos obligatorios.");
        if (step === 2 && !coords) return alert("Por favor marca tu ubicación en el mapa. Esto SOLO será visible para ONGs validadas.");
        setStep(step + 1);
    };

    const handleBack = () => setStep(step - 1);

    const handleSubmit = async () => {
        setCargando(true);
        try {
            // Mapping Frontend fields to Backend DTO
            // Nota: El backend espera 'TieneMascotas', nosotros tenemos 'AceptaPerros/Gatos'.
            // Por ahora enviaremos valores por defecto para lo que no tenemos.
            const dto = {
                usuarioId: usuario.id,
                direccion: direccion,
                latitud: coords?.lat,
                longitud: coords?.lng,
                tipoVivienda: tipoVivienda,
                tienePatio: patio,
                tieneMascotas: false, // Default
                tieneNinos: false,    // Default
                disponibilidad: 1,    // Default
                tiempo: "Indefinido", // Default
                cuidadosEsp: false    // Default
            };

            const res = await fetch('http://localhost:5269/api/Hogares', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dto)
            });

            if (res.ok) {
                alert("¡Te has postulado como Hogar de Tránsito! Una ONG te contactará pronto.");
                navigate('/perfil');
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
                            <h2 className="text-2xl font-heading font-extrabold text-tech">Ser Hogar de Tránsito</h2>
                            <p className="text-gray-500">Ofrece un techo temporal a un animal rescatado.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Teléfono Móvil</label>
                                    <div className="relative group">
                                        <Phone className="absolute left-4 top-3.5 text-gray-400 w-5 h-5 group-focus-within:text-health transition-colors" />
                                        <input
                                            type="tel" value={telefono} onChange={e => setTelefono(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 focus:border-health focus:ring-4 focus:ring-health/10 outline-none transition-all font-medium"
                                            placeholder="Ej: 11 1234 5678" autoFocus
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Dirección Real</label>
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

                            <hr className="border-gray-100 my-4" />

                            <p className="text-sm font-bold text-gray-700 mb-2">Preferencias y Comodidades</p>
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <button
                                    onClick={() => setAceptaPerros(!aceptaPerros)}
                                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${aceptaPerros ? 'border-nature bg-nature/10 text-nature font-bold' : 'border-gray-100 text-gray-400'}`}
                                >
                                    <Dog className="w-8 h-8" /> Perros
                                </button>
                                <button
                                    onClick={() => setAceptaGatos(!aceptaGatos)}
                                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${aceptaGatos ? 'border-love bg-love/10 text-love font-bold' : 'border-gray-100 text-gray-400'}`}
                                >
                                    <Cat className="w-8 h-8" /> Gatos
                                </button>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-gray-600">Tipo de Vivienda</span>
                                    <select
                                        value={tipoVivienda}
                                        onChange={e => setTipoVivienda(e.target.value)}
                                        className="bg-white border border-gray-200 rounded-lg py-1 px-3 text-sm font-medium outline-none focus:border-health"
                                    >
                                        <option value="Casa">Casa</option>
                                        <option value="Departamento">Departamento</option>
                                        <option value="PH">PH</option>
                                        <option value="Campo">Campo / Quinta</option>
                                    </select>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-gray-600 flex items-center gap-2"><Maximize className="w-4 h-4" /> ¿Tienes patio cerrado?</span>
                                    <div
                                        onClick={() => setPatio(!patio)}
                                        className={`w-12 h-7 rounded-full p-1 cursor-pointer transition-colors ${patio ? 'bg-nature' : 'bg-gray-300'}`}
                                    >
                                        <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${patio ? 'translate-x-5' : 'translate-x-0'}`} />
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
                            <h2 className="text-2xl font-heading font-extrabold text-tech">Ubicación Privada</h2>
                            <p className="text-gray-500 text-sm">Esta ubicación <strong>NO</strong> será pública. Solo la verán ONGs verificadas.</p>
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
                                        👇 Marca tu domicilio
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
                            <p className="text-gray-500">¿Estás listo para ayudar?</p>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="bg-nature/10 p-3 rounded-full text-nature"><Home className="w-6 h-6" /></div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase">Hogar</p>
                                    <p className="font-bold text-lg text-gray-800">{tipoVivienda} {patio && 'con Patio'}</p>
                                    <p className="text-sm text-gray-500">{direccion}</p>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                {aceptaPerros && <span className="bg-nature text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Dog className="w-3 h-3" /> Acepto Perros</span>}
                                {aceptaGatos && <span className="bg-love text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Cat className="w-3 h-3" /> Acepto Gatos</span>}
                            </div>
                        </div>

                        <div className="mt-8 bg-blue-50 p-4 rounded-xl border border-blue-100 text-blue-800 text-sm flex gap-3">
                            <Check className="w-5 h-5 flex-shrink-0" />
                            <p>Tu solicitud quedará en estado "Pendiente" hasta que una ONG cercana valide tus datos.</p>
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
                        <div className="bg-nature/10 p-2.5 rounded-xl text-nature">
                            <Home className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-lg font-heading font-extrabold text-tech leading-none">Ser Tránsito</h1>
                            <p className="text-xs text-gray-500 font-medium mt-1">Postulación de Hogar</p>
                        </div>
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-4 py-8 max-w-2xl">
                <StepTracker currentStep={step} totalSteps={3} labels={['Hogar', 'Ubicación', 'Confirmar']} />

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
                            {cargando ? <Loader2 className="w-6 h-6 animate-spin" /> : (step === 3 ? 'Enviar Solicitud' : 'Continuar')}
                            {!cargando && step !== 3 && <ArrowRight className="w-5 h-5" />}
                            {!cargando && step === 3 && <Check className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TransitWizard;
