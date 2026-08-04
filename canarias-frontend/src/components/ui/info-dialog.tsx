"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface InfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  actionText?: string;
}

export function InfoDialog({
  open,
  onOpenChange,
  title,
  description,
  actionText = "Aceptar",
}: InfoDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="border border-[#F5A300]/90 shadow-[0_0_0_1px_rgba(245,163,0,.25)] p-8">
        <AlertDialogHeader className="space-y-4 text-left">
          <AlertDialogTitle className="text-2xl font-bold text-white">
            {title}
          </AlertDialogTitle>

          <AlertDialogDescription className="leading-7 text-white/65">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-8 border-0 bg-transparent p-0 sm:justify-end">
          <AlertDialogAction
            onClick={() => onOpenChange(false)}
            className="h-11 rounded-xl border border-[#F5A300]/80 bg-[#F5A300] px-6 font-semibold text-[#0D1B2A] transition-all hover:bg-[#e89b00]"
          >
            {actionText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
