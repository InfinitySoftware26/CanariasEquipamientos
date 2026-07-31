import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type ButtonProps = React.ComponentProps<typeof Button>;

export function CancelButton({
  className,
  size = 16,
  ...props
}: ButtonProps) {
  return (
    <Button
      variant="outline"
      size={size}
      className={cn(
        "rounded-xl border-white/20 bg-white/5 text-white hover:border-[#F5A300]/40 hover:bg-white/10",
        className,
      )}
      {...props}
    />
  );
}
