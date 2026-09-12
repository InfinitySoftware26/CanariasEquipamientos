"use client";

import { useState } from "react";

import {
    CreateFinancingPlanPayload,
    FinancingPlan,
    PaymentFrequency,
    UpdateFinancingPlanPayload,
} from "@/types/financing/financing.types";

interface FinancingPlanFormState {
    name: string;
    financingConfigId: string;
    paymentFrequency: PaymentFrequency;
    installmentsCount: string;
    isGlobal: boolean;
    productIds: string[];
}

const initialState: FinancingPlanFormState = {
    name: "",
    financingConfigId: "",
    paymentFrequency: "monthly",
    installmentsCount: "",
    isGlobal: true,
    productIds: [],
};

export function useFinancingPlanForm() {
    const [form, setForm] = useState<FinancingPlanFormState>(initialState);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    const updateField = <K extends keyof FinancingPlanFormState>(
        field: K,
        value: FinancingPlanFormState[K],
    ) => {
        setForm((current) => ({ ...current, [field]: value }));
        setErrors((current) => ({ ...current, [field]: "" }));
    };

    const loadPlan = (plan: FinancingPlan) => {
        setForm({
            name: plan.name,
            financingConfigId: plan.financingConfigId,
            paymentFrequency: plan.paymentFrequency,
            installmentsCount: String(plan.installmentsCount),
            isGlobal: plan.isGlobal,
            productIds: plan.products?.map((product) => product.productId) ?? [],
        });
        setErrors({});
    };

    const validate = () => {
        const nextErrors: Record<string, string> = {};

        if (!form.name.trim()) {
            nextErrors.name = "El nombre es obligatorio";
        }

        if (!form.financingConfigId) {
            nextErrors.financingConfigId = "Debe seleccionar una configuración de financiación";
        }

        const installments = Number(form.installmentsCount);

        if (!form.installmentsCount || Number.isNaN(installments) || installments < 1) {
            nextErrors.installmentsCount = "Ingrese una cantidad de cuotas válida";
        }

        if (!form.isGlobal && form.productIds.length === 0) {
            nextErrors.productIds = "Debe seleccionar al menos un producto";
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const toCreatePayload = (): CreateFinancingPlanPayload => ({
        name: form.name.trim(),
        financingConfigId: form.financingConfigId,
        paymentFrequency: form.paymentFrequency,
        installmentsCount: Number(form.installmentsCount),
        isGlobal: form.isGlobal,
        productIds: form.isGlobal ? [] : form.productIds,
    });

    const toUpdatePayload = (): UpdateFinancingPlanPayload => ({
        name: form.name.trim(),
        financingConfigId: form.financingConfigId,
        paymentFrequency: form.paymentFrequency,
        installmentsCount: Number(form.installmentsCount),
        isGlobal: form.isGlobal,
        productIds: form.isGlobal ? [] : form.productIds,
    });

    return {
        form,
        errors,
        loading,
        setLoading,
        updateField,
        loadPlan,
        validate,
        toCreatePayload,
        toUpdatePayload,
    };
}
