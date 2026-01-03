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

// Valid category slugs
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

  // Validate category slug
  if (!VALID_CATEGORIES.includes(categorySlug.toLowerCase())) {
    notFound();
  }

  const categoryTitle = getCategoryDisplayName(categorySlug);

  const [openCart, setOpenCart] = useState(false);
  const [selected, setSelected] = useState(sortOptions[0]);
  const [inStock, setInStock] = useState(false);
  const [outOfStock, setOutOfStock] = useState(false);
  const [price, setPrice] = useState<[number, number]>([0, MAX_PRODUCT_PRICE]);
  const [debouncedPrice, setDebouncedPrice] = useState<[number, number]>(price);
  const [openMobileFilter, setOpenMobileFilter] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedPrice(price), 250);
    return () => clearTimeout(t);
  }, [price]);

  const availabilityParam: boolean | undefined = useMemo(() => {
    if (inStock && !outOfStock) return true;
    if (!inStock && outOfStock) return false;
    return undefined;
  }, [inStock, outOfStock]);

  // Server-side filters (price) - category filtering is done via categorySlug
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

  // Flatten all loaded pages
  const pages = (data?.pages ?? []) as ProductListResponse[];
  const sourceProducts = useMemo(
    () => pages.flatMap((p) => (Array.isArray(p.data) ? p.data : [])),
    [pages]
  );

  // Get total from backend pagination
  const totalFromBackend = pages[0]?.meta?.totalItems ?? 0;

  // Client-side filter for availability
  const availabilityFiltered = useMemo(() => {
    if (availabilityParam === undefined) return sourceProducts;
    return sourceProducts.filter((p) =>
      availabilityParam ? p.stockQty > 0 : p.stockQty === 0
    );
  }, [sourceProducts, availabilityParam]);

  // Client-side sort
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
      case "featured":
      default:
        return by((a, b) => {
          if (a.isNewArrival !== b.isNewArrival) return a.isNewArrival ? -1 : 1;
          if (a.isBestSeller !== b.isBestSeller) return a.isBestSeller ? -1 : 1;
          return b.createdAtMs - a.createdAtMs;
        });
    }
  }, [availabilityFiltered, selected.value]);

  const totalVisible = sortedProducts.length;

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

          {/* FILTER & SORT - Desktop */}
          <div className="mb-10 space-y-6 hidden md:block">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <span className="font-medium text-sm text-foreground">
                  FILTER:
                </span>

                {/* Availability */}
                <Popover className="relative">
                  <PopoverButton className="outline-0 focus:outline-0 px-4 py-2 border border-foreground/20 rounded-lg flex items-center gap-5">
                    Availability <ChevronDown />
                  </PopoverButton>
                  <PopoverPanel
                    anchor="bottom"
                    className="translate-y-2 flex flex-col z-10 bg-background border border-foreground/20 rounded-lg w-56"
                  >
                    <div className="px-5 py-3 flex items-center justify-between gap-2 border-b border-foreground/20">
                      <p className="text-sm font-normal text-foreground">
                        {selectedAvailabilityCount} Selected
                      </p>
                      <button
                        type="button"
                        className="commonLink"
                        onClick={() => {
                          setInStock(false);
                          setOutOfStock(false);
                        }}
                      >
                        Reset
                      </button>
                    </div>
                    <div className="px-5 py-3 flex items-center gap-2">
                      <Checkbox
                        checked={inStock}
                        onChange={setInStock}
                        className="group size-6 rounded-md bg-foreground/10 p-1 ring-1 ring-white/15 ring-inset focus:not-data-focus:outline-none data-checked:bg-brand"
                      >
                        <Check className="hidden size-4 fill-transparent stroke-background group-data-checked:block text-brand" />
                      </Checkbox>
                      <p className="text-sm font-normal">In Stock</p>
                    </div>
                    <div className="px-5 py-3 flex items-center gap-2">
                      <Checkbox
                        checked={outOfStock}
                        onChange={setOutOfStock}
                        className="group size-6 rounded-md bg-foreground/10 p-1 ring-1 ring-white/15 ring-inset focus:not-data-focus:outline-none data-checked:bg-brand"
                      >
                        <Check className="hidden size-4 fill-transparent stroke-background group-data-checked:block text-brand" />
                      </Checkbox>
                      <p className="text-sm font-normal">Out of Stock</p>
                    </div>
                  </PopoverPanel>
                </Popover>

                {/* Price */}
                <Popover className="relative">
                  <PopoverButton className="outline-0 focus:outline-0 px-4 py-2 border border-foreground/20 rounded-lg flex items-center gap-5">
                    Price
                    <ChevronDown />
                  </PopoverButton>
                  <PopoverPanel
                    anchor="bottom"
                    className="translate-y-2 px-6 py-6 flex flex-col z-10 bg-background border border-foreground/20 rounded-lg w-56"
                  >
                    <div className="py-3 flex items-center gap-2">
                      <RangeSlider
                        min={0}
                        max={MAX_PRODUCT_PRICE}
                        value={price}
                        onChange={setPrice}
                      />
                    </div>
                  </PopoverPanel>
                </Popover>
              </div>

              <div className="flex flex-col md:flex-row items-start md: items-center gap-4 text-sm">
                <p className="whitespace-nowrap text-sm text-foreground">
                  Sort by:
                </p>
                <CommonSelect
                  name="sort"
                  options={sortOptions}
                  value={selected}
                  onChange={setSelected}
                  placeholder="Sort by"
                  className="min-w-46"
                />
                <p className="whitespace-nowrap text-sm text-foreground">
                  {totalFromBackend} Products
                </p>
              </div>
            </div>

            {/* ACTIVE FILTERS */}
            {(price[0] > 0 ||
              price[1] < MAX_PRODUCT_PRICE ||
              availabilityParam !== undefined) && (
              <div className="flex flex-wrap items-center gap-3">
                {availabilityParam !== undefined && (
                  <span className="flex items-center gap-2 bg-muted px-4 py-2 rounded-full text-sm">
                    {availabilityParam ? "In Stock" : "Out of Stock"}
                    <button
                      className="text-lg leading-none"
                      onClick={() => {
                        setInStock(false);
                        setOutOfStock(false);
                      }}
                    >
                      ×
                    </button>
                  </span>
                )}
                {(price[0] > 0 || price[1] < MAX_PRODUCT_PRICE) && (
                  <span className="flex items-center gap-2 bg-muted px-4 py-2 rounded-full text-sm">
                    Rs. {price[0]}. 00 - Rs. {price[1]}.00
                    <button
                      className="text-lg leading-none"
                      onClick={() => setPrice([0, MAX_PRODUCT_PRICE])}
                    >
                      ×
                    </button>
                  </span>
                )}
                <button
                  className="text-sm underline"
                  onClick={() => handleClearAll()}
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* MOBILE FILTER BAR */}
          <div className="flex md:hidden items-center justify-between mb-6 gap-4">
            <button
              onClick={() => setOpenMobileFilter(true)}
              className="flex items-center gap-2.5 px-4 py-2 border border-foreground/20 rounded-lg text-sm font-medium"
            >
              <Filter className="w-5 h-5" />
              Filter
            </button>
            <div className="w-1/2">
              <CommonSelect
                name="sort"
                options={sortOptions}
                value={selected}
                onChange={setSelected}
                placeholder="Sort by"
                className="min-w-40"
              />
            </div>
          </div>

          {/* PRODUCT GRID */}
          <div className="productGrid">
            {isLoading ? (
              <div className="col-span-full py-10 text-center text-foreground/60">
                Loading products...
              </div>
            ) : isError ? (
              <div className="col-span-full py-10 text-center text-red-500">
                Error loading products:{" "}
                {error?.message || "Something went wrong"}
              </div>
            ) : sortedProducts.length === 0 ? (
              <div className="col-span-full py-10 text-center text-foreground/60">
                No products found in {categoryTitle}
              </div>
            ) : (
              sortedProducts.map((product) => (
                <CommonProductCard
                  key={product.id}
                  title={product.title}
                  price={product.price}
                  oldPrice={product.oldPrice}
                  image={product.image}
                  onAddToCart={() => setOpenCart(true)}
                  tag={product.tag}
                />
              ))
            )}
          </div>

          {/* LOAD MORE */}
          <div className="flex justify-center items-center mt-8">
            <CommonButton
              variant="secondaryBtn"
              className="max-w-fit"
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

      {/* Mobile Filters Dialog */}
      <Dialog
        open={openMobileFilter}
        onClose={() => setOpenMobileFilter(false)}
        className="relative z-50 md:hidden"
      >
        <div className="fixed inset-0 bg-black/40" />
        <div className="fixed inset-x-0 bottom-0 flex items-end">
          <DialogPanel className="w-full bg-background rounded-t-2xl p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Filters</h3>
              <button
                onClick={() => setOpenMobileFilter(false)}
                className="text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Availability */}
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-3">Availability</h4>
              <div className="flex items-center gap-2 mb-3">
                <Checkbox
                  checked={inStock}
                  onChange={setInStock}
                  className="group size-5 rounded-md bg-foreground/10 p-1 data-checked:bg-brand"
                >
                  <CheckIcon className="hidden size-3 group-data-checked: block text-background" />
                </Checkbox>
                <p className="text-sm">In Stock</p>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={outOfStock}
                  onChange={setOutOfStock}
                  className="group size-5 rounded-md bg-foreground/10 p-1 data-checked:bg-brand"
                >
                  <CheckIcon className="hidden size-3 group-data-checked:block text-background" />
                </Checkbox>
                <p className="text-sm">Out of Stock</p>
              </div>
            </div>

            {/* Price */}
            <div className="mb-8">
              <h4 className="text-sm font-medium mb-3">Price</h4>
              <RangeSlider
                min={0}
                max={MAX_PRODUCT_PRICE}
                value={price}
                onChange={setPrice}
              />
            </div>

            <div className="flex gap-4">
              <CommonButton
                variant="secondaryBtn"
                className="w-full"
                onClick={handleClearAll}
              >
                Clear
              </CommonButton>
              <CommonButton
                className="w-full"
                onClick={() => setOpenMobileFilter(false)}
              >
                Apply Filters
              </CommonButton>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}
