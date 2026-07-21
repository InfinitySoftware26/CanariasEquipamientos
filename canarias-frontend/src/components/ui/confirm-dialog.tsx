"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  title: string;
  description: string;

  confirmText?: string;
  cancelText?: string;

  loading?: boolean;
  destructive?: boolean;

  onConfirm: () => void;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  loading = false,
  destructive = false,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        className="
    border
    border-[#F5A300]/90
    shadow-[0_0_0_1px_rgba(245,163,0,.25)]
    p-8
  "
      >
        <AlertDialogHeader className="space-y-4 text-left">
          <AlertDialogTitle className="text-2xl font-bold text-white">
            {title}
          </AlertDialogTitle>

          <AlertDialogDescription className="leading-7 text-white/65">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-8 border-0 bg-transparent p-0 sm:justify-end">
          <AlertDialogCancel
            className="
              h-11
              rounded-xl
              border
              border-white/10
              bg-white/5
              px-6
              text-white
              transition-all
              hover:border-[#F5A300]/40
              hover:bg-white/10
            "
          >
            {cancelText}
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            className={
              destructive
                ? `
                  h-11
                  rounded-xl
                  border
                  border-red-500/30
                  bg-red-500/10
                  px-6
                  text-red-300
                  transition-all
                  hover:border-red-500/50
                  hover:bg-red-500/20
                `
                : `
                  h-11
                  rounded-xl
                  border
                  border-[#F5A300]/80
                  bg-[#F5A300]
                  px-6
                  font-semibold
                  text-[#0D1B2A]
                  transition-all
                  hover:bg-[#e89b00]
                `
            }
          >
            {loading ? "Procesando..." : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
