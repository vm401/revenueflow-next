import React from 'react';
import { TableHead } from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface AnimatedTableHeaderProps {
  variant?: 'mint' | 'lilac' | 'royal' | 'peach' | 'default';
  animation?: 'glow' | 'scale' | 'slide';
  children: React.ReactNode;
  className?: string;
}

const variantStyles = {
  mint: 'bg-mint-50/50 border-mint-200 dark:bg-mint-950/20 dark:border-mint-800',
  lilac: 'bg-lilac-50/50 border-lilac-200 dark:bg-lilac-950/20 dark:border-lilac-800',
  royal: 'bg-royal-50/50 border-royal-200 dark:bg-royal-950/20 dark:border-royal-800',
  peach: 'bg-peach-50/50 border-peach-200 dark:bg-peach-950/20 dark:border-peach-800',
  default: ''
};

const animationStyles = {
  glow: 'hover-glow',
  scale: 'hover-scale',
  slide: 'filter-slide'
};

export const AnimatedTableHeader: React.FC<AnimatedTableHeaderProps> = ({
  variant = 'default',
  animation = 'glow',
  className,
  children
}) => {
  return (
    <TableHead
      className={cn(
        variant !== 'default' && variantStyles[variant],
        animationStyles[animation],
        "transition-all duration-200 ease-out cursor-pointer",
        className
      )}
    >
      {children}
    </TableHead>
  );
};

export default AnimatedTableHeader;
