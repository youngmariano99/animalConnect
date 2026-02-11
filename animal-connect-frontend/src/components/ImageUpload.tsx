import React, { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageUploadProps {
    onImageSelect: (file: File | null) => void;
    initialPreview?: string;
}

const ImageUpload = ({ onImageSelect, initialPreview }: ImageUploadProps) => {
    const [preview, setPreview] = useState<string | null>(initialPreview || null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);
            onImageSelect(file);
        }
    };

    const clearImage = () => {
        setPreview(null);
        onImageSelect(null);
    };

    useEffect(() => {
        return () => {
            if (preview && !initialPreview) URL.revokeObjectURL(preview);
        };
    }, [preview, initialPreview]);

    return (
        <div className="w-full">
            <AnimatePresence mode="wait">
                {preview ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="relative w-full h-64 rounded-pet overflow-hidden shadow-md group"
                    >
                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                        <button
                            type="button"
                            onClick={clearImage}
                            className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm p-2 rounded-full text-gray-500 hover:text-red-500 transition-colors shadow-sm"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </motion.div>
                ) : (
                    <motion.label
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-pet cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-health/50 transition-all group"
                    >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <div className="p-4 bg-white rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform duration-300">
                                <Upload className="w-8 h-8 text-health" />
                            </div>
                            <p className="mb-2 text-sm font-bold text-gray-500 group-hover:text-health transition-colors">
                                Toca para subir foto
                            </p>
                            <p className="text-xs text-gray-400">PNG, JPG (MAX. 5MB)</p>
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </motion.label>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ImageUpload;
