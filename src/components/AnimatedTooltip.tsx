import React, { useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface AnimatedTooltipProps {
  children: React.ReactNode;
  content: string;
  variant?: 'mint' | 'lilac' | 'royal' | 'peach';
  className?: string;
  delayDuration?: number;
}

const variantStyles = {
  mint: 'bg-mint-100 text-mint-800 border-mint-200 dark:bg-mint-900/20 dark:text-mint-300 dark:border-mint-700',
  lilac: 'bg-lilac-100 text-lilac-800 border-lilac-200 dark:bg-lilac-900/20 dark:text-lilac-300 dark:border-lilac-700',
  royal: 'bg-royal-100 text-royal-800 border-royal-200 dark:bg-royal-900/20 dark:text-royal-300 dark:border-royal-700',
  peach: 'bg-peach-100 text-peach-800 border-peach-200 dark:bg-peach-900/20 dark:text-peach-300 dark:border-peach-700'
};

export const AnimatedTooltip: React.FC<AnimatedTooltipProps> = ({
  children,
  content,
  variant = 'mint',
  className,
  delayDuration = 300
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <TooltipProvider>
      <Tooltip open={isOpen} onOpenChange={setIsOpen} delayDuration={delayDuration}>
        <TooltipTrigger asChild>
          <div 
            className={cn("cursor-help", className)}
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
          >
            {children}
          </div>
        </TooltipTrigger>
        <TooltipContent 
          className={cn(
            "filter-slide filter-expand",
            variantStyles[variant],
            "border-2 shadow-lg"
          )}
          side="top"
        >
          <p className="font-medium">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default AnimatedTooltip;
