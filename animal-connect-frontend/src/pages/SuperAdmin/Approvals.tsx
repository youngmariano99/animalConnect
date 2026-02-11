import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Check, X, MapPin, ExternalLink, Loader2, ShieldCheck, Users } from 'lucide-react';

interface PendingEntity {
    id: number;
    nombre: string;         // mapped from nombreVeterinaria or nombre
    usuario: string;        // mapped from nombreUsuario or emailContacto
    subtitulo: string;      // mapped from matricula or descripcion
    direccion: string;
    lat: number;
    lng: number;
    raw: any;
}

const Approvals = () => {
    const { type } = useParams(); // 'vets' or 'ongs'
    const isVet = type === 'vets';

    const [items, setItems] = useState<PendingEntity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [type]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const endpoint = isVet
                ? 'http://localhost:5269/api/SuperAdmin/veterinarios-pendientes'
                : 'http://localhost:5269/api/SuperAdmin/ongs-pendientes';

            const res = await fetch(endpoint);
            if (res.ok) {
                const data = await res.json();
                const mapped = data.map((d: any) => ({
                    id: d.id,
                    nombre: isVet ? d.nombreVeterinaria : d.nombre,
                    usuario: isVet ? d.nombreUsuario : d.emailContacto,
                    subtitulo: isVet ? `Matrícula: ${d.matriculaProfesional}` : d.descripcion,
                    direccion: isVet ? (d.direccion || 'Sin dirección cargada') : `${d.ciudad}, ${d.barrio || ''}`,
                    lat: isVet ? (d.lat || 0) : 0,
                    lng: isVet ? (d.lng || 0) : 0,
                    raw: d
                }));
                setItems(mapped);
            } else {
                setItems([]);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: number, action: 'aprobar' | 'rechazar') => {
        if (!confirm(`¿Seguro deseas ${action} esta solicitud?`)) return;

        try {
            let url = '';
            if (isVet) {
                url = action === 'aprobar'
                    ? `http://localhost:5269/api/SuperAdmin/aprobar-vet/${id}`
                    : `http://localhost:5269/api/SuperAdmin/rechazar-vet/${id}`;
            } else {
                url = action === 'aprobar'
                    ? `http://localhost:5269/api/SuperAdmin/aprobar-ong/${id}`
                    : `http://localhost:5269/api/SuperAdmin/rechazar-ong/${id}`;
            }

            const res = await fetch(url, { method: 'POST' });
            if (res.ok) {
                alert(`Solicitud ${action}da con éxito.`);
                fetchData();
            } else {
                alert("Error al procesar solicitud.");
            }
        } catch (e) { console.error(e); }
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <div className={`p-3 rounded-xl ${isVet ? 'bg-blue-500' : 'bg-purple-500'}`}>
                    {isVet ? <ShieldCheck className="w-8 h-8 text-white" /> : <Users className="w-8 h-8 text-white" />}
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white">Solicitudes de {isVet ? 'Veterinarios' : 'ONGs'}</h1>
                    <p className="text-slate-400">Revisa y aprueba las solicitudes de registro pendientes.</p>
                </div>
            </div>

            {loading ? (
                <div className="py-20 flex justify-center">
                    <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
                </div>
            ) : items.length === 0 ? (
                <div className="bg-slate-800 rounded-3xl p-12 text-center border border-slate-700 border-dashed">
                    <p className="text-slate-500 text-lg">No hay solicitudes pendientes en este momento.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {items.map(item => (
                        <div key={item.id} className="bg-slate-800 p-6 rounded-2xl border border-slate-700 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-slate-600 transition">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="text-xl font-bold text-white">{item.nombre}</h3>
                                    <span className="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded-md font-mono">{item.usuario}</span>
                                </div>
                                <p className={`text-sm font-medium mb-3 ${isVet ? 'text-orange-400' : 'text-purple-400'}`}>{item.subtitulo}</p>

                                <div className="flex items-center gap-4 text-sm text-slate-400">
                                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {item.direccion}</span>
                                    {(item.lat !== 0) && (
                                        <a href={`https://www.google.com/maps/search/?api=1&query=${item.lat},${item.lng}`} target="_blank" className="text-blue-400 hover:text-blue-300 flex items-center gap-1">
                                            <ExternalLink className="w-3 h-3" /> Ver Mapa
                                        </a>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleAction(item.id, 'rechazar')}
                                    className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500 hover:text-white rounded-xl font-bold transition flex items-center gap-2"
                                >
                                    <X className="w-4 h-4" /> Rechazar
                                </button>
                                <button
                                    onClick={() => handleAction(item.id, 'aprobar')}
                                    className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold shadow-lg shadow-green-900/20 transition flex items-center gap-2"
                                >
                                    <Check className="w-4 h-4" /> Aprobar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Approvals;
