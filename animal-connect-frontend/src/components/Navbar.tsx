// src/components/Navbar.tsx
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PawPrint, Menu, X, ChevronDown, Stethoscope, Store, HeartPulse, UserCircle, LogOut, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Simulamos la autenticación por ahora
const checkUser = () => {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (!usuarioGuardado || usuarioGuardado === "undefined") return null;
    try {
        return JSON.parse(usuarioGuardado);
    } catch (error) {
        console.error("Error leyendo usuario:", error);
        localStorage.removeItem('usuario');
        return null;
    }
};

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState(checkUser());
    const location = useLocation();

    const isActive = (path: string) => {
        return location.pathname === path
            ? 'text-health font-bold bg-health/10 rounded-xl'
            : 'text-tech hover:text-health font-medium hover:bg-health/5 rounded-xl';
    };

    const isServiceActive = () => {
        const servicesPaths = ['/marketplace', '/campanias'];
        const isMatch = servicesPaths.some(p => location.pathname.includes(p));
        return isMatch ? 'text-health font-bold bg-health/10 rounded-xl' : 'text-tech hover:text-health font-medium hover:bg-health/5 rounded-xl';
    };

    const handleLogout = () => {
        localStorage.removeItem('usuario');
        localStorage.removeItem('token');
        setUser(null);
        window.location.href = '/login';
    };

    return (
        <nav className="bg-white/90 backdrop-blur-md sticky top-0 z-[1000] border-b border-gray-100 shadow-sm">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-20">
                    {/* LOGO */}
                    <Link to="/" className="flex items-center space-x-2 group">
                        <div className="bg-health p-2.5 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-health/20">
                            <PawPrint className="text-white w-6 h-6" strokeWidth={2.5} />
                        </div>
                        <span className="font-heading font-extrabold text-2xl text-tech tracking-tight">
                            Animal<span className="text-health">Connect</span>
                        </span>
                    </Link>

                    {/* MENÚ DE ESCRITORIO */}
                    <div className="hidden md:flex space-x-2 items-center">
                        <Link to="/" className={`px-4 py-2 transition-all duration-300 ${isActive('/')}`}>Inicio</Link>

                        {/* Dropdown Servicios */}
                        <div className="relative group">
                            <button className={`flex items-center gap-1 px-4 py-2 transition-all duration-300 ${isServiceActive()}`}>
                                <span>Servicios</span>
                                <ChevronDown className="w-4 h-4" />
                            </button>
                            <div className="absolute top-full left-0 w-56 bg-white shadow-xl rounded-2xl py-2 hidden group-hover:block border border-gray-100 mt-2 animate-in fade-in slide-in-from-top-2">
                                <Link to="/marketplace" className="flex items-center px-4 py-3 text-tech hover:bg-health/5 hover:text-health transition-colors">
                                    <Stethoscope className="w-5 h-5 mr-3 text-health" /> Veterinarias
                                </Link>
                                <Link to="/marketplace" className="flex items-center px-4 py-3 text-tech hover:bg-health/5 hover:text-health transition-colors">
                                    <Store className="w-5 h-5 mr-3 text-hope" /> Pet Shops
                                </Link>
                                <Link to="/campanias" className="flex items-center px-4 py-3 text-tech hover:bg-health/5 hover:text-health transition-colors">
                                    <HeartPulse className="w-5 h-5 mr-3 text-love" /> Campañas Salud
                                </Link>
                            </div>
                        </div>

                        <Link to="/adopcion" className={`px-4 py-2 transition-all duration-300 ${isActive('/adopcion')}`}>Adopción</Link>
                        <Link to="/comunidad" className={`px-4 py-2 transition-all duration-300 ${isActive('/comunidad')}`}>Comunidad</Link>

                        {/* ÁREA DE USUARIO */}
                        <div className="pl-4 ml-2 flex items-center gap-3">
                            {user ? (
                                <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                                    <div className="text-right hidden lg:block">
                                        <div className="text-sm font-bold text-tech">{user.nombre}</div>
                                        <div className="text-xs text-health font-semibold capitalize">{user.rol}</div>
                                    </div>
                                    <Link to="/perfil" className="bg-gray-100 p-2.5 rounded-full hover:bg-health/10 text-tech hover:text-health transition-all duration-300 ring-2 ring-transparent hover:ring-health/20" title="Mi Perfil">
                                        <User className="w-5 h-5" />
                                    </Link>
                                    <button onClick={handleLogout} className="text-gray-400 hover:text-love transition-colors p-2" title="Cerrar Sesión">
                                        <LogOut className="w-5 h-5" />
                                    </button>
                                </div>
                            ) : (
                                <Link to="/login" className="bg-health text-white px-6 py-2.5 rounded-full font-bold hover:bg-health/90 transition-all shadow-lg shadow-health/30 hover:shadow-health/40 transform hover:-translate-y-0.5 flex items-center gap-2">
                                    <UserCircle className="w-5 h-5" />
                                    Ingresar
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* BOTÓN HAMBURGUESA (MÓVIL) */}
                    <button
                        className="md:hidden p-2 text-tech hover:bg-gray-100 rounded-xl transition-colors"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
                    </button>
                </div>
            </div>

            {/* MENÚ MÓVIL */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
                    >
                        <div className="p-4 space-y-2">
                            <Link to="/" className="block px-4 py-3 rounded-xl text-tech font-bold hover:bg-gray-50" onClick={() => setIsOpen(false)}>Inicio</Link>

                            <div className="bg-gray-50 rounded-2xl p-4 space-y-1">
                                <p className="text-xs font-bold text-health uppercase tracking-wider mb-2 px-2">Servicios</p>
                                <Link to="/marketplace" className="flex items-center px-4 py-3 rounded-xl text-tech hover:bg-white" onClick={() => setIsOpen(false)}>
                                    <Stethoscope className="w-5 h-5 mr-3 text-health" /> Veterinarias
                                </Link>
                                <Link to="/marketplace" className="flex items-center px-4 py-3 rounded-xl text-tech hover:bg-white" onClick={() => setIsOpen(false)}>
                                    <Store className="w-5 h-5 mr-3 text-hope" /> Pet Shops
                                </Link>
                            </div>

                            <Link to="/adopcion" className="block px-4 py-3 rounded-xl text-tech font-bold hover:bg-gray-50" onClick={() => setIsOpen(false)}>Adopción</Link>

                            {user ? (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <div className="flex items-center justify-between px-2 mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-health/10 p-2 rounded-full">
                                                <User className="w-5 h-5 text-health" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-tech">{user.nombre}</div>
                                                <div className="text-xs text-gray-500">{user.rol}</div>
                                            </div>
                                        </div>
                                        <button onClick={handleLogout} className="text-love font-medium text-sm bg-love/10 px-3 py-1.5 rounded-lg">Salir</button>
                                    </div>
                                    <Link to="/perfil" className="block w-full text-center bg-gray-100 text-tech py-3 rounded-xl font-bold" onClick={() => setIsOpen(false)}>
                                        Ir a mi Perfil
                                    </Link>
                                </div>
                            ) : (
                                <Link to="/login" className="block w-full text-center bg-health text-white py-3.5 rounded-xl font-bold shadow-lg shadow-health/20 mt-4" onClick={() => setIsOpen(false)}>
                                    Ingresar
                                </Link>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;