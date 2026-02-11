import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Map, Users, LogOut, ShieldCheck, Menu, X, Building
} from 'lucide-react';

const SuperAdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = React.useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('usuario') || '{}');

    // Security Check
    React.useEffect(() => {
        if (user.rol !== 'Administrador') { // "Administrador" = SuperAdmin in this context
            navigate('/login');
        }
    }, [user, navigate]);

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/superadmin/dashboard' },
        { icon: Map, label: 'Municipios', path: '/superadmin/municipios' },
        { icon: ShieldCheck, label: 'Vets Pendientes', path: '/superadmin/aprobaciones/vets' },
        { icon: Users, label: 'ONGs Pendientes', path: '/superadmin/aprobaciones/ongs' },
    ];

    return (
        <div className="min-h-screen bg-slate-900 flex font-sans text-slate-100">
            {/* Sidebar Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:sticky top-0 left-0 h-screen w-64 bg-black border-r border-slate-800 z-50 transition-transform duration-300
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-orange-600 p-2 rounded-lg">
                            <Building className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg leading-none text-orange-500">AnimalConnect</h1>
                            <span className="text-xs text-slate-500">SuperAdmin</span>
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

                <div className="absolute bottom-0 w-full p-4 bg-black">
                    <button
                        onClick={() => {
                            localStorage.removeItem('usuario');
                            navigate('/login');
                        }}
                        className="w-full flex items-center justify-center gap-2 p-2 rounded-lg text-red-500 hover:bg-slate-900 transition text-sm font-bold border border-slate-800 hover:border-red-900"
                    >
                        <LogOut className="w-4 h-4" /> Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen relative bg-slate-900">
                {/* Mobile Header */}
                <header className="lg:hidden bg-black p-4 border-b border-slate-800 flex items-center justify-between sticky top-0 z-30">
                    <button onClick={() => setSidebarOpen(true)} className="text-slate-400">
                        <Menu className="w-6 h-6" />
                    </button>
                    <span className="font-bold text-orange-500">SuperAdmin Panel</span>
                    <div className="w-6" />
                </header>

                <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default SuperAdminLayout;
