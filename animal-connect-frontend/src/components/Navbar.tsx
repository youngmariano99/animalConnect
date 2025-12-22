// src/components/Navbar.tsx
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

// Simulamos la autenticación por ahora (luego conectaremos esto con Auth real)
const checkUser = () => {
    const usuarioGuardado = localStorage.getItem('usuario');
    
    // Si no hay nada, o es la palabra "undefined" (basura), retornamos null
    if (!usuarioGuardado || usuarioGuardado === "undefined") return null;

    try {
        return JSON.parse(usuarioGuardado);
    } catch (error) {
        // Si falla el parseo, limpiamos la basura para que no moleste más
        console.error("Error leyendo usuario:", error);
        localStorage.removeItem('usuario');
        return null;
    }
};

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false); // Estado para menú móvil
    const [user, setUser] = useState(checkUser()); // Estado del usuario
    const location = useLocation(); // Hook para saber en qué URL estamos

    // Función auxiliar para saber si un link está activo (Reemplaza a tu isActive antiguo)
    const isActive = (path: string) => {
        return location.pathname === path 
            ? 'text-orange-600 font-bold' 
            : 'text-gray-600 hover:text-orange-500 font-medium';
    };

    // Función para el dropdown de Servicios (lógica migrada de tu layout.js)
    const isServiceActive = () => {
        const servicesPaths = ['/veterinarias', '/tiendas', '/salud'];
        const isMatch = servicesPaths.some(p => location.pathname.includes(p));
        return isMatch ? 'text-orange-600 font-bold' : 'text-gray-600 hover:text-orange-500 font-medium';
    };

    const handleLogout = () => {
        localStorage.removeItem('usuario');
        localStorage.removeItem('token');
        setUser(null);
        window.location.href = '/login';
    };

    return (
        <nav id="app-navbar" className="bg-white shadow-md sticky top-0 z-[1000]">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* LOGO */}
                    <Link to="/" className="flex items-center space-x-2 group">
                        <div className="bg-orange-100 p-2 rounded-lg group-hover:bg-orange-200 transition">
                            <i className="fa-solid fa-paw text-2xl text-orange-600"></i>
                        </div>
                        <span className="font-bold text-xl text-gray-800 tracking-tight">
                            Animal<span className="text-orange-600">Connect</span>
                        </span>
                    </Link>

                    {/* MENÚ DE ESCRITORIO */}
                    <div className="hidden md:flex space-x-8 items-center">
                        <Link to="/" className={`transition ${isActive('/')}`}>Inicio</Link>
                        
                        {/* Dropdown Servicios */}
                        <div className="relative group">
                            <button className={`flex items-center space-x-1 transition ${isServiceActive()}`}>
                                <span>Servicios</span>
                                <i className="fa-solid fa-chevron-down text-xs"></i>
                            </button>
                            {/* Menú desplegable */}
                            <div className="absolute top-full left-0 w-48 bg-white shadow-lg rounded-xl py-2 hidden group-hover:block border border-gray-100 mt-2">
                                <Link to="/veterinarias" className="block px-4 py-2 text-gray-600 hover:bg-orange-50 hover:text-orange-600">
                                    <i className="fa-solid fa-user-doctor mr-2"></i> Veterinarias
                                </Link>
                                <Link to="/tiendas" className="block px-4 py-2 text-gray-600 hover:bg-orange-50 hover:text-orange-600">
                                    <i className="fa-solid fa-store mr-2"></i> Pet Shops
                                </Link>
                                <Link to="/salud" className="block px-4 py-2 text-gray-600 hover:bg-orange-50 hover:text-orange-600">
                                    <i className="fa-solid fa-heart-pulse mr-2"></i> Salud
                                </Link>
                            </div>
                        </div>

                        <Link to="/adopcion" className={`transition ${isActive('/adopcion')}`}>Adopción</Link>
                        <Link to="/comunidad" className={`transition ${isActive('/comunidad')}`}>Comunidad</Link>

                        {/* ÁREA DE USUARIO (Dinámica) */}
                        {user ? (
                            <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-gray-200">
                                <div className="text-right hidden lg:block">
                                    <div className="text-sm font-bold text-gray-800">{user.nombre || 'Usuario'}</div>
                                    <div className="text-xs text-gray-500 capitalize">{user.rol || 'Ciudadano'}</div>
                                </div>
                                <Link to="/perfil" className="bg-gray-100 p-2 rounded-full hover:bg-orange-100 text-gray-600 hover:text-orange-600 transition" title="Mi Perfil">
                                    <i className="fa-solid fa-user-gear text-sm"></i>
                                </Link>
                                <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition" title="Cerrar Sesión">
                                    <i className="fa-solid fa-right-from-bracket"></i>
                                </button>
                            </div>
                        ) : (
                            <Link to="/login" className="bg-orange-600 text-white px-6 py-2 rounded-full font-bold hover:bg-orange-700 transition shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                                Ingresar
                            </Link>
                        )}
                    </div>

                    {/* BOTÓN HAMBURGUESA (MÓVIL) */}
                    <button 
                        className="md:hidden text-gray-600 focus:outline-none"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <i className={`fa-solid ${isOpen ? 'fa-times' : 'fa-bars'} text-2xl`}></i>
                    </button>
                </div>
            </div>

            {/* MENÚ MÓVIL (Desplegable) */}
            {isOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-lg">
                    <div className="px-4 py-3 space-y-3">
                        <Link to="/" className="block text-gray-600 font-medium" onClick={() => setIsOpen(false)}>Inicio</Link>
                        <div className="pl-4 border-l-2 border-orange-100 space-y-2">
                            <p className="text-xs font-bold text-orange-400 uppercase tracking-wider">Servicios</p>
                            <Link to="/veterinarias" className="block text-gray-600" onClick={() => setIsOpen(false)}>Veterinarias</Link>
                            <Link to="/tiendas" className="block text-gray-600" onClick={() => setIsOpen(false)}>Pet Shops</Link>
                        </div>
                        <Link to="/adopcion" className="block text-gray-600 font-medium" onClick={() => setIsOpen(false)}>Adopción</Link>
                        
                        {user ? (
                            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                                <span className="font-bold text-gray-800">Hola, {user.nombre}</span>
                                <button onClick={handleLogout} className="text-red-500 text-sm font-bold">Salir</button>
                            </div>
                        ) : (
                            <Link to="/login" className="block w-full text-center bg-orange-600 text-white py-3 rounded-xl font-bold shadow-md" onClick={() => setIsOpen(false)}>
                                <i className="fa-solid fa-user-circle text-xl mr-2"></i> Ingresar
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;