import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "../../utils/cn";
import { createPortal } from 'react-dom'

interface ModalProps {
    open: boolean
    onClose: () => void
    title: string
    children: React.ReactNode
    size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
}

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        if (open) document.addEventListener('keydown', handleEsc)
        return () => document.removeEventListener('keydown', handleEsc)
    }, [open, onClose])

    if (!open) return null

    return createPortal (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
            <div className="fixed inset-0 bg-black/50" onClick={onClose} />
            <div
                className={cn(
                    'relative cinder-glass-solid rounded-[20px] shadow-xl w-full mx-auto',
                    'flex flex-col max-h-[min(90dvh,900px)]',
                    sizes[size]
                )}
            >
                <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-jira-border shrink-0">
                    <h2 className="text-base sm:text-lg font-semibold text-jira-text pr-2 truncate">{title}</h2>
                    <button type="button" onClick={onClose} className="p-1 rounded hover:bg-white/10">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-4 sm:p-6 overflow-y-auto min-h-0 flex-1">{children}</div>
            </div>
        </div>,
        document.body
    )
}
