"use client";

import { useState } from "react";

import {
    CreateFinancingPlanPayload,
    FinancingPlan,
    PaymentFrequency,
    UpdateFinancingPlanPayload,
} from "@/types/financing/financing.types";

export interface FinancingPlanFormState {
    name: string;
    rateType: "config" | "custom";
    financingConfigId: string;
    financingRate: string;
    paymentFrequency: PaymentFrequency;
    installmentsCount: string;
    isGlobal: boolean;
    productIds: string[];
}

const initialState: FinancingPlanFormState = {
    name: "",
    rateType: "config",
    financingConfigId: "",
    financingRate: "",
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
        setForm((current) => {
            const next = { ...current, [field]: value };
            if (field === "rateType") {
                if (value === "config") {
                    next.financingRate = "";
                } else {
                    next.financingConfigId = "";
                }
            } else if (field === "financingConfigId" && value) {
                next.rateType = "config";
                next.financingRate = "";
            } else if (field === "financingRate" && value !== "") {
                next.rateType = "custom";
                next.financingConfigId = "";
            }
            return next;
        });
        setErrors((current) => ({
            ...current,
            [field]: "",
            ...(field === "rateType" || field === "financingConfigId" || field === "financingRate"
                ? { financingConfigId: "", financingRate: "" }
                : {}),
        }));
    };

    const loadPlan = (plan: FinancingPlan) => {
        const hasCustomRate = plan.financingRate !== null && plan.financingRate !== undefined;
        setForm({
            name: plan.name,
            rateType: hasCustomRate ? "custom" : "config",
            financingConfigId: plan.financingConfigId ?? "",
            financingRate: hasCustomRate ? String(Number(plan.financingRate) * 100) : "",
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

        if (form.rateType === "config") {
            if (!form.financingConfigId) {
                nextErrors.financingConfigId = "Debe seleccionar una configuración de financiación";
            }
        } else {
            const rate = Number(form.financingRate);
            if (form.financingRate === "" || Number.isNaN(rate) || rate < 0) {
                nextErrors.financingRate = "Ingrese un porcentaje de financiación válido (≥ 0%)";
            }
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
        financingConfigId: form.rateType === "config" && form.financingConfigId ? form.financingConfigId : null,
        financingRate: form.rateType === "custom" && form.financingRate !== "" ? Number(form.financingRate) / 100 : null,
        paymentFrequency: form.paymentFrequency,
        installmentsCount: Number(form.installmentsCount),
        isGlobal: form.isGlobal,
        productIds: form.isGlobal ? [] : form.productIds,
    });

    const toUpdatePayload = (): UpdateFinancingPlanPayload => ({
        name: form.name.trim(),
        financingConfigId: form.rateType === "config" && form.financingConfigId ? form.financingConfigId : null,
        financingRate: form.rateType === "custom" && form.financingRate !== "" ? Number(form.financingRate) / 100 : null,
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
