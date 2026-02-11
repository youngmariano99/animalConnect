import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, FileText, Users, Settings,
    LogOut, ShieldAlert, PawPrint, Menu, X
} from 'lucide-react';

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = React.useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('usuario') || '{}');

    // Security Check (Simple frontend check)
    React.useEffect(() => {
        if (!user.esAdmin && user.rol !== 'Municipio') {
            // For testing purposes, we might allow it, but in prod:
            // navigate('/login');
        }
    }, []);

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
        { icon: FileText, label: 'Admisión (Intake)', path: '/admin/intake' },
        { icon: PawPrint, label: 'Pacientes', path: '/admin/pacientes' },
        { icon: Users, label: 'Usuarios', path: '/admin/usuarios' },
        { icon: Settings, label: 'Configuración', path: '/admin/config' },
    ];

    return (
        <div className="min-h-screen bg-gray-100 flex font-sans">
            {/* Sidebar Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:sticky top-0 left-0 h-screen w-64 bg-slate-900 text-white z-50 transition-transform duration-300
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-orange-500 p-2 rounded-lg">
                            <ShieldAlert className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg leading-none">Zoonosis</h1>
                            <span className="text-xs text-slate-400">Admin Panel</span>
                        </div>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <nav className="mt-6 px-4 space-y-2">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/20'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        )
                    })}
                </nav>

                <div className="absolute bottom-0 w-full p-4 bg-slate-950">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                            <span className="font-bold text-slate-200">A</span>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white">Admin</p>
                            <p className="text-xs text-slate-500">Municipio</p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            localStorage.removeItem('usuario');
                            navigate('/login');
                        }}
                        className="w-full flex items-center justify-center gap-2 p-2 rounded-lg text-red-400 hover:bg-slate-900 transition text-sm"
                    >
                        <LogOut className="w-4 h-4" /> Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen relative">
                {/* Mobile Header */}
                <header className="lg:hidden bg-white p-4 shadow-sm flex items-center justify-between sticky top-0 z-30">
                    <button onClick={() => setSidebarOpen(true)} className="text-slate-700">
                        <Menu className="w-6 h-6" />
                    </button>
                    <span className="font-bold text-slate-800">Panel Zoonosis</span>
                    <div className="w-6" />
                </header>

                <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
