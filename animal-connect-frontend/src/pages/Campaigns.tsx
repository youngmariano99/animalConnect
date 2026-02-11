import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Calendar, MapPin, Phone, Syringe, HeartHandshake, User } from 'lucide-react';
import { divIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Campana {
    id: number;
    titulo: string;
    descripcion: string;
    tipo: 'Vacunacion' | 'Castracion' | 'Adopcion';
    fechaInicio: string;
    fechaFin: string;
    ubicacionLat: number;
    ubicacionLon: number;
    direccion: string;
    organizador: string;
    contactoWhatsapp?: string;
}

const customIcon = (type: string) => divIcon({
    className: '',
    html: `<div class="w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white ${type === 'Vacunacion' ? 'bg-blue-500' :
        type === 'Castracion' ? 'bg-purple-500' : 'bg-green-500'
        }">
    <i class="fas fa-${type === 'Vacunacion' ? 'syringe' : type === 'Castracion' ? 'notes-medical' : 'paw'}"></i>
  </div>`
});

const Campaigns = () => {
    const [campanas, setCampanas] = useState<Campana[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'map' | 'list'>('map');

    useEffect(() => {
        fetchCampanas();
    }, []);

    const fetchCampanas = async () => {
        try {
            const res = await fetch('http://localhost:5269/api/Campanias');
            const data = await res.json();
            setCampanas(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20 flex flex-col">
            {/* Header */}
            <div className="bg-white p-4 shadow-sm z-20 flex justify-between items-center sticky top-0">
                <h1 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                    <HeartHandshake className="text-red-500" /> Salud Pública
                </h1>
                <div className="bg-gray-100 rounded-lg p-1 flex">
                    <button
                        onClick={() => setView('map')}
                        className={`p-2 rounded-md transition ${view === 'map' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}
                    >
                        <MapPin className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setView('list')}
                        className={`p-2 rounded-md transition ${view === 'list' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}
                    >
                        <Calendar className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 relative">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                    </div>
                ) : view === 'map' ? (
                    <MapContainer
                        center={[-37.99, -61.35]} // Default to Pringles
                        zoom={13}
                        style={{ height: '100%', width: '100%', zIndex: 0 }}
                    >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        {campanas.map(c => (
                            <Marker
                                key={c.id}
                                position={[c.ubicacionLat, c.ubicacionLon]}
                                icon={customIcon(c.tipo)}
                            >
                                <Popup>
                                    <div className="min-w-[200px]">
                                        <h3 className="font-bold text-gray-800 mb-1">{c.titulo}</h3>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase ${c.tipo === 'Vacunacion' ? 'bg-blue-100 text-blue-600' :
                                            c.tipo === 'Castracion' ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-600'
                                            }`}>
                                            {c.tipo}
                                        </span>
                                        <p className="text-sm text-gray-600 my-2">{c.direccion}</p>
                                        {c.contactoWhatsapp && (
                                            <a
                                                href={`https://wa.me/${c.contactoWhatsapp}`}
                                                target="_blank"
                                                className="block w-full bg-green-500 text-white text-center py-2 rounded-lg font-bold text-xs"
                                            >
                                                Reservar Turno
                                            </a>
                                        )}
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                ) : (
                    <div className="p-4 space-y-4">
                        {campanas.map(c => (
                            <div key={c.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
                                <div className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center ${c.tipo === 'Vacunacion' ? 'bg-blue-100 text-blue-500' :
                                    c.tipo === 'Castracion' ? 'bg-purple-100 text-purple-500' : 'bg-green-100 text-green-500'
                                    }`}>
                                    {c.tipo === 'Vacunacion' ? <Syringe /> : <User />}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-gray-800">{c.titulo}</h3>
                                        <span className="text-xs font-bold text-gray-400">
                                            {new Date(c.fechaInicio).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-2">{c.descripcion}</p>
                                    <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
                                        <MapPin className="w-3 h-3" /> {c.direccion}
                                    </div>
                                    {c.contactoWhatsapp && (
                                        <a
                                            href={`https://wa.me/${c.contactoWhatsapp}`}
                                            target="_blank"
                                            className="inline-flex items-center gap-2 bg-green-50 text-green-600 px-3 py-1.5 rounded-lg text-xs font-bold"
                                        >
                                            <Phone className="w-3 h-3" /> Contactar
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Campaigns;
