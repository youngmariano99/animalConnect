import { motion } from 'framer-motion';
import { MapPin, Heart, Share2, Phone } from 'lucide-react';

interface Animal {
    id: number;
    nombre: string;
    descripcion: string;
    imagenUrl: string;
    idEstado: number; // 1: Perdido, 2: Encontrado, 3: En Adopción
    idEspecie: number;
    ubicacionLat: number;
    ubicacionLon: number;
    telefonoContacto?: string;
    fechaPublicacion?: string;
}

interface PetCardProps {
    animal: Animal;
    onClick: () => void;
}

const PetCard = ({ animal, onClick }: PetCardProps) => {
    const isLost = animal.idEstado === 1;
    const badgeColor = isLost ? 'bg-red-500' : 'bg-green-500';
    const statusText = isLost ? 'PERDIDO' : 'ENCONTRADO';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white rounded-pet shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full relative group"
            onClick={onClick}
        >
            {/* Imagen Principal */}
            <div className="relative h-48 overflow-hidden">
                <img
                    src={animal.imagenUrl || 'https://via.placeholder.com/300x200?text=Sin+Imagen'}
                    alt={animal.nombre}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />

                {/* Badge de Estado */}
                <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold text-white shadow-md ${badgeColor}`}>
                    {statusText}
                </div>

                {/* Botón Favorito (Simulado) */}
                <button className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full text-gray-400 hover:text-love transition-colors shadow-sm">
                    <Heart className="w-5 h-5" />
                </button>
            </div>

            {/* Contenido */}
            <div className="p-4 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-heading font-extrabold text-lg text-tech truncate">{animal.nombre}</h3>
                    <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-lg uppercase">
                        {animal.idEspecie === 1 ? 'Perro' : 'Gato'}
                    </span>
                </div>

                <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-grow font-body">
                    {animal.descripcion}
                </p>

                <div className="flex items-center text-gray-400 text-xs mb-4">
                    <MapPin className="w-3 h-3 mr-1" />
                    <span>A 2.5 km de ti</span> {/* Mock distance */}
                </div>

                {/* Acciones */}
                <div className="grid grid-cols-2 gap-2 mt-auto">
                    {animal.telefonoContacto && (
                        <a
                            href={`https://wa.me/549${animal.telefonoContacto}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-center gap-2 bg-green-50 text-green-600 py-2.5 rounded-xl font-bold text-sm hover:bg-green-100 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Phone className="w-4 h-4" /> Whatsapp
                        </a>
                    )}
                    <a
                        href={`http://localhost:5269/api/Animales/${animal.id}/cartel`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 bg-gray-50 text-gray-600 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Share2 className="w-4 h-4" /> Cartel
                    </a>
                </div>
            </div>
        </motion.div>
    );
};

export default PetCard;
