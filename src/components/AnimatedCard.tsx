import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardProps } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AnimatedCardProps extends CardProps {
  variant?: 'mint' | 'lilac' | 'royal' | 'peach' | 'default';
  animation?: 'lift' | 'scale' | 'glow' | 'slide';
  children: React.ReactNode;
  className?: string;
}

const variantStyles = {
  mint: 'border-mint-200 hover:border-mint-300 bg-mint-50/50 dark:bg-mint-950/20',
  lilac: 'border-lilac-200 hover:border-lilac-300 bg-lilac-50/50 dark:bg-lilac-950/20',
  royal: 'border-royal-200 hover:border-royal-300 bg-royal-50/50 dark:bg-royal-950/20',
  peach: 'border-peach-200 hover:border-peach-300 bg-peach-50/50 dark:bg-peach-950/20',
  default: ''
};

const animationStyles = {
  lift: 'hover-lift',
  scale: 'hover-scale',
  glow: 'hover-glow',
  slide: 'filter-slide'
};

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  variant = 'default',
  animation = 'lift',
  className,
  children,
  ...props
}) => {
  return (
    <Card
      className={cn(
        variant !== 'default' && variantStyles[variant],
        animationStyles[animation],
        "transition-all duration-300 ease-out cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </Card>
  );
};

export default AnimatedCard;
