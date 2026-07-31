import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type ButtonProps = React.ComponentProps<typeof Button>;

export function SaveButton({ className, size = 16, ...props }: ButtonProps) {
  return (
    <Button
      variant="default"
      size={size}
      className={cn(
        "rounded-xl bg-[#F5A300] text-[#0D1B2A] hover:bg-[#ffb82c] font-semibold",
        className,
      )}
      {...props}
    />
  );
}
