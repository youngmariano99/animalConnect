import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, Map as MapIcon, List, Dog, Cat } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import PetCard from '../components/PetCard';
import QuickActions from '../components/QuickActions';
import ReportWizard from './ReportWizard'; // Nuevo Wizard

// --- CONFIGURACIÓN DE ÍCONOS ---
const getIcon = (idEspecie: number, idEstado: number) => {
    const especie = Number(idEspecie);
    const estado = Number(idEstado);
    const color = estado === 1 ? '#ef4444' : '#22c55e'; // Rojo: Perdido, Verde: Encontrado/Adopción

    // SVGs simplificados de Lucide para incrustar en HTML string de Leaflet
    const pawSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703 1.725 1.722 3.656 1 1.261-.472 1.96-1.454 2.344-2.5"/><path d="M14.267 5.172c0-1.39 1.577-2.493 3.5-2.172 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.96-1.454-2.344-2.5"/><path d="M8 14v.5"/><path d="M16 14v.5"/><path d="M11.25 16.25h1.5L12 17l-.75-.75Z"/><path d="M4.42 11.247A4.335 4.335 0 0 1 6.964 9.6c.98-.312 2.022-.23 2.89.366l.734.468a2 2 0 0 0 2.824 0l.734-.468c.868-.596 1.91-.678 2.89-.366 2.057.653 3.493 2.454 3.415 4.605-.078 2.148-1.558 3.96-3.673 4.416a10.99 10.99 0 0 1-8.558 0c-2.115-.456-3.595-2.268-3.673-4.416Z"/></svg>';
    const dogSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703 1.725 1.722 3.656 1 1.261-.472 1.96-1.454 2.344-2.5"/><path d="M14.267 5.172c0-1.39 1.577-2.493 3.5-2.172 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.96-1.454-2.344-2.5"/><path d="M8 14v.5"/><path d="M16 14v.5"/><path d="M11.25 16.25h1.5L12 17l-.75-.75Z"/></svg>';
    const catSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5c.67 0 1.35.09 2 .26 1.78-2 5.03-2.84 6.42-2.26 1.4.58-.42 7-.42 7 .57 1.07 1 2.24 1 3.44C21 17.9 16.97 21 12 21S3 17.9 3 13.44C3 12.24 3.43 11.07 4 10c0 0-1.82-6.42-.42-7 1.39-.58 4.64.26 6.42 2.26.65-.17 1.33-.26 2-.26Z"/></svg>';

    let iconHtml = pawSvg;
    if (especie === 1) iconHtml = dogSvg;
    if (especie === 2) iconHtml = catSvg;

    return L.divIcon({
        className: 'custom-pin',
        html: `<div style="
                  background-color: ${color}; 
                  width: 40px; height: 40px; 
                  border-radius: 50%; 
                  border: 3px solid white; 
                  display: flex; align-items: center; justify-content: center; 
                  box-shadow: 0 4px 10px rgba(0,0,0,0.3);
                ">
                  ${iconHtml}
               </div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40]
    });
};

// --- INTERFACES ---
interface Animal {
    id: number;
    nombre: string;
    descripcion: string;
    imagenUrl: string;
    idEstado: number;
    idEspecie: number;
    ubicacionLat: number;
    ubicacionLon: number;
    telefonoContacto?: string;
    fechaPublicacion?: string;
}

const Home = () => {
    // ESTADOS UI
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
    const [activeFilter, setActiveFilter] = useState<'todos' | 'perdidos' | 'encontrados'>('todos');
    const [speciesFilter, setSpeciesFilter] = useState<'todos' | 'perro' | 'gato'>('todos');

    // UBICACIÓN & DATA
    const [ubicacion, setUbicacion] = useState<{ lat: number, lng: number } | null>({ lat: -37.9943, lng: -61.3572 }); // Bahía Blanca default
    const [esUbicacionReal, setEsUbicacionReal] = useState(false);
    const [animales, setAnimales] = useState<Animal[]>([]);
    const [cargando, setCargando] = useState(true);

    // FORMULARIO REPORTE (Wizard)
    const [modalAbierto, setModalAbierto] = useState(false);
    const [tipoReporte, setTipoReporte] = useState<'perdido' | 'encontrado'>('perdido');

    useEffect(() => {
        if (ubicacion) cargarAnimales(ubicacion.lat, ubicacion.lng);

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const userLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setUbicacion(userLoc);
                setEsUbicacionReal(true);
                cargarAnimales(userLoc.lat, userLoc.lng);
            },
            (err) => console.warn("GPS error:", err)
        );
    }, []);

    const cargarAnimales = async (lat: number, lng: number) => {
        try {
            const res = await fetch(`http://localhost:5269/api/Animales?lat=${lat}&lng=${lng}&radio=50`);
            if (res.ok) {
                const data = await res.json();
                setAnimales(data);
            }
        } catch (error) {
            console.error("Error cargando animales:", error);
        } finally {
            setCargando(false);
        }
    };

    const animalesFiltrados = animales.filter(a => {
        const estadoMatch =
            activeFilter === 'todos' ? true :
                activeFilter === 'perdidos' ? a.idEstado === 1 :
                    (a.idEstado === 2 || a.idEstado === 3);

        const especieMatch =
            speciesFilter === 'todos' ? true :
                speciesFilter === 'perro' ? a.idEspecie === 1 :
                    a.idEspecie === 2;

        return estadoMatch && especieMatch;
    });

    const handleWizardSubmit = async (data: any) => {
        try {
            const formData = new FormData();
            formData.append('Nombre', data.nombre);
            formData.append('Descripcion', data.descripcion);
            formData.append('IdEstado', data.type === 'perdido' ? '1' : '2'); // 1: Perdido, 2: Encontrado
            formData.append('IdEspecie', data.especie);
            formData.append('UbicacionLat', data.lat.toString().replace(',', '.'));
            formData.append('UbicacionLon', data.lng.toString().replace(',', '.'));
            formData.append('TelefonoContacto', data.telefono);

            const user = JSON.parse(localStorage.getItem('usuario') || '{}');
            if (user.id) formData.append('UsuarioId', user.id);
            if (data.foto) formData.append('foto', data.foto);

            const res = await fetch('http://localhost:5269/api/Animales', { method: 'POST', body: formData });

            if (res.ok) {
                alert("¡Reporte publicado con éxito! 🐾");
                setModalAbierto(false);
                if (ubicacion) cargarAnimales(ubicacion.lat, ubicacion.lng);
            } else {
                alert("Hubo un error al publicar el reporte.");
            }
        } catch (error) {
            console.error("Error submitting wizard:", error);
            alert("Error de conexión");
        }
    };

    return (
        <div className="bg-canvas min-h-[calc(100vh-80px)] pb-24 relative">

            {/* --- HEADER DESKTOP / MOBILE --- */}
            <div className="sticky top-20 z-30 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">

                    {/* BUSCADOR */}
                    <div className="relative flex-grow max-w-md">
                        <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar por zona, nombre..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full border-none focus:ring-2 focus:ring-health text-sm font-medium"
                        />
                    </div>

                    {/* TOGGLE VISTA (LISTA / MAPA) */}
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow text-health' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <List className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('map')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'map' ? 'bg-white shadow text-health' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <MapIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* FILTROS (CHIPS) */}
                <div className="container mx-auto px-4 pb-3 overflow-x-auto flex gap-2 no-scrollbar">
                    <button onClick={() => setActiveFilter('todos')} className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${activeFilter === 'todos' ? 'bg-tech text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>Todos</button>
                    <button onClick={() => setActiveFilter('perdidos')} className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${activeFilter === 'perdidos' ? 'bg-love text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>Perdidos</button>
                    <button onClick={() => setActiveFilter('encontrados')} className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${activeFilter === 'encontrados' ? 'bg-health text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>Encontrados</button>
                    <div className="w-[1px] h-6 bg-gray-200 mx-1"></div>
                    <button onClick={() => setSpeciesFilter(speciesFilter === 'perro' ? 'todos' : 'perro')} className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 transition-colors ${speciesFilter === 'perro' ? 'bg-hope text-tech' : 'bg-white border border-gray-200 text-gray-600'}`}><Dog className="w-3 h-3" /> Perros</button>
                    <button onClick={() => setSpeciesFilter(speciesFilter === 'gato' ? 'todos' : 'gato')} className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 transition-colors ${speciesFilter === 'gato' ? 'bg-hope text-tech' : 'bg-white border border-gray-200 text-gray-600'}`}><Cat className="w-3 h-3" /> Gatos</button>
                </div>
            </div>

            {/* --- CONTENIDO PRINCIPAL --- */}
            <div className="container mx-auto px-4 py-6">

                {/* VISTA MAPA */}
                {viewMode === 'map' && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="h-[70vh] rounded-pet overflow-hidden shadow-lg border-2 border-white relative z-10"
                    >
                        <MapContainer
                            key={esUbicacionReal ? "real" : "default"}
                            center={[ubicacion!.lat, ubicacion!.lng]}
                            zoom={14}
                            style={{ height: "100%", width: "100%" }}
                        >
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                            <MarkerClusterGroup chunkedLoading>
                                {animalesFiltrados.map(animal => (
                                    (animal.ubicacionLat !== 0) && (
                                        <Marker
                                            key={animal.id}
                                            position={[animal.ubicacionLat, animal.ubicacionLon]}
                                            icon={getIcon(animal.idEspecie, animal.idEstado)}
                                        >
                                            <Popup>
                                                <div className="text-center">
                                                    <p className={`font-bold uppercase text-[10px] mb-1 ${animal.idEstado === 1 ? 'text-love' : 'text-health'}`}>
                                                        {animal.idEstado === 1 ? 'Perdido' : 'Encontrado'}
                                                    </p>
                                                    <b>{animal.nombre}</b>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    )
                                ))}
                            </MarkerClusterGroup>
                        </MapContainer>
                        {!esUbicacionReal && (
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-4 py-2 rounded-full text-xs font-bold shadow-md text-tech z-[500]">
                                📍 Buscando tu ubicación...
                            </div>
                        )}
                    </motion.div>
                )}

                {/* VISTA LISTA (GRID) */}
                {viewMode === 'list' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        <AnimatePresence>
                            {animalesFiltrados.map(animal => (
                                <PetCard key={animal.id} animal={animal} onClick={() => { }} />
                            ))}
                        </AnimatePresence>

                        {animalesFiltrados.length === 0 && !cargando && (
                            <div className="col-span-full text-center py-20 text-gray-400">
                                <Dog className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                <p className="font-medium text-lg">No encontramos mascotas por aquí.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* --- FAB QUICK ACTIONS --- */}
            <QuickActions
                onReportLost={() => { setTipoReporte('perdido'); setModalAbierto(true); }}
                onReportFound={() => { setTipoReporte('encontrado'); setModalAbierto(true); }}
            />

            {/* --- MODAL DE REPORTE --- */}
            <ReportWizard
                isOpen={modalAbierto}
                onClose={() => setModalAbierto(false)}
                type={tipoReporte}
                onSubmit={handleWizardSubmit}
                initialLocation={ubicacion!}
            />
        </div>
    );
};

export default Home;