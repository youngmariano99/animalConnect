import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Home, Filter, ShieldCheck, Map, Users, Dog, Cat } from 'lucide-react';
import { motion } from 'framer-motion';

// --- ICONS ---
const iconTransit = L.divIcon({
    className: 'custom-pin',
    html: `<div style="background-color: #5B9279; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.2);">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32]
});

// --- MOCK DATA REMOVED ---

const ONGDashboard = () => {
    const navigate = useNavigate();
    const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
    const [transitos, setTransitos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!usuario) {
            navigate('/login');
            return;
        }

        fetchTransitos();
    }, []);

    const fetchTransitos = async () => {
        try {
            // Fetch all transit homes (filtered by proximity approx 50km for now?)
            // Backend endpoint: GET /api/Hogares/buscar
            // Params: usuarioSolicitanteId, lat, lng, radio

            // Simulating center of Buenos Aires if user location not available or use user's loc
            // For now, we'll ask for a wide range.
            const url = `http://localhost:5269/api/Hogares/buscar?usuarioSolicitanteId=${usuario.id}&lat=-34.6037&lng=-58.3816&radio=50`;

            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                // Map backend data to frontend structure if needed
                // Backend returns: { id, direccionAproximada, latitud, longitud, tipoVivienda, tienePatioCerrado, nombreContacto... }

                const mapped = data.map((h: any) => ({
                    id: h.id,
                    nombre: h.nombreContacto || 'Usuario Anónimo',
                    direccion: h.direccionAproximada,
                    tipo: h.tipoVivienda + (h.tienePatioCerrado ? ' con Patio' : ''),
                    estado: 'Pendiente', // Backend doesn't strictly return state 'Pendiente/Validado' for the listing search?
                    // Wait, search returns "Hogares". Need to check if there is a "Validation" status.
                    // The Controller returns "Estado" in the entity, but "BuscarHogares" projection might not include it.
                    // Let's check the Controller projection...
                    // Projection: id, direccionAproximada, lat, lng, tipoVivienda, tienePatioCerrado...
                    // It does NOT include 'Estado'. It filters by "Active".
                    // But for the Dashboard we want to see PENDING ones too?
                    // The controller filters `UltimaActualizacion > 30 days`.
                    // It seems the current backend logic is "Search for available homes".
                    // For "NGO Validation Dashboard", we might need a different endpoint or use this one.
                    // Let's assume for now we list what we find.
                    lat: h.latitud,
                    lng: h.longitud,
                    perros: true, // Mocked for now as not in return
                    gatos: false
                }));
                setTransitos(mapped);
            } else {
                console.error("Error fetching homes");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleValidar = (id: number) => {
        if (confirm("¿Validar este hogar de tránsito?")) {
            // For now just local update, backend update would require an endpoint
            setTransitos(prev => prev.map(t => t.id === id ? { ...t, estado: 'Validado' } : t));
        }
    };

    // Mocking 'Pendiente' logic for UI demo since backend returns all active
    // We will treat all fetched as "Pendiente" of verification by THIS ONG for the UX
    const pendientes = transitos.filter(t => t.estado !== 'Validado'); // All initially

    return (
        <div className="min-h-screen bg-canvas font-sans text-tech pb-24">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-md sticky top-0 z-[100] border-b border-gray-100">
                <div className="container mx-auto px-4 h-20 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-love/10 p-2.5 rounded-xl text-love">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-lg font-heading font-extrabold text-tech leading-none">Panel de ONG</h1>
                            <p className="text-xs text-gray-500 font-medium mt-1">Gestión de Red</p>
                        </div>
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-4 py-8">

                {/* Stats / Actions */}
                {loading ? (
                    <div className="flex justify-center p-20"><span className="animate-spin text-tech">⏳ Cargando...</span></div>
                ) : (
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                            <span className="text-3xl font-heading font-extrabold text-love mb-1">{pendientes.length}</span>
                            <span className="text-xs font-bold text-gray-400 uppercase">Validaciones Pendientes</span>
                        </div>
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                            <span className="text-3xl font-heading font-extrabold text-nature mb-1">{transitos.length}</span>
                            <span className="text-xs font-bold text-gray-400 uppercase">Hogares en Red</span>
                        </div>
                    </div>
                )}

                {/* Toolbar */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-heading font-bold text-tech flex items-center gap-2">
                        <Users className="w-5 h-5 text-gray-400" /> Red de Tránsitos
                    </h2>
                    <div className="flex bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-gray-100 text-tech shadow-inner' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <Filter className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('map')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'map' ? 'bg-gray-100 text-tech shadow-inner' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <Map className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                {viewMode === 'list' ? (
                    <div className="space-y-4">
                        {transitos.map((t) => (
                            <motion.div
                                key={t.id}
                                layout
                                className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-4">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${t.estado === 'Validado' ? 'bg-nature/10 text-nature' : 'bg-orange-100 text-orange-500'}`}>
                                            <Home className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-tech">{t.nombre}</h3>
                                            <p className="text-sm text-gray-500">{t.direccion}</p>
                                            <div className="flex gap-2 mt-1">
                                                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-500 font-medium">{t.tipo}</span>
                                                {t.perros && <Dog className="w-3 h-3 text-gray-400" />}
                                                {t.gatos && <Cat className="w-3 h-3 text-gray-400" />}
                                            </div>
                                        </div>
                                    </div>
                                    {t.estado === 'Pendiente' && (
                                        <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase">Pendiente</span>
                                    )}
                                </div>

                                {t.estado === 'Pendiente' && (
                                    <div className="flex gap-2 pt-4 border-t border-gray-50">
                                        <button className="flex-1 py-2.5 rounded-xl border border-gray-200 font-bold text-gray-500 text-sm hover:bg-gray-50">Rechazar</button>
                                        <button
                                            onClick={() => handleValidar(t.id)}
                                            className="flex-1 py-2.5 rounded-xl bg-nature text-white font-bold text-sm shadow-lg shadow-nature/20 hover:bg-nature/90"
                                        >
                                            Validar
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="h-[500px] w-full rounded-3xl overflow-hidden border border-gray-200 shadow-inner relative">
                        <MapContainer center={[-34.6037, -58.3816]} zoom={13} style={{ height: "100%", width: "100%" }}>
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            {transitos.map(t => (
                                <Marker key={t.id} position={[t.lat, t.lng]} icon={iconTransit}>
                                    <Popup>
                                        <strong>{t.nombre}</strong><br />
                                        {t.direccion}<br />
                                        Status: {t.estado}
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                        <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur p-3 rounded-xl text-xs font-bold text-gray-600 shadow-lg text-center z-[1000]">
                            Mapa Privado - Solo visible para tu ONG
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ONGDashboard;
