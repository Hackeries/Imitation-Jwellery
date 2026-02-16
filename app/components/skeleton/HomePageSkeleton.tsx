export default function HomePageSkeleton() {
  return (
    <div className="homepageWrap gradientBg">
      {/* Hero Section Skeleton - Matching the actual design */}
      <section className="relative bg-[#fdebcf] overflow-hidden">
        <div className="w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 items-center min-h-[500px] md:min-h-[600px] lg:min-h-[700px]">
            {/* Left Content Skeleton */}
            <div className="px-6 md:px-12 lg:px-20 py-12 md:py-16 lg:py-20 space-y-6 animate-pulse">
              <div className="h-4 w-32 bg-gray-300 rounded" />
              <div className="h-12 md:h-16 w-4/5 bg-gray-300 rounded" />
              <div className="space-y-3">
                <div className="h-4 w-full bg-gray-200 rounded" />
                <div className="h-4 w-11/12 bg-gray-200 rounded" />
                <div className="h-4 w-10/12 bg-gray-200 rounded" />
                <div className="h-4 w-9/12 bg-gray-200 rounded" />
              </div>
              <div className="h-14 w-40 bg-gray-400 rounded-full" />
            </div>

            {/* Right Image Skeleton */}
            <div className="relative h-full min-h-[200px] lg:min-h-[300px] bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Product Feature Strip Skeleton */}
      <section className="px-3 md:px-8 lg:px-10 py-4 bg-white">
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 max-w-[1560px] mx-auto">
          {[1, 2, 3, 4].map((i) => (
            <div key={`feature-${i}`} className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gray-300" />
              <div className="h-5 w-24 bg-gray-300 rounded" />
            </div>
          ))}
        </div>
      </section>

      {/* Categories Section Skeleton */}
      <section className="px-3 md:px-8 lg:px-10 py-7 md:py-12 lg:py-20">
        <div className="max-w-[1560px] mx-auto">
          <div className="text-center mb-12">
            <div className="h-10 w-64 bg-gray-300 rounded mx-auto mb-4" />
            <div className="h-4 w-96 max-w-full bg-gray-200 rounded mx-auto" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={`category-${i}`} className="space-y-3">
                <div className="aspect-square rounded-2xl bg-gray-300" />
                <div className="h-5 w-3/4 bg-gray-300 rounded mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers Section Skeleton */}
      <section className="px-3 md:px-8 lg:px-10 py-7 md:py-12 lg:py-20 bg-[#fce9ca]/30">
        <div className="max-w-[1560px] mx-auto">
          <div className="text-center mb-12">
            <div className="h-10 w-48 bg-gray-300 rounded mx-auto mb-4" />
            <div className="h-4 w-72 max-w-full bg-gray-200 rounded mx-auto" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-6 lg:gap-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-4">
                <div className="h-[250px] md:h-[320px] rounded-2xl bg-gray-300" />
                <div className="h-5 w-3/4 bg-gray-300 rounded mx-auto" />
                <div className="h-6 w-20 bg-gray-300 rounded mx-auto" />
                <div className="h-11 w-full bg-gray-300 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Feedback Skeleton */}
      <section className="px-3 md:px-8 lg:px-10 py-7 md:py-12 lg:py-20">
        <div className="max-w-[1560px] mx-auto">
          <div className="text-center mb-12">
            <div className="h-10 w-56 bg-gray-300 rounded mx-auto mb-4" />
            <div className="h-4 w-80 max-w-full bg-gray-200 rounded mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={`feedback-${i}`} className="border border-gray-300 rounded-xl p-6 space-y-4">
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <div key={`star-${s}`} className="h-5 w-5 bg-gray-300 rounded" />
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-gray-300 rounded" />
                  <div className="h-4 w-5/6 bg-gray-300 rounded" />
                  <div className="h-4 w-4/6 bg-gray-300 rounded" />
                </div>
                <div className="flex items-center gap-3 pt-4">
                  <div className="h-12 w-12 rounded-full bg-gray-300" />
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-gray-300 rounded" />
                    <div className="h-3 w-32 bg-gray-200 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals Section Skeleton */}
      <section className="px-3 md:px-8 lg:px-10 py-7 md:py-12 lg:py-20">
        <div className="max-w-[1560px] mx-auto">
          <div className="text-center mb-12">
            <div className="h-10 w-48 bg-gray-300 rounded mx-auto mb-4" />
            <div className="h-4 w-96 max-w-full bg-gray-200 rounded mx-auto" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-6 lg:gap-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={`arrival-${i}`} className="space-y-4">
                <div className="h-[250px] md:h-[320px] rounded-2xl bg-gray-300" />
                <div className="h-5 w-3/4 bg-gray-300 rounded mx-auto" />
                <div className="h-6 w-20 bg-gray-300 rounded mx-auto" />
                <div className="h-11 w-full bg-gray-300 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Collection Skeleton */}
      <section className="px-3 md:px-8 lg:px-10 py-7 md:py-12 lg:py-20 bg-[#fce9ca]/20">
        <div className="max-w-[1560px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-[400px] rounded-2xl bg-gray-300" />
            <div className="h-[400px] rounded-2xl bg-gray-300" />
          </div>
        </div>
      </section>

      {/* Store Features Skeleton */}
      <section className="px-3 md:px-8 lg:px-10 py-7 md:py-12 lg:py-20">
        <div className="max-w-[1560px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={`feature-${i}`} className="text-center space-y-4">
                <div className="h-16 w-16 bg-gray-300 rounded-full mx-auto" />
                <div className="h-6 w-40 bg-gray-300 rounded mx-auto" />
                <div className="h-4 w-full bg-gray-200 rounded" />
                <div className="h-4 w-5/6 bg-gray-200 rounded mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
