import React from 'react';

interface BadgeProps {
  label: string;
  variant?: 'green' | 'blue' | 'purple' | 'amber' | 'slate';
}

export default function Badge({ label, variant = 'slate' }: BadgeProps) {
  const variantStyles = {
    green: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50',
    blue: 'bg-sky-950/60 text-sky-400 border-sky-800/50',
    purple: 'bg-purple-950/60 text-purple-400 border-purple-800/50',
    amber: 'bg-amber-950/60 text-amber-400 border-amber-800/50',
    slate: 'bg-slate-800/80 text-slate-300 border-slate-700/50'
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${variantStyles[variant]}`}>
      {label}
    </span>
  );
}
