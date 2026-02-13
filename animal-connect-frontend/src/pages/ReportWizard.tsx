import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react';
import StepTracker from '../components/StepTracker';
import ImageUpload from '../components/ImageUpload';

// --- ICONS ---
const iconUbicacion = L.divIcon({
    className: 'custom-icon',
    html: `<div style="background-color: #006D77; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 8px rgba(0,0,0,0.4);"></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
});

// --- SUB-COMPONENTS ---
const LocationPicker = ({ lat, lng, onLocationSelect, initialCenter }: { lat: number, lng: number, onLocationSelect: (lat: number, lng: number) => void, initialCenter: { lat: number, lng: number } }) => {
    const [position, setPosition] = useState<{ lat: number, lng: number } | null>(
        lat !== 0 ? { lat, lng } : null
    );

    const MapEvents = () => {
        useMapEvents({
            click(e) {
                setPosition(e.latlng);
                onLocationSelect(e.latlng.lat, e.latlng.lng);
            },
        });
        return position ? <Marker position={position} icon={iconUbicacion} /> : null;
    };

    return (
        <div className="h-64 rounded-pet overflow-hidden relative border-2 border-gray-100 shadow-inner">
            <MapContainer center={[initialCenter.lat, initialCenter.lng]} zoom={13} style={{ height: "100%", width: "100%" }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapEvents />
            </MapContainer>
            {!position && (
                <div className="absolute inset-0 bg-black/5 flex items-center justify-center pointer-events-none">
                    <span className="bg-white/90 backdrop-blur px-4 py-2 rounded-full text-sm font-bold shadow text-gray-600">
                        📍 Toca el mapa para ubicar
                    </span>
                </div>
            )}
        </div>
    );
};

// --- MAIN WIZARD ---
interface ReportWizardProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'perdido' | 'encontrado';
    onSubmit: (data: any) => Promise<number | null>; // Return ID
    initialLocation: { lat: number, lng: number };
}

const ReportWizard = ({ isOpen, onClose, type, onSubmit, initialLocation }: ReportWizardProps) => {
    const [step, setStep] = useState(1);
    const totalSteps = 4;

    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        especie: '1',
        foto: null as File | null,
        lat: 0,
        lng: 0,
        telefono: ''
    });

    const [createdId, setCreatedId] = useState<number | null>(null); // Guardar ID para el cartel

    const handleNext = () => {
        if (step === 1 && !formData.foto) return alert("Por favor sube una foto");
        if (step === 2 && !formData.nombre) return alert("Por favor ingresa un nombre o raza");
        if (step === 3 && formData.lat === 0) return alert("Por favor indica la ubicación");

        if (step < totalSteps) setStep(step + 1);
        else handleSubmit();
    };

    const handleBack = () => {
        if (step > 1 && step <= totalSteps) setStep(step - 1); // No volver desde Success
    };

    const handleSubmit = async () => {
        try {
            const newId = await onSubmit({ ...formData, type });
            if (newId) {
                setCreatedId(newId);
                setStep(5); // Ir a Success
            } else {
                onClose(); // Fallback si no hay ID
            }
        } catch (e) {
            console.error(e);
            alert("Error al enviar el reporte");
        }
    };

    // Wizard Content per Step
    const renderStep = () => {
        switch (step) {
            case 1: // FOTO
                return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} key="step1">
                        <h3 className="text-xl font-heading font-bold text-tech mb-2">📸 Foto de la Mascota</h3>
                        <p className="text-gray-500 mb-6 text-sm">Una buena foto aumenta las chances de encontrarlo.</p>
                        <ImageUpload onImageSelect={(file) => setFormData({ ...formData, foto: file })} />
                    </motion.div>
                );
            case 2: // DETAILS
                return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} key="step2">
                        <h3 className="text-xl font-heading font-bold text-tech mb-4">📝 Detalles Clave</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Nombre / Raza</label>
                                <input
                                    type="text"
                                    className="w-full p-4 rounded-xl border border-gray-200 focus:border-health focus:ring-4 focus:ring-health/10 outline-none font-medium bg-gray-50"
                                    placeholder="Ej: Rocky, Labrador..."
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Especie</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setFormData({ ...formData, especie: '1' })}
                                        className={`p-3 rounded-xl border-2 font-bold transition-all ${formData.especie === '1' ? 'border-health bg-health/10 text-health' : 'border-gray-100 text-gray-400'}`}
                                    >
                                        🐶 Perro
                                    </button>
                                    <button
                                        onClick={() => setFormData({ ...formData, especie: '2' })}
                                        className={`p-3 rounded-xl border-2 font-bold transition-all ${formData.especie === '2' ? 'border-health bg-health/10 text-health' : 'border-gray-100 text-gray-400'}`}
                                    >
                                        🐱 Gato
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Descripción Extra</label>
                                <textarea
                                    rows={3}
                                    className="w-full p-4 rounded-xl border border-gray-200 focus:border-health focus:ring-4 focus:ring-health/10 outline-none font-medium bg-gray-50 text-sm"
                                    placeholder="Collar rojo, renguea un poco..."
                                    value={formData.descripcion}
                                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                />
                            </div>
                        </div>
                    </motion.div>
                );
            case 3: // LOCATION
                return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} key="step3">
                        <h3 className="text-xl font-heading font-bold text-tech mb-2">📍 ¿Dónde fue?</h3>
                        <p className="text-gray-500 mb-4 text-sm">Marca el punto exacto en el mapa.</p>
                        <LocationPicker
                            lat={formData.lat}
                            lng={formData.lng}
                            onLocationSelect={(lat, lng) => setFormData({ ...formData, lat, lng })}
                            initialCenter={initialLocation}
                        />
                    </motion.div>
                );
            case 4: // CONTACT
                return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} key="step4">
                        <h3 className="text-xl font-heading font-bold text-tech mb-2">📞 Contacto</h3>
                        <p className="text-gray-500 mb-6 text-sm">¿Cómo te pueden ubicar?</p>

                        <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 mb-6 flex items-start gap-3">
                            <div className="bg-orange-100 p-2 rounded-full text-orange-600">
                                <Check className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-orange-800 text-sm">¡Casi listo!</h4>
                                <p className="text-orange-700 text-xs mt-1">Tu aviso será visible para toda la comunidad cercano a tu ubicación.</p>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">WhatsApp / Teléfono</label>
                            <input
                                type="tel"
                                className="w-full p-4 rounded-xl border border-gray-200 focus:border-health focus:ring-4 focus:ring-health/10 outline-none font-medium bg-gray-50"
                                placeholder="Ej: 291 123 4567"
                                value={formData.telefono}
                                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                            />
                        </div>
                    </motion.div>
                );
            case 5: // SUCCESS & POSTER
                return (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-green-50 shadow-inner">
                            <Check className="w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-800 mb-2">¡Reporte Enviado!</h3>
                        <p className="text-gray-500 text-sm max-w-xs mx-auto mb-8">
                            La comunidad ya ha sido alertada.
                        </p>

                        {/* CARTEL DE BÚSQUEDA */}
                        <div className="bg-orange-50 rounded-2xl p-6 border-2 border-orange-100 max-w-sm mx-auto">
                            <h4 className="font-bold text-orange-800 text-lg mb-2">🖨️ ¡Imprimí tu Cartel!</h4>
                            <p className="text-orange-700/80 text-xs mb-4 leading-relaxed">
                                Generamos un cartel PDF con foto y código QR listo para pegar en tu barrio.
                            </p>

                            <a
                                href={`http://localhost:5269/api/Animales/${createdId}/cartel`}
                                target="_blank"
                                rel="noreferrer"
                                className="w-full bg-orange-600 text-white font-black py-4 rounded-xl shadow-lg shadow-orange-600/30 active:scale-95 transition-transform flex items-center justify-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Descargar Cartel Oficial
                            </a>
                        </div>
                    </motion.div>
                );
            default: return null;
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={step === 5 ? onClose : undefined} // Click outside closes only strictly if success
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        {step !== 5 && (
                            <div className={`p-6 pb-4 ${type === 'perdido' ? 'bg-love/10' : 'bg-health/10'}`}>
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className={`text-2xl font-heading font-extrabold ${type === 'perdido' ? 'text-love' : 'text-health'}`}>
                                        {type === 'perdido' ? '💔 Perdí mi Mascota' : '👀 Encontré un Animal'}
                                    </h2>
                                    <button onClick={onClose} className="bg-white/50 p-2 rounded-full hover:bg-white transition-colors">
                                        <X className="w-5 h-5 text-gray-500" />
                                    </button>
                                </div>
                                <StepTracker currentStep={step} totalSteps={totalSteps} />
                            </div>
                        )}

                        {/* Body */}
                        <div className="p-6 flex-grow overflow-y-auto">
                            <AnimatePresence mode="wait">
                                {renderStep()}
                            </AnimatePresence>
                        </div>

                        {/* Footer Controls */}
                        {step !== 5 && (
                            <div className="p-6 pt-2 border-t border-gray-100 flex gap-3 bg-gray-50/50">
                                {step > 1 && (
                                    <button
                                        onClick={handleBack}
                                        className="flex-1 py-4 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <ArrowLeft className="w-5 h-5" /> Volver
                                    </button>
                                )}
                                <button
                                    onClick={handleNext}
                                    className={`flex-[2] py-4 rounded-xl font-bold text-white shadow-lg shadow-current/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${type === 'perdido' ? 'bg-love shadow-love/30' : 'bg-health shadow-health/30'}`}
                                >
                                    {step === totalSteps ? '📢 PUBLICAR AVISO' : 'Siguiente'}
                                    {step !== totalSteps && <ArrowRight className="w-5 h-5" />}
                                </button>
                            </div>
                        )}

                        {/* Final Step Close Button */}
                        {step === 5 && (
                            <div className="p-6 pt-0">
                                <button onClick={onClose} className="w-full py-3 text-gray-400 font-bold hover:bg-gray-50 rounded-xl">
                                    Cerrar
                                </button>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ReportWizard;
