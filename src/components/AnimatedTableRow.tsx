import React from 'react';
import { TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface AnimatedTableRowProps {
  variant?: 'mint' | 'lilac' | 'royal' | 'peach' | 'default';
  animation?: 'hover' | 'slide' | 'glow';
  children: React.ReactNode;
  className?: string;
}

const variantStyles = {
  mint: 'hover:bg-mint-50/50 dark:hover:bg-mint-950/20',
  lilac: 'hover:bg-lilac-50/50 dark:hover:bg-lilac-950/20',
  royal: 'hover:bg-royal-50/50 dark:hover:bg-royal-950/20',
  peach: 'hover:bg-peach-50/50 dark:hover:bg-peach-950/20',
  default: ''
};

const animationStyles = {
  hover: 'table-row-hover',
  slide: 'filter-slide',
  glow: 'hover-glow'
};

export const AnimatedTableRow: React.FC<AnimatedTableRowProps> = ({
  variant = 'default',
  animation = 'hover',
  className,
  children,
  ...props
}) => {
  return (
    <TableRow
      className={cn(
        variant !== 'default' && variantStyles[variant],
        animationStyles[animation],
        "transition-all duration-200 ease-out",
        className
      )}
      {...props}
    >
      {children}
    </TableRow>
  );
};

export default AnimatedTableRow;
