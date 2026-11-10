-- =============================================================================
-- Diagnóstico: promociones configuradas y ventas que las usaron
-- -----------------------------------------------------------------------------
-- SOLO LECTURA (transacción READ ONLY + ROLLBACK). Insumo para definir el
-- signo de discount_percentage (pendiente de negocio). No cambia lógica ni datos.
--
-- Contexto (sales.service.ts, createSale): financingRate = tasa del plan
-- (o de su configuración) + discount_percentage de la promoción, acotado a
-- -0.99. Con el código actual, un valor POSITIVO es recargo y uno NEGATIVO
-- es descuento, a pesar del nombre "discount". La venta no guarda la tasa
-- aplicada; la sección 2 la infiere de los importes.
-- =============================================================================

BEGIN TRANSACTION READ ONLY;

-- 1. Promociones configuradas, con su valor y uso.
SELECT
  so.name                                   AS sociedad,
  p.promotion_id,
  p.name                                    AS promocion,
  p.discount_percentage,
  CASE
    WHEN p.discount_percentage IS NULL THEN 'sin ajuste'
    WHEN p.discount_percentage > 0     THEN 'hoy se aplica como RECARGO'
    WHEN p.discount_percentage < 0     THEN 'hoy se aplica como DESCUENTO'
    ELSE 'cero'
  END                                       AS efecto_con_logica_actual,
  p.is_active,
  p.is_global,
  p.installments_count                      AS cuotas_promo,
  p.payment_frequency                       AS frecuencia_promo,
  fp.name                                   AS plan_asociado,
  fp.financing_rate                         AS tasa_plan,
  fc.financing_rate                         AS tasa_config_plan,
  p.created_at,
  COUNT(s.sale_id)                          AS ventas,
  COALESCE(SUM(s.total_amount), 0)          AS total_contado_ventas
FROM "PROMOTIONS" p
LEFT JOIN "SOCIETYS" so                 ON so.society_id::text = p.society_id::text
LEFT JOIN "FINANCING_PLANS" fp          ON fp.financing_plan_id = p.financing_plan_id
LEFT JOIN "FINANCING_CONFIGURATIONS" fc ON fc.financing_config_id = fp.financing_config_id
LEFT JOIN "SALES" s                     ON s.promotion_id = p.promotion_id
GROUP BY so.name, p.promotion_id, p.name, p.discount_percentage, p.is_active, p.is_global,
         p.installments_count, p.payment_frequency, fp.name, fp.financing_rate,
         fc.financing_rate, p.created_at
ORDER BY so.name, p.created_at;

-- 2. Ventas que usaron una promoción, con la tasa efectiva inferida:
--    (cuota * cantidad de cuotas) / total contado - 1.
--    Es aproximada por el redondeo a centavos de la cuota.
SELECT
  so.name                                   AS sociedad,
  s.sale_id,
  s.sale_date,
  s.status,
  p.name                                    AS promocion,
  p.discount_percentage                     AS ajuste_promo_actual,
  fp.name                                   AS plan,
  s.total_amount                            AS total_contado,
  s.installment_amount,
  s.installments_count,
  s.payment_frequency,
  ROUND(s.installment_amount * s.installments_count, 2)            AS total_financiado,
  CASE WHEN s.total_amount > 0 THEN
    ROUND((s.installment_amount * s.installments_count) / s.total_amount - 1, 4)
  END                                       AS tasa_efectiva_inferida
FROM "SALES" s
JOIN "PROMOTIONS" p            ON p.promotion_id = s.promotion_id
LEFT JOIN "FINANCING_PLANS" fp ON fp.financing_plan_id = s.financing_plan_id
LEFT JOIN "SOCIETYS" so        ON so.society_id::text = s.society_id::text
ORDER BY so.name, s.sale_date DESC;

-- Nota: discount_percentage de hoy puede diferir del vigente al momento de
-- la venta (no hay historial). Comparar ajuste_promo_actual con
-- tasa_efectiva_inferida - tasa del plan para detectar cambios posteriores.

ROLLBACK;
