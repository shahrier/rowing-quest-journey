import { BadgeTier } from '@/lib/supabase-types';
import { Award } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  name: string;
  description: string;
  tier: BadgeTier;
  earned: boolean;
  earnedAt?: string;
}

export function Badge({ name, description, tier, earned, earnedAt }: BadgeProps) {
  const tierColors = {
    bronze: {
      bg: 'bg-amber-100 dark:bg-amber-950',
      border: 'border-amber-300 dark:border-amber-800',
      text: 'text-amber-800 dark:text-amber-300',
      icon: 'text-amber-600 dark:text-amber-400',
    },
    silver: {
      bg: 'bg-slate-100 dark:bg-slate-900',
      border: 'border-slate-300 dark:border-slate-700',
      text: 'text-slate-800 dark:text-slate-300',
      icon: 'text-slate-500 dark:text-slate-400',
    },
    gold: {
      bg: 'bg-yellow-100 dark:bg-yellow-950',
      border: 'border-yellow-300 dark:border-yellow-800',
      text: 'text-yellow-800 dark:text-yellow-300',
      icon: 'text-yellow-600 dark:text-yellow-400',
    },
  };

  const colors = tierColors[tier];

  return (
    <div 
      className={cn(
        'relative rounded-lg border p-4 flex flex-col items-center text-center transition-all',
        colors.bg,
        colors.border,
        earned ? 'opacity-100' : 'opacity-60 grayscale',
      )}
    >
      <div className={cn('absolute -top-3 -right-3 rounded-full p-1.5', colors.bg, colors.border)}>
        <Award className={cn('h-5 w-5', colors.icon)} />
      </div>
      
      <div className="mt-2 mb-1">
        <span className={cn(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
          colors.bg,
          colors.text
        )}>
          {tier.charAt(0).toUpperCase() + tier.slice(1)}
        </span>
      </div>
      
      <h3 className="font-semibold mt-2">{name}</h3>
      
      <p className="text-xs text-muted-foreground mt-1 flex-grow">
        {description}
      </p>
      
      {earned ? (
        <div className="mt-3 text-xs text-muted-foreground">
          {earnedAt ? `Earned on ${new Date(earnedAt).toLocaleDateString()}` : 'Earned'}
        </div>
      ) : (
        <div className="mt-3 text-xs text-muted-foreground">
          Not yet earned
        </div>
      )}
    </div>
  );
}