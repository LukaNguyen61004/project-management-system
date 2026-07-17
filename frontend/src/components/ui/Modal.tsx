import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "../../utils/cn";

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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={onClose} />
            <div
                className={cn(
                    'relative bg-white rounded-lg shadow-xl w-full mx-auto',
                    'flex flex-col max-h-[min(90vh,900px)]',
                    sizes[size]
                )}
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-jira-border shrink-0">
                    <h2 className="text-lg font-semibold text-jira-text">{title}</h2>
                    <button type="button" onClick={onClose} className="p-1 rounded hover:bg-gray-100">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto min-h-0 flex-1">{children}</div>
            </div>
        </div>
    )
}
