"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import CommonButton from "@/app/components/button/CommonButton";
import CommonHeading from "@/app/components/CommonHeading";
import CommonProductCard from "@/app/components/CommonProductCard";
import RangeSlider from "@/app/components/RangeSlider";
import CommonSelect from "@/app/components/select/CommonSelect";
import { ProductListSkeleton } from "@/app/components/skeleton";
import {
  Dialog,
  DialogPanel,
  Popover,
  PopoverButton,
  PopoverPanel,
} from "@headlessui/react";
import { ChevronDown, Filter } from "lucide-react";
import { useProductsInfinite } from "@/hooks/use-products";
import AnimatedSection from "@/app/components/AnimatedSection";

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

function ProductListLoading() {
  return (
    <div className="min-h-[60vh] py-12">
      <ProductListSkeleton count={8} />
    </div>
  );
}

export default function ProductList() {
  return (
    <Suspense fallback={<ProductListLoading />}>
      <ProductListContent />
    </Suspense>
  );
}

function ProductListContent() {
  const searchParams = useSearchParams();
  const filter = searchParams.get("filter");

  const [availability, setAvailability] = useState<
    "inStock" | "outOfStock" | null
  >(null);
  const [selected, setSelected] = useState(sortOptions[0]);
  const [price, setPrice] = useState<[number, number]>([0, MAX_PRODUCT_PRICE]);
  const [debouncedPrice, setDebouncedPrice] = useState(price);
  const [openMobileFilter, setOpenMobileFilter] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedPrice(price), 250);
    return () => clearTimeout(t);
  }, [price]);

  const availabilityParam = useMemo<boolean | undefined>(() => {
    if (availability === "inStock") return true;
    if (availability === "outOfStock") return false;
    return undefined;
  }, [availability]);

  const pageTitle = useMemo(() => {
    if (filter === "best-seller") return "Best Sellers";
    if (filter === "new-arrival") return "New Arrivals";
    return "All Products";
  }, [filter]);

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useProductsInfinite({
    minPrice: debouncedPrice[0],
    maxPrice: debouncedPrice[1],
    inStock: availabilityParam,
    sort: selected.value,
    isBestSeller: filter === "best-seller" ? true : undefined,
    isNewArrival: filter === "new-arrival" ? true : undefined,
  });

  const pages = data?.pages ?? [];
  const allProducts = useMemo(() => pages.flatMap((p) => p.data), [pages]);
  const totalFromBackend = pages[0]?.meta?.totalItems ?? 0;

  const handleClearFilters = () => {
    setAvailability(null);
    setPrice([0, MAX_PRODUCT_PRICE]);
  };

  const isFilterActive =
    price[0] > 0 || price[1] < MAX_PRODUCT_PRICE || availability !== null;

  const getAvailabilityLabel = () => {
    if (availability === "inStock") return "In Stock";
    if (availability === "outOfStock") return "Out of Stock";
    return "All Products";
  };

  return (
    <>
      <div className="gradientBg">
        <AnimatedSection>
          <section className="max-w-full px-4 md:px-6 lg:px-10 py-4 md:py-6 lg:pt-6">
            <div className="max-w-[1560px] mx-auto">
              <CommonHeading
                level={1}
                title={pageTitle}
                description="Proudly Supporting Ethical Sourcing - Every Gemstone Has a Story."
              />

              <div className="mb-10 space-y-6 hidden md:block">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    <span className="font-medium text-sm text-foreground">
                      FILTER:
                    </span>
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
                            {availability ? getAvailabilityLabel() : "Show All"}
                          </p>
                          <button
                            className="commonLink"
                            onClick={() => setAvailability(null)}
                          >
                            Reset
                          </button>
                        </div>
                        <label className="px-5 py-3 flex items-center gap-2 cursor-pointer hover:bg-foreground/5">
                          <div className="relative size-5 rounded-full border-2 border-foreground/30 flex items-center justify-center">
                            <input
                              type="radio"
                              name="availability"
                              value="inStock"
                              checked={availability === "inStock"}
                              onChange={(e) =>
                                setAvailability(e.target.value as "inStock")
                              }
                              className="opacity-0 absolute size-5 cursor-pointer"
                            />
                            {availability === "inStock" && (
                              <div className="size-2.5 rounded-full bg-brand" />
                            )}
                          </div>
                          <p className="text-sm font-normal">In Stock</p>
                        </label>
                        <label className="px-5 py-3 flex items-center gap-2 cursor-pointer hover:bg-foreground/5">
                          <div className="relative size-5 rounded-full border-2 border-foreground/30 flex items-center justify-center">
                            <input
                              type="radio"
                              name="availability"
                              value="outOfStock"
                              checked={availability === "outOfStock"}
                              onChange={(e) =>
                                setAvailability(e.target.value as "outOfStock")
                              }
                              className="opacity-0 absolute size-5 cursor-pointer"
                            />
                            {availability === "outOfStock" && (
                              <div className="size-2.5 rounded-full bg-brand" />
                            )}
                          </div>
                          <p className="text-sm font-normal">Out of Stock</p>
                        </label>
                      </PopoverPanel>
                    </Popover>

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

                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4 text-sm">
                    <p className="whitespace-nowrap text-sm text-foreground">
                      Sort by:
                    </p>
                    <CommonSelect
                      name="availability"
                      options={sortOptions}
                      value={selected}
                      onChange={setSelected}
                      placeholder="Availability"
                      className="min-w-46"
                    />
                    <p className="whitespace-nowrap text-sm text-foreground">
                      {totalFromBackend} Products
                    </p>
                  </div>
                </div>

                {isFilterActive && (
                   <div className="flex items-center gap-4">
                     {(price[0] > 0 || price[1] < MAX_PRODUCT_PRICE) && (
                       <span className="flex items-center gap-2 bg-gray-100 border border-gray-200 text-gray-800 px-4 py-2 rounded-full text-sm">
                         Rs. {price[0]} - Rs. {price[1]}
                         <button
                           className="text-lg leading-none"
                           onClick={() => setPrice([0, MAX_PRODUCT_PRICE])}
                         >
                           ×
                         </button>
                       </span>
                     )}

                     {availability !== null && (
                       <span className="flex items-center gap-2 bg-gray-100 border border-gray-200 text-gray-800 px-4 py-2 rounded-full text-sm">
                         {getAvailabilityLabel()}
                         <button
                           className="text-lg leading-none"
                           onClick={() => setAvailability(null)}
                         >
                           ×
                         </button>
                       </span>
                     )}

                    <button
                      className="text-sm underline"
                      onClick={handleClearFilters}
                    >
                      Clear all
                    </button>
                  </div>
                )}
              </div>

              <div className="flex md:hidden items-center justify-between mb-4 gap-3">
                <button
                  onClick={() => setOpenMobileFilter(true)}
                  className="flex items-center gap-2 bg-[#2b2522] text-white px-5 py-2.5 rounded-full font-medium text-sm transition-colors hover:bg-black"
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
              <div className="productGrid">
                {isLoading || isError ? (
                  <ProductListSkeleton count={8} />
                ) : allProducts.length === 0 ? (
                  <div className="col-span-full py-10 text-center">
                    No products found
                  </div>
                ) : (
                  allProducts.map((product) => (
                    <CommonProductCard
                      key={product.id}
                      productId={product.id}
                      title={product.title}
                      price={product.price}
                      oldPrice={product.oldPrice}
                      image={product.image}
                      tag={product.tag}
                    />
                  ))
                )}
              </div>
            </div>

            <div className="flex justify-center items-center mt-6 mb-8 md:mt-8 md:mb-12">
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
                    : "You've seen all products"}
              </CommonButton>
            </div>
          </section>
        </AnimatedSection>
      </div>

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

            <div className="mb-6">
              <h4 className="text-sm font-medium mb-3">Availability</h4>

              <label
                className="flex items-center gap-2 mb-3 cursor-pointer p-2 -m-2"
                onClick={() => setAvailability("inStock")}
              >
                <div className="relative size-5 rounded-full border-2 border-foreground/30 flex items-center justify-center">
                  <input
                    type="radio"
                    name="availability-mobile"
                    value="inStock"
                    checked={availability === "inStock"}
                    onChange={() => setAvailability("inStock")}
                    className="opacity-0 absolute size-5 cursor-pointer"
                  />
                  {availability === "inStock" && (
                    <div className="size-2.5 rounded-full bg-brand" />
                  )}
                </div>
                <p className="text-sm">In Stock</p>
              </label>

              <label
                className="flex items-center gap-2 cursor-pointer p-2 -m-2"
                onClick={() => setAvailability("outOfStock")}
              >
                <div className="relative size-5 rounded-full border-2 border-foreground/30 flex items-center justify-center">
                  <input
                    type="radio"
                    name="availability-mobile"
                    value="outOfStock"
                    checked={availability === "outOfStock"}
                    onChange={() => setAvailability("outOfStock")}
                    className="opacity-0 absolute size-5 cursor-pointer"
                  />
                  {availability === "outOfStock" && (
                    <div className="size-2.5 rounded-full bg-brand" />
                  )}
                </div>
                <p className="text-sm">Out of Stock</p>
              </label>
            </div>

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
                onClick={() => {
                  handleClearFilters();
                  setOpenMobileFilter(false);
                }}
              >
                Reset to Default
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
