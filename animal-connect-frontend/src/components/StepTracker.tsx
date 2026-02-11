import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface StepTrackerProps {
    currentStep: number;
    totalSteps: number;
    labels?: string[];
}

const StepTracker = ({ currentStep, totalSteps, labels }: StepTrackerProps) => {
    return (
        <div className="w-full mb-8">
            <div className="flex justify-between relative">
                {/* Progress Bar Background */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10 rounded-full" />

                {/* Active Progress Bar */}
                <motion.div
                    className="absolute top-1/2 left-0 h-1 bg-health -z-10 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                />

                {Array.from({ length: totalSteps }).map((_, index) => {
                    const stepNum = index + 1;
                    const isActive = stepNum <= currentStep;
                    const isCompleted = stepNum < currentStep;

                    return (
                        <div key={index} className="flex flex-col items-center gap-2">
                            <motion.div
                                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${isActive
                                        ? 'bg-health border-health text-white shadow-lg shadow-health/20'
                                        : 'bg-white border-gray-300 text-gray-400'
                                    }`}
                                animate={{ scale: isActive ? 1.1 : 1 }}
                            >
                                {isCompleted ? <Check className="w-4 h-4" /> : <span className="text-xs font-bold">{stepNum}</span>}
                            </motion.div>
                            {labels && (
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-health' : 'text-gray-400'}`}>
                                    {labels[index]}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StepTracker;
