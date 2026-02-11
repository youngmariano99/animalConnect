import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, Circle } from 'react-leaflet';
import { Building, MapPin, Save } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Municipios = () => {
    const [formData, setFormData] = useState({
        nombreMunicipio: '',
        provincia: '',
        usuario: '',
        password: '',
        radioKm: 15,
        latitud: 0,
        longitud: 0
    });
    const [cargando, setCargando] = useState(false);

    const LocationPicker = () => {
        useMapEvents({
            click(e) {
                setFormData(prev => ({ ...prev, latitud: e.latlng.lat, longitud: e.latlng.lng }));
            },
        });
        return formData.latitud !== 0 ? (
            <>
                <Marker position={[formData.latitud, formData.longitud]} />
                <Circle center={[formData.latitud, formData.longitud]} radius={formData.radioKm * 1000} pathOptions={{ color: 'orange', fillColor: '#f97316', fillOpacity: 0.2 }} />
            </>
        ) : null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.latitud === 0) return alert("Por favor selecciona la ubicación en el mapa");

        setCargando(true);
        try {
            const res = await fetch('http://localhost:5269/api/SuperAdmin/crear-municipio', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                alert("Municipio Creado Exitosamente");
                setFormData({ ...formData, nombreMunicipio: '', usuario: '', password: '', latitud: 0, longitud: 0 });
            } else {
                const txt = await res.text();
                alert(`Error: ${txt}`);
            }
        } catch (error) {
            console.error(error);
            alert("Error de conexión");
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-2">Gestión de Municipios</h1>
            <p className="text-slate-400 mb-8">Da de alta nuevos municipios en la plataforma.</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Form */}
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-700">
                            <Building className="w-6 h-6 text-orange-500" />
                            <h2 className="text-xl font-bold text-white">Datos de la Entidad</h2>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Nombre del Municipio</label>
                            <input required className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-orange-500 outline-none"
                                placeholder="Ej: Municipalidad de Coronel Pringles"
                                value={formData.nombreMunicipio}
                                onChange={e => setFormData({ ...formData, nombreMunicipio: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Provincia</label>
                            <input required className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-orange-500 outline-none"
                                placeholder="Ej: Buenos Aires"
                                value={formData.provincia}
                                onChange={e => setFormData({ ...formData, provincia: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Usuario Admin</label>
                                <input required className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-orange-500 outline-none"
                                    placeholder="zoonosis_pringles"
                                    value={formData.usuario}
                                    onChange={e => setFormData({ ...formData, usuario: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Contraseña</label>
                                <input required type="password" className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-orange-500 outline-none"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Radio de Cobertura (KM)</label>
                            <div className="flex items-center gap-4">
                                <input type="range" min="1" max="100" className="flex-1 accent-orange-500"
                                    value={formData.radioKm}
                                    onChange={e => setFormData({ ...formData, radioKm: parseInt(e.target.value) })}
                                />
                                <span className="bg-slate-700 px-3 py-1 rounded text-white font-mono">{formData.radioKm} km</span>
                            </div>
                        </div>

                        <button type="submit" disabled={cargando} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-900/40 transition mt-6 flex items-center justify-center gap-2">
                            {cargando ? 'Creando...' : <><Save className="w-5 h-5" /> Crear Municipio</>}
                        </button>
                    </form>
                </div>

                {/* Map */}
                <div className="bg-slate-800 p-1 rounded-2xl border border-slate-700 h-[600px] overflow-hidden relative">
                    <MapContainer center={[-38.4161, -63.6167]} zoom={5} style={{ height: "100%", width: "100%", borderRadius: "1rem" }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
                        <LocationPicker />
                    </MapContainer>
                    {formData.latitud === 0 && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none z-[1000]">
                            <div className="bg-slate-900/90 text-white px-6 py-3 rounded-full backdrop-blur border border-slate-700 shadow-xl flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-orange-500 animate-bounce" />
                                <span>Toca el mapa para ubicar el centro</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Municipios;
