import React, { useEffect, useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    BarElement
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { Activity, Users, PawPrint, Home, AlertCircle } from 'lucide-react';

ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement,
    BarElement, ArcElement, Title, Tooltip, Legend
);

const Dashboard = () => {
    const user = JSON.parse(localStorage.getItem('usuario') || '{}');
    const [stats, setStats] = useState({
        totalAnimales: 0,
        adopcionesMes: 0,
        casosAbiertos: 0,
        usuariosNuevos: 0,
        speciesLabels: ['Perros', 'Gatos', 'Otros'],
        speciesData: [0, 0, 0],
        trendData: [0, 0, 0, 0, 0, 0]
    });

    useEffect(() => {
        if (user.id) fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch(`http://localhost:5269/api/Admin/dashboard-stats/${user.id}`);
            if (res.ok) {
                const data = await res.json();
                setStats({
                    totalAnimales: data.totalReportes,
                    adopcionesMes: data.adopcionesMes,
                    casosAbiertos: data.casosAbiertos,
                    usuariosNuevos: data.usuariosNuevos,
                    speciesLabels: data.speciesLabels,
                    speciesData: data.speciesData,
                    trendData: data.adoptionTrend
                });
            }
        } catch (error) {
            console.error("Error fetching dashboard stats:", error);
        }
    };

    const dataSpecies = {
        labels: stats.speciesLabels,
        datasets: [
            {
                data: stats.speciesData,
                backgroundColor: ['#f97316', '#a855f7', '#3b82f6'],
                borderWidth: 0,
            },
        ],
    };

    const dataAdoptions = {
        labels: ['Hace 5 meses', 'Hace 4 meses', 'Hace 3 meses', 'Hace 2 meses', 'Mes Pasado', 'Este Mes'],
        datasets: [
            {
                label: 'Adopciones',
                data: stats.trendData,
                borderColor: '#22c55e',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                tension: 0.4,
                fill: true,
            },
        ],
    };

    const dataIntake = {
        labels: ['Perdidos', 'Encontrados', 'Abandono'],
        datasets: [
            {
                label: 'Ingresos',
                data: [65, 40, 10], // Still mocked as Backend didn't provide this yet
                backgroundColor: ['#ef4444', '#3b82f6', '#eab308'],
            },
        ],
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-800">Resumen de Gestión</h1>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Animales Registrados', val: stats.totalAnimales, icon: PawPrint, color: 'text-orange-600', bg: 'bg-orange-100' },
                    { label: 'Adopciones (Mes)', val: stats.adopcionesMes, icon: Home, color: 'text-green-600', bg: 'bg-green-100' },
                    { label: 'Casos Abiertos', val: stats.casosAbiertos, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100' },
                    { label: 'Nuevos Usuarios', val: stats.usuariosNuevos, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
                ].map((kpi, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${kpi.bg} ${kpi.color}`}>
                            <kpi.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">{kpi.label}</p>
                            <p className="text-2xl font-bold text-slate-800">{kpi.val}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-2">
                    <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                        <Activity className="w-4 h-4" /> Tendencia de Adopciones
                    </h3>
                    <div className="h-64 flex justify-center">
                        <Line options={{ maintainAspectRatio: false }} data={dataAdoptions} />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                        <PawPrint className="w-4 h-4" /> Distribución Especies
                    </h3>
                    <div className="h-64 flex justify-center relative">
                        <Doughnut options={{ maintainAspectRatio: false }} data={dataSpecies} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
