"use client";

import CommonButton from "@/app/components/button/CommonButton";
import CartDrawer from "@/app/components/CartDrawer";
import CommonHeading from "@/app/components/CommonHeading";
import CommonProductCard from "@/app/components/CommonProductCard";
import RangeSlider from "@/app/components/RangeSlider";
import CommonSelect from "@/app/components/select/CommonSelect";
import {
  Checkbox,
  Dialog,
  DialogPanel,
  Popover,
  PopoverButton,
  PopoverPanel,
} from "@headlessui/react";
import { Check, CheckIcon, ChevronDown, Filter } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useParams, notFound } from "next/navigation";
import { useProductsByCategory } from "@/hooks/use-products";
import { getCategoryDisplayName } from "@/services/category-service";
import type { ProductListResponse } from "@/services/product-service";

const sortOptions = [
  { label: "Featured", value: "featured" },
  { label: "Best selling", value: "best-selling" },
  { label: "Alphabetically, A-Z", value: "az" },
  { label: "Alphabetically, Z-A", value: "za" },
  { label: "Price, low to high", value: "price-asc" },
  { label: "Price, high to low", value: "price-desc" },
  { label: "Date, old to new", value: "date-asc" },
  { label: "Date, new to old", value: "date-desc" },
];

const MAX_PRODUCT_PRICE = 2500;

// allowed category names
const VALID_CATEGORIES = [
  "pendant",
  "necklace",
  "earring",
  "bracelet",
  "jewelry-set",
  "ring",
];

