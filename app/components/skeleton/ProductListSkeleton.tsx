import ProductCardSkeleton from "./ProductCardSkeleton";

interface ProductListSkeletonProps {
  count?: number;
}

export default function ProductListSkeleton({ count = 8 }: ProductListSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </>
  );
}
