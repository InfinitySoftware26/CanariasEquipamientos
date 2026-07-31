import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type ButtonProps = React.ComponentProps<typeof Button>;

export function DangerButton({
  className,
  size = "lg",
  ...props
}: ButtonProps) {
  return (
    <Button
      variant="destructive"
      size={size}
      className={cn(
        "rounded-xl border-red-500/40 bg-transparent text-red-400 transition-all duration-200 hover:border-red-500/60 hover:bg-red-500/10 hover:text-red-300",
        className,
      )}
      {...props}
    />
  );
}