export default function CategoryProductList() {
  const params = useParams();
  const categorySlug = params.category as string;

  // stop page if category is wrong
  if (!VALID_CATEGORIES.includes(categorySlug.toLowerCase())) {
    notFound();
  }

  const categoryTitle = getCategoryDisplayName(categorySlug);

  const [openCart, setOpenCart] = useState(false);
  const [selected, setSelected] = useState(sortOptions[0]);

  // stock filter state
  const [inStock, setInStock] = useState(false);
  const [outOfStock, setOutOfStock] = useState(false);

  const [price, setPrice] = useState<[number, number]>([0, MAX_PRODUCT_PRICE]);
  const [debouncedPrice, setDebouncedPrice] = useState<[number, number]>(price);
  const [openMobileFilter, setOpenMobileFilter] = useState(false);

  // delay price update to reduce api calls
  useEffect(() => {
    const t = setTimeout(() => setDebouncedPrice(price), 250);
    return () => clearTimeout(t);
  }, [price]);

  // decide stock value to send
  const availabilityParam: boolean | undefined = useMemo(() => {
    if (inStock && !outOfStock) return true;
    if (!inStock && outOfStock) return false;
    return undefined;
  }, [inStock, outOfStock]);

  // backend only handles price filter
  const serverFilters = useMemo(
    () => ({ minPrice: debouncedPrice[0], maxPrice: debouncedPrice[1] }),
    [debouncedPrice]
  );

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useProductsByCategory(categorySlug, serverFilters);

  // merge all pages data
  const pages = (data?.pages ?? []) as ProductListResponse[];
  const sourceProducts = useMemo(
    () => pages.flatMap((p) => (Array.isArray(p.data) ? p.data : [])),
    [pages]
  );

  // total count from backend
  const totalFromBackend = pages[0]?.meta?.totalItems ?? 0;

  // filter stock on frontend
  const availabilityFiltered = useMemo(() => {
    if (availabilityParam === undefined) return sourceProducts;
    return sourceProducts.filter((p) =>
      availabilityParam ? p.stockQty > 0 : p.stockQty === 0
    );
  }, [sourceProducts, availabilityParam]);

  // sort products on frontend
  const sortedProducts = useMemo(() => {
    const arr = [...availabilityFiltered];

    const by = (
      cmp: (a: (typeof arr)[number], b: (typeof arr)[number]) => number
    ) => arr.sort(cmp);

    switch (selected.value) {
      case "az":
        return by((a, b) => a.title.localeCompare(b.title));
      case "za":
        return by((a, b) => b.title.localeCompare(a.title));
      case "price-asc":
        return by((a, b) => a.priceNumber - b.priceNumber);
      case "price-desc":
        return by((a, b) => b.priceNumber - a.priceNumber);
      case "date-asc":
        return by((a, b) => a.createdAtMs - b.createdAtMs);
      case "date-desc":
        return by((a, b) => b.createdAtMs - a.createdAtMs);
      case "best-selling":
        return by((a, b) => {
          if (a.isBestSeller !== b.isBestSeller) return a.isBestSeller ? -1 : 1;
          return b.createdAtMs - a.createdAtMs;
        });
      default:
        return by((a, b) => {
          if (a.isNewArrival !== b.isNewArrival) return a.isNewArrival ? -1 : 1;
          if (a.isBestSeller !== b.isBestSeller) return a.isBestSeller ? -1 : 1;
          return b.createdAtMs - a.createdAtMs;
        });
    }
  }, [availabilityFiltered, selected.value]);

  // reset all filters
  const handleClearAll = () => {
    setPrice([0, MAX_PRODUCT_PRICE]);
    setSelected(sortOptions[0]);
    setInStock(false);
    setOutOfStock(false);
  };

  const selectedAvailabilityCount = (inStock ? 1 : 0) + (outOfStock ? 1 : 0);

  return (
    <>
      <div className="gradientBg">
        <section className="max-w-full px-3 md:px-6 lg:px-10 md:py-6 lg:pt-6">
          <CommonHeading
            level={1}
            title={categoryTitle}
            description="Proudly Supporting Ethical Sourcing - Every Gemstone Has a Story."
          />

          {/* desktop filter bar */}
          <div className="mb-10 space-y-6 hidden md:block">
            <div className="flex justify-between gap-4 flex-wrap">
              <div className="flex gap-4 items-center flex-wrap">
                <span className="text-sm font-medium">FILTER</span>

                <Popover className="relative">
                  <PopoverButton className="px-4 py-2 border rounded-lg flex gap-3">
                    Availability <ChevronDown />
                  </PopoverButton>

                  <PopoverPanel className="translate-y-2 bg-background border rounded-lg w-56">
                    <div className="px-5 py-3 flex justify-between border-b">
                      <p className="text-sm">
                        {selectedAvailabilityCount} Selected
                      </p>
                      <button
                        className="commonLink"
                        onClick={() => {
                          setInStock(false);
                          setOutOfStock(false);
                        }}
                      >
                        Reset
                      </button>
                    </div>

                    <div className="px-5 py-3 flex gap-2">
                      <Checkbox checked={inStock} onChange={setInStock}>
                        <Check />
                      </Checkbox>
                      <p>In Stock</p>
                    </div>

                    <div className="px-5 py-3 flex gap-2">
                      <Checkbox checked={outOfStock} onChange={setOutOfStock}>
                        <Check />
                      </Checkbox>
                      <p>Out of Stock</p>
                    </div>
                  </PopoverPanel>
                </Popover>

                <Popover className="relative">
                  <PopoverButton className="px-4 py-2 border rounded-lg flex gap-3">
                    Price <ChevronDown />
                  </PopoverButton>

                  <PopoverPanel className="translate-y-2 px-6 py-6 bg-background border rounded-lg w-56">
                    <RangeSlider
                      min={0}
                      max={MAX_PRODUCT_PRICE}
                      value={price}
                      onChange={setPrice}
                    />
                  </PopoverPanel>
                </Popover>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <p>Sort by</p>
                <CommonSelect
                  name="sort"
                  options={sortOptions}
                  value={selected}
                  onChange={setSelected}
                />
                <p>{totalFromBackend} Products</p>
              </div>
            </div>
          </div>

          {/* mobile filter bar */}
          <div className="flex md:hidden justify-between mb-6">
            <button
              onClick={() => setOpenMobileFilter(true)}
              className="flex gap-2 px-4 py-2 border rounded-lg text-sm"
            >
              <Filter className="w-5 h-5" />
              Filter
            </button>

            <CommonSelect
              name="sort"
              options={sortOptions}
              value={selected}
              onChange={setSelected}
              className="w-40"
            />
          </div>

          {/* product grid */}
          <div className="productGrid">
            {isLoading ? (
              <div className="col-span-full py-10 text-center">
                Loading products
              </div>
            ) : isError ? (
              <div className="col-span-full py-10 text-center text-red-500">
                {error?.message || "Something went wrong"}
              </div>
            ) : sortedProducts.length === 0 ? (
              <div className="col-span-full py-10 text-center">
                No products found
              </div>
            ) : (
              sortedProducts.map((product) => (
                <CommonProductCard
                  key={product.id}
                  title={product.title}
                  price={product.price}
                  oldPrice={product.oldPrice}
                  image={product.image}
                  tag={product.tag}
                  onAddToCart={() => setOpenCart(true)}
                />
              ))
            )}
          </div>

          {/* load more */}
          <div className="flex justify-center mt-8">
            <CommonButton
              variant="secondaryBtn"
              onClick={() => fetchNextPage()}
              disabled={!hasNextPage || isFetchingNextPage}
            >
              {isFetchingNextPage
                ? "Loading..."
                : hasNextPage
                ? "Load More"
                : "All products loaded"}
            </CommonButton>
          </div>
        </section>
      </div>

      <CartDrawer open={openCart} onClose={() => setOpenCart(false)} />

      {/* mobile filter dialog */}
      <Dialog
        open={openMobileFilter}
        onClose={() => setOpenMobileFilter(false)}
        className="relative z-50 md:hidden"
      >
        <div className="fixed inset-0 bg-black/40" />
        <div className="fixed inset-x-0 bottom-0">
          <DialogPanel className="bg-background rounded-t-2xl p-6">
            <RangeSlider
              min={0}
              max={MAX_PRODUCT_PRICE}
              value={price}
              onChange={setPrice}
            />
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}