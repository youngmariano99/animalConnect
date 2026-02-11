import { FileText, Search, Plus, Calendar, Clock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const MedicalRecords = () => {
    // Mock Data
    const patients = [
        { id: 1, name: 'Luna', species: 'Perro', owner: 'Juan Pérez', lastVisit: '12/10/2023', status: 'Tratamiento' },
        { id: 2, name: 'Simba', species: 'Gato', owner: 'Maria Gomez', lastVisit: '15/10/2023', status: 'Alta' },
        { id: 3, name: 'Coco', species: 'Perro', owner: 'Carlos Ruiz', lastVisit: '20/10/2023', status: 'Observación' },
    ];

    return (
        <div className="min-h-screen bg-canvas text-tech font-sans pb-20">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
                <div className="container mx-auto px-4 h-20 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-health/10 p-2.5 rounded-xl text-health">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-lg font-heading font-extrabold text-tech leading-none">Historias Clínicas</h1>
                            <p className="text-xs text-gray-500 font-medium mt-1">Gestión de pacientes</p>
                        </div>
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-4 py-8">
                {/* Search & Actions */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar por paciente, dueño o ID..."
                            className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 focus:border-health focus:ring-4 focus:ring-health/10 outline-none transition-all font-medium"
                        />
                    </div>
                    <button className="bg-tech text-white px-6 py-3.5 rounded-xl font-bold shadow-lg shadow-tech/20 hover:bg-tech/90 transition flex items-center justify-center gap-2">
                        <Plus className="w-5 h-5" /> Nuevo Paciente
                    </button>
                </div>

                {/* Patient List */}
                <div className="grid gap-4">
                    {patients.map((patient, index) => (
                        <motion.div
                            key={patient.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-xl font-bold text-gray-400 group-hover:bg-health/10 group-hover:text-health transition-colors">
                                        {patient.name[0]}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-800">{patient.name} <span className="text-xs font-normal text-gray-500 ml-1">({patient.species})</span></h3>
                                        <p className="text-sm text-gray-500">Dueño: {patient.owner}</p>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${patient.status === 'Alta' ? 'bg-green-100 text-green-700' :
                                        patient.status === 'Tratamiento' ? 'bg-blue-100 text-blue-700' :
                                            'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {patient.status}
                                </span>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-50 flex gap-4 text-xs text-gray-400 font-medium">
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5" /> Última visita: {patient.lastVisit}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" /> Hace 3 días
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Empty State / Info */}
                <div className="mt-8 bg-blue-50 p-6 rounded-2xl border border-blue-100 flex items-start gap-4">
                    <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0" />
                    <div>
                        <h4 className="font-bold text-blue-800">Próximamente: Gestión Avanzada</h4>
                        <p className="text-sm text-blue-600 mt-1">Estamos trabajando en el módulo completo de historias clínicas digitales, que incluirá vacunación, desparasitación y carga de estudios.</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MedicalRecords;
