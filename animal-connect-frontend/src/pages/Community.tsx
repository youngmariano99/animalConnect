import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageCircle, Heart, Share2, Send,
    Shield, Filter, Plus, Megaphone, CircleHelp
} from 'lucide-react';

interface Post {
    id: number;
    titulo: string;
    contenido: string;
    categoria: 'Duda' | 'Historia' | 'Aviso';
    fechaPublicacion: string;
    autor: string;
    esVeterinario: boolean;
    nombreOng?: string;
    autorId: number;
    totalComentarios: number;
    comentarios: Comment[];
    latitud?: number;
    longitud?: number;
}

interface Comment {
    id: number;
    contenido: string;
    fecha: string;
    autor: string;
    esVeterinario: boolean;
    nombreOng?: string;
}

const Community = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'Todas' | 'Duda' | 'Historia' | 'Aviso'>('Todas');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newPost, setNewPost] = useState({ titulo: '', contenido: '', categoria: 'Duda' });
    const [activeCommentBox, setActiveCommentBox] = useState<number | null>(null);
    const [commentText, setCommentText] = useState('');

    const user = JSON.parse(localStorage.getItem('zoonosis_user') || '{}');

    useEffect(() => {
        fetchPosts();
    }, [filter]);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const url = `http://localhost:5269/api/Foro?pagina=1&cantidad=20&categoria=${filter}`;
            const res = await fetch(url);
            const data = await res.json();
            setPosts(data.data || []);
        } catch (error) {
            console.error("Error fetching posts:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePost = async () => {
        if (!user.id) return alert("Debes iniciar sesión");

        try {
            const payload = {
                titulo: newPost.titulo,
                contenido: newPost.contenido,
                categoria: newPost.categoria,
                usuarioId: user.id,
                // Dummy coords for MVP or use navigator.geolocation
                latitud: -38.0,
                longitud: -61.0
            };

            const res = await fetch('http://localhost:5269/api/Foro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const data = await res.json();
                // Optimistic update or refresh
                setShowCreateModal(false);
                setNewPost({ titulo: '', contenido: '', categoria: 'Duda' });
                fetchPosts();

                // Gamification Alert (Simulated)
                if (data.nuevosPuntos) {
                    alert(`¡Post publicado! Ganaste puntos. Total: ${data.nuevosPuntos}`);
                }
            }
        } catch (e) { console.error(e); }
    };

    const handleComment = async (postId: number) => {
        if (!commentText.trim()) return;
        try {
            const res = await fetch(`http://localhost:5269/api/Foro/${postId}/comentar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contenido: commentText, usuarioId: user.id })
            });
            if (res.ok) {
                setCommentText('');
                fetchPosts(); // Refresh to see comment
            }
        } catch (e) { console.error(e); }
    };

    const categories = [
        { id: 'Todas', label: 'Todo', icon: Filter, color: 'bg-gray-800' },
        { id: 'Duda', label: 'Consultas', icon: CircleHelp, color: 'bg-blue-500' },
        { id: 'Historia', label: 'Historias', icon: Heart, color: 'bg-red-500' },
        { id: 'Aviso', label: 'Avisos', icon: Megaphone, color: 'bg-yellow-500' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white p-4 sticky top-0 z-40 border-b border-gray-100 flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold text-gray-800">Comunidad</h1>
                    <p className="text-xs text-gray-500">Muro vecinal de Pringles</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-orange-600 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition"
                >
                    <Plus className="w-6 h-6" />
                </button>
            </div>

            {/* Filters */}
            <div className="p-4 flex gap-2 overflow-x-auto scrollbar-hide">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setFilter(cat.id as any)}
                        className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${filter === cat.id
                            ? `${cat.color} text-white shadow-md`
                            : 'bg-white text-gray-600 border border-gray-200'
                            }`}
                    >
                        {React.createElement(cat.icon, { className: "w-3 h-3" })}
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Feed */}
            <div className="px-4 space-y-4 max-w-2xl mx-auto">
                {loading ? (
                    <div className="text-center py-12 text-gray-400">
                        <MessageCircle className="w-10 h-10 mx-auto mb-2 animate-bounce" />
                        <p>Cargando muro...</p>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                        <p className="text-gray-500">No hay publicaciones en esta categoría.</p>
                    </div>
                ) : (
                    posts.map(post => (
                        <motion.div
                            key={post.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100"
                        >
                            {/* Author Header */}
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg font-bold text-gray-400">
                                        {post.autor.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-sm text-gray-800">{post.autor}</span>
                                            {post.esVeterinario && <Shield className="w-4 h-4 text-blue-500" />}
                                            {post.nombreOng && <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">{post.nombreOng}</span>}
                                        </div>
                                        <p className="text-xs text-gray-400">{new Date(post.fechaPublicacion).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${post.categoria === 'Historia' ? 'bg-red-50 text-red-500' :
                                    post.categoria === 'Aviso' ? 'bg-yellow-50 text-yellow-600' :
                                        'bg-blue-50 text-blue-500'
                                    }`}>
                                    {post.categoria}
                                </span>
                            </div>

                            <h3 className="font-bold text-lg mb-2">{post.titulo}</h3>
                            <p className="text-gray-600 text-sm mb-4 leading-relaxed">{post.contenido}</p>

                            {/* Footer Actions */}
                            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                <button
                                    onClick={() => setActiveCommentBox(activeCommentBox === post.id ? null : post.id)}
                                    className="flex items-center gap-2 text-gray-500 text-xs font-bold hover:text-orange-500 transition"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    {post.comentarios?.length || 0} Comentarios
                                </button>
                                <button className="text-gray-400 hover:text-orange-500">
                                    <Share2 className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Comments Section */}
                            {activeCommentBox === post.id && (
                                <div className="mt-4 bg-gray-50 p-4 rounded-xl">
                                    <div className="space-y-3 mb-4 max-h-40 overflow-y-auto">
                                        {post.comentarios?.map(c => (
                                            <div key={c.id} className="flex gap-2">
                                                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-xs text-gray-400 border border-gray-200">
                                                    {c.autor.charAt(0)}
                                                </div>
                                                <div className="bg-white p-2 rounded-lg rounded-tl-none border border-gray-200 text-xs flex-1">
                                                    <span className="font-bold mr-1">{c.autor}</span>
                                                    <span className="text-gray-600">{c.contenido}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Escribe un comentario..."
                                            value={commentText}
                                            onChange={(e) => setCommentText(e.target.value)}
                                            className="w-full pl-4 pr-10 py-2 rounded-full border border-gray-200 text-sm focus:outline-none focus:border-orange-500"
                                        />
                                        <button
                                            onClick={() => handleComment(post.id)}
                                            className="absolute right-1 top-1 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center hover:bg-orange-600"
                                        >
                                            <Send className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ))
                )}
            </div>

            {/* Create Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl"
                        >
                            <h2 className="text-xl font-bold mb-4">Nueva Publicación</h2>

                            <select
                                className="w-full mb-4 p-3 rounded-xl border border-gray-200 bg-gray-50 font-bold text-gray-700"
                                value={newPost.categoria}
                                onChange={(e) => setNewPost({ ...newPost, categoria: e.target.value as any })}
                            >
                                <option value="Duda">❓ Consulta</option>
                                <option value="Historia">❤️ Historia</option>
                                <option value="Aviso">📢 Aviso</option>
                            </select>

                            <input
                                type="text"
                                placeholder="Título breve"
                                className="w-full mb-3 p-3 rounded-xl border border-gray-200 focus:border-orange-500 outline-none font-bold"
                                value={newPost.titulo}
                                onChange={(e) => setNewPost({ ...newPost, titulo: e.target.value })}
                            />

                            <textarea
                                rows={4}
                                placeholder="Escribe tu mensaje aquí..."
                                className="w-full mb-6 p-3 rounded-xl border border-gray-200 focus:border-orange-500 outline-none text-sm resize-none"
                                value={newPost.contenido}
                                onChange={(e) => setNewPost({ ...newPost, contenido: e.target.value })}
                            />

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-xl"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleCreatePost}
                                    className="flex-1 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 shadow-md"
                                >
                                    Publicar
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Community;
