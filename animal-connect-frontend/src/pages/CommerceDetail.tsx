import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Star, ArrowLeft, ShoppingBag, Plus, Trash2, Heart } from 'lucide-react';

const CommerceDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');

    const [comercio, setComercio] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showAddProduct, setShowAddProduct] = useState(false);

    // New Product Form
    const [newItemName, setNewItemName] = useState('');
    const [newItemPrice, setNewItemPrice] = useState('');
    const [newItemDesc, setNewItemDesc] = useState('');

    useEffect(() => {
        fetchComercio();
    }, [id]);

    const fetchComercio = async () => {
        try {
            const res = await fetch(`http://localhost:5269/api/Comercios/${id}`);
            if (res.ok) {
                const data = await res.json();
                setComercio(data);
            } else {
                alert("Comercio no encontrado");
                navigate('/marketplace');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddProduct = async () => {
        if (!newItemName || !newItemPrice) return alert("Completa nombre y precio");

        try {
            const dto = {
                comercioId: parseInt(id!),
                nombre: newItemName,
                descripcion: newItemDesc,
                precio: parseFloat(newItemPrice),
                imagenUrl: "https://cdn-icons-png.flaticon.com/512/3081/3081559.png", // Mock
                disponible: true
            };

            const res = await fetch('http://localhost:5269/api/Comercios/producto', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dto)
            });

            if (res.ok) {
                setShowAddProduct(false);
                setNewItemName('');
                setNewItemPrice('');
                setNewItemDesc('');
                fetchComercio(); // Refresh
            } else {
                alert("Error al agregar producto");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteProduct = async (itemId: number) => {
        if (!confirm("¿Eliminar producto?")) return;
        try {
            const res = await fetch(`http://localhost:5269/api/Comercios/producto/${itemId}`, {
                method: 'DELETE'
            });
            if (res.ok) fetchComercio();
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin text-tech text-4xl">⏳</div></div>;
    if (!comercio) return null;

    const isOwner = usuario && comercio.usuarioId === usuario.id;

    return (
        <div className="min-h-screen bg-canvas pb-20">
            {/* --- HERO HEADER --- */}
            <div className="relative h-64 bg-gray-900">
                <img src={comercio.logoUrl || "https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?auto=format&fit=crop&q=80"} className="w-full h-full object-cover opacity-60" alt="Cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

                <button onClick={() => navigate(-1)} className="absolute top-4 left-4 bg-white/20 backdrop-blur p-2 rounded-full text-white hover:bg-white/30 transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </button>

                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <div className="flex items-end gap-4">
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 rounded-2xl bg-white p-1 shadow-lg">
                            <img src={comercio.logoUrl} className="w-full h-full object-cover rounded-xl" alt="Logo" />
                        </motion.div>
                        <div className="flex-1 mb-1">
                            <h1 className="text-2xl font-heading font-extrabold leading-none">{comercio.nombre}</h1>
                            <p className="text-gray-300 text-sm mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> {comercio.direccion}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- INFO BAR --- */}
            <div className="bg-white px-6 py-4 border-b border-gray-100 flex justify-between items-center sticky top-0 z-40 shadow-sm">
                <div>
                    <span className="text-xs font-bold uppercase bg-tech/10 text-tech px-2 py-1 rounded">{comercio.etiquetas}</span>
                </div>
                <div className="flex gap-2 text-yellow-500 font-bold text-sm items-center">
                    <Star className="w-4 h-4 fill-current" /> 4.9
                </div>
            </div>

            {/* --- CATALOG --- */}
            <main className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-heading font-bold text-tech flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-gray-400" /> Catálogo
                    </h2>
                    {isOwner && (
                        <button
                            onClick={() => setShowAddProduct(!showAddProduct)}
                            className="bg-tech text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg shadow-tech/20 flex items-center gap-1"
                        >
                            <Plus className="w-4 h-4" /> Agregar
                        </button>
                    )}
                </div>

                {/* ADD PRODUCT FORM (Owner Only) */}
                <AnimatePresence>
                    {showAddProduct && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                            className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 overflow-hidden"
                        >
                            <h3 className="font-bold text-sm text-gray-500 mb-3 uppercase">Nuevo Producto</h3>
                            <div className="space-y-3">
                                <input type="text" placeholder="Nombre del producto" className="w-full p-2 rounded-lg border border-gray-200 text-sm" value={newItemName} onChange={e => setNewItemName(e.target.value)} />
                                <div className="flex gap-3">
                                    <input type="number" placeholder="Precio" className="w-1/3 p-2 rounded-lg border border-gray-200 text-sm" value={newItemPrice} onChange={e => setNewItemPrice(e.target.value)} />
                                    <input type="text" placeholder="Descripción corta" className="flex-1 p-2 rounded-lg border border-gray-200 text-sm" value={newItemDesc} onChange={e => setNewItemDesc(e.target.value)} />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => setShowAddProduct(false)} className="px-3 py-1.5 text-xs font-bold text-gray-500">Cancelar</button>
                                    <button onClick={handleAddProduct} className="px-3 py-1.5 bg-tech text-white text-xs font-bold rounded-lg shadow-md">Guardar</button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* GRID */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {comercio.catalogo && comercio.catalogo.length > 0 ? (
                        comercio.catalogo.map((prod: any) => (
                            <div key={prod.id} className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                                <div className="aspect-square bg-gray-100 rounded-xl mb-3 overflow-hidden relative group">
                                    <img src={prod.imagenUrl || "https://cdn-icons-png.flaticon.com/512/3081/3081559.png"} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt={prod.nombre} />
                                    {isOwner && (
                                        <button
                                            onClick={() => handleDeleteProduct(prod.id)}
                                            className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                                <h4 className="font-bold text-gray-800 text-sm leading-tight">{prod.nombre}</h4>
                                <p className="text-xs text-gray-400 mt-1 line-clamp-2 flex-1">{prod.descripcion}</p>
                                <div className="mt-2 flex justify-between items-center">
                                    <span className="font-heading font-black text-tech">${prod.precio}</span>
                                    <button className="bg-tech/10 text-tech p-1.5 rounded-lg hover:bg-tech hover:text-white transition-colors">
                                        <Heart className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-2 py-10 text-center">
                            <p className="text-gray-400 text-sm">Este comercio aún no cargó productos.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default CommerceDetail;
