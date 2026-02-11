import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PawPrint, Loader2, AlertCircle, User, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

interface LoginRequest {
    Usuario: string;
    Password: string;
}

interface UserResponse {
    id: number;
    nombre: string;
    rol: string;
    tienePerfilMatch: boolean;
    puntos: number;
    estadoVeterinario?: string;
    perfilCompleto?: boolean;
}

const Login = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState<LoginRequest>({ Usuario: '', Password: '' });
    const [error, setError] = useState<string | null>(null);
    const [cargando, setCargando] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setCargando(true);

        try {
            const response = await fetch('http://localhost:5269/api/Auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || 'Usuario o contraseña incorrectos');
            }

            const data: UserResponse = await response.json();
            localStorage.setItem('usuario', JSON.stringify(data));

            if (data.rol === 'Administrador') {
                navigate('/superadmin');
            } else if (data.rol === 'Municipio') {
                navigate('/admin');
            } else {
                navigate('/');
            }

            window.location.reload();

        } catch (err) {
            console.error(err);
            setError('Credenciales inválidas o error de conexión.');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-canvas px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-8 rounded-pet shadow-2xl w-full max-w-md border border-gray-100"
            >

                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="bg-health w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-health/30"
                    >
                        <PawPrint className="text-white w-10 h-10" />
                    </motion.div>
                    <h2 className="text-3xl font-heading font-extrabold text-tech">Bienvenido</h2>
                    <p className="text-gray-500 mt-2 font-body">Ingresa a AnimalConnect</p>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm flex items-center shadow-sm"
                    >
                        <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative group">
                        <User className="absolute left-4 top-3.5 text-gray-400 w-5 h-5 group-focus-within:text-health transition-colors" />
                        <input
                            type="text"
                            name="Usuario"
                            value={formData.Usuario}
                            onChange={handleChange}
                            className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 focus:border-health focus:ring-4 focus:ring-health/10 outline-none transition-all bg-gray-50 focus:bg-white font-medium text-tech"
                            placeholder="Tu nombre de usuario"
                            required
                        />
                    </div>

                    <div className="relative group">
                        <Lock className="absolute left-4 top-3.5 text-gray-400 w-5 h-5 group-focus-within:text-health transition-colors" />
                        <input
                            type="password"
                            name="Password"
                            value={formData.Password}
                            onChange={handleChange}
                            className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 focus:border-health focus:ring-4 focus:ring-health/10 outline-none transition-all bg-gray-50 focus:bg-white font-medium text-tech"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={cargando}
                        className="w-full bg-health text-white py-4 rounded-pet font-bold hover:bg-health/90 transition-all shadow-lg shadow-health/30 hover:shadow-health/40 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                    >
                        {cargando ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Ingresar'}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-gray-500 font-medium">
                    ¿No tienes cuenta?{' '}
                    <Link to="/register" className="text-health font-bold hover:text-tech transition-colors hover:underline">
                        Regístrate aquí
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;