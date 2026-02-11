import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Save, AlertTriangle, Dog, MapPin, Syringe, FileText } from 'lucide-react';

const Intake = () => {
    const navigate = useNavigate();
    const [cargando, setCargando] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        nombre: '',
        especie: 'Perro',
        raza: '',
        edadAprox: '',
        estadoSalud: 'Bueno',
        direccionEncontrado: '',
        barrio: '',
        descripcion: '',
        nroChip: '', // New field for admin
        observacionesInternas: '', // New field for admin
        vacunado: false,
        castrado: false
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckbox = (name: string) => {
        setFormData(prev => ({ ...prev, [name]: !prev[name as keyof typeof prev] }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setCargando(true);

        const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

        // Mapping to Backend DTO
        const payload = {
            ...formData,
            usuarioId: usuario.id,
            esIngresoAdministrativo: true, // Flag for backend
            fechaIngreso: new Date().toISOString(),
            idEstado: 3, // En Adopción by default for Intake
            ubicacion: `${formData.direccionEncontrado}, ${formData.barrio}`,
            esPerro: formData.especie === 'Perro',
            sexo: 'Macho', // Default, should add selector
            imagenUrl: 'https://via.placeholder.com/400' // Placeholder for now
        };

        try {
            const res = await fetch('http://localhost:5269/api/Animales', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert("Ingreso registrado correctamente. Nro de Caso: #" + Math.floor(Math.random() * 10000));
                navigate('/admin/dashboard');
            } else {
                alert("Error al registrar ingreso.");
            }
        } catch (error) {
            console.error(error);
            alert("Error de conexión");
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Admisión de Animales (Intake)</h1>
                    <p className="text-slate-500">Formulario de ingreso para Zoonosis y Refugios.</p>
                </div>
                <div className="bg-orange-100 text-orange-700 px-4 py-2 rounded-lg text-sm font-bold border border-orange-200 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Uso Interno Exclusivo
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* SECTION 1: DATOS BÁSICOS */}
                    <section className="space-y-4">
                        <h3 className="font-bold text-slate-700 border-b pb-2 flex items-center gap-2">
                            <Dog className="w-5 h-5 text-slate-400" /> Datos del Animal
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre (o Apodo)</label>
                                <input required name="nombre" value={formData.nombre} onChange={handleChange} className="w-full p-2 rounded-lg border border-slate-300" placeholder="Ej: Terry" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Especie</label>
                                <select name="especie" value={formData.especie} onChange={handleChange} className="w-full p-2 rounded-lg border border-slate-300">
                                    <option value="Perro">Perro</option>
                                    <option value="Gato">Gato</option>
                                    <option value="Otro">Otro</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Raza (Aprox)</label>
                                <input name="raza" value={formData.raza} onChange={handleChange} className="w-full p-2 rounded-lg border border-slate-300" placeholder="Ej: Mestizo" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Edad Estimada</label>
                                <input name="edadAprox" value={formData.edadAprox} onChange={handleChange} className="w-full p-2 rounded-lg border border-slate-300" placeholder="Ej: 2 años" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nro Chip / Tatuaje (Opcional)</label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                                <input name="nroChip" value={formData.nroChip} onChange={handleChange} className="w-full pl-9 p-2 rounded-lg border border-slate-300 bg-slate-50" placeholder="XXX-XXX-XXX" />
                            </div>
                        </div>
                    </section>

                    {/* SECTION 2: ESTADO Y SALUD */}
                    <section className="space-y-4">
                        <h3 className="font-bold text-slate-700 border-b pb-2 flex items-center gap-2">
                            <Syringe className="w-5 h-5 text-slate-400" /> Salud y Estado
                        </h3>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Condición General</label>
                            <select name="estadoSalud" value={formData.estadoSalud} onChange={handleChange} className="w-full p-2 rounded-lg border border-slate-300">
                                <option value="Bueno">Bueno (Sano)</option>
                                <option value="Regular">Regular (Requiere atención)</option>
                                <option value="Malo">Crítico / Urgente</option>
                            </select>
                        </div>

                        <div className="flex gap-4 pt-2">
                            <label className="flex items-center gap-2 cursor-pointer p-3 border rounded-lg hover:bg-slate-50 flex-1">
                                <input type="checkbox" checked={formData.vacunado} onChange={() => handleCheckbox('vacunado')} className="w-4 h-4 text-orange-600 rounded" />
                                <span className="text-sm font-medium">Vacunado (Antirrábica)</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer p-3 border rounded-lg hover:bg-slate-50 flex-1">
                                <input type="checkbox" checked={formData.castrado} onChange={() => handleCheckbox('castrado')} className="w-4 h-4 text-orange-600 rounded" />
                                <span className="text-sm font-medium">Castrado</span>
                            </label>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Observaciones Internas</label>
                            <textarea name="observacionesInternas" value={formData.observacionesInternas} onChange={handleChange} className="w-full p-2 rounded-lg border border-slate-300 h-24 text-sm" placeholder="Detalles médicos, comportamiento, etc. (No visible al público)" />
                        </div>
                    </section>

                    {/* SECTION 3: ORIGEN (Full Width) */}
                    <section className="md:col-span-2 space-y-4">
                        <h3 className="font-bold text-slate-700 border-b pb-2 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-slate-400" /> Origen del Ingreso
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Dirección de Hallazgo / Retiro</label>
                                <input required name="direccionEncontrado" value={formData.direccionEncontrado} onChange={handleChange} className="w-full p-2 rounded-lg border border-slate-300" placeholder="Calle y Altura" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Barrio / Zona</label>
                                <input required name="barrio" value={formData.barrio} onChange={handleChange} className="w-full p-2 rounded-lg border border-slate-300" placeholder="Ej: Centro" />
                            </div>
                        </div>
                    </section>
                </div>

                <div className="mt-8 flex justify-end gap-4 border-t pt-6">
                    <button type="button" onClick={() => navigate('/admin/dashboard')} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100">
                        Cancelar
                    </button>
                    <button type="submit" disabled={cargando} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition flex items-center gap-2">
                        {cargando ? 'Guardando...' : <><Save className="w-5 h-5" /> Registrar Ingreso</>}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Intake;
