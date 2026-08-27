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
                <label htmlFor={inputId} className='text-sm font-semibold text-jira-text font-[Hind]'>
                    {label}
                </label>
            )}
           <input
             id={inputId}
             className={cn(
               'rounded-2xl border border-jira-border bg-transparent px-3 py-2 text-sm text-jira-text',
               'placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-white/25',
               error && 'border-red-500',
               className
             )}
             {...props}
           />
           {error && <span className='text-xs text-red-500'>{error}</span>}

        </div>
    )

}