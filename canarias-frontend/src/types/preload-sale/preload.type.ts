import { PreloadFormData } from "@/types/preloadForm.type";
import { Zone } from "@/types/zones/zone.type";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export type Product = {
  productId: string;
  name: string;
  brand?: string;
  model?: string;
  price: number;
};

export type StepSaleProps = {
  form: PreloadFormData;
  setForm: React.Dispatch<React.SetStateAction<PreloadFormData>>;
  products: Product[];
  handleSubmit: () => void;
  loading: boolean;
};

export type StepClientProps = {
  form: PreloadFormData;
  setForm: React.Dispatch<React.SetStateAction<PreloadFormData>>;
  handleSearchClient: () => void;
  clientFound: boolean;
  searched: boolean;
};

export type StepClientDataProps = {
  form: PreloadFormData;
  setForm: React.Dispatch<React.SetStateAction<PreloadFormData>>;
  zones: Zone[];
};

export type StepTitleProps = {
  icon: React.ReactNode;
  label: string;
  desc?: string;
};

export type PreloadSaleViewProps = {
  step: number;
  form: PreloadFormData;
  setForm: React.Dispatch<React.SetStateAction<PreloadFormData>>;
  products: Product[];
  clientFound: boolean;
  searched: boolean;
  error: string | null;
  loading: boolean;
  clientConfirmOpen: boolean;
  setClientConfirmOpen: (open: boolean) => void;
  clientConfirmType: "existing" | "new" | null;
  confirmClientSelection: () => void;

  zones: Zone[];
  infoOpen: boolean;
  infoMessage: {
    title: string;
    description: string;
    actionText?: string;
  } | null;
  closeInfo: () => void;

  handleSearchClient: () => void;
  handleSubmit: () => void;
  goToSaleStep: () => void;

  router: AppRouterInstance;
};
