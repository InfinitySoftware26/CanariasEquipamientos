"use client";

import { PreloadSaleView } from "@/components/preload-sale/PreloadSaleView";
import { usePreloadSale } from "@/hooks/sales/usePreloadSale";

export default function PreloadPage() {
  const logic = usePreloadSale();

  return <PreloadSaleView {...logic} />;
}
