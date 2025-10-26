import { Button } from "@/components/ui/button";
import { trackClick } from "@/lib/analytics";
import { ButtonHTMLAttributes } from "react";

interface TrackableButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  trackingId: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  children: React.ReactNode;
}

export const TrackableButton = ({ 
  trackingId, 
  children, 
  onClick,
  variant,
  size,
  className,
  ...props 
}: TrackableButtonProps) => {
  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    // Track the click
    await trackClick(trackingId, typeof children === 'string' ? children : trackingId);
    
    // Call the original onClick if provided
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <Button 
      variant={variant}
      size={size}
      className={className}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Button>
  );
};
