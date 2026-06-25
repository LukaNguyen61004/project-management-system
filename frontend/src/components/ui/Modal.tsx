import { useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
    open: boolean
    onClose: () => void
    title: string
    children: React.ReactNode
}

export function Modal({ open, onClose, title, children }: ModalProps) {
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        if (open) document.addEventListener('keydown', handleEsc)
        return () => document.removeEventListener('keydown', handleEsc)
    }, [open, onClose])

    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16">
            <div className="fixed inset-0 bg-black/50" onClick={onClose} />
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
                <div className="flex items-center justify-between px-6 py-4 border-b border-jira-border">
                    <h2 className="text-lg font-semibold text-jira-text">{title}</h2>
                    <button type="button" onClick={onClose} className="p-1 rounded hover:bg-gray-100">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>
    )
}