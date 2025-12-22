import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

// 1. INTERFAZ: Lo que espera tu Backend C# (LoginRequest)
interface LoginRequest {
    Usuario: string;
    Password: string;
}

// 2. INTERFAZ CORREGIDA: Según tu AuthController.cs actual
// Tu backend devuelve los datos "planos", no dentro de un objeto "usuario".
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
            // Asegúrate que este puerto (7133) sea el correcto donde corre tu API
            const response = await fetch('http://localhost:5269/api/Auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                // Intentamos leer el mensaje de error del backend si existe
                const errorData = await response.text(); 
                throw new Error(errorData || 'Usuario o contraseña incorrectos');
            }

            // CORRECCIÓN AQUÍ:
            const data: UserResponse = await response.json(); 

            // Como tu backend NO devuelve un token por ahora (según el archivo que pasaste),
            // solo guardamos los datos del usuario.
            
            // Guardamos todo el objeto 'data' como el usuario actual
            localStorage.setItem('usuario', JSON.stringify(data)); 

            // REDIRECCIÓN (Usando data.rol directamente)
            if (data.rol === 'Administrador') {
                navigate('/superadmin');
            } else if (data.rol === 'Municipio') {
                navigate('/admin');
            } else {
                navigate('/'); // Usuario normal va al Home
            }

            // Forzamos una recarga rápida para que la Navbar se entere que cambiamos de usuario
            // (Una solución temporal simple, luego usaremos Context para hacerlo elegante)
            window.location.reload();

        } catch (err) {
            console.error(err);
            setError('Credenciales inválidas o error de conexión.');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 bg-[url('https://images.unsplash.com/photo-1548199973-03cce0bbc87b')] bg-cover bg-center bg-blend-overlay">
            <div className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl w-full max-w-md">
                
                <div className="text-center mb-8">
                    <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fa-solid fa-paw text-3xl text-orange-600"></i>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800">Bienvenido</h2>
                    <p className="text-gray-500 mt-2">Ingresa a AnimalConnect</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm flex items-center">
                        <i className="fa-solid fa-circle-exclamation mr-2"></i>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Usuario</label>
                        <input 
                            type="text" 
                            name="Usuario"
                            value={formData.Usuario}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition"
                            placeholder="Tu nombre de usuario"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Contraseña</label>
                        <input 
                            type="password" 
                            name="Password"
                            value={formData.Password}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={cargando}
                        className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 transition shadow-lg disabled:opacity-50 flex justify-center items-center"
                    >
                        {cargando ? <i className="fa-solid fa-spinner fa-spin"></i> : 'Ingresar'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-500">
                    ¿No tienes cuenta?{' '}
                    <Link to="/register" className="text-orange-600 font-bold hover:underline">
                        Regístrate aquí
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;