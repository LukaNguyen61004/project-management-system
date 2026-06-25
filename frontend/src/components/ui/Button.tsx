import { cn } from '../../utils/cn';
import type { ButtonHTMLAttributes } from 'react';


interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary';
    size?: 'sm' | 'md'
}

const variants = {
    primary: 'bg-jira-blue hover:bg-jira-blue-dark text-white',
    secondary: 'bg-white border border-jira-border hover:bg-gray-50 text-jira-text',
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
            'inline-flex items-center justify-center gap-2 rounded font-medium transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            variants[variant],
            sizes[size],
            className
        )}
        {...props}>

            {children}
        </button>
    )
}