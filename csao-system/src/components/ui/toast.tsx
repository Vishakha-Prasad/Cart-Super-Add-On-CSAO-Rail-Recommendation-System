'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info, AlertTriangle, CheckCircle } from 'lucide-react';

export type ToastType = 'info' | 'error' | 'success' | 'warning';

interface ToastProps {
    message: string;
    type?: ToastType;
    onClose: () => void;
    duration?: number;
}

export const Toast = ({ message, type = 'info', onClose, duration = 3000 }: ToastProps) => {
    useEffect(() => {
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [onClose, duration]);

    const icons = {
        info: <Info className="w-4 h-4 text-blue-500" />,
        error: <AlertTriangle className="w-4 h-4 text-red-500" />,
        warning: <AlertTriangle className="w-4 h-4 text-orange-500" />,
        success: <CheckCircle className="w-4 h-4 text-green-500" />,
    };

    const colors = {
        info: 'bg-blue-50 border-blue-100',
        error: 'bg-red-50 border-red-100',
        warning: 'bg-orange-50 border-orange-100',
        success: 'bg-green-50 border-green-100',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] min-w-[300px] p-4 rounded-2xl border shadow-xl flex items-center gap-3 ${colors[type]}`}
        >
            {icons[type]}
            <p className="text-sm font-medium text-gray-900 flex-1">{message}</p>
            <button onClick={onClose} className="p-1 hover:bg-black/5 rounded-full transition-colors">
                <X className="w-4 h-4 text-gray-400" />
            </button>
        </motion.div>
    );
};

// Global Toast Manager
export const useToast = () => {
    const [toast, setToast] = React.useState<{ message: string, type: ToastType } | null>(null);

    const showToast = (message: string, type: ToastType = 'info') => {
        setToast({ message, type });
    };

    const hideToast = () => setToast(null);

    return { toast, showToast, hideToast };
};
