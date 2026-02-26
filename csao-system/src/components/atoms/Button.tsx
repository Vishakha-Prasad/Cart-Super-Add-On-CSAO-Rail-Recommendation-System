import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'sm' | 'md' | 'lg';
}

export const Button = ({
    className,
    variant = 'primary',
    size = 'md',
    ...props
}: ButtonProps) => {
    return (
        <button
            className={cn(
                'rounded-md font-medium transition-colors focus-visible:outline-none disabled:opacity-50',
                variant === 'primary' && 'bg-red-600 text-white hover:bg-red-700',
                variant === 'secondary' && 'bg-slate-100 text-slate-900 hover:bg-slate-200',
                variant === 'outline' && 'border border-slate-200 bg-transparent hover:bg-slate-100',
                size === 'sm' && 'px-3 py-1.5 text-xs',
                size === 'md' && 'px-4 py-2 text-sm',
                size === 'lg' && 'px-6 py-3 text-base',
                className
            )}
            {...props}
        />
    );
};
