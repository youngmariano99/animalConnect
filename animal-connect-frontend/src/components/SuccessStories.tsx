import { motion } from 'framer-motion';
import { Heart, Calendar, Quote } from 'lucide-react';

const stories = [
    { id: 1, pet: 'Rocky', family: 'Familia López', img: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400', date: 'Hace 2 días', quote: "Rocky llenó de alegría nuestra casa desde el primer día." },
    { id: 2, pet: 'Mía', family: 'Clara y Tomás', img: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=400', date: 'Hace 1 semana', quote: "No imaginamos la vida sin ella." },
    { id: 3, pet: 'Toby', family: 'Los García', img: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=400', date: 'Hace 3 semanas', quote: "Gracias AnimalConnect por unirnos." },
];

const SuccessStories = () => {
    return (
        <section className="py-12 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-10">
                    <span className="inline-block bg-love/10 text-love px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest mb-3">Community</span>
                    <h2 className="text-3xl font-heading font-extrabold text-tech">Finales Felices</h2>
                    <p className="text-gray-500 mt-2 max-w-md mx-auto">Historias que nos inspiran a seguir trabajando.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {stories.map((story, i) => (
                        <motion.div
                            key={story.id}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="group relative h-96 rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-xl transition-shadow"
                        >
                            <img src={story.img} alt={story.pet} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                                <Quote className="w-8 h-8 text-love mb-4 opacity-80" />
                                <p className="text-lg font-medium italic mb-6 leading-relaxed">"{story.quote}"</p>

                                <div className="flex items-center justify-between border-t border-white/20 pt-4">
                                    <div>
                                        <h4 className="font-bold text-xl">{story.pet}</h4>
                                        <p className="text-sm text-gray-300">Adoptado por {story.family}</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-bold bg-white/20 backdrop-blur px-3 py-1.5 rounded-lg">
                                        <Calendar className="w-3 h-3" /> {story.date}
                                    </div>
                                </div>
                            </div>

                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur rounded-full p-2 text-love opacity-0 group-hover:opacity-100 transform translate-y-[-10px] group-hover:translate-y-0 transition-all duration-300">
                                <Heart className="w-6 h-6 fill-current" />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default SuccessStories;
