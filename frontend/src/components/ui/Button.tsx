import { cn } from '../../utils/cn';
import type { ButtonHTMLAttributes } from 'react';


interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary';
    size?: 'sm' | 'md'
}

const variants = {
    primary: 'bg-[#9d877c]/85 hover:bg-[#9d877c] text-[#151414]',
    secondary: 'cinder-glass hover:bg-white/10 text-jira-text',
}

const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
}

export function Button({
    variant = 'primary',
    size = 'md',
    className,
    children,
    ...props
}: ButtonProps) {
    return (
        <button className={cn(
            'inline-flex items-center justify-center gap-2 rounded-[10px] font-medium cursor-pointer transition-all',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:opacity-50',
            variants[variant],
            sizes[size],
            className
        )}
        {...props}>

            {children}
        </button>
    )
}