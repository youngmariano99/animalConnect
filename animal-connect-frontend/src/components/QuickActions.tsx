import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Megaphone } from 'lucide-react';

interface QuickActionsProps {
    onReportLost: () => void;
    onReportFound: () => void;
}

const QuickActions = ({ onReportLost, onReportFound }: QuickActionsProps) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="fixed bottom-24 right-4 z-[900] flex flex-col items-end gap-3">
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.8 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.8 }}
                            transition={{ delay: 0.1 }}
                        >
                            <button
                                onClick={() => { onReportFound(); setIsOpen(false); }}
                                className="flex items-center gap-3 bg-white pl-4 pr-1 py-1 rounded-full shadow-lg border border-gray-100 group hover:scale-105 transition-transform"
                            >
                                <span className="font-bold text-sm text-gray-700">Encontré uno</span>
                                <div className="bg-green-500 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-md">
                                    <Search className="w-5 h-5" />
                                </div>
                            </button>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.8 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.8 }}
                        >
                            <button
                                onClick={() => { onReportLost(); setIsOpen(false); }}
                                className="flex items-center gap-3 bg-white pl-4 pr-1 py-1 rounded-full shadow-lg border border-gray-100 group hover:scale-105 transition-transform"
                            >
                                <span className="font-bold text-sm text-gray-700">Perdí mi mascota</span>
                                <div className="bg-red-500 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-md">
                                    <Megaphone className="w-5 h-5" />
                                </div>
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center transition-colors ${isOpen ? 'bg-gray-800 text-white' : 'bg-health text-white'
                    }`}
            >
                <motion.div
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <Plus className="w-8 h-8" strokeWidth={3} />
                </motion.div>
            </motion.button>
        </div>
    );
};

export default QuickActions;
