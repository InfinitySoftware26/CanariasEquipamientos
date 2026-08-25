"use client";

import { useState } from "react";

import {
    CreateFinancingConfigPayload,
    FinancingConfiguration,
    UpdateFinancingConfigPayload,
} from "@/types/financing/financing.types";

interface FinancingConfigFormState {
    name: string;
    financingRate: string;
    isGlobal: boolean;
    isActive: boolean;
    productIds: string[];
}

const initialState: FinancingConfigFormState = {
    name: "",
    financingRate: "",
    isGlobal: true,
    isActive: true,
    productIds: [],
};

export function useFinancingConfigForm() {
    const [form, setForm] = useState<FinancingConfigFormState>(initialState);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    const updateField = <K extends keyof FinancingConfigFormState>(
        field: K,
        value: FinancingConfigFormState[K],
    ) => {
        setForm((current) => ({ ...current, [field]: value }));
        setErrors((current) => ({ ...current, [field]: "" }));
    };

    const loadConfig = (config: FinancingConfiguration) => {
        setForm({
            name: config.name,
            financingRate: String(config.financingRate * 100),
            isGlobal: config.isGlobal,
            isActive: config.isActive,
            productIds: config.products?.map((product) => product.productId) ?? [],
        });
        setErrors({});
    };

    const validate = () => {
        const nextErrors: Record<string, string> = {};

        if (!form.name.trim()) {
            nextErrors.name = "El nombre es obligatorio";
        }

        const rate = Number(form.financingRate);

        if (form.financingRate === "" || Number.isNaN(rate) || rate < 0 || rate > 100) {
            nextErrors.financingRate = "Ingrese una tasa válida entre 0 y 100";
        }

        if (!form.isGlobal && form.productIds.length === 0) {
            nextErrors.productIds = "Debe seleccionar al menos un producto";
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const toCreatePayload = (): CreateFinancingConfigPayload => ({
        name: form.name.trim(),
        financingRate: Number(form.financingRate) / 100,
        isGlobal: form.isGlobal,
        productIds: form.isGlobal ? [] : form.productIds,
    });

    const toUpdatePayload = (): UpdateFinancingConfigPayload => ({
        name: form.name.trim(),
        financingRate: Number(form.financingRate) / 100,
        isActive: form.isActive,
    });

    return {
        form,
        errors,
        loading,
        setLoading,
        updateField,
        loadConfig,
        validate,
        toCreatePayload,
        toUpdatePayload,
    };
}
