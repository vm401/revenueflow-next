import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedIcon } from "./AnimatedIcon";

interface ExpandableTextProps {
  text: string;
  maxLength?: number;
  className?: string;
}

export function ExpandableText({ text, maxLength = 50, className = "" }: ExpandableTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (text.length <= maxLength) {
    return <span className={className}>{text}</span>;
  }

  const truncatedText = text.substring(0, maxLength) + "...";

  return (
    <div className={`${className} space-y-1`}>
      <div className="flex items-start gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-5 w-5 p-0 hover:bg-transparent"
        >
          <AnimatedIcon 
            icon={isExpanded ? ChevronDown : ChevronRight} 
            variant="mint" 
            animation="rotate" 
            className="h-3 w-3" 
          />
        </Button>
        <span className="flex-1 break-words">
          {isExpanded ? text : truncatedText}
        </span>
      </div>
    </div>
  );
}
