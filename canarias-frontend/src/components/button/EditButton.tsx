import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type ButtonProps = React.ComponentProps<typeof Button>;

export function EditButton({ className, size = "lg", ...props }: ButtonProps) {
  return (
    <Button
      variant="outline"
      size={size}
      className={cn(
        "rounded-xl border-white/30 bg-transparent text-white transition-all duration-200 hover:border-[#F5A300]/50 hover:bg-[#F5A300]/10 hover:text-white hover:shadow-[0_0_10px_rgba(245,163,0,.15)]",
        className,
      )}
      {...props}
    />
  );
}
