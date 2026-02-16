export default function ProductDetailSkeleton() {
  return (
    <div className="productListPage gradientBg">
      <div className="max-w-[1560px] mx-auto px-3 md:px-6 lg:px-10 py-6 md:py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery Skeleton */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="w-full aspect-square rounded-2xl bg-gray-200 animate-pulse" />
            
            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-lg bg-gray-200 animate-pulse" />
              ))}
            </div>
          </div>

          {/* Product Info Skeleton */}
          <div className="space-y-6">
            {/* Title */}
            <div className="space-y-3">
              <div className="h-8 bg-gray-200 rounded-lg animate-pulse w-3/4" />
              <div className="h-6 bg-gray-200 rounded-lg animate-pulse w-1/2" />
            </div>

            {/* Price */}
            <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-1/3" />

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="h-5 bg-gray-200 rounded animate-pulse w-24" />
              <div className="h-5 bg-gray-200 rounded animate-pulse w-16" />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
            </div>

            {/* Size/Variant Selector */}
            <div className="space-y-3">
              <div className="h-5 bg-gray-200 rounded animate-pulse w-20" />
              <div className="flex gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-10 w-16 bg-gray-200 rounded-lg animate-pulse" />
                ))}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-3">
              <div className="h-5 bg-gray-200 rounded animate-pulse w-24" />
              <div className="h-12 bg-gray-200 rounded-lg animate-pulse w-32" />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <div className="h-12 bg-gray-200 rounded-full animate-pulse flex-1" />
              <div className="h-12 w-12 bg-gray-200 rounded-full animate-pulse" />
            </div>

            {/* Additional Info */}
            <div className="space-y-2 pt-6 border-t border-gray-200">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        <div className="mt-16 space-y-8">
          <div className="h-8 bg-gray-200 rounded-lg animate-pulse w-48 mx-auto" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-square rounded-2xl bg-gray-200 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                <div className="h-5 bg-gray-200 rounded animate-pulse w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
