import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    leftIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, leftIcon, className = '', ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-bold text-tech mb-2">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {leftIcon && (
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                            {leftIcon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={`
              w-full bg-white border-2 rounded-xl px-4 py-3 font-medium text-tech outline-none transition-all
              placeholder:text-gray-400
              ${leftIcon ? 'pl-11' : ''}
              ${error
                                ? 'border-love focus:border-love focus:ring-4 focus:ring-love/10'
                                : 'border-gray-100 focus:border-health focus:ring-4 focus:ring-health/10'
                            }
              ${className}
            `}
                        {...props}
                    />
                </div>
                {error && (
                    <p className="mt-1 text-xs font-bold text-love">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;
