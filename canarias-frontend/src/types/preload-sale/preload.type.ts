import { PreloadFormData } from "@/types/preloadForm.type";
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

export type StepTitleProps = {
  icon: React.ReactNode;
  label: string;
  desc?: string;
};

export type StepClientDataProps = {
  form: PreloadFormData;
  setForm: React.Dispatch<React.SetStateAction<PreloadFormData>>;
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

  handleSearchClient: () => void;
  handleSubmit: () => void;
  goToSaleStep: () => void;

  router: AppRouterInstance;
};
