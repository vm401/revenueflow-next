import React from 'react';
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AnimatedButtonProps extends Omit<ButtonProps, 'variant'> {
  colorVariant?: 'mint' | 'lilac' | 'royal' | 'peach' | 'default';
  animation?: 'pulse' | 'bounce' | 'lift' | 'scale' | 'glow';
  children: React.ReactNode;
}

const variantStyles = {
  mint: 'bg-mint-600 hover:bg-mint-700 text-white border-mint-500 hover:border-mint-600',
  lilac: 'bg-lilac-600 hover:bg-lilac-700 text-white border-lilac-500 hover:border-lilac-600',
  royal: 'bg-royal-600 hover:bg-royal-700 text-white border-royal-500 hover:border-royal-600',
  peach: 'bg-peach-600 hover:bg-peach-700 text-white border-peach-500 hover:border-peach-600',
  default: ''
};

const animationStyles = {
  pulse: 'btn-pulse',
  bounce: 'btn-bounce',
  lift: 'hover-lift',
  scale: 'hover-scale',
  glow: 'hover-glow'
};

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  colorVariant = 'default',
  animation = 'pulse',
  className,
  children,
  ...props
}) => {
  return (
    <Button
      className={cn(
        colorVariant !== 'default' && variantStyles[colorVariant],
        animationStyles[animation],
        "transition-all duration-200 ease-out",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
};

export default AnimatedButton;
