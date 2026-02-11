import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Stethoscope, AlertCircle, Loader2, FileText, AlignLeft, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RegisterRequest {
    Usuario: string;
    Password: string;
    Rol: string;
    Matricula?: string;
    Biografia?: string;
}

const Register = () => {
    const navigate = useNavigate();
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<RegisterRequest>({
        Usuario: '',
        Password: '',
        Rol: 'Ciudadano',
        Matricula: '',
        Biografia: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setCargando(true);

        if (formData.Rol === 'Veterinario' && !formData.Matricula) {
            setError('La matrícula es obligatoria para veterinarios.');
            setCargando(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:5269/api/Auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || 'Error al registrarse');
            }

            alert('¡Cuenta creada con éxito! Ahora inicia sesión.');
            navigate('/login');

        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Error de conexión');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-canvas px-4 py-12">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-8 rounded-pet shadow-2xl w-full max-w-lg border border-gray-100"
            >

                <div className="text-center mb-6">
                    <h2 className="text-3xl font-heading font-extrabold text-tech">Crear Cuenta</h2>
                    <p className="text-gray-500 mt-2 font-body">Únete a la comunidad de AnimalConnect</p>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm flex items-center shadow-sm"
                    >
                        <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">

                    <div className="space-y-4">
                        <label className="block text-tech text-sm font-bold mb-1">Usuario</label>
                        <div className="relative group">
                            <User className="absolute left-4 top-3.5 text-gray-400 w-5 h-5 group-focus-within:text-health transition-colors" />
                            <input
                                type="text" name="Usuario"
                                value={formData.Usuario} onChange={handleChange}
                                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 focus:border-health focus:ring-4 focus:ring-health/10 outline-none transition-all bg-gray-50 focus:bg-white font-medium text-tech"
                                placeholder="Ej: mariano99" required
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="block text-tech text-sm font-bold mb-1">Contraseña</label>
                        <input
                            type="password" name="Password"
                            value={formData.Password} onChange={handleChange}
                            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-health focus:ring-4 focus:ring-health/10 outline-none transition-all bg-gray-50 focus:bg-white font-medium text-tech"
                            placeholder="••••••••" required
                        />
                    </div>

                    <div className="pt-2">
                        <label className="block text-tech text-sm font-bold mb-3">Quiero registrarme como:</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, Rol: 'Ciudadano' })}
                                className={`relative py-4 rounded-xl border-2 font-bold transition-all flex flex-col items-center justify-center gap-2 ${formData.Rol === 'Ciudadano'
                                        ? 'border-health bg-health/5 text-health shadow-lg shadow-health/10'
                                        : 'border-gray-100 text-gray-400 hover:border-health/30 hover:bg-gray-50'
                                    }`}
                            >
                                {formData.Rol === 'Ciudadano' && <div className="absolute top-2 right-2 bg-health rounded-full p-0.5"><Check className="w-3 h-3 text-white" /></div>}
                                <User className="w-6 h-6" />
                                <span className="text-sm">Ciudadano</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, Rol: 'Veterinario' })}
                                className={`relative py-4 rounded-xl border-2 font-bold transition-all flex flex-col items-center justify-center gap-2 ${formData.Rol === 'Veterinario'
                                        ? 'border-tech bg-tech/5 text-tech shadow-lg shadow-tech/10'
                                        : 'border-gray-100 text-gray-400 hover:border-tech/30 hover:bg-gray-50'
                                    }`}
                            >
                                {formData.Rol === 'Veterinario' && <div className="absolute top-2 right-2 bg-tech rounded-full p-0.5"><Check className="w-3 h-3 text-white" /></div>}
                                <Stethoscope className="w-6 h-6" />
                                <span className="text-sm">Veterinario</span>
                            </button>
                        </div>
                    </div>

                    <AnimatePresence>
                        {formData.Rol === 'Veterinario' && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="bg-tech/5 p-6 rounded-2xl border border-tech/10 space-y-4 mt-2">
                                    <h4 className="text-tech font-bold text-sm flex items-center gap-2">
                                        <Stethoscope className="w-4 h-4" /> Datos Profesionales
                                    </h4>

                                    <div className="relative group">
                                        <FileText className="absolute left-4 top-3.5 text-gray-400 w-5 h-5 group-focus-within:text-tech transition-colors" />
                                        <input
                                            type="text" name="Matricula"
                                            value={formData.Matricula} onChange={handleChange}
                                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-tech focus:ring-4 focus:ring-tech/10 outline-none transition-all bg-white font-medium text-tech"
                                            placeholder="Ej: MP-12345"
                                        />
                                    </div>

                                    <div className="relative group">
                                        <AlignLeft className="absolute left-4 top-3.5 text-gray-400 w-5 h-5 group-focus-within:text-tech transition-colors" />
                                        <textarea
                                            name="Biografia"
                                            value={formData.Biografia} onChange={handleChange}
                                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-tech focus:ring-4 focus:ring-tech/10 outline-none transition-all bg-white font-medium text-tech resize-none"
                                            placeholder="Especialista en..."
                                            rows={2}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button
                        type="submit" disabled={cargando}
                        className={`w-full text-white py-4 rounded-pet font-bold transition-all shadow-lg transform hover:-translate-y-1 mt-6 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 ${formData.Rol === 'Veterinario'
                                ? 'bg-tech hover:bg-tech/90 shadow-tech/30'
                                : 'bg-health hover:bg-health/90 shadow-health/30'
                            }`}
                    >
                        {cargando ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Crear Cuenta'}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-gray-500 font-medium">
                    ¿Ya tienes cuenta?{' '}
                    <Link to="/login" className="text-health font-bold hover:text-tech transition-colors hover:underline">
                        Ingresa aquí
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;