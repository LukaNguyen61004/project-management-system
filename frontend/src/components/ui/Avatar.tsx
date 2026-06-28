import { cn } from '../../utils/cn'

interface AvatarProps {
  name?: string | null
  src?: string | null
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: 'w-6 h-6 text-xs',
  md: 'w-8 h-8 text-sm',
  lg: 'w-10 h-10 text-base',
}

function getInitials(name?: string | null) {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function Avatar({ name, src, size = 'md' }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name || 'User'}
        className={cn('rounded-full object-cover shrink-0', sizes[size])}
      />
    )
  }

  return (
    <div
      className={cn(
        'rounded-full bg-jira-blue flex items-center justify-center text-white font-medium shrink-0',
        sizes[size]
      )}
    >
      {getInitials(name)}
    </div>
  )
}
