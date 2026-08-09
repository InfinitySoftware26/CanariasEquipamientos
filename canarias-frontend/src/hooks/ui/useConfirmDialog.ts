"use client";

import { useCallback, useState } from "react";

type InfoDialogMessage = {
  title: string;
  description: string;
  actionText?: string;
};

export function useConfirmDialog() {
  const [open, setOpen] = useState(false);

  const openDialog = useCallback(() => {
    setOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setOpen(false);
  }, []);

  return {
    open,
    openDialog,
    closeDialog,
    setOpen,
  };
}

export function useInfoDialog() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<InfoDialogMessage | null>(null);

  const openInfo = useCallback((info: InfoDialogMessage) => {
    setMessage(info);
    setOpen(true);
  }, []);

  const closeInfo = useCallback(() => {
    setOpen(false);
  }, []);

  return {
    open,
    message,
    openInfo,
    closeInfo,
    setOpen,
    setMessage,
  };
}
