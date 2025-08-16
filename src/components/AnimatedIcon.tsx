import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from "@/lib/utils";

interface AnimatedIconProps {
  icon: LucideIcon;
  variant?: 'mint' | 'lilac' | 'royal' | 'peach' | 'default';
  animation?: 'pulse' | 'bounce' | 'rotate' | 'glow';
  size?: number;
  className?: string;
}

const variantColors = {
  mint: 'text-mint-600 hover:text-mint-700',
  lilac: 'text-lilac-600 hover:text-lilac-700',
  royal: 'text-royal-600 hover:text-royal-700',
  peach: 'text-peach-600 hover:text-peach-700',
  default: 'text-foreground'
};

const animationStyles = {
  pulse: 'loading-pulse',
  bounce: 'hover-scale',
  rotate: 'hover:rotate-12 transition-transform duration-200',
  glow: 'hover-glow'
};

export const AnimatedIcon: React.FC<AnimatedIconProps> = ({
  icon: Icon,
  variant = 'default',
  animation = 'pulse',
  size = 24,
  className
}) => {
  return (
    <Icon
      size={size}
      className={cn(
        variantColors[variant],
        animationStyles[animation],
        "transition-all duration-200 ease-out cursor-pointer",
        className
      )}
    />
  );
};

export default AnimatedIcon;
