import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion } from 'framer-motion';
import { Search, Map as MapIcon, List, Star, Navigation, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// --- ICONS ---
const createIcon = (color: string) => L.divIcon({
    className: 'custom-pin',
    html: `<div style="background-color: ${color}; width: 36px; height: 36px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/></svg>
    </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36]
});

const icons: Record<string, L.DivIcon> = {
    'Veterinaria': createIcon('#4E9F3D'), // Green
    'PetShop': createIcon('#FF8A65'),     // Orange
    'Peluqueria': createIcon('#ba68c8'),  // Purple
    'Destacado': createIcon('#FFD700')    // Gold
};

const MapUpdater = ({ center }: { center: [number, number] }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
};

const Marketplace = () => {
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
    const [comercios, setComercios] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRubro, setSelectedRubro] = useState<string | null>(null);
    const [userLocation, setUserLocation] = useState<[number, number]>([-34.6037, -58.3816]);

    // Categories for filter chips
    const categories = [
        { id: 'Veterinaria', label: 'Veterinarias', color: 'bg-green-100 text-green-700' },
        { id: 'PetShop', label: 'Pet Shops', color: 'bg-orange-100 text-orange-700' },
        { id: 'Peluqueria', label: 'Peluquería', color: 'bg-purple-100 text-purple-700' },
        { id: 'BarFriendly', label: 'Pet Friendly', color: 'bg-blue-100 text-blue-700' }
    ];

    useEffect(() => {
        // Get Location
        navigator.geolocation.getCurrentPosition(
            (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
            () => console.warn("GPS no disponible, usando default")
        );

        fetchComercios();
    }, [selectedRubro]);

    const fetchComercios = async () => {
        setLoading(true);
        try {
            let url = `http://localhost:5269/api/Comercios?lat=${userLocation[0]}&lng=${userLocation[1]}&radio=20`;
            if (selectedRubro) url += `&rubro=${selectedRubro}`;

            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                setComercios(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen flex flex-col bg-canvas overflow-hidden">
            {/* --- HEADER SEARCH --- */}
            <div className="bg-white px-4 pt-4 pb-2 z-[500] shadow-sm">
                <div className="flex gap-3 mb-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar tiendas, servicios..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-100 border-none font-medium focus:ring-2 focus:ring-tech/20 outline-none"
                        />
                    </div>
                    <button
                        onClick={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
                        className="bg-tech text-white p-2.5 rounded-xl shadow-lg shadow-tech/30 active:scale-95 transition-transform"
                    >
                        {viewMode === 'map' ? <List className="w-6 h-6" /> : <MapIcon className="w-6 h-6" />}
                    </button>
                </div>

                {/* Categories */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    <button
                        onClick={() => setSelectedRubro(null)}
                        className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors border ${!selectedRubro ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-500 border-gray-200'}`}
                    >
                        Todos
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedRubro(selectedRubro === cat.id ? null : cat.id)}
                            className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors border ${selectedRubro === cat.id ? 'border-transparent shadow-md' : 'border-gray-200 bg-white text-gray-500'} ${selectedRubro === cat.id ? cat.color : ''}`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* --- CONTENT --- */}
            <div className="flex-1 relative">
                {loading && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-sm">
                        <div className="animate-spin text-tech text-4xl">⏳</div>
                    </div>
                )}

                {viewMode === 'map' ? (
                    <MapContainer
                        center={userLocation}
                        zoom={14}
                        style={{ height: "100%", width: "100%" }}
                        zoomControl={false}
                    >
                        <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                        <MapUpdater center={userLocation} />

                        {/* User Location */}
                        <Marker position={userLocation} icon={L.divIcon({ className: 'user-loc', html: '<div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg pulse-ring"></div>' })} />

                        {comercios.map(c => (
                            <Marker
                                key={c.id}
                                position={[c.latitud, c.longitud]}
                                icon={c.esDestacado ? icons['Destacado'] : (icons[c.etiquetas] || icons['PetShop'])}
                                eventHandlers={{
                                    click: () => navigate(`/comercio/${c.id}`)
                                }}
                            >
                            </Marker>
                        ))}
                    </MapContainer>
                ) : (
                    <div className="h-full overflow-y-auto p-4 space-y-4 pb-24">
                        {comercios.map((c, i) => (
                            <motion.div
                                key={c.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                onClick={() => navigate(`/comercio/${c.id}`)}
                                className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 cursor-pointer active:scale-[0.98] transition-transform"
                            >
                                <div className="w-20 h-20 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden">
                                    <img src={c.logoUrl || "https://cdn-icons-png.flaticon.com/512/3081/3081559.png"} className="w-full h-full object-cover" alt={c.nombre} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-tech text-lg leading-tight">{c.nombre}</h3>
                                            <p className="text-xs font-bold text-gray-400 mt-1 uppercase">{c.etiquetas}</p>
                                        </div>
                                        {c.distanciaKm > 0 && (
                                            <span className="text-xs font-bold text-tech bg-gray-100 px-2 py-1 rounded-lg flex items-center gap-1">
                                                <Navigation className="w-3 h-3" /> {c.distanciaKm.toFixed(1)}km
                                            </span>
                                        )}
                                    </div>
                                    <div className="mt-3 flex items-center gap-1 text-yellow-500 text-xs font-bold">
                                        <Star className="w-4 h-4 fill-current" /> 4.8 <span className="text-gray-300 font-normal">(120)</span>
                                    </div>
                                </div>
                                <div className="flex items-center text-gray-300">
                                    <ChevronRight className="w-6 h-6" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* --- CAROUSEL (MAP MODE) --- */}
            {viewMode === 'map' && comercios.length > 0 && (
                <div className="absolute bottom-4 left-0 right-0 z-[400] overflow-x-auto flex gap-4 px-4 pb-4 snap-x scrollbar-hide">
                    {comercios.slice(0, 5).map(c => (
                        <div
                            key={c.id}
                            onClick={() => navigate(`/comercio/${c.id}`)}
                            className="bg-white p-3 rounded-2xl shadow-xl w-[280px] flex-shrink-0 snap-center flex gap-3 border border-gray-100 cursor-pointer"
                        >
                            <div className="w-16 h-16 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden">
                                <img src={c.logoUrl || "https://cdn-icons-png.flaticon.com/512/3081/3081559.png"} className="w-full h-full object-cover" alt={c.nombre} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-tech truncate">{c.nombre}</h4>
                                <p className="text-xs text-gray-500 truncate">{c.direccion}</p>
                                <div className="flex justify-between mt-2">
                                    <span className="text-[10px] font-bold uppercase bg-orange-50 text-orange-600 px-2 py-0.5 rounded">{c.etiquetas}</span>
                                    <span className="text-xs font-bold text-tech flex items-center gap-1"><Navigation className="w-3 h-3" /> {c.distanciaKm?.toFixed(1)}km</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Marketplace;
