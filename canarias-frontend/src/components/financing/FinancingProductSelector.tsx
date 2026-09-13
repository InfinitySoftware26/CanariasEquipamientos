"use client";

import { useMemo, useState } from "react";
import { Search, Package } from "lucide-react";

import { Product } from "@/types/preload-sale/preload.type";

interface FinancingProductsSelectorProps {
  products: Product[];
  selectedProductIds: string[];
  onChange: (productIds: string[]) => void;
  disabled?: boolean;
  error?: string;
}

export function FinancingProductsSelector({
  products,
  selectedProductIds,
  onChange,
  disabled = false,
  error,
}: FinancingProductsSelectorProps) {
  const [search, setSearch] = useState("");

  const filteredProducts = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return products;
    }

    return products.filter((product) => {
      return (
        product.name.toLowerCase().includes(value) ||
        product.brand?.toLowerCase().includes(value) ||
        product.model?.toLowerCase().includes(value)
      );
    });
  }, [products, search]);

  const toggleProduct = (productId: string) => {
    if (disabled) return;

    if (selectedProductIds.includes(productId)) {
      onChange(selectedProductIds.filter((id) => id !== productId));

      return;
    }

    onChange([...selectedProductIds, productId]);
  };

  const selectAll = () => {
    if (disabled) return;

    const ids = filteredProducts.map((product) => product.productId);

    onChange(Array.from(new Set([...selectedProductIds, ...ids])));
  };

  const clearSelection = () => {
    if (disabled) return;

    onChange([]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white">Productos</p>

          <p className="text-xs text-white/50">
            Seleccioná los productos que utilizarán esta financiación.
          </p>
        </div>

        <span className="rounded-full bg-[#F5A300]/10 px-3 py-1 text-xs font-medium text-[#F5A300]">
          {selectedProductIds.length} seleccionados
        </span>
      </div>

      <div className="relative">
        <Search
          size={17}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
        />

        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          disabled={disabled}
          placeholder="Buscar producto..."
          className="
            h-11
            w-full
            rounded-xl
            border border-white/10
            bg-white/5
            pl-10
            pr-3
            text-white
            outline-none
            placeholder:text-white/30
            focus:border-[#F5A300]
            disabled:opacity-50
          "
        />
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={selectAll}
          disabled={disabled || filteredProducts.length === 0}
          className="
            rounded-lg
            border border-white/10
            bg-white/5
            px-3
            py-2
            text-xs
            font-medium
            text-white/70
            transition
            hover:bg-white/10
            hover:text-white
            disabled:opacity-40
          "
        >
          Seleccionar visibles
        </button>

        <button
          type="button"
          onClick={clearSelection}
          disabled={disabled || selectedProductIds.length === 0}
          className="
            rounded-lg
            border border-white/10
            bg-white/5
            px-3
            py-2
            text-xs
            font-medium
            text-white/70
            transition
            hover:bg-white/10
            hover:text-white
            disabled:opacity-40
          "
        >
          Limpiar
        </button>
      </div>

      <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
        {filteredProducts.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 text-center">
            <Package size={22} className="mx-auto mb-2 text-white/30" />

            <p className="text-sm text-white/50">
              No se encontraron productos.
            </p>
          </div>
        ) : (
          filteredProducts.map((product) => {
            const selected = selectedProductIds.includes(product.productId);

            return (
              <button
                key={product.productId}
                type="button"
                onClick={() => toggleProduct(product.productId)}
                disabled={disabled}
                className={`
                  flex
                  w-full
                  items-center
                  justify-between
                  rounded-xl
                  border
                  p-3
                  text-left
                  transition
                  ${
                    selected
                      ? "border-[#F5A300]/50 bg-[#F5A300]/10"
                      : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
                  }
                  disabled:opacity-50
                `}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-lg
                      ${
                        selected
                          ? "bg-[#F5A300]/20 text-[#F5A300]"
                          : "bg-white/5 text-white/40"
                      }
                    `}
                  >
                    <Package size={17} />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-white">
                      {product.name}
                    </p>

                    {(product.brand || product.model) && (
                      <p className="text-xs text-white/40">
                        {[product.brand, product.model]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    )}
                  </div>
                </div>

                <div
                  className={`
                    flex
                    h-5
                    w-5
                    items-center
                    justify-center
                    rounded-md
                    border
                    text-xs
                    ${
                      selected
                        ? "border-[#F5A300] bg-[#F5A300] text-[#0D1B2A]"
                        : "border-white/20 bg-white/5"
                    }
                  `}
                >
                  {selected ? "✓" : ""}
                </div>
              </button>
            );
          })
        )}
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
