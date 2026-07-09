interface EpicBadgeProps {
  name: string
  color: string
}

export function EpicBadge({ name, color }: EpicBadgeProps) {
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded truncate max-w-[120px]"
      style={{ backgroundColor: `${color}22`, color }}
      title={name}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
      {name}
    </span>
  )
}