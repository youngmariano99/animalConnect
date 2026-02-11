import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, User, Trophy, ShieldAlert, Plus, Store, Trash2, MapPin, Power, RefreshCw, Loader2, Home, HeartHandshake, CheckCircle } from 'lucide-react';
import StatsChart from '../components/StatsChart';

// --- INTERFACES ---
interface Animal {
    id: number;
    nombre: string;
    descripcion: string;
    imagenUrl: string;
    idEstado: number;
    fechaPublicacion: string;
    fechaUltimaRenovacion: string;
}

interface Clinica {
    id: number;
    nombre: string;
    direccion: string;
    esDeTurno: boolean;
    fechaInicioTurno?: string;
}

interface Comercio {
    id: number;
    nombre: string;
    direccion: string;
    rubro: string;
    logoUrl: string;
}

interface HogarTransito {
    id: number;
    capacidad: number;
    estaDisponible: boolean;
}

const Perfil = () => {
    const navigate = useNavigate();
    const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');

    // Estados
    const [cargando, setCargando] = useState(true);
    const [misAnimales, setMisAnimales] = useState<Animal[]>([]);
    const [misClinicas, setMisClinicas] = useState<Clinica[]>([]);
    const [misComercios, setMisComercios] = useState<Comercio[]>([]);
    const [miHogar, setMiHogar] = useState<HogarTransito | null>(null);
    const [finalizarId, setFinalizarId] = useState<number | null>(null); // ID of animal being finalized

    // Mock Data for Charts
    const dataVisitas = [
        { name: 'Lun', value: 12 }, { name: 'Mar', value: 19 }, { name: 'Mie', value: 15 },
        { name: 'Jue', value: 25 }, { name: 'Vie', value: 32 }, { name: 'Sab', value: 40 },
        { name: 'Dom', value: 28 },
    ];

    useEffect(() => {
        if (!usuario) {
            navigate('/login');
            return;
        }
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        setCargando(true);
        await Promise.all([
            cargarPublicaciones(),
            cargarComercios(),
            cargarHogar(),
            usuario.rol === 'Veterinario' && cargarClinicas(),
        ]);
        setCargando(false);
    };

    const cargarPublicaciones = async () => {
        try {
            const res = await fetch(`http://localhost:5269/api/Animales/usuario/${usuario.id}`);
            if (res.ok) setMisAnimales(await res.json());
        } catch (error) { console.error(error); }
    };

    const cargarClinicas = async () => {
        try {
            const res = await fetch(`http://localhost:5269/api/Clinicas/mis-clinicas/${usuario.id}`);
            if (res.ok) setMisClinicas(await res.json());
        } catch (e) { console.error(e); }
    };

    const cargarComercios = async () => {
        try {
            const res = await fetch(`http://localhost:5269/api/Comercios/mis-comercios/${usuario.id}`);
            if (res.ok) setMisComercios(await res.json());
        } catch (error) { console.error(error); }
    };

    const cargarHogar = async () => {
        try {
            const res = await fetch(`http://localhost:5269/api/Hogares/mi-hogar/${usuario.id}`);
            if (res.ok) setMiHogar(await res.json());
        } catch (error) { console.error(error); }
    };

    const toggleTurno = async (clinica: Clinica) => {
        if (!confirm(`¿Cambiar estado de guardia de ${clinica.nombre}?`)) return;
        try {
            const res = await fetch(`http://localhost:5269/api/Veterinarias/turno/${clinica.id}`, { method: 'PUT' });
            if (res.ok) cargarClinicas();
        } catch (e) { console.error(e); }
    };

    const handleFinalizar = async (animalId: number, motivo: 'Adoptado' | 'Encontrado') => {
        if (!confirm(`¿Marcar como ${motivo}? Esta acción finalizará la publicación.`)) return;

        try {
            // ID 4 = Adoptado (Archivado), ID 5 = Encontrado (Archivado)
            // Esto hará que dejen de aparecer en el feed público (que muestra 1, 2, 3)
            const nuevoEstado = motivo === 'Adoptado' ? 4 : 5;

            const res = await fetch(`http://localhost:5269/api/Animales/estado/${animalId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevoEstado)
            });

            if (res.ok) {
                alert(`¡Qué gran noticia! 🥳\nEl caso ha sido cerrado como ${motivo}.`);

                if (motivo === 'Adoptado') {
                    const compartir = confirm("¿Quieres compartir esta Historia de Éxito en la Comunidad?");
                    if (compartir) navigate('/comunidad');
                }

                setFinalizarId(null);
                cargarPublicaciones(); // Refresh list
            }
        } catch (error) {
            console.error(error);
            alert("Error al finalizar la publicación");
        }
    };

    // --- RENDER HELPERS ---
    const renderVetDashboard = () => (
        <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
                <div className="h-64 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <StatsChart title="Pacientes esta semana" data={dataVisitas} />
                </div>
            </div>
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h2 className="text-2xl font-heading font-extrabold text-gray-800">Panel Profesional</h2>
                    <p className="text-gray-500 text-sm">Gestión de clínicas y pacientes</p>
                </div>
                <Link to="/clinica-wizard" className="bg-purple-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-purple-700 shadow-lg shadow-purple-200 transition flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Nueva Clínica
                </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {misClinicas.map(c => (
                    <div key={c.id} className={`relative overflow-hidden bg-white p-6 rounded-2xl shadow-sm border-2 transition-all ${c.esDeTurno ? 'border-red-400 ring-4 ring-red-100' : 'border-gray-100 hover:border-gray-200'}`}>
                        {c.esDeTurno && (
                            <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-sm uppercase tracking-wider">
                                En Guardia Activa
                            </div>
                        )}
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h4 className="font-bold text-xl text-gray-800">{c.nombre}</h4>
                                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                    <MapPin className="w-3 h-3" /> {c.direccion}
                                </p>
                            </div>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${c.esDeTurno ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-400'}`}>
                                <ShieldAlert className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => toggleTurno(c)}
                                className={`flex-1 py-3 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 ${c.esDeTurno
                                    ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100'
                                    : 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-200'
                                    }`}
                            >
                                <Power className="w-4 h-4" />
                                {c.esDeTurno ? 'Finalizar Guardia' : 'Activar Guardia'}
                            </button>
                            <button className="px-4 py-3 rounded-xl bg-gray-50 text-gray-600 font-bold border border-gray-100 hover:bg-gray-100">
                                Editar
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-8 pb-24">
            {/* Header del Perfil */}
            <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-gray-200/50 mb-10 flex flex-col md:flex-row items-center justify-between border border-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-yellow-400 opacity-50" />

                <div className="flex items-center gap-6 relative z-10">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center text-gray-400 shadow-inner border-4 border-white">
                        <User className="w-10 h-10" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-heading font-extrabold text-gray-800">{usuario?.nombre || 'Usuario'}</h2>
                        <div className="flex items-center gap-3 mt-2">
                            <span className="bg-yellow-50 text-yellow-700 text-xs font-bold px-3 py-1 rounded-full border border-yellow-100 flex items-center gap-1">
                                <Trophy className="w-3 h-3 text-yellow-500" /> {usuario?.puntos || 0} Ptos
                            </span>
                            <span className="text-gray-400 text-sm font-medium px-2 border-l border-gray-200">
                                {usuario?.rol}
                            </span>
                        </div>
                    </div>
                </div>

                <div className='flex gap-2'>
                    <button
                        onClick={() => navigate('/comercio-register')}
                        className="mt-6 md:mt-0 bg-blue-50 text-blue-600 px-4 py-3 rounded-xl hover:bg-blue-100 transition font-bold text-sm flex items-center gap-2"
                    >
                        <Store className="w-4 h-4" /> Crear Comercio
                    </button>
                    <button
                        onClick={() => { localStorage.removeItem('usuario'); navigate('/login'); }}
                        className="mt-6 md:mt-0 bg-red-50 text-red-500 px-4 py-3 rounded-xl hover:bg-red-100 transition font-bold text-sm flex items-center gap-2"
                    >
                        <LogOut className="w-4 h-4" /> Salir
                    </button>
                </div>
            </div>

            {/* SECCIÓN VETERINARIOS */}
            {usuario?.rol === 'Veterinario' && renderVetDashboard()}

            {/* SECCIÓN HOGAR DE TRÁNSITO */}
            <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100 mb-8 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                        <Home className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 text-lg">Hogar de Tránsito</h3>
                        <p className="text-sm text-gray-600">
                            {miHogar ? (miHogar.estaDisponible ? "✅ Disponible para recibir" : "⛔ No disponible") : "No estás registrado como hogar."}
                        </p>
                    </div>
                </div>
                {miHogar ? (
                    <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold hover:bg-gray-50">Gestionar</button>
                ) : (
                    <Link to="/transit-register" className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-bold hover:bg-orange-700 shadow-md">
                        Postularme
                    </Link>
                )}
            </div>

            {/* SECCIÓN COMERCIOS */}
            {misComercios.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-xl font-heading font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <Store className="w-5 h-5 text-blue-500" /> Mis Comercios
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {misComercios.map(c => (
                            <div key={c.id} className="bg-white p-4 rounded-xl border border-gray-200 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <img src={c.logoUrl} className="w-10 h-10 rounded-lg bg-gray-100" />
                                    <div>
                                        <p className="font-bold text-gray-800">{c.nombre}</p>
                                        <p className="text-xs text-gray-500">{c.rubro}</p>
                                    </div>
                                </div>
                                <Link to={`/comercio/${c.id}`} className="text-sm font-bold text-blue-600 hover:underline">Administrar</Link>
                            </div>
                        ))}
                    </div>
                </div>
            )}


            {/* SECCIÓN MIS PUBLICACIONES */}
            <h3 className="text-xl font-heading font-bold text-gray-700 mb-6 flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-green-600" /> Mis Publicaciones
            </h3>

            {cargando ? (
                <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {misAnimales.length === 0 && (
                        <div className="col-span-full text-center py-16 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                            <p className="text-gray-400 font-medium">No tienes publicaciones activas.</p>
                            <Link to="/home" className="text-orange-600 font-bold hover:underline mt-2 inline-block">Reportar mascota</Link>
                        </div>
                    )}

                    {misAnimales.map(animal => (
                        <div key={animal.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group hover:shadow-md transition-all">
                            <div className="relative h-48 overflow-hidden">
                                <img src={animal.imagenUrl || 'https://via.placeholder.com/400'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute top-3 right-3">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${animal.idEstado === 3 ? 'bg-orange-500 text-white' :
                                        animal.idEstado === 1 ? 'bg-red-500 text-white' : // Perdido
                                            'bg-green-500 text-white' // Encontrado
                                        }`}>
                                        {animal.idEstado === 3 ? 'En Adopción' : animal.idEstado === 1 ? 'Perdido' : 'Encontrado'}
                                    </span>
                                </div>
                            </div>
                            <div className="p-5 flex-1 flex flex-col">
                                <h4 className="font-bold text-lg text-gray-800 mb-1">{animal.nombre}</h4>
                                <p className="text-xs text-gray-400 mb-3">{new Date(animal.fechaPublicacion).toLocaleDateString()}</p>
                                <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-1">{animal.descripcion}</p>

                                <div className="relative">
                                    {finalizarId === animal.id ? (
                                        <div className="absolute bottom-0 left-0 right-0 bg-white border border-gray-200 rounded-xl p-2 shadow-xl z-10 animate-[fadeIn_0.2s]">
                                            <p className="text-xs font-bold text-center mb-2 text-gray-700">¿Cómo finalizó?</p>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleFinalizar(animal.id, 'Adoptado')}
                                                    className="flex-1 bg-green-50 text-green-700 py-2 rounded-lg text-xs font-bold hover:bg-green-100"
                                                >
                                                    🏠 Adoptado
                                                </button>
                                                <button
                                                    onClick={() => handleFinalizar(animal.id, 'Encontrado')}
                                                    className="flex-1 bg-blue-50 text-blue-700 py-2 rounded-lg text-xs font-bold hover:bg-blue-100"
                                                >
                                                    🙌 Encontrado
                                                </button>
                                            </div>
                                            <button onClick={() => setFinalizarId(null)} className="w-full mt-2 text-xs text-gray-400 font-bold hover:text-gray-600">Cancelar</button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2 pt-4 border-t border-gray-50">
                                            <button className="flex-1 bg-gray-50 text-gray-600 py-2.5 rounded-lg font-bold text-xs hover:bg-gray-100 flex items-center justify-center gap-2">
                                                <RefreshCw className="w-3 h-3" /> Renovar
                                            </button>
                                            <button
                                                onClick={() => setFinalizarId(animal.id)}
                                                className="flex-1 bg-green-50 text-green-600 py-2.5 rounded-lg font-bold text-xs hover:bg-green-100 flex items-center justify-center gap-2"
                                            >
                                                <CheckCircle className="w-3 h-3" /> Finalizar
                                            </button>
                                            <button className="w-10 bg-red-50 text-red-500 rounded-lg flex items-center justify-center hover:bg-red-100">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Perfil;