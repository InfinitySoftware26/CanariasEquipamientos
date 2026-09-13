"use client";

import { useState } from "react";

import {
    CreatePromotionPayload,
    PaymentFrequency,
    Promotion,
    UpdatePromotionPayload,
} from "@/types/financing/financing.types";

interface PromotionFormState {
    name: string;
    financingPlanId: string;
    discountPercentage: string;
    paymentFrequency: PaymentFrequency;
    installmentsCount: string;
    isGlobal: boolean;
    productIds: string[];
}

const initialState: PromotionFormState = {
    name: "",
    financingPlanId: "",
    discountPercentage: "",
    paymentFrequency: "monthly",
    installmentsCount: "",
    isGlobal: false,
    productIds: [],
};

export function usePromotionForm() {
    const [form, setForm] = useState<PromotionFormState>(initialState);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    const updateField = <K extends keyof PromotionFormState>(
        field: K,
        value: PromotionFormState[K],
    ) => {
        setForm((current) => ({ ...current, [field]: value }));
        setErrors((current) => ({ ...current, [field]: "" }));
    };

    const loadPromotion = (promotion: Promotion) => {
        setForm({
            name: promotion.name,
            financingPlanId: promotion.financingPlanId ?? "",
            discountPercentage:
                promotion.discountPercentage !== null && promotion.discountPercentage !== undefined
                    ? String(promotion.discountPercentage * 100)
                    : "",
            paymentFrequency: promotion.paymentFrequency ?? "monthly",
            installmentsCount:
                promotion.installmentsCount !== null && promotion.installmentsCount !== undefined
                    ? String(promotion.installmentsCount)
                    : "",
            isGlobal: promotion.isGlobal,
            productIds: promotion.products?.map((product) => product.productId) ?? [],
        });
        setErrors({});
    };

    const hasPlan = Boolean(form.financingPlanId);

    const validate = () => {
        const nextErrors: Record<string, string> = {};

        if (!form.name.trim()) {
            nextErrors.name = "El nombre es obligatorio";
        }

        if (!hasPlan && !form.isGlobal && form.productIds.length === 0) {
            nextErrors.productIds = "Debe seleccionar al menos un producto";
        }

        if (form.discountPercentage) {
            const discount = Number(form.discountPercentage);
            if (Number.isNaN(discount) || discount < -100 || discount > 100) {
                nextErrors.discountPercentage = "Ingrese un porcentaje válido entre -100 y 100";
            }
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const toCreatePayload = (): CreatePromotionPayload => ({
        name: form.name.trim(),
        financingPlanId: form.financingPlanId || null,
        discountPercentage: form.discountPercentage ? Number(form.discountPercentage) / 100 : null,
        paymentFrequency: hasPlan ? null : form.paymentFrequency,
        installmentsCount: hasPlan
            ? null
            : form.installmentsCount
                ? Number(form.installmentsCount)
                : null,
        isGlobal: hasPlan ? undefined : form.isGlobal,
        productIds: hasPlan || form.isGlobal ? [] : form.productIds,
    });

    const toUpdatePayload = (): UpdatePromotionPayload => toCreatePayload();

    return {
        form,
        errors,
        loading,
        setLoading,
        updateField,
        loadPromotion,
        validate,
        toCreatePayload,
        toUpdatePayload,
        hasPlan,
    };
}
