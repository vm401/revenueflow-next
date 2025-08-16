import React from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface AnimatedFilterProps {
  type: 'input' | 'select';
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  options?: { value: string; label: string }[];
  variant?: 'mint' | 'lilac' | 'royal' | 'peach';
  className?: string;
}

const variantStyles = {
  mint: 'border-mint-200 focus:border-mint-400 focus:ring-mint-200',
  lilac: 'border-lilac-200 focus:border-lilac-400 focus:ring-lilac-200',
  royal: 'border-royal-200 focus:border-royal-400 focus:ring-royal-200',
  peach: 'border-peach-200 focus:border-peach-400 focus:ring-peach-200'
};

export const AnimatedFilter: React.FC<AnimatedFilterProps> = ({
  type,
  placeholder,
  value,
  onChange,
  options = [],
  variant = 'mint',
  className
}) => {
  if (type === 'input') {
    return (
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "filter-slide filter-expand",
          variantStyles[variant],
          "transition-all duration-300 ease-out",
          className
        )}
      />
    );
  }

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger 
        className={cn(
          "filter-slide filter-expand",
          variantStyles[variant],
          "transition-all duration-300 ease-out",
          className
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default AnimatedFilter;
