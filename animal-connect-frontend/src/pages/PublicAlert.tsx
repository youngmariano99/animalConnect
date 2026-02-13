import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Phone, MessageCircle, AlertTriangle, MapPin, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface Animal {
    id: number;
    nombre: string;
    descripcion: string;
    imagenUrl: string;
    telefonoContacto: string;
    direccion: string;
    fechaPublicacion: string;
    idEstado: number; // 1: Perdido, 2: Encontrado
    especie: { nombre: string };
    ubicacionLat: number;
    ubicacionLon: number;
}

const PublicAlert = () => {
    const { id } = useParams();
    const [animal, setAnimal] = useState<Animal | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) fetchAnimal(id);
    }, [id]);

    const fetchAnimal = async (animalId: string) => {
        try {
            const res = await fetch(`http://localhost:5269/api/Animales/${animalId}`);
            if (res.ok) {
                const data = await res.json();
                setAnimal(data);
            }
        } catch (error) {
            console.error("Error fetching animal:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: `¡Ayuda! ${animal?.nombre} está perdido`,
                text: `Por favor ayudanos a encontrar a ${animal?.nombre}. Mira su perfil aquí:`,
                url: window.location.href
            });
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-400">Cargando alerta...</div>;
    if (!animal) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">Alerta no encontrada o expirada.</div>;

    const isLost = animal.idEstado === 1;

    return (
        <div className="min-h-screen bg-canvas pb-20 font-nunito">
            {/* Header de Emergencia */}
            <div className={`p-4 text-center ${isLost ? 'bg-love' : 'bg-health'} text-white shadow-lg`}>
                <div className="flex items-center justify-center gap-2 mb-1">
                    <AlertTriangle className="w-6 h-6 animate-pulse" />
                    <h1 className="text-2xl font-black uppercase tracking-wider">{isLost ? '¡SE BUSCA!' : '¡ENCONTRADO!'}</h1>
                </div>
                <p className="text-sm font-bold opacity-90">Por favor, ayudanos a difundir</p>
            </div>

            <div className="max-w-md mx-auto relative -mt-6 px-4">
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-white rounded-3xl shadow-xl overflow-hidden border-4 border-white"
                >
                    {/* Foto Principal */}
                    <div className="aspect-square bg-gray-100 relative">
                        {animal.imagenUrl ? (
                            <img src={animal.imagenUrl} alt={animal.nombre} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">Sin Foto</div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6 pt-20">
                            <h2 className="text-3xl font-black text-white mb-1">{animal.nombre}</h2>
                            <p className="text-white/90 font-bold flex items-center gap-2">
                                <span className="bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs uppercase">{animal.especie?.nombre}</span>
                                <span className="text-sm">{new Date(animal.fechaPublicacion).toLocaleDateString()}</span>
                            </p>
                        </div>
                    </div>

                    {/* Detalles */}
                    <div className="p-6 space-y-6">
                        {/* Ubicación */}
                        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <MapPin className="w-6 h-6 text-gray-400 mt-1" />
                            <div>
                                <h3 className="font-bold text-gray-800 text-sm uppercase mb-1">Visto por última vez en</h3>
                                <p className="text-lg font-medium text-gray-600 leading-tight">{animal.direccion || "Zona no especificada"}</p>
                            </div>
                        </div>

                        {/* Descripción */}
                        <div className="space-y-2">
                            <h3 className="font-bold text-gray-400 text-xs uppercase tracking-widest">Descripción</h3>
                            <p className="text-gray-700 leading-relaxed text-lg">{animal.descripcion}</p>
                        </div>

                        {/* Botones de Acción (Floating en Mobile, pero aquí inline) */}
                        <div className="space-y-3 pt-4">
                            <a
                                href={`tel:${animal.telefonoContacto}`}
                                className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 text-white font-black text-lg shadow-lg active:scale-95 transition-transform ${isLost ? 'bg-love shadow-love/30' : 'bg-health shadow-health/30'}`}
                            >
                                <Phone className="w-6 h-6" />
                                Llamar Ahora
                            </a>

                            <a
                                href={`https://wa.me/${animal.telefonoContacto?.replace(/[^0-9]/g, '')}?text=Hola, vi tu alerta sobre ${animal.nombre} en AnimalConnect.`}
                                target="_blank"
                                rel="noreferrer"
                                className="w-full py-4 bg-gray-800 text-white rounded-2xl flex items-center justify-center gap-3 font-bold text-lg shadow-lg active:scale-95 transition-transform"
                            >
                                <MessageCircle className="w-6 h-6" />
                                Whatsapp
                            </a>

                            <button
                                onClick={handleShare}
                                className="w-full py-3 bg-white border-2 border-gray-100 text-gray-600 rounded-2xl flex items-center justify-center gap-2 font-bold hover:bg-gray-50"
                            >
                                <Share2 className="w-5 h-5" />
                                Compartir Difusión
                            </button>
                        </div>
                    </div>
                </motion.div>

                <p className="text-center text-gray-400 text-xs mt-8 mb-8 font-medium">
                    Impulsado por <br />
                    <span className="text-tech font-black text-sm">AnimalConnect</span>
                </p>
            </div>
        </div>
    );
};

export default PublicAlert;
