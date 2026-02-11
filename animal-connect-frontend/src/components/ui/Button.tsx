import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    className = '',
    disabled,
    ...props
}) => {
    const baseStyles = "inline-flex items-center justify-center font-bold transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-health text-white hover:bg-health/90 shadow-lg shadow-health/20",
        secondary: "bg-hope text-tech hover:bg-hope/90 shadow-lg shadow-hope/20",
        outline: "border-2 border-health text-health hover:bg-health/5",
        ghost: "text-tech hover:bg-gray-100",
        danger: "bg-love text-white hover:bg-love/90 shadow-lg shadow-love/20"
    };

    const sizes = {
        sm: "h-9 px-4 text-sm rounded-lg",
        md: "h-12 px-6 text-base rounded-pet", // Using custom border radius
        lg: "h-14 px-8 text-lg rounded-pet"
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
            {children}
            {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
        </button>
    );
};

export default Button;
