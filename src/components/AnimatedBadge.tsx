import React from 'react';
import { Badge, BadgeProps } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AnimatedBadgeProps extends Omit<BadgeProps, 'variant'> {
  colorVariant?: 'mint' | 'lilac' | 'royal' | 'peach' | 'default';
  animation?: 'glow' | 'scale' | 'pulse';
  children: React.ReactNode;
  className?: string;
}

const variantStyles = {
  mint: 'bg-mint-100 text-mint-800 border-mint-200 hover:bg-mint-200 dark:bg-mint-900/20 dark:text-mint-300 dark:border-mint-700',
  lilac: 'bg-lilac-100 text-lilac-800 border-lilac-200 hover:bg-lilac-200 dark:bg-lilac-900/20 dark:text-lilac-300 dark:border-lilac-700',
  royal: 'bg-royal-100 text-royal-800 border-royal-200 hover:bg-royal-200 dark:bg-royal-900/20 dark:text-royal-300 dark:border-royal-700',
  peach: 'bg-peach-100 text-peach-800 border-peach-200 hover:bg-peach-200 dark:bg-peach-900/20 dark:text-peach-300 dark:border-peach-700',
  default: ''
};

const animationStyles = {
  glow: 'badge-glow',
  scale: 'hover-scale',
  pulse: 'loading-pulse'
};

export const AnimatedBadge: React.FC<AnimatedBadgeProps> = ({
  colorVariant = 'default',
  animation = 'glow',
  className,
  children,
  ...props
}) => {
  return (
    <Badge
      className={cn(
        colorVariant !== 'default' && variantStyles[colorVariant],
        animationStyles[animation],
        "transition-all duration-200 ease-out cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </Badge>
  );
};

export default AnimatedBadge;
