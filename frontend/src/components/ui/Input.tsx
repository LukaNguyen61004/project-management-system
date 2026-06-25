import { cn } from '../../utils/cn';
import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement>{
    label?:string
    error?:string
}

export function Input({label, error, className, id,...props}: InputProps){
    const inputId =id || label?.toLowerCase().replace(/\s/g, '-')

    return (
        <div className="flex flex-col gap-1">
            {label && (
                <label htmlFor={inputId} className='text-sm font-medium text-jira-text'>
                    {label}
                </label>
            )}
           <input
             id={inputId}
             className={cn(
               'rounded border border-jira-border px-3 py-2 text-sm',
               'focus:outline-none focus:ring-2 focus:ring-jira-blue',
               error && 'border-red-500',
               className
             )}
             {...props}
           />
           {error && <span className='text-xs text-red-500'>{error}</span>}

        </div>
    )

}